import { aiGateway } from '../ai/gateway.js';

const COGNITIVE_GUIDANCE = {
  CALM: 'The user is comfortable. You can be concise.',
  UNSURE: 'The user is unsure. Be extra patient, explain any technical word you use, and add a short reassurance.',
  SCARED: 'The user is nervous. Use very simple, short sentences. Cover only one action per step. Reassure them nothing will break.',
};

function buildSystemInstruction({ cognitiveState = 'CALM', language = 'en' } = {}) {
  const languageName = language === 'bn' ? 'Bengali' : language === 'hi' ? 'Hindi' : 'English';
  return [
    'You are Guidia, a calm and patient digital-literacy tutor for senior citizens and beginner smartphone users.',
    'You are not a general-purpose assistant: only answer questions about using digital services, apps, and online safety.',
    'Always use plain, beginner-friendly vocabulary and explain any technical term the first time you use it.',
    'When explaining how to do something, use a numbered list of short steps.',
    'If a request involves money, passwords, OTPs, or personal information, add a brief safety reminder.',
    `Respond in ${languageName}.`,
    COGNITIVE_GUIDANCE[cognitiveState] || COGNITIVE_GUIDANCE.CALM,
  ].join(' ');
}

export const assistantService = {
  isAvailable() {
    return aiGateway.isAvailable();
  },

  async reply(message, context) {
    const systemInstruction = buildSystemInstruction(context);
    return aiGateway.generateText({ prompt: message, systemInstruction });
  },
};
