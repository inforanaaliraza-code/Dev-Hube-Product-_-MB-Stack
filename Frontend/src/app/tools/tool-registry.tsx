import type { ComponentType } from "react";
import { AiCodeGeneratorTool } from "@/components/tools/ai-code-generator/ai-code-generator-tool";
import { AiResumeBuilderTool } from "@/components/tools/ai-resume-builder/ai-resume-builder-tool";
import { CompressPdfTool } from "@/components/tools/compress-pdf/compress-pdf-tool";
import { ImageCompressorTool } from "@/components/tools/image-compressor/image-compressor-tool";
import { MarkdownEditorTool } from "@/components/tools/markdown-editor/markdown-editor-tool";
import { MergePdfTool } from "@/components/tools/merge-pdf/merge-pdf-tool";
import { PaletteGeneratorTool } from "@/components/tools/palette-generator/palette-generator-tool";
import { PasswordGeneratorTool } from "@/components/tools/password-generator/password-generator-tool";
import { PdfToWordTool } from "@/components/tools/pdf-to-word/pdf-to-word-tool";
import { QrGeneratorTool } from "@/components/tools/qr-generator/qr-generator-tool";
import { SplitPdfTool } from "@/components/tools/split-pdf/split-pdf-tool";
import { SqlFormatterTool } from "@/components/tools/sql-formatter/sql-formatter-tool";
import { TempMailTool } from "@/components/tools/temp-mail/temp-mail-tool";
import { YoutubeThumbnailTool } from "@/components/tools/youtube-thumbnail/youtube-thumbnail-tool";
import { ImageToTextTool } from "@/components/tools/image-to-text/image-to-text-tool";
import { SpeechToTextTool } from "@/components/tools/speech-to-text/speech-to-text-tool";
import { AiParaphraseTool } from "@/components/tools/ai-paraphrase/ai-paraphrase-tool";
import { AiHumanizerTool } from "@/components/tools/ai-humanizer/ai-humanizer-tool";
import { WhoisLookupTool } from "@/components/tools/whois-lookup/whois-lookup-tool";
import { IpLookupTool } from "@/components/tools/ip-lookup/ip-lookup-tool";
import { SpeedTestTool } from "@/components/tools/speed-test/speed-test-tool";
import { ApiTesterTool } from "@/components/tools/api-tester/api-tester-tool";
import {
  Base64Tool,
  CaseConverterTool,
  CodeReaderTool,
  ColorPickerTool,
  ContrastCheckerTool,
  CronParserTool,
  CssMinifierTool,
  CsvJsonTool,
  HashGeneratorTool,
  HtmlEntitiesTool,
  HtmlStripperTool,
  HtmlToMarkdownTool,
  ImageConverterTool,
  JsBeautifierTool,
  JsonFormatterTool,
  JsonValidatorTool,
  JwtDecoderTool,
  LoremIpsumTool,
  MetaTagsGeneratorTool,
  OtpDetectorTool,
  RegexTesterTool,
  RobotsTxtTool,
  SitemapGeneratorTool,
  TextDiffTool,
  TimestampConverterTool,
  UnitConverterTool,
  UrlEncoderTool,
  UserAgentParserTool,
  UuidGeneratorTool,
  WordCounterTool,
} from "@/components/tools/devtools/devtools-tools";
import {
  CsvToXmlTool,
  EncryptDecryptTool,
  FileEncodeDecodeTool,
  HtmlFormatterTool,
  JsonDiffTool,
  JsonSchemaGeneratorTool,
  JsonToCodeTool,
  JsonToXmlTool,
  StringUtilitiesTool,
  XmlFormatterTool,
  XmlToCodeTool,
  XmlToCsvTool,
  XmlToJsonTool,
  XmlValidatorTool,
} from "@/components/tools/devtools/extended-tools";

export const TOOL_COMPONENTS: Record<string, ComponentType> = {
  "temp-mail": TempMailTool,
  "qr-generator": QrGeneratorTool,
  "image-compressor": ImageCompressorTool,
  "pdf-to-word": PdfToWordTool,
  "merge-pdf": MergePdfTool,
  "split-pdf": SplitPdfTool,
  "compress-pdf": CompressPdfTool,
  "ai-code-generator": AiCodeGeneratorTool,
  "sql-formatter": SqlFormatterTool,
  "password-generator": PasswordGeneratorTool,
  "palette-generator": PaletteGeneratorTool,
  "markdown-editor": MarkdownEditorTool,
  "ai-resume-builder": AiResumeBuilderTool,
  "youtube-thumbnail": YoutubeThumbnailTool,
  "image-to-text": ImageToTextTool,
  "speech-to-text": SpeechToTextTool,
  "ai-paraphrase": AiParaphraseTool,
  "ai-humanizer": AiHumanizerTool,
  "whois-lookup": WhoisLookupTool,
  "ip-lookup": IpLookupTool,
  "speed-test": SpeedTestTool,
  "meta-tags-generator": MetaTagsGeneratorTool,
  "robots-txt": RobotsTxtTool,
  "sitemap-generator": SitemapGeneratorTool,
  "json-validator": JsonValidatorTool,
  "json-formatter": JsonFormatterTool,
  "css-minifier": CssMinifierTool,
  "js-beautifier": JsBeautifierTool,
  "html-to-markdown": HtmlToMarkdownTool,
  "regex-tester": RegexTesterTool,
  "csv-to-json": CsvJsonTool,
  base64: Base64Tool,
  "jwt-decoder": JwtDecoderTool,
  "url-encoder": UrlEncoderTool,
  "uuid-generator": UuidGeneratorTool,
  "api-tester": ApiTesterTool,
  "otp-detector": OtpDetectorTool,
  "code-reader": CodeReaderTool,
  "color-picker": ColorPickerTool,
  "contrast-checker": ContrastCheckerTool,
  "lorem-ipsum": LoremIpsumTool,
  "case-converter": CaseConverterTool,
  "text-diff": TextDiffTool,
  "word-counter": WordCounterTool,
  "html-stripper": HtmlStripperTool,
  "timestamp-converter": TimestampConverterTool,
  "cron-parser": CronParserTool,
  "hash-generator": HashGeneratorTool,
  "image-converter": ImageConverterTool,
  "unit-converter": UnitConverterTool,
  "user-agent-parser": UserAgentParserTool,
  "html-entities": HtmlEntitiesTool,
  "file-encode-decode": FileEncodeDecodeTool,
  "string-utilities": StringUtilitiesTool,
  "html-formatter": HtmlFormatterTool,
  "json-to-xml": JsonToXmlTool,
  "json-diff": JsonDiffTool,
  "json-schema-generator": JsonSchemaGeneratorTool,
  "json-to-code": JsonToCodeTool,
  "xml-formatter": XmlFormatterTool,
  "xml-to-json": XmlToJsonTool,
  "xml-to-csv": XmlToCsvTool,
  "csv-to-xml": CsvToXmlTool,
  "xml-validator": XmlValidatorTool,
  "xml-to-code": XmlToCodeTool,
  "encrypt-decrypt": EncryptDecryptTool,
};

export const READY_TOOL_SLUGS = Object.keys(TOOL_COMPONENTS);
