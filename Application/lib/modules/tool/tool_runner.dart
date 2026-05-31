import 'dart:convert';
import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:get/get.dart';
import '../../core/app_error.dart';
import '../../core/offline_controller.dart';
import '../../core/aes_gcm_crypto.dart';
import '../../data/local_formatters.dart';
import '../../data/tool_config.dart';
import '../../data/tool_output.dart';
import 'api_tester_history.dart';
import 'tool_controller.dart';

class ToolRunner {
  static Future<void> execute(ToolController c) async {
    if (Get.isRegistered<OfflineController>() &&
        Get.find<OfflineController>().isOffline.value &&
        !ToolConfig.worksOffline(c.kind)) {
      c.error.value = ToolErrorHints.offlineToolRun(c.kind);
      c.errorScope.value = AppErrorScope.offline;
      return;
    }
    c.clearError();
    c.output.value = '';
    c.qrImageBase64.value = '';
    c.resultImageBase64.value = '';
    c.resultFileBase64.value = '';
    c.previewHtml.value = '';
    c.thumbnailUrls.clear();
    c.hashResults.clear();
    c.paletteColors.clear();
    c.speedTestDone.value = false;

    final k = c.kind;
    final text = c.input.value;

    try {
      switch (k) {
        case ToolKind.qrGenerator:
          final res = await c.qr.create(
            payload: text.isEmpty ? 'https://devhube.com' : text,
            mode: c.qrMode.value,
            foregroundColor: c.fieldUrl.value.trim().isEmpty ? null : c.fieldUrl.value.trim(),
          );
          c.qrImageBase64.value = res['imagePngBase64']?.toString() ?? '';
          c.output.value = res['publicUrl']?.toString() ?? res['id']?.toString() ?? '';
          if (c.qrImageBase64.value.isEmpty) {
            c.error.value = 'QR image not returned. Start the qr-generator worker on your PC.';
            c.errorScope.value = AppErrorScope.worker;
          }
          return;
        case ToolKind.localFormat:
          await _runLocal(c);
          return;
        case ToolKind.tempMail:
          return;
        case ToolKind.imageCompressor:
          await _fileTool(c, '/image-compressor/compress', {
            'quality': c.numericOption.value.toString(),
          });
          return;
        case ToolKind.pdfToWord:
          await _fileTool(c, '/pdf-to-word/convert', null);
          return;
        case ToolKind.mergePdf:
          await _mergePdf(c);
          return;
        case ToolKind.splitPdf:
          await _splitPdf(c);
          return;
        case ToolKind.compressPdf:
          await _fileTool(c, '/compress-pdf/compress', {
            'level': c.mode.value.isEmpty ? 'medium' : c.mode.value,
          });
          return;
        case ToolKind.imageToText:
          await _fileTool(c, '/image-to-text/extract', null, textKey: 'text');
          return;
        case ToolKind.speechToText:
          await _fileTool(c, '/speech-to-text/transcribe', null, textKey: 'transcript');
          return;
        case ToolKind.imageConverter:
          await _fileTool(
            c,
            '/image-converter/convert',
            {'format': c.mode.value.isEmpty ? 'png' : c.mode.value},
            imageKey: 'imageBase64',
          );
          return;
        case ToolKind.base64:
          c.output.value = ToolOutput.fromResponse(
            await c.dev.post('/base64/convert', {'text': text, 'mode': c.mode.value}),
          );
          return;
        case ToolKind.urlEncode:
          c.output.value = ToolOutput.fromResponse(
            await c.dev.post('/url-encoder/convert', {'text': text, 'mode': c.mode.value}),
          );
          return;
        case ToolKind.htmlEntities:
          c.output.value = ToolOutput.fromResponse(
            await c.dev.post('/html-entities/convert', {'text': text, 'mode': c.mode.value}),
          );
          return;
        case ToolKind.jwt:
          c.output.value = ToolOutput.fromResponse(
            await c.dev.post('/jwt-decoder/decode', {'token': text}),
          );
          return;
        case ToolKind.uuid:
          final res = await c.dev.post('/uuid-generator/generate', {
            'version': c.mode.value.isEmpty ? 'v4' : c.mode.value,
            'count': 5,
          });
          c.output.value = (res['uuids'] as List?)?.join('\n') ?? '';
          return;
        case ToolKind.jsonFormat:
          c.output.value = ToolOutput.fromResponse(
            await c.dev.post('/json-formatter/format', {
              'json': text,
              'minify': c.mode.value == 'minify',
            }),
          );
          return;
        case ToolKind.jsonValidate:
          final res = await c.dev.post('/json-validator/validate', {'json': text});
          c.output.value = res['valid'] == true
              ? (res['formatted']?.toString() ?? 'Valid JSON')
              : (res['error']?.toString() ?? 'Invalid JSON');
          return;
        case ToolKind.hash:
          final hashRes = await c.dev.post('/hash-generator/generate', {'text': text});
          final hashes = hashRes['hashes'];
          if (hashes is Map) {
            c.hashResults
              ..clear()
              ..addAll(hashes.map((k, v) => MapEntry(k.toString(), v.toString())));
          }
          c.output.value = ToolOutput.fromResponse(hashRes);
          return;
        case ToolKind.timestamp:
          c.output.value = ToolOutput.fromResponse(
            await c.dev.post('/timestamp-converter/convert', {
              'value': text,
              'mode': c.mode.value.isEmpty ? 'toDate' : c.mode.value,
            }),
          );
          return;
        case ToolKind.cronParser:
          c.output.value = ToolOutput.fromResponse(
            await c.dev.post('/cron-parser/parse', {'expression': text}),
          );
          return;
        case ToolKind.caseConvert:
          c.output.value = ToolOutput.fromResponse(
            await c.dev.post('/case-converter/convert', {
              'text': text,
              'mode': c.mode.value.isEmpty ? 'camel' : c.mode.value,
            }),
          );
          return;
        case ToolKind.wordCount:
          final res = await c.dev.post('/word-counter/count', {'text': text});
          c.output.value = res.entries.map((e) => '${e.key}: ${e.value}').join('\n');
          return;
        case ToolKind.lorem:
          c.output.value = ToolOutput.fromResponse(
            await c.dev.post('/lorem-ipsum/generate', {
              'type': 'paragraphs',
              'count': int.tryParse(text) ?? 2,
            }),
          );
          return;
        case ToolKind.regex:
          final res = await c.dev.post('/regex-tester/test', {
            'pattern': text,
            'text': c.input2.value,
            'flags': 'g',
          });
          c.output.value = 'Matches: ${res['count']}\n${res['matches']}';
          return;
        case ToolKind.textDiff:
          c.output.value = ToolOutput.fromResponse(
            await c.dev.post('/text-diff/diff', {'left': text, 'right': c.input2.value}),
          );
          return;
        case ToolKind.cssMinify:
          c.output.value = ToolOutput.fromResponse(
            await c.dev.post('/css-minifier/minify', {'css': text}),
          );
          return;
        case ToolKind.jsBeautify:
          c.output.value = ToolOutput.fromResponse(
            await c.dev.post('/js-beautifier/beautify', {'code': text}),
          );
          return;
        case ToolKind.htmlToMarkdown:
          final res = await c.dev.post('/html-to-markdown/convert', {'html': text});
          c.output.value = res['markdown']?.toString() ?? '';
          return;
        case ToolKind.htmlStripper:
          final res = await c.dev.post('/html-stripper/strip', {'html': text});
          c.output.value = res['text']?.toString() ?? '';
          return;
        case ToolKind.csvToJson:
          final res = await c.dev.post('/csv-to-json/to-json', {'csv': text});
          c.output.value = res['json']?.toString() ?? '';
          return;
        case ToolKind.jsonToCsv:
          final res = await c.dev.post('/csv-to-json/to-csv', {'json': text});
          c.output.value = res['csv']?.toString() ?? '';
          return;
        case ToolKind.password:
          if (c.mode.value == 'breach') {
            final res = await c.dev.post('/password-generator/check-breach', {'password': text});
            c.pwStrength.value = res['strength']?.toString() ?? '';
            c.output.value = ToolOutput.fromResponse(res);
          } else {
            final res = await c.dev.post('/password-generator/generate', {
              'length': c.passwordLength.value,
              'uppercase': c.pwUpper.value,
              'lowercase': c.pwLower.value,
              'numbers': c.pwNumbers.value,
              'symbols': c.pwSymbols.value,
            });
            c.pwStrength.value = res['strength']?.toString() ?? '';
            c.output.value = res['password']?.toString() ?? ToolOutput.fromResponse(res);
          }
          return;
        case ToolKind.apiTester:
          final res = await c.dev.post('/api-tester/send', _apiTesterPayload(c));
          final status = res['status'] is int ? res['status'] as int : int.tryParse('${res['status']}') ?? 0;
          final duration = res['durationMs'] is int ? res['durationMs'] as int : int.tryParse('${res['durationMs']}') ?? 0;
          c.apiResponseStatus.value = status;
          c.apiResponseDuration.value = duration;
          c.output.value =
              '${res['headers'] ?? ''}\n\n${res['bodyPreview'] ?? res['body'] ?? ''}';
          ApiTesterHistory.add(
            ApiHistoryEntry(
              method: c.mode.value,
              url: c.input.value.trim(),
              status: status,
              durationMs: duration,
              at: DateTime.now(),
            ),
          );
          c.apiHistoryEpoch.value++;
          return;
        case ToolKind.metaTags:
          final metaRes = await c.dev.post('/meta-tags-generator/generate', {
            'title': text,
            'description': c.input2.value,
            'url': c.fieldUrl.value,
          });
          c.previewHtml.value = metaRes['html']?.toString() ?? '';
          c.output.value = ToolOutput.fromResponse(metaRes);
          return;
        case ToolKind.robotsTxt:
          c.output.value = ToolOutput.fromResponse(
            await c.dev.post('/robots-txt/generate', {
              'rules': [
                {
                  'agent': '*',
                  'allow': ['/'],
                  'disallow': text.split('\n').where((l) => l.trim().isNotEmpty).toList(),
                },
              ],
              if (c.fieldUrl.value.isNotEmpty) 'sitemap': c.fieldUrl.value,
            }),
          );
          return;
        case ToolKind.sitemap:
          c.output.value = ToolOutput.fromResponse(
            await c.dev.post('/sitemap-generator/generate', {'urls': text}),
          );
          return;
        case ToolKind.colorPicker:
          c.output.value = ToolOutput.fromResponse(
            await c.dev.post('/color-picker/convert', {'hex': text}),
          );
          return;
        case ToolKind.contrastChecker:
          c.output.value = ToolOutput.fromResponse(
            await c.dev.post('/contrast-checker/check', {
              'foreground': text,
              'background': c.input2.value,
            }),
          );
          return;
        case ToolKind.otpDetector:
          final res = await c.dev.post('/otp-detector/detect', {
            'text': text,
            'subject': c.input2.value,
          });
          c.output.value = 'Primary: ${res['primary']}\nAll: ${res['codes']}';
          return;
        case ToolKind.codeReader:
          final res = await c.dev.post('/code-reader/detect', {
            'text': text,
            'subject': c.input2.value,
          });
          c.output.value = 'Primary: ${res['primary']}\nAll: ${res['codes']}';
          return;
        case ToolKind.unitConverter:
          c.output.value = ToolOutput.fromResponse(
            await c.dev.post('/unit-converter/convert', {
              'value': double.tryParse(text) ?? 16,
              'from': c.mode.value.isEmpty ? 'px' : c.mode.value.split('-').first,
              'to': c.mode.value.contains('-') ? c.mode.value.split('-').last : 'rem',
              'rootPx': double.tryParse(c.input2.value) ?? 16,
            }),
          );
          return;
        case ToolKind.userAgentParser:
          c.output.value = ToolOutput.fromResponse(
            await c.dev.post('/user-agent-parser/parse', {
              'ua': text.isEmpty ? 'Mozilla/5.0' : text,
            }),
          );
          return;
        case ToolKind.aiCode:
          c.output.value = ToolOutput.fromResponse(
            await c.dev.post('/ai-code-generator/generate', {
              'prompt': text,
              'language': c.mode.value.isEmpty ? 'typescript' : c.mode.value,
            }),
          );
          return;
        case ToolKind.aiResume:
          final res = await c.dev.post('/ai-resume-builder/generate', {
            'fullName': text.isEmpty ? 'Your Name' : text,
            'jobTitle': c.input2.value.isEmpty ? 'Software Engineer' : c.input2.value,
            'summary': c.resumeSummary.value,
            'experience': c.resumeExperience.value,
            'skills': c.resumeSkills.value,
            'education': c.resumeEducation.value,
          });
          c.output.value = res['resumeMarkdown']?.toString() ??
              res['resume']?.toString() ??
              ToolOutput.fromResponse(res);
          return;
        case ToolKind.aiParaphrase:
          c.output.value = ToolOutput.fromResponse(
            await c.dev.post('/ai-paraphrase/rewrite', {'text': text}),
          );
          return;
        case ToolKind.aiHumanizer:
          c.output.value = ToolOutput.fromResponse(
            await c.dev.post('/ai-humanizer/rewrite', {'text': text}),
          );
          return;
        case ToolKind.sqlFormatter:
          c.output.value = ToolOutput.fromResponse(
            await c.dev.post('/sql-formatter/format', {
              'sql': text,
              'dialect': c.mode.value.isEmpty ? 'postgresql' : c.mode.value,
            }),
          );
          return;
        case ToolKind.markdownEditor:
          final mdRes = await c.dev.post('/markdown-editor/preview', {'markdown': text});
          c.previewHtml.value = mdRes['html']?.toString() ?? '';
          c.output.value = mdRes['html']?.toString() ?? ToolOutput.fromResponse(mdRes);
          return;
        case ToolKind.paletteGenerator:
          final palRes = await c.dev.post('/palette-generator/generate', {
            'baseColor': text.isEmpty ? '#A855F7' : text,
            'mode': c.mode.value.isEmpty ? 'complementary' : c.mode.value,
            'count': 5,
          });
          final colors = palRes['colors'];
          if (colors is List) {
            c.paletteColors
              ..clear()
              ..addAll(colors.map((e) => e.toString()));
          }
          c.paletteGradient.value = palRes['gradient']?.toString() ?? '';
          c.paletteCssVars.value = palRes['cssVars']?.toString() ?? '';
          c.output.value = '${c.paletteGradient.value}\n\n${c.paletteCssVars.value}';
          return;
        case ToolKind.youtubeThumbnail:
          final ytRes = await c.dev.post('/youtube-thumbnail/resolve', {'url': text});
          final thumbs = ytRes['thumbnails'];
          if (thumbs is Map) {
            c.thumbnailUrls
              ..clear()
              ..addAll(
                thumbs.map((k, v) => MapEntry(k.toString(), v.toString())),
              );
          }
          c.output.value = ToolOutput.fromResponse(ytRes);
          return;
        case ToolKind.whoisLookup:
          c.output.value = ToolOutput.fromResponse(
            await c.dev.post('/whois-lookup/lookup', {'domain': text}),
          );
          return;
        case ToolKind.ipLookup:
          c.output.value = ToolOutput.fromResponse(
            await c.dev.post('/ip-lookup/lookup', {
              if (text.trim().isNotEmpty) 'ip': text.trim(),
            }),
          );
          return;
        case ToolKind.speedTest:
          final stRes = await c.dev.post('/speed-test/run', {'url': text});
          c.speedTotalMs.value = stRes['totalMs'] is int
              ? stRes['totalMs'] as int
              : int.tryParse('${stRes['totalMs']}') ?? 0;
          c.speedStatusCode.value = stRes['statusCode'] is int
              ? stRes['statusCode'] as int
              : int.tryParse('${stRes['statusCode']}') ?? 0;
          final bytes = stRes['downloadBytes'] is int
              ? stRes['downloadBytes'] as int
              : int.tryParse('${stRes['downloadBytes']}') ?? 0;
          c.speedDownloadKb.value = bytes / 1024;
          c.speedThroughput.value = stRes['throughputKbps'] is int
              ? stRes['throughputKbps'] as int
              : int.tryParse('${stRes['throughputKbps']}') ?? 0;
          c.speedRating.value = stRes['rating']?.toString() ?? '';
          c.speedTestDone.value = true;
          c.output.value = ToolOutput.fromResponse(stRes);
          return;
      }
    } catch (e) {
      c.setErrorFrom(e);
    }
  }

