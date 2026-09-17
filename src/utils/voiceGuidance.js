export const VOICE_PROFILES = {
  calm: { rate: 1.05, pauseMs: 250 },
  unsure: { rate: 0.95, pauseMs: 450 },
  scared: { rate: 0.82, pauseMs: 700 },
};

export const VOICE_SPEEDS = {
  slow: 0.8,
  normal: 1,
  faster: 1.15,
};

export function recommendedVoiceRate(mode = 'calm') {
  return VOICE_PROFILES[mode]?.rate || VOICE_PROFILES.calm.rate;
}

export function cleanSpokenText(text = '') {
  return String(text)
    .replace(/<[^>]*>/g, ' ')
    .replace(/https?:\/\/\S+/gi, ' link ')
    .replace(/[`*_#~|[\]{}]/g, ' ')
    .replace(/[•→⇒]/g, '. ')
    .replace(/\s*>\s*/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();
}

function findChunkBoundary(text, max) {
  const slice = text.slice(0, max);
  const punctuation = ['।', '.', '!', '?', '…', ';', ','];
  const candidates = punctuation
    .map((mark) => slice.lastIndexOf(mark))
    .filter((idx) => idx > 35);

  if (candidates.length > 0) return Math.max(...candidates) + 1;

  const spaceIdx = text.lastIndexOf(' ', max);
  return spaceIdx > 0 ? spaceIdx : max;
}

export function voiceChunks(text = '', mode = 'calm') {
  const clean = cleanSpokenText(text);
  const max = mode === 'scared' ? 95 : mode === 'unsure' ? 135 : 180;
  const chunks = [];
  let rem = clean;

  while (rem.length > 0) {
    if (rem.length <= max) {
      chunks.push(rem);
      break;
    }

    const idx = findChunkBoundary(rem, max);
    chunks.push(rem.slice(0, idx).trim());
    rem = rem.slice(idx).trimStart();
  }

  return chunks.filter(Boolean);
}
