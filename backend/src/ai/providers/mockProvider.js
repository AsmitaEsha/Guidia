// Deterministic provider for automated tests and offline demos. Selected
// only with AI_PROVIDER=mock; it never pretends to be Grok in the UI — the
// gateway reports provider "mock" and responses are marked as such.

let nextStructured = null;

export const mockProvider = {
  name: 'mock',

  isAvailable() {
    return true;
  },

  // Tests can queue the next structured payload.
  setNextStructured(value) {
    nextStructured = value;
  },

  async text({ messages }) {
    const last = messages[messages.length - 1]?.content ?? '';
    return { text: `[mock reply] ${String(last).slice(0, 80)}`, model: 'mock-1', inputTokens: 0, outputTokens: 0 };
  },

  async structured({ name }) {
    const value = nextStructured ?? defaultFor(name);
    nextStructured = null;
    return { raw: JSON.stringify(value), model: 'mock-1', inputTokens: 0, outputTokens: 0 };
  },

  async vision({ name }) {
    return this.structured({ name });
  },

  async speech() {
    // 1 frame of silent MP3 is enough for tests.
    return { audio: Buffer.from('fffb9000000000000000000000000000', 'hex'), mimeType: 'audio/mpeg', model: 'mock-tts' };
  },

  async transcribe() {
    return { text: 'mock transcript', model: 'mock-stt' };
  },
};

function defaultFor(name) {
  if (name === 'assistant_reply') {
    return {
      reply: '[mock] Here is one small step at a time.',
      steps: [],
      intent: 'UNKNOWN',
      grounding: 'MODEL_INTERPRETATION',
      needsClarification: false,
      clarifyingQuestion: '',
      safetyNote: '',
      actionProposal: null,
    };
  }
  if (name === 'screen_analysis') {
    return {
      screenType: 'unknown',
      detectedApp: '',
      userGoal: 'UNKNOWN',
      risk: 'UNKNOWN',
      summary: '[mock] Screen analysis is running in mock mode.',
      nextAction: '',
      requiresConfirmation: false,
      warning: '',
      elements: [],
    };
  }
  if (name === 'safety_interpretation') {
    return { severity: 'SAFE', explanation: '[mock] No extra context.', reasons: [] };
  }
  return {};
}
