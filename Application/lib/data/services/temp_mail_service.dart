import '../api_client.dart';
import '../api_parse.dart';

class TempMailService {
  TempMailService(this._api);

  final ApiClient _api;

  Future<List<String>> domains() async {
    final list = await _api.getList('/temp-mail/domains');
    return list.map((e) {
      final m = ApiParse.map(e);
      return m['domain']?.toString() ?? e.toString();
    }).toList();
  }

  Future<Map<String, dynamic>> createMailbox({String? domain, String? localPart}) async {
    return ApiParse.map(await _api.postJson<dynamic>('/temp-mail/mailboxes', {
      if (domain != null && domain.isNotEmpty) 'domain': domain,
      if (localPart != null && localPart.isNotEmpty) 'localPart': localPart,
    }));
  }

  Future<Map<String, dynamic>> mailbox(String id) async {
    return _api.getMap('/temp-mail/mailboxes/$id');
  }

  Future<List<Map<String, dynamic>>> messages(String mailboxId) async {
    final data = await _api.getJson<dynamic>('/temp-mail/mailboxes/$mailboxId/messages');
    return ApiParse.list(data).map((e) => ApiParse.map(e)).toList();
  }

  Future<Map<String, dynamic>> message(String mailboxId, String messageId) async {
    return _api.getMap('/temp-mail/mailboxes/$mailboxId/messages/$messageId');
  }

  Future<void> deleteMailbox(String id) async {
    await _api.dio.delete('/temp-mail/mailboxes/$id');
  }
}
