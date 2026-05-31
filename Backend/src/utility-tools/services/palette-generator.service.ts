import { Injectable } from '@nestjs/common';
import { GeneratePaletteDto } from '../dto/palette.dto';

@Injectable()
export class PaletteGeneratorService {
  generate(dto: GeneratePaletteDto) {
    const mode = dto.mode ?? 'random';
    const count = dto.count ?? 5;
    const base = this.normalizeHex(dto.baseColor ?? this.randomHex());
    const colors =
      mode === 'random'
        ? Array.from({ length: count }, () => this.randomHex())
        : this.harmony(base, mode, count);

    const gradient = `linear-gradient(135deg, ${colors.join(', ')})`;
    const cssVars = colors.map((c, i) => `--color-${i + 1}: ${c};`).join('\n');

    return {
      mode,
      baseColor: base,
      colors,
      gradient,
      cssVars,
    };
  }

  private normalizeHex(value: string) {
    const raw = value.startsWith('#') ? value.slice(1) : value;
    return `#${raw.toUpperCase()}`;
  }

  private randomHex() {
    const n = Math.floor(Math.random() * 0xffffff);
    return `#${n.toString(16).padStart(6, '0').toUpperCase()}`;
  }

  private hexToHsl(hex: string) {
    const raw = hex.replace('#', '');
    const r = parseInt(raw.slice(0, 2), 16) / 255;
    const g = parseInt(raw.slice(2, 4), 16) / 255;
    const b = parseInt(raw.slice(4, 6), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        default:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  private hslToHex(h: number, s: number, l: number) {
    const sat = s / 100;
    const light = l / 100;
    const c = (1 - Math.abs(2 * light - 1)) * sat;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = light - c / 2;
    let r = 0;
    let g = 0;
    let b = 0;
    if (h < 60) {
      r = c;
      g = x;
    } else if (h < 120) {
      r = x;
      g = c;
    } else if (h < 180) {
      g = c;
      b = x;
    } else if (h < 240) {
      g = x;
      b = c;
    } else if (h < 300) {
      r = x;
      b = c;
    } else {
      r = c;
      b = x;
    }
    const to = (v: number) =>
      Math.round((v + m) * 255)
        .toString(16)
        .padStart(2, '0');
    return `#${to(r)}${to(g)}${to(b)}`.toUpperCase();
  }

  private harmony(base: string, mode: string, count: number) {
    const { h, s, l } = this.hexToHsl(base);
    const offsets =
      mode === 'complementary'
        ? [0, 180]
        : mode === 'analogous'
          ? [0, 30, -30, 60, -60]
          : mode === 'triadic'
            ? [0, 120, 240]
            : [0, 0, 0, 15, -15, 30, -30];
    const colors: string[] = [];
    for (let i = 0; i < count; i += 1) {
      const offset = offsets[i % offsets.length] ?? i * 25;
      const hue = (h + offset + 360) % 360;
      const lightness = mode === 'monochrome' ? Math.max(20, Math.min(80, l + (i - count / 2) * 8)) : l;
      colors.push(this.hslToHex(hue, s, lightness));
    }
    return colors;
  }
}
