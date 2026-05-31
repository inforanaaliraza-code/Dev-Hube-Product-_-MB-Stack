import 'dart:convert';

class ToolOutput {
  static String fromResponse(Map<String, dynamic> res) {
    for (final key in const [
      'output',
      'html',
      'content',
      'xml',
      'markdown',
      'code',
      'text',
      'formatted',
      'password',
      'transcript',
      'result',
    ]) {
      final v = res[key];
      if (v != null && v.toString().isNotEmpty) return v.toString();
    }
    if (res['hashes'] is Map) {
      return (res['hashes'] as Map)
          .entries
          .map((e) => '${e.key}: ${e.value}')
          .join('\n');
    }
    if (res['uuids'] is List) {
      return (res['uuids'] as List).join('\n');
    }
    if (res['colors'] is List) {
      return (res['colors'] as List).join('\n');
    }
    if (res['thumbnails'] is List) {
      return const JsonEncoder.withIndent('  ').convert(res['thumbnails']);
    }
    return const JsonEncoder.withIndent('  ').convert(res);
  }
}
