import type { ToolNavIconName } from "./tool-visuals";

export type ToolNavItem = {
  slug: string;
  label?: string;
};

export type ToolNavSection = {
  title: string;
  items: ToolNavItem[];
};

export type ToolNavRoot = {
  id: string;
  label: string;
  icon: ToolNavIconName;
  sections: ToolNavSection[];
};

export const TOOL_NAV_ROOTS: ToolNavRoot[] = [
  {
    id: "text-encoding",
    label: "Text & Encoding",
    icon: "text",
    sections: [
      {
        title: "Encoding / decoding tools",
        items: [
          { slug: "base64", label: "Base64 Encode/Decode" },
          { slug: "url-encoder", label: "URL Encode/Decode" },
          { slug: "html-entities", label: "HTML Encode/Decode" },
          { slug: "file-encode-decode", label: "File Encode/Decode" },
        ],
      },
      {
        title: "Text tools",
        items: [
          { slug: "case-converter", label: "Text Case Converter" },
          { slug: "string-utilities", label: "String Utilities" },
          { slug: "text-diff", label: "Text Diff" },
          { slug: "word-counter" },
          { slug: "html-stripper" },
          { slug: "lorem-ipsum" },
          { slug: "ai-paraphrase", label: "AI Paraphrasing Tool" },
          { slug: "ai-humanizer", label: "AI Humanizer" },
        ],
      },
    ],
  },
  {
    id: "code",
    label: "Code Tools",
    icon: "code",
    sections: [
      {
        title: "Code tools",
        items: [
          { slug: "cron-parser", label: "Cron Expression" },
          { slug: "uuid-generator", label: "UUID Generator" },
          { slug: "regex-tester", label: "Regex Tester" },
          { slug: "css-minifier", label: "CSS Minifier" },
          { slug: "markdown-editor", label: "Markdown Preview" },
          { slug: "js-beautifier", label: "JavaScript Beautifier" },
          { slug: "text-diff", label: "Code Diff" },
          { slug: "html-formatter", label: "HTML Formatter" },
          { slug: "json-to-code", label: "JSON to Code" },
          { slug: "xml-to-code", label: "XML to Code" },
          { slug: "sql-formatter", label: "SQL Formatter" },
          { slug: "ai-code-generator", label: "AI Code Generator" },
          { slug: "html-to-markdown" },
        ],
      },
    ],
  },
  {
    id: "json-xml",
    label: "JSON / XML",
    icon: "data",
    sections: [
      {
        title: "JSON tools",
        items: [
          { slug: "json-formatter", label: "JSON Formatter" },
          { slug: "json-validator", label: "JSON Validator" },
          { slug: "json-to-xml", label: "JSON to XML" },
          { slug: "csv-to-json", label: "CSV ⇄ JSON" },
          { slug: "json-diff", label: "JSON Diff" },
          { slug: "json-schema-generator", label: "JSON Schema Generator" },
          { slug: "json-to-code", label: "JSON to Code" },
        ],
      },
      {
        title: "XML tools",
        items: [
          { slug: "xml-formatter", label: "XML Formatter" },
          { slug: "xml-to-json", label: "XML to JSON" },
          { slug: "xml-to-csv", label: "XML to CSV" },
          { slug: "csv-to-xml", label: "CSV to XML" },
          { slug: "xml-validator", label: "XML Validator" },
          { slug: "xml-to-code", label: "XML to Code" },
        ],
      },
    ],
  },
  {
    id: "security",
    label: "Security & Crypto",
    icon: "security",
    sections: [
      {
        title: "Security tools",
        items: [
          { slug: "jwt-decoder", label: "JWT Decoder" },
          { slug: "encrypt-decrypt", label: "Encrypt / Decrypt" },
          { slug: "hash-generator", label: "Hash Generator" },
          { slug: "password-generator", label: "Password Generator" },
        ],
      },
    ],
  },
  {
    id: "utilities",
    label: "Utilities",
    icon: "utilities",
    sections: [
      {
        title: "Email & identity",
        items: [
          { slug: "temp-mail" },
          { slug: "otp-detector" },
          { slug: "code-reader", label: "Auto Code Reader" },
        ],
      },
      {
        title: "PDF & documents",
        items: [
          { slug: "pdf-to-word" },
          { slug: "merge-pdf" },
          { slug: "split-pdf" },
          { slug: "compress-pdf" },
        ],
      },
      {
        title: "Media & images",
        items: [
          { slug: "image-compressor" },
          { slug: "image-converter" },
          { slug: "image-to-text", label: "Screenshot to Text" },
          { slug: "speech-to-text" },
          { slug: "youtube-thumbnail" },
          { slug: "qr-generator", label: "QR Code Generator" },
        ],
      },
      {
        title: "AI & career",
        items: [
          { slug: "ai-resume-builder" },
        ],
      },
      {
        title: "SEO & web",
        items: [
          { slug: "meta-tags-generator" },
          { slug: "robots-txt" },
          { slug: "sitemap-generator" },
          { slug: "speed-test", label: "Website Speed Test" },
          { slug: "api-tester" },
        ],
      },
      {
        title: "Network & lookup",
        items: [
          { slug: "whois-lookup" },
          { slug: "ip-lookup" },
          { slug: "user-agent-parser" },
        ],
      },
      {
        title: "Design & color",
        items: [
          { slug: "palette-generator" },
          { slug: "color-picker" },
          { slug: "contrast-checker" },
        ],
      },
      {
        title: "Other",
        items: [
          { slug: "timestamp-converter" },
          { slug: "unit-converter" },
        ],
      },
    ],
  },
];

const slugToNavRoot = new Map<string, string>();

for (const root of TOOL_NAV_ROOTS) {
  for (const section of root.sections) {
    for (const item of section.items) {
      if (!slugToNavRoot.has(item.slug)) {
        slugToNavRoot.set(item.slug, root.id);
      }
    }
  }
}

export function getAllNavSlugs(): string[] {
  const slugs: string[] = [];
  for (const root of TOOL_NAV_ROOTS) {
    for (const section of root.sections) {
      for (const item of section.items) {
        if (!slugs.includes(item.slug)) slugs.push(item.slug);
      }
    }
  }
  return slugs;
}

export function getNavRootForSlug(slug: string): string | undefined {
  return slugToNavRoot.get(slug);
}

export function getSlugsForNavRoot(navId: string): string[] {
  const root = TOOL_NAV_ROOTS.find((r) => r.id === navId);
  if (!root) return [];
  const slugs: string[] = [];
  for (const section of root.sections) {
    for (const item of section.items) {
      if (!slugs.includes(item.slug)) slugs.push(item.slug);
    }
  }
  return slugs;
}

export function getNavLabel(slug: string, fallback: string): string {
  for (const root of TOOL_NAV_ROOTS) {
    for (const section of root.sections) {
      const hit = section.items.find((i) => i.slug === slug);
      if (hit?.label) return hit.label;
    }
  }
  return fallback;
}
