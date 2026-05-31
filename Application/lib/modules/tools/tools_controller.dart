import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import '../../core/app_error.dart';
import '../../core/async_load_mixin.dart';
import '../../core/constants.dart';
import '../../core/offline_controller.dart';
import '../../data/models/tool_model.dart';
import '../../data/offline_store.dart';
import '../../data/tools_repository.dart';
import '../../core/notifications_controller.dart';
import '../../core/tool_search_launcher.dart';
import '../shell/shell_controller.dart';

class ToolsController extends GetxController with AsyncLoadMixin {
  final loading = true.obs;
  final error = ''.obs;
  final errorScope = AppErrorScope.unknown.obs;
  final all = <ToolModel>[].obs;
  final filtered = <ToolModel>[].obs;
  final categories = <String>[].obs;
  final categoryCounts = <String, int>{}.obs;
  final selectedCategory = ''.obs;
  final query = ''.obs;
  final favorites = <String>{}.obs;

  final searchFocus = FocusNode();
  final searchController = TextEditingController();

  final _box = GetStorage();
  bool _ready = false;

  ToolsRepository get _catalog => Get.find();
  OfflineController get _offline => Get.find();
  OfflineStore get _store => Get.find();

  int get toolCount => all.length;

  bool get hasContent => all.isNotEmpty;

  @override
  void onInit() {
    super.onInit();
    _loadFavorites();
    _primeFromCache();
    ever(query, (_) => applyFilter());
    ever(selectedCategory, (_) => applyFilter());
    searchController.addListener(() {
      if (query.value != searchController.text) {
        query.value = searchController.text;
      }
    });
  }

  @override
  void onClose() {
    searchController.dispose();
    searchFocus.dispose();
    super.onClose();
  }

  Future<void> ensureLoaded({bool force = false}) async {
    if (_ready && !force && error.value.isEmpty) return;
    await load(force: force);
  }

  void _loadFavorites() {
    final raw = _box.read<List<dynamic>>(AppConstants.toolFavoritesKey);
    if (raw != null) {
      favorites.assignAll(raw.map((e) => e.toString()).toSet());
    }
  }

  void _saveFavorites() {
    _box.write(AppConstants.toolFavoritesKey, favorites.toList());
  }

  void _primeFromCache() {
    final instant = _catalog.peekCatalog();
    if (instant == null) return;
    _applyCatalog(instant);
    loading.value = false;
    error.value = '';
    if (instant.offline || instant.isBundledSeed) {
      _markOffline(instant);
    }
  }

  void _applyCatalog(ToolsCatalog catalog) {
    categories.value = catalog.categories;
    all.value = catalog.tools;
    final counts = <String, int>{};
    for (final t in all) {
      counts[t.category] = (counts[t.category] ?? 0) + 1;
    }
    categoryCounts.value = counts;
    if (categories.isEmpty) {
      categories.value = counts.keys.toList()..sort();
    }
    applyFilter();
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
    error.value = '';

    try {
      final catalog = await _catalog.loadCatalog(force: force);
      _applyCatalog(catalog);
      if (catalog.offline) {
        _markOffline(catalog);
        error.value = '';
      } else {
        _offline.markOnline();
      }
    } catch (e) {
      final fallback = _catalog.peekCatalog();
      if (fallback != null && fallback.tools.isNotEmpty) {
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

  void applyFilter() {
    final q = query.value.trim().toLowerCase();
    final cat = selectedCategory.value;
    filtered.value = all.where((t) {
      if (cat.isNotEmpty && t.category != cat) return false;
      if (q.isEmpty) return true;
      return t.name.toLowerCase().contains(q) ||
          t.tagline.toLowerCase().contains(q) ||
          t.category.toLowerCase().contains(q);
    }).toList();
  }

  void selectCategory(String c) {
    selectedCategory.value = selectedCategory.value == c ? '' : c;
  }

  void clearCategory() {
    selectedCategory.value = '';
  }

  bool isFavorite(String slug) => favorites.contains(slug);

  void toggleFavorite(String slug) {
    if (favorites.contains(slug)) {
      favorites.remove(slug);
    } else {
      favorites.add(slug);
    }
    favorites.refresh();
    _saveFavorites();
  }

  void focusSearch() => ToolSearchLauncher.open();

  void openToolSearch() => ToolSearchLauncher.open();

  void openTool(String slug) => Get.toNamed('/tool/$slug');

  void openSettings() => Get.find<ShellController>().setTab(3);

  void openNotifications() {
    if (Get.isRegistered<NotificationsController>()) {
      Get.find<NotificationsController>().openScreen();
    }
  }

  IconData? iconForCategory(String c) {
    final lower = c.toLowerCase();
    if (lower.contains('ai')) return Icons.auto_awesome;
    if (lower.contains('format')) return Icons.text_format;
    if (lower.contains('encod')) return Icons.lock_outline;
    if (lower.contains('generat')) return Icons.build_circle_outlined;
    if (lower.contains('network') || lower.contains('api')) return Icons.hub_outlined;
    if (lower.contains('secur')) return Icons.shield_outlined;
    if (lower.contains('pdf') || lower.contains('file')) return Icons.picture_as_pdf_outlined;
    if (lower.contains('image')) return Icons.image_outlined;
    return Icons.widgets_outlined;
  }
}
