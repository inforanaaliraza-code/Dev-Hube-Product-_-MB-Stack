import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../core/category_icons.dart';
import '../core/colors.dart';

class BrowseCategorySection extends StatelessWidget {
  const BrowseCategorySection({
    super.key,
    required this.categories,
    required this.counts,
    required this.onCategory,
    this.selected,
    this.showAll = false,
    this.onAll,
    this.horizontalPadding = 16,
    this.height = 88,
  });

  final List<String> categories;
  final Map<String, int> counts;
  final ValueChanged<String> onCategory;
  final String? selected;
  final bool showAll;
  final VoidCallback? onAll;
  final double horizontalPadding;
  final double height;

  @override
  Widget build(BuildContext context) {
    if (categories.isEmpty) return const SizedBox.shrink();
    final items = <_CatItem>[
      if (showAll)
        _CatItem(
          label: 'All',
          count: counts.values.fold<int>(0, (a, b) => a + b),
          icon: Icons.apps_rounded,
          selected: selected == null || selected!.isEmpty,
          onTap: onAll ?? () {},
        ),
      ...categories.map((c) {
        return _CatItem(
          label: c,
          count: counts[c] ?? 0,
          icon: iconForToolCategory(c) ?? Icons.widgets_outlined,
          selected: selected == c,
          onTap: () => onCategory(c),
        );
      }),
    ];

    return SizedBox(
      height: height,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
        itemCount: items.length,
        separatorBuilder: (_, __) => const SizedBox(width: 10),
        itemBuilder: (_, i) => _CategoryCard(item: items[i]),
      ),
    );
  }
}

class _CatItem {
  _CatItem({
    required this.label,
    required this.count,
    required this.icon,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final int count;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;
}

class _CategoryCard extends StatelessWidget {
  const _CategoryCard({required this.item});

  final _CatItem item;

  @override
  Widget build(BuildContext context) {
    final sel = item.selected;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: item.onTap,
        borderRadius: BorderRadius.circular(16),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          width: 148,
          padding: const EdgeInsets.fromLTRB(12, 10, 10, 10),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            gradient: sel
                ? LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      AppColors.primary.withValues(alpha: 0.22),
                      AppColors.accent.withValues(alpha: 0.08),
                    ],
                  )
                : null,
            color: sel ? null : AppColors.muted.withValues(alpha: 0.88),
            border: Border.all(
              color: sel ? AppColors.primary.withValues(alpha: 0.65) : AppColors.border,
              width: sel ? 1.5 : 1,
            ),
          ),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  gradient: LinearGradient(
                    colors: sel
                        ? [AppColors.primary, AppColors.aurora3]
                        : [
                            AppColors.mutedFg.withValues(alpha: 0.35),
                            AppColors.mutedFg.withValues(alpha: 0.15),
                          ],
                  ),
                ),
                child: Icon(item.icon, color: Colors.white, size: 20),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      item.label,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      item.count > 0 ? '${item.count} tools' : 'Explore',
                      style: const TextStyle(
                        color: AppColors.mutedFg,
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ),
              Icon(
                Icons.arrow_forward_ios,
                size: 12,
                color: sel ? AppColors.primary : AppColors.mutedFg,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
