import 'package:get_storage/get_storage.dart';

class ApiHistoryEntry {
  ApiHistoryEntry({
    required this.method,
    required this.url,
    required this.status,
    required this.durationMs,
    required this.at,
  });

  final String method;
  final String url;
  final int status;
  final int durationMs;
  final DateTime at;

  Map<String, dynamic> toJson() => {
        'method': method,
        'url': url,
        'status': status,
        'durationMs': durationMs,
        'at': at.toIso8601String(),
      };

  factory ApiHistoryEntry.fromJson(Map<String, dynamic> j) {
    return ApiHistoryEntry(
      method: j['method']?.toString() ?? 'GET',
      url: j['url']?.toString() ?? '',
      status: j['status'] is int ? j['status'] as int : int.tryParse('${j['status']}') ?? 0,
      durationMs: j['durationMs'] is int ? j['durationMs'] as int : int.tryParse('${j['durationMs']}') ?? 0,
      at: DateTime.tryParse(j['at']?.toString() ?? '') ?? DateTime.now(),
    );
  }
}

class ApiTesterHistory {
  static const _key = 'api_tester_history_v1';
  static const _max = 30;
  static final _box = GetStorage();

  static List<ApiHistoryEntry> load() {
    final raw = _box.read<List<dynamic>>(_key);
    if (raw == null) return [];
    return raw
        .map((e) => ApiHistoryEntry.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  static void add(ApiHistoryEntry entry) {
    final list = load();
    list.insert(0, entry);
    if (list.length > _max) list.removeRange(_max, list.length);
    _box.write(_key, list.map((e) => e.toJson()).toList());
  }

  static void clear() => _box.remove(_key);
}