  static Future<void> _fileTool(
    ToolController c,
    String path,
    Map<String, dynamic>? query, {
    String? textKey,
    String imageKey = 'imageBase64',
  }) async {
    if (c.pickedFiles.isEmpty) {
      c.setValidationError('Pick a file first');
      return;
    }
    final file = c.pickedFiles.first;
    if (file.path == null) {
      c.setValidationError('Invalid file');
      return;
    }
    final res = await c.worker.uploadSingle(path, file, query: query);
    if (textKey != null) {
      c.output.value = res[textKey]?.toString() ?? ToolOutput.fromResponse(res);
    } else if (res[imageKey] != null) {
      c.resultImageBase64.value = res[imageKey].toString();
      c.output.value = 'Image ready — see preview below';
    } else if (res['pdfBase64'] != null) {
      c.resultFileBase64.value = res['pdfBase64'].toString();
      c.resultFileName.value = res['filename']?.toString() ?? 'output.pdf';
      c.output.value = 'PDF ready (${c.resultFileName.value})';
    } else if (res['docxBase64'] != null) {
      c.resultFileBase64.value = res['docxBase64'].toString();
      c.resultFileName.value = res['filename']?.toString() ?? 'output.docx';
      c.output.value = 'Document ready';
    } else {
      c.output.value = ToolOutput.fromResponse(res);
    }
  }

