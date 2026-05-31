import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../data/models/tool_model.dart';
import '../../data/tools_repository.dart';

class ToolSearchController extends GetxController {
  final query = ''.obs;
  final results = <ToolModel>[].obs;

  final searchController = TextEditingController();
  final focusNode = FocusNode();

  ToolsRepository get _catalog => Get.find();

  List<ToolModel> get _allTools {
    final catalog = _catalog.peekCatalog();
    if (catalog == null || catalog.tools.isEmpty) return [];
    final list = List<ToolModel>.from(catalog.tools);
    list.sort((a, b) => a.name.compareTo(b.name));
    return list;
  }

  @override
  void onInit() {
    super.onInit();
    searchController.addListener(_onTextChanged);
    _filter();
    Future.microtask(() {
      if (focusNode.canRequestFocus) focusNode.requestFocus();
    });
  }

  @override
  void onClose() {
    searchController.dispose();
    focusNode.dispose();
    super.onClose();
  }

  void _onTextChanged() {
    query.value = searchController.text;
    _filter();
  }

  void clearQuery() {
    searchController.clear();
    query.value = '';
    _filter();
  }

  void _filter() {
    final q = query.value.trim().toLowerCase();
    final all = _allTools;
    if (q.isEmpty) {
      results.assignAll(all);
      return;
    }
    results.assignAll(
      all.where((t) {
        if (t.name.toLowerCase().contains(q)) return true;
        if (t.tagline.toLowerCase().contains(q)) return true;
        if (t.category.toLowerCase().contains(q)) return true;
        if (t.slug.toLowerCase().contains(q)) return true;
        for (final k in t.keywords) {
          if (k.toLowerCase().contains(q)) return true;
        }
        return false;
      }),
    );
  }

  void openTool(String slug) {
    Get.back();
    Get.toNamed('/tool/$slug');
  }
}
