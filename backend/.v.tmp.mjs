import { MsEdgeTTS } from 'msedge-tts';
const t = new MsEdgeTTS(); const v = await t.getVoices();
console.log(v.filter((x) => /^(bn|hi)-/.test(x.Locale) || /Multilingual/.test(x.ShortName) && /^en-US/.test(x.Locale)).map((x) => `${x.ShortName} ${x.Gender}`).join('\n'));
process.exit(0);
