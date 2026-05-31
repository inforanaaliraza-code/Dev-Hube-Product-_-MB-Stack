import '../api_client.dart';
import '../api_parse.dart';
import '../models/tool_model.dart';

class ToolsService {
  ToolsService(this._api);

  final ApiClient _api;

  Future<List<ToolModel>> fetchTools({String? category, String? search}) async {
    final data = await _api.getList(
      '/tools',
      query: {
        if (category != null && category.isNotEmpty) 'category': category,
        if (search != null && search.isNotEmpty) 'search': search,
      },
    );
    return data
        .map((e) => ToolModel.fromJson(ApiParse.map(e)))
        .where((t) => t.slug.isNotEmpty)
        .toList();
  }

  Future<ToolModel> fetchTool(String slug) async {
    final data = await _api.getMap('/tools/$slug');
    return ToolModel.fromJson(data);
  }

  Future<List<String>> fetchCategories() async {
    final data = await _api.getJson<dynamic>('/categories');
    return ApiParse.categories(data);
  }
}
