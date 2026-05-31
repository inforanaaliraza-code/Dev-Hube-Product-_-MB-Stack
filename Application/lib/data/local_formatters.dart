import 'dart:convert';

class LocalFormatters {
  static String run(String slug, String input, String input2, String mode) {
    switch (slug) {
      case 'json-to-xml':
        return jsonToXml(input);
      case 'json-diff':
        return jsonDiff(input, input2);
      case 'json-schema-generator':
        return jsonSchema(input);
      case 'json-to-code':
        return jsonToTs(input);
      case 'xml-formatter':
        return prettyXml(input);
      case 'xml-to-json':
        return xmlToJson(input);
      case 'xml-validator':
        return validateXml(input);
      case 'xml-to-csv':
      case 'csv-to-xml':
        return '$slug: convert via CSV/JSON tools on server or paste smaller samples';
      case 'xml-to-code':
        return jsonToTs(xmlToJson(input));
      case 'encrypt-decrypt':
        return 'Use the Encrypt / Decrypt tool screen (AES-GCM).';
      case 'html-formatter':
        return input
            .replaceAll('><', '>\n<')
            .replaceAll(RegExp(r'\n\s*\n'), '\n');
      case 'string-utilities':
        return stringUtility(input, mode);
      default:
        return 'Unsupported local tool: $slug';
    }
  }

  static String stringUtility(String text, String mode) {
    switch (mode) {
      case 'reverse':
        return text.split('').reversed.join();
      case 'trim':
        return text.trim();
      case 'upper':
        return text.toUpperCase();
      case 'lower':
        return text.toLowerCase();
      case 'sort':
        return (text.split('')..sort()).join();
      default:
        return text.trim();
    }
  }

  static String jsonToXml(String jsonStr) {
    final data = json.decode(jsonStr);
    return '<?xml version="1.0"?>\n<root>${_jsonNode(data)}</root>';
  }

  static String jsonObjectToXml(dynamic data) {
    return '<row>${_jsonNode(data)}</row>';
  }

  static String _jsonNode(dynamic data) {
    if (data is Map) {
      return data.entries
          .map((e) => '<${e.key}>${_jsonNode(e.value)}</${e.key}>')
          .join();
    }
    if (data is List) {
      return data.map((e) => '<item>${_jsonNode(e)}</item>').join();
    }
    return _escape(data.toString());
  }

  static String _escape(String s) =>
      s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

  static String jsonDiff(String a, String b) {
    final ja = json.encode(json.decode(a));
    final jb = json.encode(json.decode(b));
    return ja == jb ? 'JSON documents are identical' : 'JSON documents differ';
  }

  static String jsonSchema(String jsonStr) {
    final data = json.decode(jsonStr);
    return const JsonEncoder.withIndent('  ').convert(_inferSchema(data));
  }

  static Map<String, dynamic> _inferSchema(dynamic v) {
    if (v is Map) {
      return {
        'type': 'object',
        'properties': v.map((k, val) => MapEntry(k, _inferSchema(val))),
      };
    }
    if (v is List) {
      return {
        'type': 'array',
        'items': v.isEmpty ? {} : _inferSchema(v.first),
      };
    }
    if (v is int) return {'type': 'integer'};
    if (v is double) return {'type': 'number'};
    if (v is bool) return {'type': 'boolean'};
    return {'type': 'string'};
  }

  static String jsonToTs(String jsonStr) {
    final data = json.decode(jsonStr);
    return 'export type Root = ${_tsType(data)};';
  }

  static String jsonToPython(String jsonStr) {
    final data = json.decode(jsonStr);
    return 'class Root:\n    pass\n\n# ${json.encode(data)}';
  }

  static String _tsType(dynamic v) {
    if (v is Map) {
      final fields = v.entries.map((e) => '${e.key}: ${_tsType(e.value)}').join('; ');
      return '{ $fields }';
    }
    if (v is List) {
      return v.isEmpty ? 'unknown[]' : '${_tsType(v.first)}[]';
    }
    if (v is int || v is double) return 'number';
    if (v is bool) return 'boolean';
    return 'string';
  }

  static String prettyXml(String xml) {
    validateXml(xml);
    return xml.replaceAll('><', '>\n<');
  }

  static String xmlToJson(String xml) {
    final stripped = xml.replaceAll(RegExp(r'</?[^>]+>'), ' ').trim();
    return const JsonEncoder.withIndent('  ').convert({'text': stripped});
  }

  static String validateXml(String xml) {
    if (!xml.contains('<') || !xml.contains('>')) {
      throw const FormatException('Invalid XML');
    }
    return 'Valid XML (basic check passed)';
  }
}
