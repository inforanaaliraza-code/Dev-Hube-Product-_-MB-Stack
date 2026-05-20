export const TOOL_CATEGORIES = [
  'Formatting',
  'Encoding',
  'Generators',
  'AI',
  'PDF',
  'Email',
  'Text',
  'Media',
  'Security',
  'Color',
  'Web',
  'SEO',
  'Network',
  'Identity',
  'Time',
] as const;

export type ToolCategory = (typeof TOOL_CATEGORIES)[number];
