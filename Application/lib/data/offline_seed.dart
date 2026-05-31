import 'models/tool_model.dart';

class OfflineSeed {
  static List<ToolModel>? _toolsCache;

  static List<ToolModel> tools() {
    return _toolsCache ??= _buildTools();
  }

  static List<String> categoriesFor(List<ToolModel> tools) {
    return tools.map((t) => t.category).toSet().toList()..sort();
  }

  static ToolModel _t(
    String slug,
    String name,
    String tagline,
    String category, {
    String icon = 'wrench',
    String accent = 'violet',
    bool featured = false,
  }) {
    return ToolModel(
      id: slug,
      slug: slug,
      name: name,
      tagline: tagline,
      description: tagline,
      category: category,
      icon: icon,
      accent: accent,
      status: 'ready',
      keywords: [slug, name.toLowerCase()],
      featured: featured,
    );
  }

  static List<ToolModel> _buildTools() => [
        _t('temp-mail', 'Temp Mail', 'Temporary email & fake inbox', 'Email', icon: 'mail', accent: 'emerald', featured: true),
        _t('qr-generator', 'QR Code Generator', 'Custom colors, logo & analytics', 'Generators', icon: 'qr-code', accent: 'amber', featured: true),
        _t('image-compressor', 'Image Compressor', 'Reduce image size instantly', 'Media', icon: 'minimize-2', accent: 'violet', featured: true),
        _t('pdf-to-word', 'PDF to Word', 'Convert PDF to editable DOCX', 'PDF', icon: 'file-text', accent: 'cyan', featured: true),
        _t('merge-pdf', 'Merge PDF', 'Combine multiple PDFs', 'PDF', icon: 'file-stack', accent: 'fuchsia'),
        _t('split-pdf', 'Split PDF', 'Extract pages from PDF', 'PDF', icon: 'scissors', accent: 'amber'),
        _t('compress-pdf', 'Compress PDF', 'Shrink PDF file size', 'PDF', icon: 'minimize-2', accent: 'emerald'),
        _t('ai-code-generator', 'AI Code Generator', 'Generate code with AI', 'AI', icon: 'bot', accent: 'violet', featured: true),
        _t('sql-formatter', 'SQL Formatter', 'Beautify & build queries', 'Formatting', icon: 'database', accent: 'cyan', featured: true),
        _t('password-generator', 'Password Generator', 'Strong passwords + breach check', 'Security', icon: 'lock', accent: 'emerald', featured: true),
        _t('palette-generator', 'Color Palette Generator', 'Palettes & gradient builder', 'Color', icon: 'palette', accent: 'violet', featured: true),
        _t('markdown-editor', 'Markdown Editor', 'Write & preview live', 'Text', icon: 'file-code', accent: 'fuchsia', featured: true),
        _t('ai-resume-builder', 'AI Resume Builder', 'AI CV generator', 'AI', icon: 'user-round', accent: 'amber', featured: true),
        _t('youtube-thumbnail', 'YouTube Thumbnail Downloader', 'HD thumbnails in one click', 'Media', icon: 'youtube', accent: 'fuchsia'),
        _t('image-to-text', 'Screenshot to Text', 'OCR online — image to text', 'AI', icon: 'scan-text', accent: 'cyan'),
        _t('speech-to-text', 'Speech to Text', 'Audio transcription', 'AI', icon: 'mic', accent: 'emerald'),
        _t('ai-paraphrase', 'AI Paraphrasing Tool', 'Rewrite text with AI', 'AI', icon: 'refresh-cw', accent: 'violet'),
        _t('ai-humanizer', 'AI Humanizer', 'Humanize AI text', 'AI', icon: 'wand-2', accent: 'fuchsia', featured: true),
        _t('whois-lookup', 'Domain WHOIS Lookup', 'Registrar & expiry info', 'Network', icon: 'search', accent: 'amber'),
        _t('ip-lookup', 'IP Address Lookup', 'Geo & ISP details', 'Network', icon: 'map-pin', accent: 'cyan'),
        _t('speed-test', 'Website Speed Test', 'Core Web Vitals audit', 'Web', icon: 'gauge', accent: 'emerald'),
        _t('meta-tags-generator', 'Meta Tags Generator', 'OG & Twitter cards', 'SEO', icon: 'tags', accent: 'violet'),
        _t('robots-txt', 'Robots.txt Generator', 'Crawler rules builder', 'SEO', icon: 'bot', accent: 'fuchsia'),
        _t('sitemap-generator', 'Sitemap Generator', 'XML sitemap from URLs', 'SEO', icon: 'map', accent: 'amber'),
        _t('json-validator', 'JSON Validator', 'Validate & pretty-print', 'Formatting', icon: 'braces', accent: 'violet'),
        _t('json-formatter', 'JSON Formatter', 'Pretty-print & minify JSON', 'Formatting', icon: 'braces', accent: 'violet'),
        _t('css-minifier', 'CSS Minifier', 'Shrink stylesheets', 'Formatting', icon: 'minus', accent: 'cyan'),
        _t('js-beautifier', 'JavaScript Beautifier', 'Format & prettify JS', 'Formatting', icon: 'code-2', accent: 'amber'),
        _t('html-to-markdown', 'HTML to Markdown', 'Convert HTML to MD', 'Text', icon: 'file-down', accent: 'emerald'),
        _t('regex-tester', 'Regex Tester', 'Test patterns in real time', 'Formatting', icon: 'regex', accent: 'fuchsia'),
        _t('csv-to-json', 'CSV ⇄ JSON', 'Convert between formats', 'Formatting', icon: 'file-spreadsheet', accent: 'emerald'),
        _t('base64', 'Base64 Encoder', 'Encode & decode Base64', 'Encoding', icon: 'binary', accent: 'cyan'),
        _t('jwt-decoder', 'JWT Decoder', 'Inspect JSON Web Tokens', 'Encoding', icon: 'key-round', accent: 'violet'),
        _t('url-encoder', 'URL Encoder', 'Encode/decode URL strings', 'Encoding', icon: 'link-2', accent: 'cyan'),
        _t('uuid-generator', 'UUID Generator', 'Generate v1, v4, v7 UUIDs', 'Generators', icon: 'hash', accent: 'amber'),
        _t('api-tester', 'API Tester', 'Postman-style REST client', 'Network', icon: 'send', accent: 'fuchsia', featured: true),
        _t('otp-detector', 'OTP Detector', 'Auto-extract verification codes', 'Identity', icon: 'shield-check', accent: 'violet'),
        _t('code-reader', 'Auto Code Reader', 'Live OTP listener', 'Identity', icon: 'radio', accent: 'amber'),
        _t('color-picker', 'Color Picker', 'HEX, RGB, HSL, OKLCH', 'Color', icon: 'pipette', accent: 'fuchsia'),
        _t('contrast-checker', 'Contrast Checker', 'WCAG accessibility ratios', 'Color', icon: 'shield-check', accent: 'emerald'),
        _t('lorem-ipsum', 'Lorem Ipsum', 'Placeholder text generator', 'Text', icon: 'type', accent: 'amber'),
        _t('case-converter', 'Case Converter', 'camel, snake, kebab, title', 'Text', icon: 'align-left', accent: 'cyan'),
        _t('text-diff', 'Text Diff', 'Compare two text blocks', 'Text', icon: 'diff', accent: 'violet'),
        _t('word-counter', 'Word Counter', 'Words, chars & reading time', 'Text', icon: 'calculator', accent: 'emerald'),
        _t('html-stripper', 'HTML Stripper', 'Remove HTML tags', 'Text', icon: 'eraser', accent: 'amber'),
        _t('timestamp-converter', 'Timestamp Converter', 'Unix ⇄ ISO ⇄ Human', 'Time', icon: 'clock', accent: 'cyan'),
        _t('cron-parser', 'Cron Parser', 'Explain cron expressions', 'Time', icon: 'clock', accent: 'violet'),
        _t('hash-generator', 'Hash Generator', 'MD5, SHA-1, SHA-256, SHA-512', 'Security', icon: 'fingerprint', accent: 'fuchsia'),
        _t('image-converter', 'Image Converter', 'PNG, JPG, WebP, AVIF', 'Media', icon: 'image', accent: 'violet'),
        _t('unit-converter', 'Unit Converter', 'px, rem, em, %, vh, vw', 'Web', icon: 'ruler', accent: 'cyan'),
        _t('user-agent-parser', 'User-Agent Parser', 'Decode UA strings', 'Web', icon: 'globe', accent: 'emerald'),
        _t('html-entities', 'HTML Entities', 'Encode & decode entities', 'Encoding', icon: 'code-2', accent: 'fuchsia'),
        _t('file-encode-decode', 'File Encode/Decode', 'Base64 files in the browser', 'Encoding', icon: 'binary', accent: 'cyan'),
        _t('string-utilities', 'String Utilities', 'Trim, reverse, sort & more', 'Text', icon: 'type', accent: 'violet'),
        _t('html-formatter', 'HTML Formatter', 'Beautify HTML markup', 'Formatting', icon: 'code-2', accent: 'cyan'),
        _t('json-to-xml', 'JSON to XML', 'Convert JSON to XML', 'Formatting', icon: 'braces', accent: 'emerald'),
        _t('json-diff', 'JSON Diff', 'Compare two JSON documents', 'Formatting', icon: 'diff', accent: 'fuchsia'),
        _t('json-schema-generator', 'JSON Schema Generator', 'Schema from sample JSON', 'Formatting', icon: 'braces', accent: 'amber'),
        _t('json-to-code', 'JSON to Code', 'Types from JSON', 'Formatting', icon: 'code-2', accent: 'violet'),
        _t('xml-formatter', 'XML Formatter', 'Pretty-print XML', 'Formatting', icon: 'file-code', accent: 'cyan'),
        _t('xml-to-json', 'XML to JSON', 'Convert XML to JSON', 'Formatting', icon: 'braces', accent: 'emerald'),
        _t('xml-to-csv', 'XML to CSV', 'XML rows to CSV', 'Formatting', icon: 'file-spreadsheet', accent: 'amber'),
        _t('csv-to-xml', 'CSV to XML', 'CSV rows to XML', 'Formatting', icon: 'file-spreadsheet', accent: 'fuchsia'),
        _t('xml-validator', 'XML Validator', 'Check XML syntax', 'Formatting', icon: 'shield-check', accent: 'emerald'),
        _t('xml-to-code', 'XML to Code', 'Types from XML', 'Formatting', icon: 'code-2', accent: 'violet'),
        _t('encrypt-decrypt', 'Encrypt / Decrypt', 'AES-GCM with password', 'Security', icon: 'lock', accent: 'amber'),
        _t('json-to-csv', 'JSON to CSV', 'Convert JSON to CSV', 'Formatting', icon: 'file-spreadsheet', accent: 'emerald'),
      ];
}
