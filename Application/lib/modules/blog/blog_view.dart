import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../core/colors.dart';
import '../../core/responsive.dart';
import '../../widgets/app_screen_header.dart';
import '../../widgets/category_filter_bar.dart';
import '../../widgets/connection_error_card.dart';
import '../../widgets/tools/tools_search_field.dart';
import '../../widgets/blog/blog_hero.dart';
import '../../widgets/blog/blog_post_card.dart';
import 'blog_controller.dart';

class BlogView extends GetView<BlogController> {
  const BlogView({super.key});

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      if (controller.loading.value && controller.posts.isEmpty) {
        return const Center(child: CircularProgressIndicator(color: AppColors.primary));
      }
      if (controller.error.value.isNotEmpty &&
          !controller.hasContent &&
          controller.filtered.isEmpty) {
        return ConnectionErrorCard(
          message: controller.error.value,
          scope: controller.errorScope.value,
          onRetry: () => controller.load(force: true),
        );
      }
      return RefreshIndicator(
        onRefresh: () => controller.load(force: true),
        color: AppColors.primary,
        child: _BlogScroll(controller: controller),
      );
    });
  }
}

class _BlogScroll extends StatelessWidget {
  const _BlogScroll({required this.controller});

  final BlogController controller;

  @override
  Widget build(BuildContext context) {
    final pad = AppLayout.screenPadding(context);

    return CustomScrollView(
      physics: const AlwaysScrollableScrollPhysics(),
      slivers: [
        SliverToBoxAdapter(
          child: AppScreenHeader(
            onSearch: controller.focusSearch,
            onNotify: controller.openNotifications,
          ),
        ),
        const SliverToBoxAdapter(child: BlogHero()),
        SliverPadding(
          padding: EdgeInsets.fromLTRB(pad.left, 0, pad.right, 10),
          sliver: SliverToBoxAdapter(
            child: ToolsSearchField(
              hint: 'Search articles…',
              controller: controller.searchController,
              focusNode: controller.searchFocus,
              onChanged: (v) => controller.searchQuery.value = v,
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: Obx(
            () => CategoryFilterBar(
              categories: controller.toolCategories,
              selected: controller.selectedCategory.value,
              horizontalPadding: pad.left,
              onAll: controller.clearCategory,
              onCategory: controller.selectCategory,
            ),
          ),
        ),
        SliverPadding(
          padding: EdgeInsets.fromLTRB(pad.left, 16, pad.right, AppLayout.bottomInset(context)),
          sliver: Obx(() {
            final items = controller.filtered;
            final marks = controller.bookmarks;
            if (items.isEmpty) {
              return SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 48),
                  child: Center(
                    child: Text(
                      controller.posts.isEmpty
                          ? 'No blog posts yet.'
                          : 'No articles match your filter.',
                      style: const TextStyle(color: AppColors.mutedFg),
                    ),
                  ),
                ),
              );
            }
            return SliverList.separated(
              itemCount: items.length,
              separatorBuilder: (_, __) => const SizedBox(height: 14),
              itemBuilder: (_, i) {
                final p = items[i];
                final key = controller.bookmarkKey(p);
                return BlogPostCard(
                  post: p,
                  dateLabel: BlogPostCard.formatDate(p.publishedAt),
                  readMinutes: BlogPostCard.estimateReadMinutes(p),
                  isBookmarked: marks.contains(key),
                  onTap: () => controller.openPost(p),
                  onBookmarkToggle: () => controller.toggleBookmark(p),
                );
              },
            );
          }),
        ),
      ],
    );
  }
}
