enum ToolKind {
  base64,
  urlEncode,
  htmlEntities,
  jwt,
  uuid,
  jsonFormat,
  jsonValidate,
  hash,
  timestamp,
  cronParser,
  caseConvert,
  wordCount,
  lorem,
  regex,
  textDiff,
  cssMinify,
  jsBeautify,
  htmlToMarkdown,
  htmlStripper,
  csvToJson,
  jsonToCsv,
  password,
  apiTester,
  qrGenerator,
  metaTags,
  robotsTxt,
  sitemap,
  colorPicker,
  contrastChecker,
  otpDetector,
  codeReader,
  unitConverter,
  userAgentParser,
  tempMail,
  imageCompressor,
  pdfToWord,
  mergePdf,
  splitPdf,
  compressPdf,
  aiCode,
  aiResume,
  aiParaphrase,
  aiHumanizer,
  sqlFormatter,
  markdownEditor,
  paletteGenerator,
  youtubeThumbnail,
  imageToText,
  speechToText,
  imageConverter,
  whoisLookup,
  ipLookup,
  speedTest,
  localFormat,
}

enum ToolUiLayout { workflow, tempMail, fileUpload, dualInput, multiField }

class ToolConfig {
  static ToolKind kindForSlug(String slug) => _map[slug] ?? ToolKind.localFormat;

  static bool isNative(String slug) => true;

  static bool worksOffline(ToolKind kind) => kind == ToolKind.localFormat;

  static ToolUiLayout layoutFor(ToolKind kind) {
    switch (kind) {
      case ToolKind.tempMail:
        return ToolUiLayout.tempMail;
      case ToolKind.imageCompressor:
      case ToolKind.pdfToWord:
      case ToolKind.mergePdf:
      case ToolKind.splitPdf:
      case ToolKind.compressPdf:
      case ToolKind.imageToText:
      case ToolKind.speechToText:
      case ToolKind.imageConverter:
        return ToolUiLayout.fileUpload;
      case ToolKind.localFormat:
        return ToolUiLayout.workflow;
      case ToolKind.regex:
      case ToolKind.textDiff:
      case ToolKind.contrastChecker:
      case ToolKind.metaTags:
        return ToolUiLayout.multiField;
      default:
        return ToolUiLayout.workflow;
    }
  }

  static const _map = <String, ToolKind>{
    'api-tester': ToolKind.apiTester,
    'base64': ToolKind.base64,
    'url-encoder': ToolKind.urlEncode,
    'html-entities': ToolKind.htmlEntities,
    'jwt-decoder': ToolKind.jwt,
    'uuid-generator': ToolKind.uuid,
    'json-formatter': ToolKind.jsonFormat,
    'json-validator': ToolKind.jsonValidate,
    'hash-generator': ToolKind.hash,
    'timestamp-converter': ToolKind.timestamp,
    'cron-parser': ToolKind.cronParser,
    'case-converter': ToolKind.caseConvert,
    'word-counter': ToolKind.wordCount,
    'lorem-ipsum': ToolKind.lorem,
    'regex-tester': ToolKind.regex,
    'text-diff': ToolKind.textDiff,
    'css-minifier': ToolKind.cssMinify,
    'js-beautifier': ToolKind.jsBeautify,
    'html-to-markdown': ToolKind.htmlToMarkdown,
    'html-stripper': ToolKind.htmlStripper,
    'json-diff': ToolKind.localFormat,
    'csv-to-json': ToolKind.csvToJson,
    'json-to-csv': ToolKind.jsonToCsv,
    'password-generator': ToolKind.password,
    'meta-tags-generator': ToolKind.metaTags,
    'robots-txt': ToolKind.robotsTxt,
    'sitemap-generator': ToolKind.sitemap,
    'color-picker': ToolKind.colorPicker,
    'contrast-checker': ToolKind.contrastChecker,
    'otp-detector': ToolKind.otpDetector,
    'code-reader': ToolKind.codeReader,
    'unit-converter': ToolKind.unitConverter,
    'user-agent-parser': ToolKind.userAgentParser,
    'temp-mail': ToolKind.tempMail,
    'qr-generator': ToolKind.qrGenerator,
    'image-compressor': ToolKind.imageCompressor,
    'pdf-to-word': ToolKind.pdfToWord,
    'merge-pdf': ToolKind.mergePdf,
    'split-pdf': ToolKind.splitPdf,
    'compress-pdf': ToolKind.compressPdf,
    'ai-code-generator': ToolKind.aiCode,
    'ai-resume-builder': ToolKind.aiResume,
    'ai-paraphrase': ToolKind.aiParaphrase,
    'ai-humanizer': ToolKind.aiHumanizer,
    'sql-formatter': ToolKind.sqlFormatter,
    'markdown-editor': ToolKind.markdownEditor,
    'palette-generator': ToolKind.paletteGenerator,
    'youtube-thumbnail': ToolKind.youtubeThumbnail,
    'image-to-text': ToolKind.imageToText,
    'speech-to-text': ToolKind.speechToText,
    'image-converter': ToolKind.imageConverter,
    'whois-lookup': ToolKind.whoisLookup,
    'ip-lookup': ToolKind.ipLookup,
    'speed-test': ToolKind.speedTest,
    'file-encode-decode': ToolKind.localFormat,
    'string-utilities': ToolKind.localFormat,
    'html-formatter': ToolKind.localFormat,
    'json-to-xml': ToolKind.localFormat,
    'json-schema-generator': ToolKind.localFormat,
    'json-to-code': ToolKind.localFormat,
    'xml-formatter': ToolKind.localFormat,
    'xml-to-json': ToolKind.localFormat,
    'xml-to-csv': ToolKind.localFormat,
    'csv-to-xml': ToolKind.localFormat,
    'xml-validator': ToolKind.localFormat,
    'xml-to-code': ToolKind.localFormat,
    'encrypt-decrypt': ToolKind.localFormat,
  };
}
