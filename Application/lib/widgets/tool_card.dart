import 'package:flutter/material.dart';
import '../core/colors.dart';
import '../data/models/tool_model.dart';
import 'glass_card.dart';
import 'tool_icon_box.dart';

class ToolCard extends StatelessWidget {
  const ToolCard({super.key, required this.tool, required this.onTap});

  final ToolModel tool;
  final VoidCallback onTap;

  Color _accent() {
    switch (tool.accent) {
      case 'cyan':
        return AppColors.accent;
      case 'fuchsia':
        return AppColors.aurora3;
      case 'amber':
        return const Color(0xFFFBBF24);
      case 'emerald':
        return const Color(0xFF34D399);
      default:
        return AppColors.primary;
    }
  }

  @override
  Widget build(BuildContext context) {
    final accent = _accent();
    return GlassCard(
      onTap: onTap,
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              ToolIconBox.fromTool(tool, size: 36),
              const Spacer(),
              if (!tool.isReady)
                _chip('Soon', AppColors.muted)
              else
                _chip(tool.category, accent.withValues(alpha: 0.2), fg: accent),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            tool.name,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14, height: 1.2),
          ),
          const Spacer(),
          Text(
            tool.tagline,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(color: AppColors.mutedFg, fontSize: 12, height: 1.25),
          ),
        ],
      ),
    );
  }

  Widget _chip(String label, Color bg, {Color fg = AppColors.mutedFg}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        label,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: TextStyle(fontSize: 10, color: fg, fontWeight: FontWeight.w500),
      ),
    );
  }
}
