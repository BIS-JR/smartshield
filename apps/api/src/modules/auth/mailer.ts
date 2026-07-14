import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';

const hasSmtpConfig = Boolean(env.smtp.host && env.smtp.user && env.smtp.password);

const transporter = hasSmtpConfig
  ? nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: { user: env.smtp.user, pass: env.smtp.password },
    })
  : null;

export async function sendMail(to: string, subject: string, text: string) {
  if (!transporter) {
    console.log(`\n[e-mail simulado] Para: ${to}\nAssunto: ${subject}\n${text}\n`);
    return;
  }

  try {
    await transporter.sendMail({ from: env.smtp.from, to, subject, text });
  } catch (err) {
    // Falha no provedor de e-mail não deve derrubar o fluxo (o registro/OTP
    // já foi persistido antes desta chamada); loga para investigação.
    console.error(`Falha ao enviar e-mail para ${to}:`, err);
  }
}
