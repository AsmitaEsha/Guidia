import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';

let transport = null;

export const emailProvider = {
  name: 'smtp',

  isConfigured() {
    return Boolean(env.smtp.host);
  },

  async send({ to, subject, text }) {
    if (!this.isConfigured()) {
      // Not an error and not a success: the outbox records SKIPPED so no UI
      // ever claims an email went out when it didn't.
      return { status: 'SKIPPED', reason: 'SMTP_NOT_CONFIGURED' };
    }
    if (!transport) {
      transport = nodemailer.createTransport({
        host: env.smtp.host,
        port: env.smtp.port,
        secure: env.smtp.port === 465,
        auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.password } : undefined,
        connectionTimeout: 10_000,
        socketTimeout: 15_000,
      });
    }
    const info = await transport.sendMail({ from: env.smtp.from, to, subject, text });
    return { status: 'SENT', providerMessageId: info.messageId };
  },
};
