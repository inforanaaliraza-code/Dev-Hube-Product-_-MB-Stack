import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/colors.dart';
import '../../data/models/tool_model.dart';
import '../../widgets/tools/tools_search_field.dart';
import '../../widgets/tool_icon_box.dart';
import 'tool_search_controller.dart';

class ToolSearchView extends GetView<ToolSearchController> {
  const ToolSearchView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: Get.back,
        ),
        title: Text(
          'Search tools',
          style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.w600, fontSize: 18),
        ),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
            child: ToolsSearchField(
              hint: 'Search by tool name, category, or keyword…',
              controller: controller.searchController,
              focusNode: controller.focusNode,
              onChanged: (_) {},
            ),
          ),
          Expanded(
            child: Obx(() {
              final q = controller.query.value.trim();
              final items = controller.results;
              if (items.isEmpty) {
                return Center(
                  child: Padding(
                    padding: const EdgeInsets.all(32),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          q.isEmpty ? Icons.widgets_outlined : Icons.search_off,
                          size: 48,
                          color: AppColors.mutedFg.withValues(alpha: 0.7),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          q.isEmpty ? 'No tools in catalog' : 'No tools match "$q"',
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            color: AppColors.mutedFg,
                            fontSize: 15,
                          ),
                        ),
                        if (q.isNotEmpty) ...[
                          const SizedBox(height: 12),
                          TextButton(
                            onPressed: controller.clearQuery,
                            child: const Text('Clear search'),
                          ),
                        ],
                      ],
                    ),
                  ),
                );
              }
              return ListView.separated(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                itemCount: items.length,
                separatorBuilder: (_, __) => const SizedBox(height: 8),
                itemBuilder: (context, i) {
                  return _SearchResultTile(
                    tool: items[i],
                    onTap: () => controller.openTool(items[i].slug),
                  );
                },
              );
            }),
          ),
        ],
      ),
    );
  }
}

class _SearchResultTile extends StatelessWidget {
  const _SearchResultTile({required this.tool, required this.onTap});

  final ToolModel tool;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final accent = accentColorFor(tool.accent);
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.card,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.border),
          ),
          child: Row(
            children: [
              ToolIconBox.fromTool(tool, size: 44),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      tool.name,
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      tool.tagline,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: AppColors.mutedFg,
                        fontSize: 12,
                        height: 1.3,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: accent.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: accent.withValues(alpha: 0.3)),
                      ),
                      child: Text(
                        tool.category,
                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: accent),
                      ),
                    ),
                  ],
                ),
              ),
              Icon(Icons.chevron_right, color: AppColors.mutedFg.withValues(alpha: 0.8)),
            ],
          ),
        ),
      ),
    );
  }
}
