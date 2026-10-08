import sharp from 'sharp';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { normalizeLanguage } from '../config/languages.js';
import { ApiError } from '../middleware/errorHandler.js';
import { aiGateway } from '../ai/gateway.js';
import { screenAnalysis } from '../ai/schemas.js';
import { visionSystemPrompt } from '../ai/prompts.js';
import { fenceUntrusted } from '../security/promptGuard.js';
import { redactSensitive } from '../security/sensitiveDataGuard.js';
import { storage } from '../storage/storageProvider.js';
import { taskService } from './taskService.js';

const RETENTION_MS = 30 * 60 * 1000;
const MAX_INPUT_PIXELS = 40_000_000; // decompression-bomb guard
const MAX_EDGE = 2000;

const DEFAULT_QUESTION = {
  en: 'What is this screen, what should I do next, and is it safe?',
  bn: 'এটা কোন স্ক্রিন, এরপর কী করব, আর এটা কি নিরাপদ?',
  hi: 'यह कौन सी स्क्रीन है, आगे क्या करूं, और क्या यह सुरक्षित है?',
  vi: 'Đây là màn hình gì, tôi nên làm gì tiếp theo, và có an toàn không?',
};

// Decodes the actual bytes (never trusting the browser's MIME type),
// applies EXIF orientation, strips all metadata, bounds the size and
// re-encodes. Malformed or oversized images are rejected here.
export async function normalizeImage(buffer) {
  let image;
  try {
    image = sharp(buffer, { limitInputPixels: MAX_INPUT_PIXELS, failOn: 'error' });
    const meta = await image.metadata();
    if (!['png', 'jpeg', 'webp'].includes(meta.format)) throw new Error('format');
  } catch {
    throw new ApiError(400, 'Please upload a PNG, JPEG or WEBP screenshot.', 'UNSUPPORTED_FILE_TYPE');
  }
  try {
    const { data, info } = await image
      .rotate()
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
      .png({ compressionLevel: 8 })
      .toBuffer({ resolveWithObject: true });
    return { buffer: data, mimeType: 'image/png', width: info.width, height: info.height, ext: 'png' };
  } catch {
    throw new ApiError(400, 'That image could not be read. Please try another screenshot.', 'IMAGE_DECODE_FAILED');
  }
}

function sanitizeResult(result) {
  const r = (s) => redactSensitive(s).text;
  return {
    ...result,
    summary: r(result.summary),
    nextAction: r(result.nextAction),
    warning: r(result.warning),
    elements: result.elements.map((el) => ({
      ...el,
      label: r(el.label),
      description: r(el.description),
      // Coordinates only when both are present; never half-guessed.
      x: el.x != null && el.y != null ? el.x : null,
      y: el.x != null && el.y != null ? el.y : null,
    })),
  };
}

function toPublic(row) {
  return {
    id: row.id,
    status: row.status,
    source: row.source,
    language: row.language,
    question: row.question,
    sourceHost: row.sourceHost,
    width: row.width,
    height: row.height,
    result: row.result,
    riskLevel: row.riskLevel,
    errorCode: row.errorCode,
    hasImage: Boolean(row.storageKey) && row.expiresAt > new Date(),
    createdAt: row.createdAt,
    expiresAt: row.expiresAt,
    taskSessionId: row.taskSessionId,
  };
}

async function runVision({ userId, row, imageBuffer, question, language, cognitiveState, requestId, previous }) {
  const { summary: taskSummary } = await taskService.summaryForPrompt(userId);
  const prompt = [
    fenceUntrusted('user question', redactSensitive(question || DEFAULT_QUESTION[language]).text),
    previous ? `Earlier Guidia explanation of this same screen (trusted): ${previous.summary}` : '',
  ].filter(Boolean).join('\n\n');

  const { data } = await aiGateway.analyzeImage({
    system: visionSystemPrompt({ language, cognitiveState, taskSummary }),
    prompt,
    imageBase64: imageBuffer.toString('base64'),
    mimeType: row.mimeType,
    name: screenAnalysis.name,
    jsonSchema: screenAnalysis.jsonSchema,
    zodSchema: screenAnalysis.zodSchema,
    meta: { feature: 'vision', userId, requestId },
  });
  return sanitizeResult(data);
}

