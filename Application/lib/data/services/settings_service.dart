import 'package:get/get.dart';
import '../api_client.dart';
import '../models/site_settings.dart';
import '../offline_store.dart';

class SettingsService extends GetxService {
  SettingsService(this._api, this._store);

  final ApiClient _api;
  final OfflineStore _store;

  Future<SiteSettings> fetchSite({bool preferCacheOnError = true}) async {
    try {
      final data = await _api.getMap('/site/settings');
      final settings = SiteSettings.fromJson(data);
      _store.saveSettings(settings);
      return settings;
    } catch (_) {
      if (!preferCacheOnError) return SiteSettings.defaults();
      return _store.readSettings() ?? SiteSettings.defaults();
    }
  }
}
