import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import '../../core/app_error.dart';
import '../../core/async_load_mixin.dart';
import '../../core/constants.dart';
import '../../core/offline_controller.dart';
import '../../data/blog_repository.dart';
import '../../data/models/blog_model.dart';
import '../../data/offline_store.dart';
import '../../data/tools_repository.dart';
import '../../core/notifications_controller.dart';
import '../../core/tool_search_launcher.dart';
import '../shell/shell_controller.dart';
import '../tools/tools_controller.dart';

class BlogController extends GetxController with AsyncLoadMixin {
  final loading = true.obs;
  final error = ''.obs;
  final errorScope = AppErrorScope.unknown.obs;
  final posts = <BlogModel>[].obs;
  final filtered = <BlogModel>[].obs;
  final toolCategories = <String>[].obs;
  final selectedCategory = ''.obs;
  final searchQuery = ''.obs;
  final bookmarks = <String>{}.obs;

  final searchFocus = FocusNode();
  final searchController = TextEditingController();

  final _box = GetStorage();
  bool _ready = false;

  BlogRepository get _blogs => Get.find();
  ToolsRepository get _catalog => Get.find();
  OfflineController get _offline => Get.find();
  OfflineStore get _store => Get.find();

  bool get hasContent => posts.isNotEmpty;

  @override
  void onInit() {
    super.onInit();
    _loadBookmarks();
    _primeFromCache();
    ever(selectedCategory, (_) => applyFilter());
    ever(searchQuery, (_) => applyFilter());
    searchController.addListener(() {
      if (searchQuery.value != searchController.text) {
        searchQuery.value = searchController.text;
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

  void _loadBookmarks() {
    final raw = _box.read<List<dynamic>>(AppConstants.blogBookmarksKey);
    if (raw != null) {
      bookmarks.assignAll(raw.map((e) => e.toString()).toSet());
    }
  }

  void _saveBookmarks() {
    _box.write(AppConstants.blogBookmarksKey, bookmarks.toList());
  }

  void _primeFromCache() {
    final cached = _blogs.peekPosts();
    if (cached.isEmpty) return;
    posts.assignAll(cached);
    _syncCategoriesFromCatalog();
    applyFilter();
    loading.value = false;
    error.value = '';
    _ready = true;
    _offline.setOffline(true, syncedAt: _store.lastSyncedAt());
  }

  void _syncCategoriesFromCatalog() {
    final peek = _catalog.peekCatalog();
    if (peek != null && peek.categories.isNotEmpty) {
      toolCategories.value = peek.categories;
      return;
    }
    toolCategories.value = posts
        .map((p) => p.toolCategory)
        .where((c) => c.isNotEmpty)
        .toSet()
        .toList()
      ..sort();
  }

  Future<void> load({bool force = false}) async {
    _primeFromCache();
    if (!hasContent) loading.value = true;
    error.value = '';

    try {
      final result = await _blogs.loadPosts(force: force);
      posts.assignAll(result.posts);
      _syncCategoriesFromCatalog();
      applyFilter();
      _ready = true;
      if (result.offline) {
        _offline.setOffline(true, syncedAt: _store.lastSyncedAt());
        error.value = '';
      } else {
        _offline.markOnline();
      }
    } catch (e) {
      final cached = _blogs.peekPosts();
      if (cached.isNotEmpty) {
        posts.assignAll(cached);
        _syncCategoriesFromCatalog();
        applyFilter();
        _ready = true;
        _offline.setOffline(true, syncedAt: _store.lastSyncedAt());
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
    final q = searchQuery.value.trim().toLowerCase();
    final cat = selectedCategory.value;
    filtered.value = posts.where((p) {
      if (cat.isNotEmpty && p.toolCategory != cat) return false;
      if (q.isEmpty) return true;
      return p.title.toLowerCase().contains(q) ||
          p.toolName.toLowerCase().contains(q) ||
          p.toolCategory.toLowerCase().contains(q) ||
          p.excerpt.toLowerCase().contains(q);
    }).toList();
  }

  void clearCategory() => selectedCategory.value = '';

  void selectCategory(String c) {
    selectedCategory.value = selectedCategory.value == c ? '' : c;
  }

  String bookmarkKey(BlogModel p) => p.id ?? p.toolSlug;

  bool isBookmarked(BlogModel p) => bookmarks.contains(bookmarkKey(p));

  void toggleBookmark(BlogModel p) {
    final key = bookmarkKey(p);
    if (bookmarks.contains(key)) {
      bookmarks.remove(key);
    } else {
      bookmarks.add(key);
    }
    bookmarks.refresh();
    _saveBookmarks();
  }

  void focusSearch() => ToolSearchLauncher.open();

  void openSettings() => Get.find<ShellController>().setTab(3);

  void openNotifications() {
    if (Get.isRegistered<NotificationsController>()) {
      Get.find<NotificationsController>().openScreen();
    }
  }

  void openPost(BlogModel post) => Get.toNamed('/blog/${post.toolSlug}', arguments: post);
}
