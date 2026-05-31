import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/colors.dart';

class HomeStatsStrip extends StatelessWidget {
  const HomeStatsStrip({
    super.key,
    required this.toolCount,
    required this.categoryCount,
  });

  final int toolCount;
  final int categoryCount;

  @override
  Widget build(BuildContext context) {
    final items = [
      (Icons.grid_view_rounded, '${toolCount > 0 ? toolCount : 60}+', 'Utilities'),
      (Icons.folder_outlined, '$categoryCount+', 'Categories'),
      (Icons.shield_outlined, '100%', 'Client-side'),
      (Icons.bolt, '0ms', 'Round-trips'),
    ];
    final narrow = MediaQuery.sizeOf(context).width < 360;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 10),
      decoration: BoxDecoration(
        color: AppColors.muted.withValues(alpha: 0.85),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: narrow
          ? GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              mainAxisSpacing: 12,
              crossAxisSpacing: 8,
              childAspectRatio: 2.4,
              children: items.map((e) => _StatCell(icon: e.$1, value: e.$2, label: e.$3)).toList(),
            )
          : Row(
              children: [
                for (var i = 0; i < items.length; i++) ...[
                  if (i > 0)
                    Container(
                      width: 1,
                      height: 36,
                      color: AppColors.border,
                    ),
                  Expanded(child: _StatCell(icon: items[i].$1, value: items[i].$2, label: items[i].$3)),
                ],
              ],
            ),
    );
  }
}

class _StatCell extends StatelessWidget {
  const _StatCell({required this.icon, required this.value, required this.label});

  final IconData icon;
  final String value;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 15, color: AppColors.mutedFg),
        const SizedBox(height: 6),
        ShaderMask(
          shaderCallback: (b) => AppColors.gradientText.createShader(b),
          child: Text(
            value,
            style: GoogleFonts.spaceGrotesk(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: Colors.white,
            ),
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          textAlign: TextAlign.center,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(
            fontSize: 9,
            letterSpacing: 0.4,
            color: AppColors.mutedFg,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}
