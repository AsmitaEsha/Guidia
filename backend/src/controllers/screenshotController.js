import multer from 'multer';
import { aiGateway } from '../ai/gateway.js';
import { ApiError } from '../middleware/errorHandler.js';

const ALLOWED_MIME = new Set(['image/png', 'image/jpeg', 'image/webp']);
const MAX_BYTES = 8 * 1024 * 1024; // 8MB

export const screenshotUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      cb(new ApiError(400, 'Please upload a PNG, JPEG, or WEBP image.', 'UNSUPPORTED_FILE_TYPE'));
      return;
    }
    cb(null, true);
  },
});

function buildSystemInstruction(language) {
  const languageName = language === 'bn' ? 'Bengali' : language === 'hi' ? 'Hindi' : 'English';
  return [
    'You are Guidia, helping a senior citizen or beginner smartphone user understand a screenshot of an app or website.',
    'Look at the image and identify the interactive elements a beginner would need explained (buttons, icons, menus, text fields, links).',
    'Also assess whether anything in the screenshot looks like a scam, phishing attempt, or otherwise unsafe (urgency, requests for OTP/password/payment, suspicious links, impersonation).',
    `Write the "summary" and every element "desc" in ${languageName}.`,
    'Respond with ONLY a single JSON object, no markdown fences, no extra text, matching exactly this shape:',
    '{"safe": boolean, "confidence": number (0-100), "summary": string (2-3 plain-language sentences, beginner-friendly), "elements": [{"label": string, "type": "navigation"|"action"|"input"|"info"|"warn"|"danger", "safe": boolean, "desc": string}]}',
    'List at most 8 of the most important elements. If the screenshot looks risky, mark the relevant elements as type "warn" or "danger" and safe:false.',
  ].join(' ');
}

function parseAnalysis(text) {
  // Models sometimes wrap JSON in ```json fences despite instructions — strip if present.
  const cleaned = text.trim().replace(/^```json\s*/i, '').replace(/```$/, '').trim();
  const data = JSON.parse(cleaned);
  if (typeof data.safe !== 'boolean' || !Array.isArray(data.elements)) {
    throw new Error('Unexpected analysis shape');
  }
  return data;
}

export const screenshotController = {
  async analyze(req, res, next) {
    try {
      if (!req.file) {
        throw new ApiError(400, 'Please choose a screenshot to upload.', 'NO_FILE');
      }

      const prompt = req.body?.question?.trim()
        ? `The user also asked: "${req.body.question.trim()}". Answer this within your summary.`
        : 'Explain what this screen is and whether it looks safe.';

      const language = ['en', 'bn', 'hi'].includes(req.body?.language) ? req.body.language : 'en';
      const raw = await aiGateway.analyzeImage({
        imageBase64: req.file.buffer.toString('base64'),
        mimeType: req.file.mimetype,
        prompt,
        systemInstruction: buildSystemInstruction(language),
      });

      let analysis;
      try {
        analysis = parseAnalysis(raw);
      } catch {
        // The model answered but not in the exact shape we asked for —
        // still show the user something real rather than fake canned data.
        analysis = { safe: true, confidence: null, summary: raw.slice(0, 500), elements: [] };
      }

      // The uploaded image is never persisted — it exists only in memory
      // for the duration of this request (README: "Screenshots should not
      // be retained unnecessarily").
      res.json({ analysis });
    } catch (err) {
      next(err);
    }
  },
};
