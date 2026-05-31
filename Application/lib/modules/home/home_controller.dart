import 'package:get/get.dart';
import '../../core/app_error.dart';
import '../../core/async_load_mixin.dart';
import '../../core/constants.dart';
import '../../core/offline_controller.dart';
import '../../data/models/site_settings.dart';
import '../../data/models/tool_model.dart';
import '../../data/offline_store.dart';
import '../../data/tools_repository.dart';
import '../../data/services/settings_service.dart';
import '../../core/notifications_controller.dart';
import '../../core/tool_search_launcher.dart';
import '../shell/shell_controller.dart';
import '../tools/tools_controller.dart';

class HomeController extends GetxController with AsyncLoadMixin {
  final loading = true.obs;
  final error = ''.obs;
  final errorScope = AppErrorScope.unknown.obs;
  final settings = SiteSettings.defaults().obs;
  final featured = <ToolModel>[].obs;
  final categories = <String>[].obs;
  final toolCount = 0.obs;
  final categoryCounts = <String, int>{}.obs;

  bool _ready = false;

  ToolsRepository get _catalog => Get.find();
  SettingsService get _site => Get.find();
  OfflineController get _offline => Get.find();
  OfflineStore get _store => Get.find();

  bool get hasContent => toolCount.value > 0;

  @override
  void onInit() {
    super.onInit();
    _primeFromCache();
  }

  Future<void> ensureLoaded({bool force = false}) async {
    if (_ready && !force && error.value.isEmpty) return;
    await load(force: force);
  }

  void _primeFromCache() {
    final instant = _catalog.peekCatalog();
    if (instant == null) return;
    settings.value = _store.readSettings() ?? SiteSettings.defaults();
    _applyCatalog(instant);
    loading.value = false;
    error.value = '';
    if (instant.offline || instant.isBundledSeed) {
      _markOffline(instant);
    }
  }

  void _applyCatalog(ToolsCatalog catalog) {
    final all = catalog.tools;
    final cats = catalog.categories;
    categories.value = cats;
    toolCount.value = all.length;
    final counts = <String, int>{};
    for (final t in all) {
      counts[t.category] = (counts[t.category] ?? 0) + 1;
    }
    categoryCounts.value = counts;
    var list = all.where((t) => t.featured && t.isReady).toList();
    if (list.isEmpty) list = all.where((t) => t.isReady).take(12).toList();
    if (list.isEmpty) list = all.take(12).toList();
    final first = list.where((t) => t.slug == AppConstants.trendingFirstSlug).toList();
    final rest = list.where((t) => t.slug != AppConstants.trendingFirstSlug).toList();
    featured.assignAll([...first, ...rest].take(9).toList());
    _ready = true;
  }

  void _markOffline(ToolsCatalog catalog) {
    _offline.setOffline(
      true,
      syncedAt: catalog.isBundledSeed ? null : _store.lastSyncedAt(),
      bundledCatalog: catalog.isBundledSeed,
    );
  }

  Future<void> load({bool force = false}) async {
    _primeFromCache();
    if (!hasContent) loading.value = true;

    try {
      settings.value = await _site.fetchSite();
      final catalog = await _catalog.loadCatalog(force: force);
      _applyCatalog(catalog);
      if (catalog.offline) {
        _markOffline(catalog);
        error.value = '';
      } else {
        _offline.markOnline();
        error.value = '';
      }
    } catch (e) {
      final fallback = _catalog.peekCatalog();
      if (fallback != null && fallback.tools.isNotEmpty) {
        settings.value = _store.readSettings() ?? SiteSettings.defaults();
        _applyCatalog(fallback);
        _markOffline(fallback);
        error.value = '';
      } else {
        final info = AppErrorInfo.from(e, apiClient);
        error.value = info.message;
        errorScope.value = info.scope;
        _offline.setOffline(true);
      }
    } finally {
      loading.value = false;
    }
  }

  void openTool(String slug) => Get.toNamed('/tool/$slug');

  void goToTools() => Get.find<ShellController>().setTab(1);

  void goToToolsCategory(String category) {
    Get.find<ShellController>().setTab(1);
    if (Get.isRegistered<ToolsController>()) {
      final tools = Get.find<ToolsController>();
      tools.selectedCategory.value = category;
      tools.applyFilter();
    }
  }

  void openSearch() => ToolSearchLauncher.open();

  void openNotifications() {
    if (Get.isRegistered<NotificationsController>()) {
      Get.find<NotificationsController>().openScreen();
    }
  }
}
