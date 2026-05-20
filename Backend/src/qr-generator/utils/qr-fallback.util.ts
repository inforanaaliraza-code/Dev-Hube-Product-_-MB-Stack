import { createHash } from 'crypto';

type GenerateInput = {
  data: string;
  foreground: string;
  background: string;
  sizePx: number;
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
};

export async function generateQrPngFallback(input: GenerateInput): Promise<Buffer> {
  const qrcode = await import('qrcode');
  const ecMap: Record<string, 'L' | 'M' | 'Q' | 'H'> = {
    L: 'L',
    M: 'M',
    Q: 'Q',
    H: 'H',
  };
  const level = ecMap[input.errorCorrection] ?? 'H';
  const buffer = await qrcode.toBuffer(input.data, {
    type: 'png',
    width: input.sizePx,
    margin: 2,
    color: {
      dark: input.foreground,
      light: input.background,
    },
    errorCorrectionLevel: level,
  });
  return buffer;
}

export function hashIp(ip: string | undefined): string | null {
  if (!ip?.trim()) {
    return null;
  }
  return createHash('sha256').update(ip.trim()).digest('hex').slice(0, 64);
}
