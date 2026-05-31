declare module 'clean-css' {
  class CleanCSS {
    constructor(options?: Record<string, unknown>);
    minify(input: string): { styles: string; errors?: unknown[] };
  }
  export = CleanCSS;
}

declare module 'cron-parser' {
  export function parseExpression(
    expression: string,
    options?: Record<string, unknown>,
  ): {
    next(): Date;
    fields: Record<string, unknown>;
  };
}

declare module 'diff' {
  export interface Change {
    value: string;
    added?: boolean;
    removed?: boolean;
  }
  export function diffLines(oldStr: string, newStr: string): Change[];
}

declare module 'js-beautify' {
  export const js: (code: string, options?: Record<string, unknown>) => string;
}

declare module 'turndown' {
  export default class TurndownService {
    constructor(options?: Record<string, unknown>);
    turndown(html: string): string;
  }
}

declare module 'ua-parser-js' {
  export class UAParser {
    constructor(ua?: string);
    getResult(): Record<string, unknown>;
  }
}

declare module 'marked' {
  export const marked: {
    parse(src: string, options?: Record<string, unknown>): string | Promise<string>;
  };
}

declare module 'sql-formatter' {
  export function format(sql: string, options?: Record<string, unknown>): string;
}
