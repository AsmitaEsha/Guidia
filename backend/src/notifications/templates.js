// Plain-text email templates. Inputs are already display-safe (no secrets);
// bodies never include OTPs, PINs, passwords, card or account numbers.

const T = {
  password_reset: {
    en: (d) => ({
      subject: 'Reset your Guidia password',
      text: `Hello ${d.fullName},\n\nSomeone (hopefully you) asked to reset your Guidia password. Open this link within 30 minutes to choose a new one:\n\n${d.resetUrl}\n\nIf you didn't ask for this, you can ignore this email — your password stays the same.\n\nGuidia will never ask you for your password, PIN or OTP by email or phone.`,
    }),
    bn: (d) => ({
      subject: 'আপনার Guidia পাসওয়ার্ড রিসেট করুন',
      text: `নমস্কার ${d.fullName},\n\nআপনার Guidia পাসওয়ার্ড রিসেট করার অনুরোধ এসেছে। ৩০ মিনিটের মধ্যে এই লিংকটি খুলে নতুন পাসওয়ার্ড দিন:\n\n${d.resetUrl}\n\nআপনি অনুরোধ না করে থাকলে এই ইমেইল উপেক্ষা করুন।\n\nGuidia কখনো ইমেইল বা ফোনে আপনার পাসওয়ার্ড, PIN বা OTP চায় না।`,
    }),
  },
  guardian_invite: {
    en: (d) => ({
      subject: `${d.seniorName} invited you to be a trusted helper on Guidia`,
      text: `Hello,\n\n${d.seniorName} would like you to be one of their trusted people on Guidia, a learning and safety companion for everyday digital tasks.\n\nSign in or create an account with this email address, then open Guardian to accept:\n\n${d.appUrl}/app/guardian\n\nYou will only see what ${d.seniorName} chooses to share, and they can change that at any time.`,
    }),
  },
  emergency_alert: {
    en: (d) => ({
      subject: `${d.seniorName} asked for help on Guidia`,
      text: `${d.seniorName} pressed "I need help" on Guidia.\n\nReason: ${d.reasonLabel}\n${d.message ? `Their note: ${d.message}\n` : ''}\nPlease contact them using a phone number or method you already trust. Open Guidia to acknowledge:\n\n${d.appUrl}/app/guardian\n\nGuidia never includes passwords, PINs or OTPs in alerts. If anyone asks you for those on ${d.seniorName}'s behalf, it is not Guidia.`,
    }),
  },
  approval_request: {
    en: (d) => ({
      subject: `${d.seniorName} is asking for your approval`,
      text: `${d.seniorName} would like your approval before continuing a practice task on Guidia.\n\nWhat: ${d.what}\nApp: ${d.application}\n${d.amount ? `Amount: ${d.amount} (practice money — nothing real moves)\n` : ''}\nReview it here:\n\n${d.appUrl}/app/guardian`,
    }),
  },
  permission_changed: {
    en: (d) => ({
      subject: 'Your Guidia sharing settings changed',
      text: `Hello ${d.fullName},\n\nThe information shared with ${d.guardianName} on Guidia was changed: ${d.summary}.\n\nIf you didn't make this change, open Guidia → Guardian to review it.`,
    }),
  },
};

export function renderEmail(template, data = {}) {
  const variants = T[template];
  if (!variants) throw new Error(`Unknown email template: ${template}`);
  const render = variants[data.language] || variants.en;
  return render(data);
}
