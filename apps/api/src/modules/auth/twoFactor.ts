import { authenticator } from 'otplib';
import QRCode from 'qrcode';

authenticator.options = { window: 1 };

export function generateTwoFactorSecret(email: string) {
  const secret = authenticator.generateSecret();
  const otpauthUrl = authenticator.keyuri(email, 'SmartShield', secret);
  return { secret, otpauthUrl };
}

export async function generateQrCodeDataUrl(otpauthUrl: string): Promise<string> {
  return QRCode.toDataURL(otpauthUrl);
}

export function verifyTwoFactorToken(token: string, secret: string): boolean {
  return authenticator.check(token, secret);
}
