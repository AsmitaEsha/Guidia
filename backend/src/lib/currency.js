// Money is stored as integer minor units. Decimal places per ISO 4217.
export const MINOR_UNITS = { BDT: 2, INR: 2, USD: 2, VND: 0 };

export function toMinor(amount, currency) {
  const exp = MINOR_UNITS[currency] ?? 2;
  return Math.round(Number(amount) * 10 ** exp);
}

export function fromMinor(minor, currency) {
  const exp = MINOR_UNITS[currency] ?? 2;
  return minor / 10 ** exp;
}

export function formatMoney(minor, currency, locale = 'en-US') {
  return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: MINOR_UNITS[currency] ?? 2 }).format(fromMinor(minor, currency));
}
