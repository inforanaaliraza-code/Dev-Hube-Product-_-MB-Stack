import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/colors.dart';
import '../../core/responsive.dart';
import '../../data/models/site_settings.dart';
import '../../widgets/connection_error_card.dart';
import '../../widgets/gradient_button.dart';
import '../../widgets/browse_category_section.dart';
import '../../widgets/home/home_featured_card.dart';
import '../../widgets/app_screen_header.dart';
import '../../widgets/home/home_hero_visual.dart';
import '../../widgets/home/home_stats_strip.dart';
import 'home_controller.dart';

class HomeView extends GetView<HomeController> {
  const HomeView({super.key});

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: () => controller.load(force: true),
      color: AppColors.primary,
      child: Obx(() {
        if (controller.loading.value && !controller.hasContent) {
          return const Center(child: CircularProgressIndicator(color: AppColors.primary));
        }
        if (controller.error.value.isNotEmpty && !controller.hasContent) {
          return ConnectionErrorCard(
            message: controller.error.value,
            scope: controller.errorScope.value,
            onRetry: () => controller.load(force: true),
          );
        }
        return _HomeContent(controller: controller);
      }),
    );
  }
}

class _HomeContent extends StatelessWidget {
  const _HomeContent({required this.controller});

  final HomeController controller;

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    final pad = AppLayout.screenPadding(context);
    final settings = controller.settings.value;
    final heroStacked = width < 520;
    final cols = AppLayout.gridColumns(width);
    final catCount = controller.categories.length;
    final toolTotal = controller.toolCount.value;

    return CustomScrollView(
      physics: const AlwaysScrollableScrollPhysics(),
      slivers: [
        SliverToBoxAdapter(
          child: AppScreenHeader(
            onSearch: controller.openSearch,
            onNotify: controller.openNotifications,
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: EdgeInsets.fromLTRB(pad.left, 8, pad.right, 0),
            child: _HeroSection(
              settings: settings,
              stacked: heroStacked,
              onExplore: controller.goToTools,
              onCategories: controller.goToTools,
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.only(top: 20, bottom: 24),
            child: HomeStatsStrip(
              toolCount: toolTotal,
              categoryCount: catCount > 0 ? catCount : 15,
            ),
          ),
        ),
        SliverPadding(
          padding: EdgeInsets.fromLTRB(pad.left, 0, pad.right, 8),
          sliver: SliverToBoxAdapter(
            child: _SectionHeader(
              icon: Icons.trending_up,
              title: 'Trending tools',
              onViewAll: controller.goToTools,
            ),
          ),
        ),
        SliverPadding(
          padding: EdgeInsets.fromLTRB(pad.left, 0, pad.right, 12),
          sliver: SliverGrid(
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: cols,
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              mainAxisExtent: AppLayout.homeCardHeight(context),
            ),
            delegate: SliverChildBuilderDelegate(
              (context, i) {
                final t = controller.featured[i];
                return HomeFeaturedCard(
                  tool: t,
                  onTap: () => controller.openTool(t.slug),
                );
              },
              childCount: controller.featured.length,
            ),
          ),
        ),
        SliverPadding(
          padding: EdgeInsets.fromLTRB(pad.left, 0, pad.right, 12),
          sliver: SliverToBoxAdapter(
            child: _SectionHeader(
              icon: Icons.grid_view_rounded,
              title: 'Browse by category',
              onViewAll: controller.goToTools,
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: BrowseCategorySection(
            categories: controller.categories,
            counts: controller.categoryCounts,
            horizontalPadding: pad.left,
            onCategory: controller.goToToolsCategory,
          ),
        ),
        SliverToBoxAdapter(child: SizedBox(height: AppLayout.bottomInset(context))),
        const SliverToBoxAdapter(child: SizedBox(height: 8)),
      ],
    );
  }
}

class _HeroSection extends StatelessWidget {
  const _HeroSection({
    required this.settings,
    required this.stacked,
    required this.onExplore,
    required this.onCategories,
  });

  final SiteSettings settings;
  final bool stacked;
  final VoidCallback onExplore;
  final VoidCallback onCategories;

  @override
  Widget build(BuildContext context) {
    final titleSize = stacked ? 24.0 : 26.0;
    final textBlock = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          settings.heroTitle,
          style: GoogleFonts.spaceGrotesk(
            fontSize: titleSize,
            fontWeight: FontWeight.w600,
            height: 1.08,
            letterSpacing: -0.5,
          ),
        ),
        ShaderMask(
          shaderCallback: (b) => AppColors.gradientText.createShader(b),
          child: Text(
            'utility hub.',
            style: GoogleFonts.spaceGrotesk(
              fontSize: titleSize,
              fontWeight: FontWeight.w600,
              height: 1.08,
              color: Colors.white,
            ),
          ),
        ),
        const SizedBox(height: 10),
        Text(
          settings.heroSubtitle,
          style: const TextStyle(
            color: AppColors.mutedFg,
            fontSize: 14,
            height: 1.45,
          ),
        ),
        const SizedBox(height: 18),
        GradientButton(
          label: 'Explore tools',
          icon: Icons.rocket_launch_outlined,
          expand: stacked,
          onPressed: onExplore,
        ),
        const SizedBox(height: 10),
        SizedBox(
          width: stacked ? double.infinity : null,
          child: OutlinedButton.icon(
            onPressed: onCategories,
            icon: const Icon(Icons.grid_view_rounded, size: 18),
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
              side: const BorderSide(color: AppColors.border),
              foregroundColor: AppColors.foreground,
            ),
            label: const Text('Browse categories'),
          ),
        ),
      ],
    );

    if (stacked) {
      return textBlock;
    }

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(child: textBlock),
        const SizedBox(width: 4),
        const HomeHeroVisual(),
      ],
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({
    required this.icon,
    required this.title,
    required this.onViewAll,
  });

  final IconData icon;
  final String title;
  final VoidCallback onViewAll;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 22, color: AppColors.foreground),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            title,
            style: GoogleFonts.spaceGrotesk(
              fontSize: 22,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        TextButton(
          onPressed: onViewAll,
          style: TextButton.styleFrom(foregroundColor: AppColors.primary),
          child: const Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('View all', style: TextStyle(fontWeight: FontWeight.w600)),
              SizedBox(width: 4),
              Icon(Icons.arrow_forward, size: 16),
            ],
          ),
        ),
      ],
    );
  }
}
