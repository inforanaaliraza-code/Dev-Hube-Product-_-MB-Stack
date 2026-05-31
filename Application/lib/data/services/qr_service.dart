import '../api_client.dart';
import '../api_parse.dart';

class QrService {
  QrService(this._api);

  final ApiClient _api;

  Future<Map<String, dynamic>> create({
    required String payload,
    String mode = 'static',
    String contentType = 'url',
    String? foregroundColor,
  }) async {
    final data = await _api.postJson<dynamic>('/qr-generator/codes', {
      'mode': mode,
      'contentType': contentType,
      'payload': payload,
      'trackScans': mode == 'dynamic',
      'sizePx': 512,
      if (foregroundColor != null && foregroundColor.isNotEmpty)
        'foregroundColor': foregroundColor,
    });
    return ApiParse.map(data);
  }
}
