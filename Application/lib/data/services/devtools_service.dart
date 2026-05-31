import '../api_client.dart';
import '../api_parse.dart';

class DevtoolsService {
  DevtoolsService(this._api);

  final ApiClient _api;

  Future<Map<String, dynamic>> post(String path, Map<String, dynamic> body) async {
    final data = await _api.postJson<dynamic>(path, body);
    return ApiParse.map(data);
  }
}