  static Future<void> _runLocal(ToolController c) async {
    final slug = c.slug.value;
    final text = c.input.value;
    switch (slug) {
      case 'xml-to-csv':
        final jsonStr = LocalFormatters.xmlToJson(text);
        final jsonObj = json.decode(jsonStr);
        final res = await c.dev.post('/csv-to-json/to-csv', {
          'json': json.encode(jsonObj is List ? jsonObj : [jsonObj]),
        });
        c.output.value = res['csv']?.toString() ?? '';
        return;
      case 'csv-to-xml':
        final res = await c.dev.post('/csv-to-json/to-json', {'csv': text});
        final parsed = json.decode(res['json']?.toString() ?? '[]');
        final items = parsed is List ? parsed : [parsed];
        final xmlItems = items.map(LocalFormatters.jsonObjectToXml).join('\n');
        c.output.value = '<?xml version="1.0" encoding="UTF-8"?>\n<rows>\n$xmlItems\n</rows>';
        return;
      case 'file-encode-decode':
        await _fileEncodeDecode(c);
        return;
      case 'json-to-code':
        c.output.value = c.mode.value == 'python'
            ? LocalFormatters.jsonToPython(text)
            : LocalFormatters.jsonToTs(text);
        return;
      case 'encrypt-decrypt':
        if (c.encryptPassword.value.isEmpty) {
          c.setValidationError('Enter a password');
          return;
        }
        try {
          if (c.mode.value == 'decrypt') {
            c.output.value = await AesGcmCrypto.decrypt(text.trim(), c.encryptPassword.value);
          } else {
            c.output.value = await AesGcmCrypto.encrypt(text, c.encryptPassword.value);
          }
        } catch (e) {
          c.setValidationError(e.toString());
        }
        return;
      default:
        c.output.value = LocalFormatters.run(slug, text, c.input2.value, c.mode.value);
    }
  }

