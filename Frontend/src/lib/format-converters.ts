export function jsonToXml(value: unknown, rootTag = "root"): string {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const node = (tag: string, v: unknown): string => {
    if (v === null || v === undefined) return `<${tag}></${tag}>`;
    if (Array.isArray(v)) {
      return v.map((item, i) => node(`${tag}_item`, item)).join("");
    }
    if (typeof v === "object") {
      const inner = Object.entries(v as Record<string, unknown>)
        .map(([k, val]) => node(k.replace(/[^a-zA-Z0-9_-]/g, "_"), val))
        .join("");
      return `<${tag}>${inner}</${tag}>`;
    }
    return `<${tag}>${esc(String(v))}</${tag}>`;
  };

  return `<?xml version="1.0" encoding="UTF-8"?>\n${node(rootTag, value)}`;
}

export function xmlToJson(xml: string): string {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const err = doc.querySelector("parsererror");
  if (err) throw new Error(err.textContent || "Invalid XML");

  const walk = (el: Element): unknown => {
    const kids = Array.from(el.children);
    if (!kids.length) {
      const t = el.textContent?.trim() ?? "";
      if (t === "true") return true;
      if (t === "false") return false;
      if (t !== "" && !Number.isNaN(Number(t))) return Number(t);
      return t;
    }
    const obj: Record<string, unknown> = {};
    for (const child of kids) {
      const val = walk(child);
      const key = child.tagName;
      if (obj[key] !== undefined) {
        const prev = obj[key];
        obj[key] = Array.isArray(prev) ? [...prev, val] : [prev, val];
      } else {
        obj[key] = val;
      }
    }
    return obj;
  };

  return JSON.stringify(walk(doc.documentElement), null, 2);
}

export function prettyXml(xml: string): string {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const err = doc.querySelector("parsererror");
  if (err) throw new Error(err.textContent || "Invalid XML");
  const serializer = new XMLSerializer();
  const raw = serializer.serializeToString(doc);
  let pad = 0;
  return raw
    .replace(/>\s*</g, ">\n<")
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (trimmed.match(/^<\/.+>/)) pad = Math.max(0, pad - 1);
      const out = `${"  ".repeat(pad)}${trimmed}`;
      if (trimmed.match(/^<[^!?/][^>]*[^/]>$/)) pad += 1;
      return out;
    })
    .join("\n");
}

export function validateXml(xml: string): { valid: boolean; error: string | null } {
  try {
    const doc = new DOMParser().parseFromString(xml, "application/xml");
    const err = doc.querySelector("parsererror");
    if (err) return { valid: false, error: err.textContent || "Invalid XML" };
    return { valid: true, error: null };
  } catch (e) {
    return { valid: false, error: e instanceof Error ? e.message : "Invalid XML" };
  }
}

export function inferJsonSchema(value: unknown): Record<string, unknown> {
  if (value === null) return { type: "null" };
  if (Array.isArray(value)) {
    return {
      type: "array",
      items: value.length ? inferJsonSchema(value[0]) : {},
    };
  }
  if (typeof value === "object") {
    const props: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      props[k] = inferJsonSchema(v);
    }
    return { type: "object", properties: props };
  }
  if (typeof value === "number") {
    return Number.isInteger(value) ? { type: "integer" } : { type: "number" };
  }
  if (typeof value === "boolean") return { type: "boolean" };
  return { type: "string" };
}

export function jsonToTypeScript(json: string, name = "Root"): string {
  const data = JSON.parse(json) as unknown;
  const typeOf = (v: unknown, key: string): string => {
    if (v === null) return "null";
    if (Array.isArray(v)) {
      const inner = v.length ? typeOf(v[0], key) : "unknown";
      return `${inner}[]`;
    }
    if (typeof v === "object") {
      const lines = Object.entries(v as Record<string, unknown>).map(
        ([k, val]) => `  ${k}: ${typeOf(val, k)};`,
      );
      return `{\n${lines.join("\n")}\n}`;
    }
    if (typeof v === "number") return "number";
    if (typeof v === "boolean") return "boolean";
    return "string";
  };
  return `export type ${name} = ${typeOf(data, name)};`;
}

export function jsonToPythonClass(json: string, name = "Root"): string {
  const data = JSON.parse(json) as unknown;
  const lines: string[] = [`class ${name}:`];
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return `${name} = ${JSON.stringify(data)}`;
  }
  for (const [k, v] of Object.entries(data)) {
    if (typeof v === "string") lines.push(`    ${k}: str = ""`);
    else if (typeof v === "number") lines.push(`    ${k}: float = 0`);
    else if (typeof v === "boolean") lines.push(`    ${k}: bool = False`);
    else lines.push(`    ${k}: object = None`);
  }
  return lines.join("\n");
}

export function prettyHtml(html: string): string {
  return html
    .replace(/>\s+</g, "><")
    .replace(/></g, ">\n<")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}
