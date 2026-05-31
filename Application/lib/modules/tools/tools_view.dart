import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/colors.dart';
import '../../core/responsive.dart';
import '../../widgets/connection_error_card.dart';
import '../../widgets/app_screen_header.dart';
import '../../widgets/browse_category_section.dart';
import '../../widgets/tools/tools_grid_card.dart';
import '../../widgets/tools/tools_search_field.dart';
import 'tools_controller.dart';

class ToolsView extends GetView<ToolsController> {
  const ToolsView({super.key});

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      if (controller.loading.value && controller.all.isEmpty) {
        return const Center(child: CircularProgressIndicator(color: AppColors.primary));
      }
      if (controller.error.value.isNotEmpty && !controller.hasContent) {
        return ConnectionErrorCard(
          message: controller.error.value,
          scope: controller.errorScope.value,
          onRetry: () => controller.load(force: true),
        );
      }
      return RefreshIndicator(
        onRefresh: () => controller.load(force: true),
        color: AppColors.primary,
        child: _ToolsScroll(controller: controller),
      );
    });
  }
}

class _ToolsScroll extends StatelessWidget {
  const _ToolsScroll({required this.controller});

  final ToolsController controller;

  @override
  Widget build(BuildContext context) {
    final pad = AppLayout.screenPadding(context);
    final width = MediaQuery.sizeOf(context).width;
    final cols = AppLayout.gridColumns(width);
    final count = controller.toolCount;
    final hint = count > 0
        ? 'Search $count+ developer tools…'
        : 'Search 60+ developer tools…';

    return CustomScrollView(
      physics: const AlwaysScrollableScrollPhysics(),
      slivers: [
        SliverToBoxAdapter(
          child: AppScreenHeader(
            onSearch: controller.focusSearch,
            onNotify: controller.openNotifications,
          ),
        ),
        SliverPadding(
          padding: EdgeInsets.fromLTRB(pad.left, 4, pad.right, 12),
          sliver: SliverToBoxAdapter(
            child: ToolsSearchField(
              hint: hint,
              controller: controller.searchController,
              focusNode: controller.searchFocus,
              onChanged: (v) => controller.query.value = v,
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: Obx(
            () => BrowseCategorySection(
              categories: controller.categories,
              counts: controller.categoryCounts,
              selected: controller.selectedCategory.value,
              showAll: true,
              onAll: controller.clearCategory,
              horizontalPadding: pad.left,
              onCategory: controller.selectCategory,
            ),
          ),
        ),
        SliverPadding(
          padding: EdgeInsets.fromLTRB(pad.left, 16, pad.right, AppLayout.bottomInset(context)),
          sliver: Obx(() {
            final items = controller.filtered;
            final favs = controller.favorites;
            if (items.isEmpty) {
              return SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 48),
                  child: Center(
                    child: Text(
                      controller.query.value.isNotEmpty
                          ? 'No tools match your search'
                          : 'No tools available',
                      style: const TextStyle(color: AppColors.mutedFg),
                    ),
                  ),
                ),
              );
            }
            return SliverGrid(
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: cols,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                mainAxisExtent: AppLayout.toolCardHeight(context),
              ),
              delegate: SliverChildBuilderDelegate(
                (context, i) {
                  final t = items[i];
                  return ToolsGridCard(
                    tool: t,
                    isFavorite: favs.contains(t.slug),
                    onTap: () => controller.openTool(t.slug),
                    onFavoriteToggle: () => controller.toggleFavorite(t.slug),
                  );
                },
                childCount: items.length,
              ),
            );
          }),
        ),
      ],
    );
  }
}

