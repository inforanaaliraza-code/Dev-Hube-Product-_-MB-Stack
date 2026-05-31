import { BadRequestException, Injectable } from '@nestjs/common';
import { createHash, randomInt } from 'crypto';
import { CheckPasswordDto } from '../dto/check-password.dto';
import { GeneratePasswordDto } from '../dto/generate-password.dto';

const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const LOWER = 'abcdefghijkmnopqrstuvwxyz';
const NUMBERS = '23456789';
const SYMBOLS = '!@#$%^&*-_=+?';

@Injectable()
export class PasswordGeneratorService {
  generate(dto: GeneratePasswordDto) {
    const length = dto.length ?? 16;
    const useUpper = dto.uppercase !== false;
    const useLower = dto.lowercase !== false;
    const useNumbers = dto.numbers !== false;
    const useSymbols = dto.symbols !== false;

    let pool = '';
    const required: string[] = [];
    if (useUpper) {
      pool += UPPER;
      required.push(UPPER);
    }
    if (useLower) {
      pool += LOWER;
      required.push(LOWER);
    }
    if (useNumbers) {
      pool += NUMBERS;
      required.push(NUMBERS);
    }
    if (useSymbols) {
      pool += SYMBOLS;
      required.push(SYMBOLS);
    }
    if (!pool) {
      throw new BadRequestException('Select at least one character set');
    }

    const chars: string[] = [];
    for (const set of required) {
      chars.push(set[randomInt(set.length)]!);
    }
    while (chars.length < length) {
      chars.push(pool[randomInt(pool.length)]!);
    }
    for (let i = chars.length - 1; i > 0; i -= 1) {
      const j = randomInt(i + 1);
      const tmp = chars[i]!;
      chars[i] = chars[j]!;
      chars[j] = tmp;
    }

    const password = chars.join('');
    return {
      password,
      length,
      strength: this.scorePassword(password),
    };
  }

  async checkBreach(dto: CheckPasswordDto) {
    const sha1 = createHash('sha1').update(dto.password).digest('hex').toUpperCase();
    const prefix = sha1.slice(0, 5);
    const suffix = sha1.slice(5);
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      throw new BadRequestException('Breach check service unavailable');
    }
    const text = await res.text();
    let count = 0;
    for (const line of text.split('\n')) {
      const [hashSuffix, hits] = line.split(':');
      if (hashSuffix?.trim() === suffix) {
        count = parseInt(hits ?? '0', 10) || 0;
        break;
      }
    }
    return {
      breached: count > 0,
      breachCount: count,
      strength: this.scorePassword(dto.password),
    };
  }

  private scorePassword(password: string) {
    let score = 0;
    if (password.length >= 12) score += 2;
    else if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    if (score >= 5) return 'strong';
    if (score >= 3) return 'medium';
    return 'weak';
  }
}
