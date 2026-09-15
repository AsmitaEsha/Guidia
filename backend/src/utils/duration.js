const UNIT_MS = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };

// Parses simple durations like "15m", "30d" into milliseconds.
export function parseDurationMs(value) {
  const match = /^(\d+)([smhd])$/.exec(value);
  if (!match) throw new Error(`Invalid duration: ${value}`);
  const [, amount, unit] = match;
  return Number(amount) * UNIT_MS[unit];
}
