import 'tool_config.dart';

class ToolSpec {
  static String runLabel(ToolKind k) {
    switch (k) {
      case ToolKind.qrGenerator:
        return 'Generate QR';
      case ToolKind.password:
        return 'Run';
      case ToolKind.lorem:
        return 'Generate';
      case ToolKind.uuid:
        return 'Generate UUIDs';
      case ToolKind.imageCompressor:
      case ToolKind.compressPdf:
        return 'Compress';
      case ToolKind.pdfToWord:
        return 'Convert';
      case ToolKind.mergePdf:
        return 'Merge PDFs';
      case ToolKind.splitPdf:
        return 'Run';
      case ToolKind.aiCode:
      case ToolKind.aiResume:
      case ToolKind.aiParaphrase:
      case ToolKind.aiHumanizer:
        return 'Generate';
      default:
        return 'Run';
    }
  }

  static String inputHint(ToolKind k, String slug) {
    switch (k) {
      case ToolKind.apiTester:
        return 'https://api.example.com/endpoint';
      case ToolKind.qrGenerator:
        return 'URL or text for QR code';
      case ToolKind.jwt:
        return 'Paste JWT token';
      case ToolKind.jsonFormat:
      case ToolKind.jsonValidate:
      case ToolKind.jsonToCsv:
        return 'Paste JSON';
      case ToolKind.csvToJson:
        return 'Paste CSV';
      case ToolKind.regex:
        return 'Regular expression pattern';
      case ToolKind.textDiff:
        return 'Original text';
      case ToolKind.lorem:
        return 'Number of paragraphs (optional)';
      case ToolKind.metaTags:
        return 'Page title';
      case ToolKind.robotsTxt:
        return 'Disallow paths (one per line)';
      case ToolKind.sitemap:
        return 'URLs (one per line)';
      case ToolKind.colorPicker:
        return '#A855F7';
      case ToolKind.contrastChecker:
        return 'Foreground hex (#000000)';
      case ToolKind.whoisLookup:
        return 'example.com';
      case ToolKind.ipLookup:
        return 'IP address (leave empty for your IP)';
      case ToolKind.speedTest:
      case ToolKind.youtubeThumbnail:
        return 'https://';
      case ToolKind.aiCode:
        return 'Describe the code you need';
      case ToolKind.aiResume:
        return 'Your full name';
      case ToolKind.aiParaphrase:
      case ToolKind.aiHumanizer:
      case ToolKind.markdownEditor:
        return 'Paste text or Markdown';
      case ToolKind.sqlFormatter:
        return 'SQL query';
      case ToolKind.paletteGenerator:
        return 'Seed color hex';
      case ToolKind.localFormat:
        if (slug == 'file-encode-decode') return 'Base64 text (decode mode)';
        return 'Input for $slug';
      default:
        return 'Input';
    }
  }

  static String? input2Hint(ToolKind k, [String slug = '']) {
    if (k == ToolKind.localFormat && slug == 'json-diff') {
      return 'Second JSON document';
    }
    switch (k) {
      case ToolKind.regex:
        return 'Sample text to test';
      case ToolKind.textDiff:
        return 'Changed text';
      case ToolKind.apiTester:
        return 'Request body (POST/PUT)';
      case ToolKind.contrastChecker:
        return 'Background hex (#FFFFFF)';
      case ToolKind.metaTags:
        return 'Meta description';
      case ToolKind.splitPdf:
        return 'Page range e.g. 1-3';
      case ToolKind.aiResume:
        return 'Job title / role';
      case ToolKind.otpDetector:
      case ToolKind.codeReader:
        return 'Email subject (optional)';
      case ToolKind.unitConverter:
        return 'Root font size (px)';
      default:
        return null;
    }
  }

  static String? fieldUrlHint(ToolKind k) {
    switch (k) {
      case ToolKind.metaTags:
        return 'Canonical URL';
      case ToolKind.robotsTxt:
        return 'Sitemap URL (optional)';
      case ToolKind.aiResume:
        return 'Skills (comma separated)';
      default:
        return null;
    }
  }

