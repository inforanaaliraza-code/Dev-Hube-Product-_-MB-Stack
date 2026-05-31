import 'dart:async';

import 'package:get/get.dart';
import 'models/tool_model.dart';
import 'offline_seed.dart';
import 'offline_store.dart';
import 'services/tools_service.dart';

class ToolsCatalog {
  const ToolsCatalog({
    required this.tools,
    required this.categories,
    this.fromMemoryCache = false,
    this.offline = false,
    this.isBundledSeed = false,
  });

  final List<ToolModel> tools;
  final List<String> categories;
  final bool fromMemoryCache;
  final bool offline;
  final bool isBundledSeed;
}

class ToolsRepository extends GetxService {
  ToolsRepository(this._service, this._store) {
    _hydrateFromDisk();
    if (_cachedTools == null || _cachedTools!.isEmpty) {
      final seedTools = OfflineSeed.tools();
      _cachedTools = seedTools;
      _categories = OfflineSeed.categoriesFor(seedTools);
    }
  }

  final ToolsService _service;
  final OfflineStore _store;

  List<ToolModel>? _cachedTools;
  List<String>? _categories;
  DateTime? _fetchedAt;

  static const _ttl = Duration(minutes: 5);

  bool get hasCache => _cachedTools != null && _cachedTools!.isNotEmpty;

  bool get hasDiskCache => _store.hasCatalog;

  bool get _isStale {
    if (_fetchedAt == null) return true;
    return DateTime.now().difference(_fetchedAt!) > _ttl;
  }

  void _hydrateFromDisk() {
    final tools = _store.readTools();
    if (tools == null || tools.isEmpty) return;
    _cachedTools = tools;
    _categories = _store.readCategories() ?? _deriveCategories(tools);
    _fetchedAt = _store.lastSyncedAt();
  }

  List<String> _deriveCategories(List<ToolModel> tools) {
    return tools.map((t) => t.category).toSet().toList()..sort();
  }

  void invalidate() {
    _fetchedAt = null;
    if (_store.hasCatalog) {
      _hydrateFromDisk();
    } else {
      final seedTools = OfflineSeed.tools();
      _cachedTools = seedTools;
      _categories = OfflineSeed.categoriesFor(seedTools);
    }
  }

  ToolModel? findBySlug(String slug) {
    if (_cachedTools != null) {
      for (final t in _cachedTools!) {
        if (t.slug == slug) return t;
      }
    }
    return _store.findTool(slug) ?? _findInSeed(slug);
  }

  ToolModel? _findInSeed(String slug) {
    for (final t in OfflineSeed.tools()) {
      if (t.slug == slug) return t;
    }
    return null;
  }

  ToolsCatalog? peekCatalog() {
    if (_cachedTools != null && _cachedTools!.isNotEmpty) {
      return ToolsCatalog(
        tools: List<ToolModel>.from(_cachedTools!),
        categories: List<String>.from(_categories ?? const []),
        fromMemoryCache: true,
        offline: _fetchedAt == null,
      );
    }
    return catalogFromDisk() ?? _seedCatalog();
  }

  ToolsCatalog? catalogFromDisk() {
    final tools = _store.readTools();
    if (tools == null || tools.isEmpty) return null;
    var categories = _store.readCategories();
    categories ??= _deriveCategories(tools);
    return ToolsCatalog(
      tools: tools,
      categories: categories,
      offline: true,
    );
  }

  ToolsCatalog _seedCatalog() {
    final seedTools = OfflineSeed.tools();
    return ToolsCatalog(
      tools: seedTools,
      categories: OfflineSeed.categoriesFor(seedTools),
      offline: true,
      isBundledSeed: true,
    );
  }

  ToolsCatalog _fallbackCatalog() {
    final disk = catalogFromDisk();
    if (disk != null) return disk;
    return _seedCatalog();
  }

  Future<ToolsCatalog> loadCatalog({bool force = false}) async {
    if (!force && _cachedTools != null && !_isStale && _fetchedAt != null) {
      return ToolsCatalog(
        tools: List<ToolModel>.from(_cachedTools!),
        categories: List<String>.from(_categories ?? const []),
        fromMemoryCache: true,
      );
    }
    try {
      final tools = await _service.fetchTools().timeout(const Duration(seconds: 5));
      var categories = await _service.fetchCategories().timeout(const Duration(seconds: 5));
      if (categories.isEmpty) {
        categories = _deriveCategories(tools);
      }
      _cachedTools = tools;
      _categories = categories;
      _fetchedAt = DateTime.now();
      _store.saveCatalog(tools, categories);
      return ToolsCatalog(tools: tools, categories: categories);
    } catch (_) {
      final fallback = _fallbackCatalog();
      _cachedTools = fallback.tools;
      _categories = fallback.categories;
      if (fallback.isBundledSeed) {
        _fetchedAt = null;
      } else {
        _fetchedAt = _store.lastSyncedAt();
      }
      return ToolsCatalog(
        tools: fallback.tools,
        categories: fallback.categories,
        fromMemoryCache: true,
        offline: true,
        isBundledSeed: fallback.isBundledSeed,
      );
    }
  }
}
