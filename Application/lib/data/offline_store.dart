import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import '../core/constants.dart';
import 'models/blog_model.dart';
import 'models/site_settings.dart';
import 'models/tool_model.dart';

class OfflineStore extends GetxService {
  final _box = GetStorage();

  void saveCatalog(List<ToolModel> tools, List<String> categories) {
    _box.write(AppConstants.offlineToolsKey, tools.map((t) => t.toJson()).toList());
    _box.write(AppConstants.offlineCategoriesKey, categories);
    _box.write(AppConstants.offlineSyncedAtKey, DateTime.now().toIso8601String());
  }

  List<ToolModel>? readTools() {
    final raw = _box.read<List<dynamic>>(AppConstants.offlineToolsKey);
    if (raw == null || raw.isEmpty) return null;
    return raw
        .map((e) => ToolModel.fromJson(Map<String, dynamic>.from(e as Map)))
        .where((t) => t.slug.isNotEmpty)
        .toList();
  }

  List<String>? readCategories() {
    final raw = _box.read<List<dynamic>>(AppConstants.offlineCategoriesKey);
    if (raw == null) return null;
    return raw.map((e) => e.toString()).where((s) => s.isNotEmpty).toList();
  }

  DateTime? lastSyncedAt() {
    final raw = _box.read<String>(AppConstants.offlineSyncedAtKey);
    if (raw == null) return null;
    try {
      return DateTime.parse(raw);
    } catch (_) {
      return null;
    }
  }

  bool get hasCatalog {
    final tools = readTools();
    return tools != null && tools.isNotEmpty;
  }

  ToolModel? findTool(String slug) {
    final tools = readTools();
    if (tools == null) return null;
    for (final t in tools) {
      if (t.slug == slug) return t;
    }
    return null;
  }

  void saveBlogs(List<BlogModel> blogs) {
    _box.write(AppConstants.offlineBlogsKey, blogs.map((b) => b.toJson()).toList());
  }

  List<BlogModel>? readBlogs() {
    final raw = _box.read<List<dynamic>>(AppConstants.offlineBlogsKey);
    if (raw == null || raw.isEmpty) return null;
    return raw
        .map((e) => BlogModel.fromJson(Map<String, dynamic>.from(e as Map)))
        .where((b) => b.toolSlug.isNotEmpty || b.title.isNotEmpty)
        .toList();
  }

  void saveSettings(SiteSettings settings) {
    _box.write(AppConstants.offlineSettingsKey, settings.toJson());
  }

  SiteSettings? readSettings() {
    final raw = _box.read<Map<dynamic, dynamic>>(AppConstants.offlineSettingsKey);
    if (raw == null) return null;
    return SiteSettings.fromJson(Map<String, dynamic>.from(raw));
  }

  void saveToolBlog(String slug, BlogModel blog) {
    _box.write('${AppConstants.offlineToolBlogPrefix}$slug', blog.toJson());
  }

  BlogModel? readToolBlog(String slug) {
    final raw = _box.read<Map<dynamic, dynamic>>('${AppConstants.offlineToolBlogPrefix}$slug');
    if (raw == null) return null;
    return BlogModel.fromJson(Map<String, dynamic>.from(raw));
  }

  void clearAll() {
    _box.remove(AppConstants.offlineToolsKey);
    _box.remove(AppConstants.offlineCategoriesKey);
    _box.remove(AppConstants.offlineBlogsKey);
    _box.remove(AppConstants.offlineSettingsKey);
    _box.remove(AppConstants.offlineSyncedAtKey);
  }
}
