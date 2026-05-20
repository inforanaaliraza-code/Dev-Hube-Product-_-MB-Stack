export function normalizeHexColor(value: string | undefined, fallback: string): string {
  if (!value?.trim()) {
    return fallback;
  }
  const raw = value.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(raw)) {
    return `#${raw
      .split('')
      .map((c) => c + c)
      .join('')
      .toLowerCase()}`;
  }
  if (/^[0-9a-fA-F]{6}$/.test(raw)) {
    return `#${raw.toLowerCase()}`;
  }
  throw new Error('Invalid color format');
}
