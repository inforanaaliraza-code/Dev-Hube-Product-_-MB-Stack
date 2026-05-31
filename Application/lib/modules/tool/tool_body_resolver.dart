import 'package:flutter/material.dart';
import '../../data/models/tool_model.dart';
import '../../data/tool_config.dart';
import 'widgets/dedicated/ai_resume_tool_body.dart';
import 'widgets/dedicated/ai_text_tool_body.dart';
import 'widgets/dedicated/api_tester_tool_body.dart';
import 'widgets/dedicated/code_reader_tool_body.dart';
import 'widgets/dedicated/color_picker_tool_body.dart';
import 'widgets/dedicated/dual_input_tool_body.dart';
import 'widgets/dedicated/encrypt_tool_body.dart';
import 'widgets/dedicated/hash_tool_body.dart';
import 'widgets/dedicated/json_tool_body.dart';
import 'widgets/dedicated/lookup_tool_body.dart';
import 'widgets/dedicated/markdown_tool_body.dart';
import 'widgets/dedicated/meta_tags_tool_body.dart';
import 'widgets/dedicated/palette_tool_body.dart';
import 'widgets/dedicated/password_tool_body.dart';
import 'widgets/dedicated/qr_generator_tool_body.dart';
import 'widgets/dedicated/seo_tool_body.dart';
import 'widgets/dedicated/speed_test_tool_body.dart';
import 'widgets/dedicated/split_io_tool_body.dart';
import 'widgets/dedicated/sql_formatter_tool_body.dart';
import 'widgets/dedicated/youtube_thumbnail_tool_body.dart';
import 'widgets/file_tool_body.dart';
import 'widgets/temp_mail_tool_body.dart';
import 'widgets/workflow_tool_body.dart';
import 'tool_controller.dart';

class ToolBodyResolver {
  static const _dualInputSlugs = {
    'text-diff',
    'json-diff',
    'regex-tester',
    'contrast-checker',
  };

  static const _aiTextSlugs = {
    'ai-code-generator',
    'ai-paraphrase',
    'ai-humanizer',
  };

  static const _splitIoLocalSlugs = {
    'html-formatter',
    'string-utilities',
    'json-to-xml',
    'json-schema-generator',
    'json-to-code',
    'xml-formatter',
    'xml-to-json',
    'xml-validator',
    'file-encode-decode',
    'csv-to-xml',
    'xml-to-csv',
    'xml-to-code',
  };

  static bool _usesSplitIo(ToolController c) {
    switch (c.kind) {
      case ToolKind.base64:
      case ToolKind.urlEncode:
      case ToolKind.htmlEntities:
      case ToolKind.jwt:
      case ToolKind.uuid:
      case ToolKind.timestamp:
      case ToolKind.cronParser:
      case ToolKind.caseConvert:
      case ToolKind.wordCount:
      case ToolKind.lorem:
      case ToolKind.cssMinify:
      case ToolKind.jsBeautify:
      case ToolKind.htmlToMarkdown:
      case ToolKind.htmlStripper:
      case ToolKind.csvToJson:
      case ToolKind.jsonToCsv:
      case ToolKind.userAgentParser:
      case ToolKind.otpDetector:
      case ToolKind.unitConverter:
        return true;
      case ToolKind.localFormat:
        return _splitIoLocalSlugs.contains(c.slug.value);
      default:
        return false;
    }
  }

  static Widget build(ToolController c, ToolModel tool) {
    switch (c.slug.value) {
      case 'api-tester':
        return ApiTesterToolBody(tool: tool);
      case 'qr-generator':
        return QrGeneratorToolBody(tool: tool);
      case 'password-generator':
        return PasswordToolBody(tool: tool);
      case 'ai-resume-builder':
        return AiResumeToolBody(tool: tool);
      case 'markdown-editor':
        return MarkdownToolBody(tool: tool);
      case 'code-reader':
        return CodeReaderToolBody(tool: tool);
      case 'encrypt-decrypt':
        return EncryptToolBody(tool: tool);
      case 'palette-generator':
        return PaletteToolBody(tool: tool);
      case 'speed-test':
        return SpeedTestToolBody(tool: tool);
      case 'sql-formatter':
        return SqlFormatterToolBody(tool: tool);
      case 'youtube-thumbnail':
        return YoutubeThumbnailToolBody(tool: tool);
      case 'whois-lookup':
      case 'ip-lookup':
        return LookupToolBody(tool: tool);
      case 'json-formatter':
      case 'json-validator':
        return JsonToolBody(tool: tool);
      case 'hash-generator':
        return HashToolBody(tool: tool);
      case 'meta-tags-generator':
        return MetaTagsToolBody(tool: tool);
      case 'robots-txt':
      case 'sitemap-generator':
        return SeoToolBody(tool: tool);
      case 'color-picker':
        return ColorPickerToolBody(tool: tool);
      default:
        if (_aiTextSlugs.contains(c.slug.value)) {
          return AiTextToolBody(tool: tool);
        }
        if (_dualInputSlugs.contains(c.slug.value)) {
          return DualInputToolBody(tool: tool);
        }
        if (_usesSplitIo(c)) {
          return SplitIoToolBody(tool: tool);
        }
        break;
    }
    switch (c.layout) {
      case ToolUiLayout.tempMail:
        return TempMailToolBody(tool: tool);
      case ToolUiLayout.fileUpload:
        return FileToolBody(tool: tool);
      default:
        return WorkflowToolBody(tool: tool);
    }
  }
}
