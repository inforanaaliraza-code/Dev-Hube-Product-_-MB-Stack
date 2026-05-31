import 'models/blog_model.dart';
import 'models/tool_model.dart';
import 'offline_seed.dart';

class BlogOfflineSeed {
  static List<BlogModel>? _cache;

  static List<BlogModel> posts() {
    return _cache ??= _build();
  }

  static BlogModel fromTool(ToolModel t) {
    return BlogModel(
      id: t.slug,
      toolSlug: t.slug,
      toolName: t.name,
      toolCategory: t.category,
      title: '${t.name} — quick guide',
      excerpt: t.tagline,
      body:
          '<p>${t.description}</p><p>Open this tool from the catalog. '
          'Connect to your backend once to load full articles and images from the server.</p>',
      toolIcon: t.icon,
      toolAccent: t.accent,
    );
  }

  static List<BlogModel> _build() {
    final featured = OfflineSeed.tools().where((t) => t.featured).take(12);
    final rest = OfflineSeed.tools().where((t) => !t.featured).take(6);
    return [...featured, ...rest].map(fromTool).toList();
  }
}