  static Map<String, dynamic> _apiTesterPayload(ToolController c) {
    final headers = <Map<String, dynamic>>[];
    for (final line in c.apiHeadersText.value.split('\n')) {
      final idx = line.indexOf(':');
      if (idx <= 0) continue;
      headers.add({
        'key': line.substring(0, idx).trim(),
        'value': line.substring(idx + 1).trim(),
        'enabled': true,
      });
    }
    Map<String, dynamic>? auth;
    if (c.apiAuthType.value == 'bearer' && c.apiBearerToken.value.isNotEmpty) {
      auth = {'type': 'bearer', 'token': c.apiBearerToken.value};
    } else if (c.apiAuthType.value == 'apikey' && c.apiBearerToken.value.isNotEmpty) {
      auth = {
        'type': 'apikey',
        'key': 'X-API-Key',
        'value': c.apiBearerToken.value,
        'addTo': 'header',
      };
    }
    final payload = <String, dynamic>{
      'url': c.input.value,
      'method': c.mode.value.isEmpty ? 'GET' : c.mode.value,
      'timeoutMs': 30000,
      'headers': headers,
    };
    if (auth != null) payload['auth'] = auth;
    if (c.input2.value.trim().isNotEmpty) {
      payload['bodyType'] = 'json';
      payload['body'] = c.input2.value;
    }
    return payload;
  }

