const OTP_HINT =
  /(?:verification|confirm(?:ation)?|security|access|login|auth(?:entication)?|one[- ]?time|otp|pin|passcode|code)[\s:;\-–—]*(?:is\s*)?(?:#)?\s*([0-9]{4,8})\b/i;

const OTP_WITH_EXPIRE = /\b([0-9]{6})\b(?=.*(?:expire|minute|valid|code))/is;

const OTP_GENERIC = /\b([0-9]{4,8})\b/g;

export function extractOtpFallback(
  subject: string,
  text: string,
  html: string,
): string[] {
  const plainHtml = html
    ? html
        .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
    : '';
  const blob = [subject, text, plainHtml].filter(Boolean).join('\n');
  if (!blob.trim()) {
    return [];
  }
  const seen = new Set<string>();
  const ordered: string[] = [];
  const push = (code: string) => {
    if (code.length < 4 || code.length > 8 || seen.has(code)) {
      return;
    }
    if (code.length === 4 && ordered.length > 0) {
      return;
    }
    seen.add(code);
    ordered.push(code);
  };
  const hint = blob.match(OTP_HINT);
  if (hint?.[1]) {
    push(hint[1]);
  }
  const expire = blob.match(OTP_WITH_EXPIRE);
  if (expire?.[1]) {
    push(expire[1]);
  }
  for (const match of blob.matchAll(OTP_GENERIC)) {
    push(match[1]);
    if (ordered.length >= 5) {
      break;
    }
  }
  return ordered.slice(0, 5);
}