export const visionService = {
  isAvailable() {
    return aiGateway.isAvailable() && env.features.grokVision && !env.killSwitches.aiVision;
  },

  async analyze({ userId, file, question, language, cognitiveState = 'CALM', source = 'UPLOAD', sourceUrl, requestId }) {
    if (!file) throw new ApiError(400, 'Please choose a screenshot to upload.', 'NO_FILE');
    if (!this.isAvailable()) {
      throw new ApiError(503, "Screen explanations aren't available right now. You can still ask Guidia in text, or use the scam checker.", 'AI_NOT_CONFIGURED');
    }
    const lang = normalizeLanguage(language);
    const image = await normalizeImage(file.buffer);
    let sourceHost = null;
    try { sourceHost = sourceUrl ? new URL(sourceUrl).hostname.slice(0, 200) : null; } catch { sourceHost = null; }

    const { task } = await taskService.summaryForPrompt(userId);
    const storageKey = await storage.put('screens', image.buffer, image.ext);
    const row = await prisma.screenshotAnalysis.create({
      data: {
        userId,
        taskSessionId: task?.id ?? null,
        source,
        status: 'PENDING',
        storageKey,
        mimeType: image.mimeType,
        width: image.width,
        height: image.height,
        sourceHost,
        language: lang,
        question: question ? redactSensitive(question).text.slice(0, 500) : null,
        expiresAt: new Date(Date.now() + RETENTION_MS),
      },
    });

    try {
      const result = await runVision({ userId, row, imageBuffer: image.buffer, question, language: lang, cognitiveState, requestId });
      const updated = await prisma.$transaction(async (tx) => {
        if (task) await taskService.appendEvent(tx, task.id, 'SCREENSHOT_ANALYZED', { analysisId: row.id, risk: result.risk });
        return tx.screenshotAnalysis.update({ where: { id: row.id }, data: { status: 'COMPLETED', result, riskLevel: result.risk } });
      });
      return toPublic(updated);
    } catch (err) {
      await prisma.screenshotAnalysis.update({ where: { id: row.id }, data: { status: 'FAILED', errorCode: err.code || 'VISION_FAILED', storageKey: null } });
      await storage.remove(storageKey).catch(() => {});
      throw err;
    }
  },

  async getOwned(userId, id) {
    const row = await prisma.screenshotAnalysis.findUnique({ where: { id } });
    if (!row || row.userId !== userId) throw new ApiError(404, 'This screen explanation was not found.', 'NOT_FOUND');
    return row;
  },

  async get(userId, id) {
    const row = await this.getOwned(userId, id);
    if (row.expiresAt < new Date() && row.status !== 'EXPIRED') {
      // Image is gone after expiry; the explanation text remains readable.
      return { ...toPublic(row), hasImage: false };
    }
    return toPublic(row);
  },

  async image(userId, id) {
    const row = await this.getOwned(userId, id);
    if (!row.storageKey || row.expiresAt < new Date()) throw new ApiError(410, 'This screenshot has been deleted for your privacy.', 'SCREENSHOT_EXPIRED');
    return { buffer: await storage.get(row.storageKey), mimeType: row.mimeType };
  },

  async ask(userId, id, { question, cognitiveState = 'CALM', requestId }) {
    const row = await this.getOwned(userId, id);
    if (!row.storageKey || row.expiresAt < new Date()) throw new ApiError(410, 'This screenshot has been deleted for your privacy. Please take a new one.', 'SCREENSHOT_EXPIRED');
    if (!this.isAvailable()) throw new ApiError(503, "Screen explanations aren't available right now.", 'AI_NOT_CONFIGURED');
    const imageBuffer = await storage.get(row.storageKey);
    const result = await runVision({ userId, row, imageBuffer, question, language: row.language, cognitiveState, requestId, previous: row.result });
    return { question: redactSensitive(question).text, answer: result };
  },

  async remove(userId, id) {
    const row = await this.getOwned(userId, id);
    if (row.storageKey) await storage.remove(row.storageKey).catch(() => {});
    await prisma.screenshotAnalysis.delete({ where: { id: row.id } });
  },
};
