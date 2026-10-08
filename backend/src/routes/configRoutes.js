import { Router } from 'express';
import { env } from '../config/env.js';
import { aiGateway } from '../ai/gateway.js';
import { speechService } from '../ai/speech.js';
import { LANGUAGES } from '../config/languages.js';

const router = Router();

// Public, non-secret capability flags so the UI can show honest
// "unavailable" states instead of dead buttons.
router.get('/', (req, res) => {
  const aiReady = aiGateway.isAvailable();
  res.json({
    success: true,
    data: {
      languages: Object.values(LANGUAGES).map(({ code, nativeName, locale }) => ({ code, nativeName, locale })),
      capabilities: {
        assistant: aiReady && !env.killSwitches.aiChat,
        vision: aiReady && env.features.grokVision && !env.killSwitches.aiVision,
        voice: aiGateway.supportsVoice() && !env.killSwitches.voice,
        // Spoken guidance from the server (may exist without voice input).
        speech: speechService.available(),
        realtimeVoice: aiGateway.supportsVoice() && env.features.realtimeVoice && !env.killSwitches.voice,
        guardianApproval: env.features.guardianApproval,
        sensitiveActions: !env.killSwitches.sensitiveActions,
        browserExtension: env.features.browserExtension,
        demoMode: env.features.demoMode,
      },
    },
  });
});

export default router;