  static Future<void> _fileEncodeDecode(ToolController c) async {
    if (c.mode.value == 'encode') {
      if (c.pickedFiles.isEmpty || c.pickedFiles.first.path == null) {
        c.setValidationError('Pick a file to encode');
        return;
      }
      final bytes = await File(c.pickedFiles.first.path!).readAsBytes();
      c.output.value = base64Encode(bytes);
      return;
    }
    if (c.input.value.trim().isEmpty) {
      c.setValidationError('Paste Base64 text to decode');
      return;
    }
    try {
      final bytes = base64Decode(c.input.value.replaceAll(RegExp(r'\s+'), ''));
      c.output.value = 'Decoded ${bytes.length} bytes';
    } catch (_) {
      c.setValidationError('Invalid Base64');
    }
  }

  static Future<void> _mergePdf(ToolController c) async {
    if (c.pickedFiles.length < 2) {
      c.setValidationError('Pick at least 2 PDF files');
      return;
    }
    final res = await c.worker.uploadMany('/merge-pdf/merge', c.pickedFiles.toList());
    c.resultFileBase64.value = res['pdfBase64']?.toString() ?? '';
    c.resultFileName.value = res['filename']?.toString() ?? 'merged.pdf';
    c.output.value = 'Merged ${res['fileCount']} files, ${res['totalPages']} pages';
  }

  static Future<void> _splitPdf(ToolController c) async {
    if (c.pickedFiles.isEmpty) {
      c.setValidationError('Pick a PDF file');
      return;
    }
    if (c.mode.value == 'inspect') {
      c.output.value = ToolOutput.fromResponse(
        await c.worker.uploadSingle('/split-pdf/inspect', c.pickedFiles.first),
      );
      return;
    }
    final res = await c.worker.uploadSingle(
      '/split-pdf/split',
      c.pickedFiles.first,
      query: {'pages': c.input2.value.isEmpty ? '1' : c.input2.value},
    );
    c.resultFileBase64.value = res['pdfBase64']?.toString() ?? res['zipBase64']?.toString() ?? '';
    c.resultFileName.value = res['filename']?.toString() ?? 'split.pdf';
    c.output.value = ToolOutput.fromResponse(res);
  }
}
