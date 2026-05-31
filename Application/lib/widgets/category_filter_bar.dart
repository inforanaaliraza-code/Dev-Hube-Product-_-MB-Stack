import 'package:flutter/material.dart';
import '../core/category_icons.dart';
import 'tools/tools_filter_chip.dart';

class CategoryFilterBar extends StatelessWidget {
  const CategoryFilterBar({
    super.key,
    required this.categories,
    required this.selected,
    required this.onAll,
    required this.onCategory,
    this.horizontalPadding = 16,
  });

  final List<String> categories;
  final String selected;
  final VoidCallback onAll;
  final ValueChanged<String> onCategory;
  final double horizontalPadding;

  @override
  Widget build(BuildContext context) {
    if (categories.isEmpty) return const SizedBox.shrink();
    return SizedBox(
      height: 46,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: EdgeInsets.only(left: horizontalPadding, right: horizontalPadding + 8),
        children: [
          ToolsFilterChip(
            label: 'All',
            icon: Icons.grid_view_rounded,
            selected: selected.isEmpty,
            gradientWhenSelected: true,
            onTap: onAll,
          ),
          for (final c in categories)
            Padding(
              padding: const EdgeInsets.only(left: 8),
              child: ToolsFilterChip(
                label: c,
                icon: iconForToolCategory(c),
                selected: selected == c,
                onTap: () => onCategory(c),
              ),
            ),
        ],
      ),
    );
  }
}
