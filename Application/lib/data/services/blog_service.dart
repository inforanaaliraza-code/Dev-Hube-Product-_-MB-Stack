import '../api_client.dart';
import '../api_parse.dart';
import '../models/blog_model.dart';

class BlogService {
  BlogService(this._api);

  final ApiClient _api;

  Future<List<BlogModel>> fetchBlogs() async {
    final data = await _api.getList('/site/tool-blogs');
    return data
        .map((e) => BlogModel.fromJson(ApiParse.map(e)))
        .where((b) => b.toolSlug.isNotEmpty || b.title.isNotEmpty)
        .toList();
  }

  Future<BlogModel?> fetchToolBlog(String slug) async {
    try {
      final data = await _api.getMap('/site/tools/$slug/blog');
      return BlogModel.fromJson(data);
    } catch (_) {
      return null;
    }
  }
}
