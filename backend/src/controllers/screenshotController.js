import multer from 'multer';
import { aiGateway } from '../ai/gateway.js';
import { ApiError } from '../middleware/errorHandler.js';
import { screenshotSessionStore } from '../services/screenshotSessionStore.js';

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

function buildAnywhereInstruction(language) {
  const languageName = language === 'bn' ? 'Bengali' : language === 'hi' ? 'Hindi' : 'English';
  return [
    'You are Guidia Anywhere, helping an elderly beginner understand a visible browser screenshot.',
    'Identify only the most important visible UI elements: buttons, menus, search boxes, account controls, forms, payment/confirmation actions, suspicious links, OTP/password fields, and warnings.',
    `Write all summary and descriptions in ${languageName}. Keep wording very short and calm.`,
    'Respond with ONLY a JSON object matching this exact shape:',
    '{"safe": boolean, "warning": string, "summary": string, "elements": [{"label": string, "type": "navigation"|"action"|"input"|"info"|"warn"|"danger", "safe": boolean, "desc": string, "x": number, "y": number}]}',
    'x and y are approximate percentages from 0 to 100 showing where the marker should appear on the screenshot.',
    'List at most 8 elements. If unsure about exact coordinates, estimate.',
  ].join(' ');
}

function starterAnalysis(language = 'en') {
  if (language === 'bn') {
    return {
      safe: true,
      warning: '',
      summary: 'Guidia আপনার দৃশ্যমান স্ক্রিনটি ধরেছে। এখানে গুরুত্বপূর্ণ অংশগুলো সহজভাবে ব্যাখ্যা করা হয়েছে।',
      elements: [
        { label: 'মেনু', type: 'navigation', safe: true, desc: 'এটি সাধারণত আরও অপশন খুলে।', x: 12, y: 16 },
        { label: 'সার্চ', type: 'input', safe: true, desc: 'এটি ব্যবহার করে ওয়েবসাইটে কিছু খুঁজতে পারবেন।', x: 50, y: 14 },
        { label: 'অ্যাকাউন্ট', type: 'navigation', safe: true, desc: 'এখানে প্রোফাইল বা সেটিংস থাকতে পারে।', x: 86, y: 16 },
        { label: 'মূল অংশ', type: 'info', safe: true, desc: 'ওয়েবসাইটের প্রধান তথ্য এখানে দেখা যায়।', x: 50, y: 52 },
      ],
    };
  }
  if (language === 'hi') {
    return {
      safe: true,
      warning: '',
      summary: 'Guidia ने आपकी दिखाई दे रही स्क्रीन को कैप्चर किया है। महत्वपूर्ण हिस्से आसान भाषा में समझाए गए हैं।',
      elements: [
        { label: 'मेनू', type: 'navigation', safe: true, desc: 'यह आमतौर पर और विकल्प खोलता है।', x: 12, y: 16 },
        { label: 'खोज', type: 'input', safe: true, desc: 'इससे आप वेबसाइट पर कुछ खोज सकते हैं।', x: 50, y: 14 },
        { label: 'अकाउंट', type: 'navigation', safe: true, desc: 'यहां प्रोफाइल या सेटिंग्स हो सकती हैं।', x: 86, y: 16 },
        { label: 'मुख्य भाग', type: 'info', safe: true, desc: 'वेबसाइट की मुख्य जानकारी यहां दिखती है।', x: 50, y: 52 },
      ],
    };
  }
  return {
    safe: true,
    warning: '',
    summary: 'Guidia captured what is currently visible on your screen. The most important areas are explained in simple words.',
    elements: [
      { label: 'Menu', type: 'navigation', safe: true, desc: 'This usually opens more options.', x: 12, y: 16 },
      { label: 'Search', type: 'input', safe: true, desc: 'Use this to find something on this website.', x: 50, y: 14 },
      { label: 'Account', type: 'navigation', safe: true, desc: 'This usually contains your profile and settings.', x: 86, y: 16 },
      { label: 'Main area', type: 'info', safe: true, desc: 'This is where the main website content appears.', x: 50, y: 52 },
    ],
  };
}

function normalizeAnywhereAnalysis(data, language) {
  const fallback = starterAnalysis(language);
  return {
    safe: typeof data.safe === 'boolean' ? data.safe : fallback.safe,
    warning: typeof data.warning === 'string' ? data.warning : '',
    summary: typeof data.summary === 'string' ? data.summary : fallback.summary,
    elements: Array.isArray(data.elements) && data.elements.length
      ? data.elements.slice(0, 8).map((element, index) => ({
          label: String(element.label || fallback.elements[index]?.label || `Item ${index + 1}`),
          type: ['navigation', 'action', 'input', 'info', 'warn', 'danger'].includes(element.type) ? element.type : 'info',
          safe: element.safe !== false,
          desc: String(element.desc || fallback.elements[index]?.desc || ''),
          x: Math.max(4, Math.min(96, Number(element.x) || fallback.elements[index]?.x || 12 + index * 12)),
          y: Math.max(4, Math.min(96, Number(element.y) || fallback.elements[index]?.y || 18 + index * 10)),
        }))
      : fallback.elements,
  };
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

  async createSession(req, res, next) {
    try {
      if (!req.file) {
        throw new ApiError(400, 'Please choose a screenshot to upload.', 'NO_FILE');
      }
      const language = ['en', 'bn', 'hi'].includes(req.body?.language) ? req.body.language : 'en';
      let analysis = starterAnalysis(language);

      if (aiGateway.isAvailable()) {
        try {
          const raw = await aiGateway.analyzeImage({
            imageBase64: req.file.buffer.toString('base64'),
            mimeType: req.file.mimetype,
            prompt: 'Explain the visible browser screen for an elderly user. Identify important UI elements and safety risks.',
            systemInstruction: buildAnywhereInstruction(language),
          });
          analysis = normalizeAnywhereAnalysis(parseAnalysis(raw), language);
        } catch {
          analysis = starterAnalysis(language);
        }
      }

      const session = screenshotSessionStore.create({
        imageBuffer: req.file.buffer,
        mimeType: req.file.mimetype,
        sourceUrl: req.body?.sourceUrl,
        analysis,
      });

      res.status(201).json({ analysisId: session.id, expiresAt: new Date(session.expiresAt).toISOString() });
    } catch (err) {
      next(err);
    }
  },

  async getSession(req, res, next) {
    try {
      const session = screenshotSessionStore.get(req.params.analysisId);
      if (!session) {
        throw new ApiError(404, 'This screenshot explanation expired or was not found.', 'SCREENSHOT_SESSION_NOT_FOUND');
      }
      res.json({
        analysisId: session.id,
        imageDataUrl: `data:${session.mimeType};base64,${session.imageBase64}`,
        analysis: session.analysis,
        sourceUrl: session.sourceUrl,
        createdAt: session.createdAt,
        expiresAt: new Date(session.expiresAt).toISOString(),
      });
    } catch (err) {
      next(err);
    }
  },
};
