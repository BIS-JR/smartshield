import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '../../db/prisma.js';
import { sendMail } from './mailer.js';
import type { OtpPurpose } from '@prisma/client';

const OTP_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;

function generateCode(): string {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
}

export async function issueOtp(email: string, purpose: OtpPurpose, userId?: string) {
  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await prisma.otpCode.create({
    data: { email, purpose, codeHash, expiresAt, userId },
  });

  const subject = 'Seu código de verificação SmartShield';
  const text = `Seu código de verificação é ${code}. Ele expira em ${OTP_TTL_MINUTES} minutos.`;
  await sendMail(email, subject, text);

  return { expiresAt };
}

export async function verifyOtp(email: string, purpose: OtpPurpose, code: string): Promise<boolean> {
  const otp = await prisma.otpCode.findFirst({
    where: { email, purpose, consumedAt: null },
    orderBy: { createdAt: 'desc' },
  });

  if (!otp) return false;
  if (otp.expiresAt < new Date()) return false;
  if (otp.attempts >= MAX_ATTEMPTS) return false;

  const matches = await bcrypt.compare(code, otp.codeHash);

  await prisma.otpCode.update({
    where: { id: otp.id },
    data: matches ? { consumedAt: new Date() } : { attempts: { increment: 1 } },
  });

  return matches;
}
