import 'package:get/get.dart';
import '../data/api_client.dart';

class MediaUrl {
  static String resolve(String? path) {
    if (path == null || path.trim().isEmpty) return '';
    final p = path.trim();
    if (p.startsWith('http://') || p.startsWith('https://')) return p;
    if (!Get.isRegistered<ApiClient>()) return p;
    final api = Get.find<ApiClient>().apiBase;
    final origin = api.replaceAll(RegExp(r'/api/v1/?$'), '');
    if (p.startsWith('/')) return '$origin$p';
    return '$origin/$p';
  }
}