  static List<({String label, String value})> modes(ToolKind k, [String slug = '']) {
    switch (k) {
      case ToolKind.base64:
      case ToolKind.urlEncode:
      case ToolKind.htmlEntities:
        return [(label: 'Encode', value: 'encode'), (label: 'Decode', value: 'decode')];
      case ToolKind.jsonFormat:
        return [(label: 'Format', value: 'format'), (label: 'Minify', value: 'minify')];
      case ToolKind.timestamp:
        return [(label: 'To date', value: 'toDate'), (label: 'To Unix', value: 'toUnix')];
      case ToolKind.caseConvert:
        return [
          (label: 'camel', value: 'camel'),
          (label: 'snake', value: 'snake'),
          (label: 'kebab', value: 'kebab'),
          (label: 'UPPER', value: 'upper'),
        ];
      case ToolKind.apiTester:
        return [
          (label: 'GET', value: 'GET'),
          (label: 'POST', value: 'POST'),
          (label: 'PUT', value: 'PUT'),
          (label: 'DELETE', value: 'DELETE'),
        ];
      case ToolKind.uuid:
        return [(label: 'v4', value: 'v4'), (label: 'v1', value: 'v1')];
      case ToolKind.password:
        return [
          (label: 'Generate', value: 'generate'),
          (label: 'Breach check', value: 'breach'),
        ];
      case ToolKind.splitPdf:
        return [
          (label: 'Inspect', value: 'inspect'),
          (label: 'Split', value: 'split'),
        ];
      case ToolKind.compressPdf:
        return [
          (label: 'Low', value: 'low'),
          (label: 'Medium', value: 'medium'),
          (label: 'High', value: 'high'),
        ];
      case ToolKind.imageConverter:
        return [
          (label: 'PNG', value: 'png'),
          (label: 'JPG', value: 'jpg'),
          (label: 'WebP', value: 'webp'),
        ];
      case ToolKind.aiCode:
        return [
          (label: 'TS', value: 'typescript'),
          (label: 'JS', value: 'javascript'),
          (label: 'Python', value: 'python'),
        ];
      case ToolKind.sqlFormatter:
        return [
          (label: 'PostgreSQL', value: 'postgresql'),
          (label: 'MySQL', value: 'mysql'),
          (label: 'SQLite', value: 'sqlite'),
        ];
      case ToolKind.unitConverter:
        return [
          (label: 'px→rem', value: 'px-rem'),
          (label: 'rem→px', value: 'rem-px'),
          (label: 'px→em', value: 'px-em'),
        ];
      case ToolKind.localFormat:
        if (slug == 'string-utilities') {
          return [
            (label: 'Trim', value: 'trim'),
            (label: 'Reverse', value: 'reverse'),
            (label: 'Sort', value: 'sort'),
          ];
        }
        if (slug == 'encrypt-decrypt' || slug == 'file-encode-decode') {
          return [
            (label: 'Encode', value: 'encode'),
            (label: 'Decode', value: 'decode'),
          ];
        }
        if (slug == 'json-to-code') {
          return [
            (label: 'TypeScript', value: 'typescript'),
            (label: 'Python', value: 'python'),
          ];
        }
        return [];
      default:
        return [];
    }
  }

  static List<String>? fileExtensions(ToolKind k) {
    switch (k) {
      case ToolKind.imageCompressor:
      case ToolKind.imageToText:
      case ToolKind.imageConverter:
        return ['png', 'jpg', 'jpeg', 'webp', 'gif'];
      case ToolKind.pdfToWord:
      case ToolKind.splitPdf:
      case ToolKind.compressPdf:
        return ['pdf'];
      case ToolKind.mergePdf:
        return ['pdf'];
      case ToolKind.speechToText:
        return ['mp3', 'wav', 'm4a', 'ogg', 'webm'];
      default:
        return null;
    }
  }

  static bool fileMultiple(ToolKind k) => k == ToolKind.mergePdf;

  static int inputLines(ToolKind k) {
    if (k == ToolKind.apiTester || k == ToolKind.qrGenerator) return 2;
    if (k == ToolKind.sitemap || k == ToolKind.robotsTxt) return 8;
    return 10;
  }
}
