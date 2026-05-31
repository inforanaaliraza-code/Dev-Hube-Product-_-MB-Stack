import { BadRequestException, Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { diffLines, type Change } from 'diff';
import { parseExpression } from 'cron-parser';
import { UAParser } from 'ua-parser-js';
import { v1 as uuidV1, v4 as uuidV4, v7 as uuidV7 } from 'uuid';
import { js as beautifyJs } from 'js-beautify';
import TurndownService from 'turndown';
import CleanCSS from 'clean-css';
import { extractOtpFallback } from '../../temp-mail/utils/otp-fallback.util';

@Injectable()
export class DevtoolsCoreService {
  health() {
    return { ok: true };
  }

  metaTags(body: {
    title: string;
    description: string;
    url?: string;
    image?: string;
    siteName?: string;
  }) {
    const title = body.title?.trim() || 'Page Title';
    const description = body.description?.trim() || '';
    const url = body.url?.trim() || 'https://example.com';
    const image = body.image?.trim() || '';
    const site = body.siteName?.trim() || title;
    const tags = [
      `<title>${this.escapeHtml(title)}</title>`,
      `<meta name="description" content="${this.escapeHtml(description)}" />`,
      `<meta property="og:type" content="website" />`,
      `<meta property="og:title" content="${this.escapeHtml(title)}" />`,
      `<meta property="og:description" content="${this.escapeHtml(description)}" />`,
      `<meta property="og:url" content="${this.escapeHtml(url)}" />`,
      `<meta property="og:site_name" content="${this.escapeHtml(site)}" />`,
      image ? `<meta property="og:image" content="${this.escapeHtml(image)}" />` : '',
      `<meta name="twitter:card" content="summary_large_image" />`,
      `<meta name="twitter:title" content="${this.escapeHtml(title)}" />`,
      `<meta name="twitter:description" content="${this.escapeHtml(description)}" />`,
      image ? `<meta name="twitter:image" content="${this.escapeHtml(image)}" />` : '',
    ].filter(Boolean);
    return { html: tags.join('\n') };
  }

  robotsTxt(body: { rules: Array<{ agent: string; allow: string[]; disallow: string[] }>; sitemap?: string }) {
    const lines: string[] = [];
    for (const rule of body.rules?.length ? body.rules : [{ agent: '*', allow: [], disallow: [] }]) {
      lines.push(`User-agent: ${rule.agent || '*'}`);
      for (const path of rule.allow ?? []) {
        if (path.trim()) lines.push(`Allow: ${path.trim()}`);
      }
      for (const path of rule.disallow ?? []) {
        if (path.trim()) lines.push(`Disallow: ${path.trim()}`);
      }
      lines.push('');
    }
    if (body.sitemap?.trim()) {
      lines.push(`Sitemap: ${body.sitemap.trim()}`);
    }
    return { content: lines.join('\n').trim() };
  }

  sitemap(body: { urls: string }) {
    const urls = body.urls
      .split(/\r?\n/)
      .map((u) => u.trim())
      .filter((u) => u.startsWith('http'));
    if (!urls.length) {
      throw new BadRequestException('Add at least one valid http URL per line');
    }
    const items = urls
      .map(
        (loc) =>
          `  <url><loc>${this.escapeXml(loc)}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`,
      )
      .join('\n');
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</urlset>`;
    return { xml, count: urls.length };
  }

  jsonValidate(body: { json: string }) {
    try {
      const parsed = JSON.parse(body.json);
      return { valid: true, formatted: JSON.stringify(parsed, null, 2), error: null };
    } catch (err) {
      return {
        valid: false,
        formatted: null,
        error: err instanceof Error ? err.message : 'Invalid JSON',
      };
    }
  }

  jsonFormat(body: { json: string; minify?: boolean }) {
    try {
      const parsed = JSON.parse(body.json);
      const output = body.minify ? JSON.stringify(parsed) : JSON.stringify(parsed, null, 2);
      return { output };
    } catch (err) {
      throw new BadRequestException(err instanceof Error ? err.message : 'Invalid JSON');
    }
  }

  cssMinify(body: { css: string }) {
    const input = body.css ?? '';
    try {
      const result = new CleanCSS({}).minify(input);
      if (result.errors?.length) {
        throw new BadRequestException(result.errors.join(', '));
      }
      return {
        output: result.styles,
        savedBytes: Math.max(0, input.length - result.styles.length),
      };
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException(err instanceof Error ? err.message : 'CSS minify failed');
    }
  }

  jsBeautify(body: { code: string }) {
    return {
      output: beautifyJs(body.code ?? '', { indent_size: 2, wrap_line_length: 100 }),
    };
  }

  htmlToMarkdown(body: { html: string }) {
    try {
      const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
      return { markdown: td.turndown(body.html ?? '') };
    } catch (err) {
      throw new BadRequestException(err instanceof Error ? err.message : 'HTML conversion failed');
    }
  }

  regexTest(body: { pattern: string; flags?: string; text: string }) {
    let regex: RegExp;
    try {
      regex = new RegExp(body.pattern, body.flags ?? 'g');
    } catch (err) {
      throw new BadRequestException(err instanceof Error ? err.message : 'Invalid regex');
    }
    const matches: Array<{ match: string; index: number; groups: string[] }> = [];
    if (body.flags?.includes('g')) {
      for (const m of body.text.matchAll(regex)) {
        matches.push({
          match: m[0],
          index: m.index ?? 0,
          groups: m.slice(1).map(String),
        });
      }
    } else {
      const m = regex.exec(body.text);
      if (m) {
        matches.push({
          match: m[0],
          index: m.index ?? 0,
          groups: m.slice(1).map(String),
        });
      }
    }
    return { matches, count: matches.length };
  }

  csvToJson(body: { csv: string; delimiter?: string }) {
    const delimiter = body.delimiter === '\\t' ? '\t' : (body.delimiter ?? ',');
    const lines = body.csv.trim().split(/\r?\n/).filter(Boolean);
    if (!lines.length) return { json: '[]' };
    const headers = lines[0]!.split(delimiter).map((h) => h.trim());
    const rows = lines.slice(1).map((line) => {
      const cols = line.split(delimiter);
      const row: Record<string, string> = {};
      headers.forEach((h, i) => {
        row[h] = (cols[i] ?? '').trim();
      });
      return row;
    });
    return { json: JSON.stringify(rows, null, 2) };
  }

  jsonToCsv(body: { json: string }) {
    const data = JSON.parse(body.json) as Array<Record<string, unknown>>;
    if (!Array.isArray(data) || !data.length) {
      throw new BadRequestException('JSON must be a non-empty array of objects');
    }
    const keys = Object.keys(data[0]!);
    const lines = [
      keys.join(','),
      ...data.map((row) => keys.map((k) => this.csvEscape(String(row[k] ?? ''))).join(',')),
    ];
    return { csv: lines.join('\n') };
  }

  base64(body: { text: string; mode: 'encode' | 'decode' }) {
    if (body.mode === 'encode') {
      return { output: Buffer.from(body.text, 'utf8').toString('base64') };
    }
    return { output: Buffer.from(body.text, 'base64').toString('utf8') };
  }

  jwtDecode(body: { token: string }) {
    const parts = body.token.trim().split('.');
    if (parts.length < 2) {
      throw new BadRequestException('Invalid JWT format');
    }
    const decode = (part: string) => JSON.parse(Buffer.from(part, 'base64url').toString('utf8'));
    const header = decode(parts[0]!);
    const payload = decode(parts[1]!);
    const exp = payload.exp as number | undefined;
    return {
      header,
      payload,
      expired: exp ? Date.now() / 1000 > exp : null,
      expiresAt: exp ? new Date(exp * 1000).toISOString() : null,
    };
  }

  urlEncode(body: { text: string; mode: 'encode' | 'decode' }) {
    return {
      output:
        body.mode === 'encode' ? encodeURIComponent(body.text) : decodeURIComponent(body.text),
    };
  }

  uuidGenerate(body: { version?: string; count?: number }) {
    const count = Math.min(Math.max(body.count ?? 1, 1), 50);
    const version = body.version ?? 'v4';
    const ids: string[] = [];
    for (let i = 0; i < count; i += 1) {
      if (version === 'v1') ids.push(uuidV1());
      else if (version === 'v7') ids.push(uuidV7());
      else ids.push(uuidV4());
    }
    return { uuids: ids, version };
  }

  async apiTest(body: {
    url: string;
    method?: string;
    headers?: Array<{ key: string; value: string; enabled?: boolean }>;
    queryParams?: Array<{ key: string; value: string; enabled?: boolean }>;
    auth?: {
      type?: 'none' | 'bearer' | 'basic' | 'apikey';
      token?: string;
      username?: string;
      password?: string;
      key?: string;
      value?: string;
      addTo?: 'header' | 'query';
    };
    bodyType?: 'none' | 'json' | 'raw' | 'form' | 'urlencoded';
    body?: string;
    formData?: Array<{ key: string; value: string; enabled?: boolean }>;
    timeoutMs?: number;
  }) {
    const rawUrl = body.url?.trim();
    if (!rawUrl) {
      throw new BadRequestException('URL is required');
    }
    let target: URL;
    try {
      target = new URL(rawUrl);
    } catch {
      throw new BadRequestException('Invalid URL');
    }
    const method = (body.method || 'GET').toUpperCase();
    const allowed = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
    if (!allowed.includes(method)) {
      throw new BadRequestException(`Unsupported method: ${method}`);
    }
    for (const row of body.queryParams ?? []) {
      if (row.enabled === false || !row.key?.trim()) continue;
      target.searchParams.append(row.key.trim(), row.value ?? '');
    }
    const headerMap = new Map<string, string>();
    for (const row of body.headers ?? []) {
      if (row.enabled === false || !row.key?.trim()) continue;
      headerMap.set(row.key.trim(), row.value ?? '');
    }
    const auth = body.auth ?? { type: 'none' };
    if (auth.type === 'bearer' && auth.token?.trim()) {
      headerMap.set('Authorization', `Bearer ${auth.token.trim()}`);
    }
    if (auth.type === 'basic' && auth.username !== undefined) {
      const encoded = Buffer.from(
        `${auth.username}:${auth.password ?? ''}`,
        'utf8',
      ).toString('base64');
      headerMap.set('Authorization', `Basic ${encoded}`);
    }
    if (auth.type === 'apikey' && auth.key?.trim()) {
      if (auth.addTo === 'query') {
        target.searchParams.set(auth.key.trim(), auth.value ?? '');
      } else {
        headerMap.set(auth.key.trim(), auth.value ?? '');
      }
    }
    const headers: Record<string, string> = {};
    headerMap.forEach((v, k) => {
      headers[k] = v;
    });
    const noBody = ['GET', 'HEAD'].includes(method);
    let fetchBody: string | FormData | undefined;
    const bodyType = body.bodyType ?? 'none';
    if (!noBody && bodyType !== 'none') {
      if (bodyType === 'form') {
        const fd = new FormData();
        for (const row of body.formData ?? []) {
          if (row.enabled === false || !row.key?.trim()) continue;
          fd.append(row.key.trim(), row.value ?? '');
        }
        fetchBody = fd;
        headerMap.delete('Content-Type');
      } else if (bodyType === 'urlencoded') {
        const params = new URLSearchParams();
        for (const row of body.formData ?? []) {
          if (row.enabled === false || !row.key?.trim()) continue;
          params.append(row.key.trim(), row.value ?? '');
        }
        fetchBody = params.toString();
        if (![...headerMap.keys()].some((k) => k.toLowerCase() === 'content-type')) {
          headerMap.set('Content-Type', 'application/x-www-form-urlencoded');
        }
      } else {
        fetchBody = body.body ?? '';
        if (bodyType === 'json' && fetchBody) {
          if (![...headerMap.keys()].some((k) => k.toLowerCase() === 'content-type')) {
            headerMap.set('Content-Type', 'application/json');
          }
        }
      }
    }
    const finalHeaders: Record<string, string> = {};
    headerMap.forEach((v, k) => {
      finalHeaders[k] = v;
    });
    const timeout = Math.min(120000, Math.max(1000, body.timeoutMs ?? 30000));
    const started = Date.now();
    try {
      const requestHeaders = { ...finalHeaders };
      if (fetchBody instanceof FormData) {
        for (const key of Object.keys(requestHeaders)) {
          if (key.toLowerCase() === 'content-type') {
            delete requestHeaders[key];
          }
        }
      }
      const res = await fetch(target.toString(), {
        method,
        headers: requestHeaders,
        body: noBody ? undefined : fetchBody,
        signal: AbortSignal.timeout(timeout),
      });
      const text = await res.text();
      const truncated = text.slice(0, 100000);
      const contentType = res.headers.get('content-type') ?? '';
      let bodyKind: 'json' | 'html' | 'xml' | 'text' = 'text';
      if (contentType.includes('json') || this.looksLikeJson(truncated)) {
        bodyKind = 'json';
      } else if (contentType.includes('html')) {
        bodyKind = 'html';
      } else if (contentType.includes('xml')) {
        bodyKind = 'xml';
      }
      return {
        ok: res.ok,
        status: res.status,
        statusText: res.statusText,
        durationMs: Date.now() - started,
        sizeBytes: new TextEncoder().encode(truncated).length,
        contentType,
        bodyKind,
        finalUrl: target.toString(),
        headers: Object.fromEntries(res.headers.entries()),
        body: truncated,
        truncated: text.length > truncated.length,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Request failed';
      return {
        ok: false,
        status: 0,
        statusText: 'Error',
        durationMs: Date.now() - started,
        sizeBytes: 0,
        contentType: '',
        bodyKind: 'text' as const,
        finalUrl: target.toString(),
        headers: {},
        body: '',
        error: message,
        truncated: false,
      };
    }
  }

  private looksLikeJson(text: string): boolean {
    const t = text.trim();
    if (!t.startsWith('{') && !t.startsWith('[')) return false;
    try {
      JSON.parse(t);
      return true;
    } catch {
      return false;
    }
  }

  otpDetect(body: { subject?: string; text?: string; html?: string }) {
    const codes = extractOtpFallback(body.subject ?? '', body.text ?? '', body.html ?? '');
    return { codes, primary: codes[0] ?? null };
  }

  colorPicker(body: { hex: string }) {
    const hex = this.normalizeHex(body.hex);
    const rgb = this.hexToRgb(hex);
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    return { hex, rgb, hsl };
  }

  contrastChecker(body: { foreground: string; background: string }) {
    const fg = this.relativeLuminance(this.hexToRgb(this.normalizeHex(body.foreground)));
    const bg = this.relativeLuminance(this.hexToRgb(this.normalizeHex(body.background)));
    const ratio = (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
    return {
      ratio: Math.round(ratio * 100) / 100,
      aaNormal: ratio >= 4.5,
      aaaNormal: ratio >= 7,
      aaLarge: ratio >= 3,
    };
  }

  loremIpsum(body: { type?: string; count?: number }) {
    const words = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor'.split(' ');
    const count = Math.min(body.count ?? 3, 20);
    if (body.type === 'words') {
      return { text: Array.from({ length: count }, (_, i) => words[i % words.length]).join(' ') };
    }
    if (body.type === 'sentences') {
      return {
        text: Array.from({ length: count }, () => `${words[0]} ${words[1]} ${words[2]}.`).join(' '),
      };
    }
    return {
      text: Array.from(
        { length: count },
        () =>
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.',
      ).join('\n\n'),
    };
  }

  caseConvert(body: { text: string; mode: string }) {
    const t = body.text ?? '';
    const modes: Record<string, string> = {
      upper: t.toUpperCase(),
      lower: t.toLowerCase(),
      title: t.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()),
      camel: t
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, c: string) => c.toUpperCase())
        .replace(/^./, (c) => c.toLowerCase()),
      snake: t.trim().toLowerCase().replace(/\s+/g, '_'),
      kebab: t.trim().toLowerCase().replace(/\s+/g, '-'),
    };
    return { output: modes[body.mode] ?? t };
  }

  textDiff(body: { left: string; right: string }) {
    const parts = diffLines(body.left ?? '', body.right ?? '');
    return {
      parts: parts.map((p: Change) => ({
        value: p.value,
        added: p.added ?? false,
        removed: p.removed ?? false,
      })),
    };
  }

  wordCounter(body: { text: string }) {
    const text = body.text ?? '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim()).length;
    return {
      words,
      characters: chars,
      sentences,
      readingMinutes: Math.max(1, Math.ceil(words / 200)),
    };
  }

  htmlStripper(body: { html: string }) {
    const text = body.html
      .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return { text };
  }

  timestampConvert(body: { value: string; mode: string }) {
    const raw = (body.value ?? '').trim();
    if (!raw) {
      throw new BadRequestException('Value is required');
    }
    const mode = (body.mode ?? '').trim().toLowerCase();

    if (mode === 'todate' || mode === 'unix-to-iso') {
      if (!/^-?\d+(\.\d+)?$/.test(raw)) {
        throw new BadRequestException('Enter a Unix timestamp (digits only) for Unix → Date');
      }
      const num = Number(raw);
      const ms = raw.replace('.', '').length > 11 ? num : num * 1000;
      const date = new Date(ms);
      if (Number.isNaN(date.getTime())) {
        throw new BadRequestException('Invalid unix timestamp');
      }
      return { unix: Math.floor(ms / 1000), iso: date.toISOString(), human: date.toString() };
    }

    if (/^-?\d+(\.\d+)?$/.test(raw)) {
      throw new BadRequestException(
        'That looks like a Unix timestamp. Use Unix → Date, or enter an ISO date (e.g. 2024-06-05T12:00:00Z) for Date → Unix',
      );
    }

    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(
        'Invalid date. Use ISO format like 2024-06-05T12:00:00Z or 2024-06-05 12:00:00',
      );
    }
    return {
      unix: Math.floor(date.getTime() / 1000),
      iso: date.toISOString(),
      human: date.toString(),
    };
  }

  cronParse(body: { expression: string }) {
    try {
      const interval = parseExpression(body.expression);
      const next = interval.next().toString();
      return { valid: true, next, description: body.expression };
    } catch (err) {
      return {
        valid: false,
        next: null,
        description: err instanceof Error ? err.message : 'Invalid cron',
      };
    }
  }

  hashGenerate(body: { text: string; algorithms?: string[] }) {
    const algos = body.algorithms?.length
      ? body.algorithms
      : ['md5', 'sha1', 'sha256', 'sha512'];
    const hashes: Record<string, string> = {};
    for (const algo of algos) {
      if (['md5', 'sha1', 'sha256', 'sha512'].includes(algo)) {
        hashes[algo] = createHash(algo).update(body.text).digest('hex');
      }
    }
    return { hashes };
  }

  unitConvert(body: { value: number; from: string; to: string; rootPx?: number }) {
    const root = body.rootPx ?? 16;
    const px = this.toPx(body.value, body.from, root);
    const converted = this.fromPx(px, body.to, root);
    return { input: body.value, from: body.from, to: body.to, result: converted, px };
  }

  userAgentParse(body: { ua: string }) {
    const parser = new UAParser(body.ua);
    const result = parser.getResult();
    return result;
  }

  htmlEntities(body: { text: string; mode: 'encode' | 'decode' }) {
    if (body.mode === 'encode') {
      return {
        output: body.text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;'),
      };
    }
    return {
      output: body.text
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&'),
    };
  }

  private escapeHtml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private escapeXml(value: string) {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  private csvEscape(value: string) {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  private normalizeHex(hex: string) {
    const raw = hex.startsWith('#') ? hex.slice(1) : hex;
    return `#${raw.padStart(6, '0').slice(0, 6).toUpperCase()}`;
  }

  private hexToRgb(hex: string) {
    const raw = hex.replace('#', '');
    return {
      r: parseInt(raw.slice(0, 2), 16),
      g: parseInt(raw.slice(2, 4), 16),
      b: parseInt(raw.slice(4, 6), 16),
    };
  }

  private rgbToHsl(r: number, g: number, b: number) {
    r /= 255;
    g /= 255;
    b /= 255;
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
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  }

  private relativeLuminance(rgb: { r: number; g: number; b: number }) {
    const transform = (c: number) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * transform(rgb.r) + 0.7152 * transform(rgb.g) + 0.0722 * transform(rgb.b);
  }

  private toPx(value: number, unit: string, root: number) {
    switch (unit) {
      case 'px':
        return value;
      case 'rem':
        return value * root;
      case 'em':
        return value * root;
      case '%':
        return (value / 100) * root;
      case 'vh':
        return (value / 100) * 900;
      case 'vw':
        return (value / 100) * 1440;
      default:
        return value;
    }
  }

  private fromPx(px: number, unit: string, root: number) {
    switch (unit) {
      case 'px':
        return Math.round(px * 100) / 100;
      case 'rem':
        return Math.round((px / root) * 1000) / 1000;
      case 'em':
        return Math.round((px / root) * 1000) / 1000;
      case '%':
        return Math.round((px / root) * 10000) / 100;
      case 'vh':
        return Math.round((px / 900) * 10000) / 100;
      case 'vw':
        return Math.round((px / 1440) * 10000) / 100;
      default:
        return px;
    }
  }
}
