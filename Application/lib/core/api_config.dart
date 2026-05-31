import 'package:flutter/foundation.dart';

class ApiConfig {
  static const port = 4000;
  static const apiPath = '/api/v1';

  static String defaultForPlatform() {
    if (kIsWeb) return 'http://127.0.0.1:$port$apiPath';
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return 'http://10.0.2.2:$port$apiPath';
      case TargetPlatform.iOS:
        return 'http://127.0.0.1:$port$apiPath';
      default:
        return 'http://127.0.0.1:$port$apiPath';
    }
  }

  static bool usesLocalhost(String url) {
    final u = url.toLowerCase();
    return u.contains('localhost') || u.contains('127.0.0.1');
  }

  static bool isMobileApp() {
    if (kIsWeb) return false;
    return defaultTargetPlatform == TargetPlatform.android ||
        defaultTargetPlatform == TargetPlatform.iOS;
  }

  static bool shouldResetLocalhostUrl(String? saved) {
    if (saved == null || saved.trim().isEmpty) return false;
    if (!isMobileApp()) return false;
    return usesLocalhost(saved);
  }

  static String fromLanHost(String host) {
    var h = host.trim();
    if (h.isEmpty) return defaultForPlatform();
    if (h.startsWith('http')) {
      return h.replaceAll(RegExp(r'/+$'), '');
    }
    h = h.split('/').first;
    h = h.replaceAll(RegExp(r':\d+$'), '');
    return 'http://$h:$port$apiPath';
  }

  static String platformHint() {
    if (kIsWeb) return 'Web: http://127.0.0.1:$port$apiPath';
    if (defaultTargetPlatform == TargetPlatform.android) {
      return 'Emulator: 10.0.2.2 · Real phone: PC IP from ipconfig (same Wi‑Fi)';
    }
    if (defaultTargetPlatform == TargetPlatform.iOS) {
      return 'Simulator: 127.0.0.1 · Real iPhone: PC Wi‑Fi IP';
    }
    return 'http://127.0.0.1:$port$apiPath';
  }
}
