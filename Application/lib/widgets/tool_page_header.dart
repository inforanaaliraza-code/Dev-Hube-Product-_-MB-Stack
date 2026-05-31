import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../core/colors.dart';
import '../data/models/tool_model.dart';
import 'tool_icon_box.dart';

class ToolPageHeader extends StatelessWidget {
  const ToolPageHeader({super.key, required this.tool, this.showName = true});

  final ToolModel tool;
  final bool showName;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ToolIconBox.fromTool(tool, size: 48),
        const SizedBox(height: 12),
        Text(
          '${tool.category} · ${tool.name}',
          style: const TextStyle(fontSize: 12, color: AppColors.mutedFg),
        ),
        if (showName) ...[
          const SizedBox(height: 6),
          Text(
            tool.name,
            style: GoogleFonts.spaceGrotesk(
              fontSize: 22,
              fontWeight: FontWeight.w600,
              height: 1.15,
            ),
          ),
        ],
        const SizedBox(height: 6),
        Text(
          tool.tagline,
          style: const TextStyle(color: AppColors.mutedFg, fontSize: 14, height: 1.35),
        ),
      ],
    );
  }
}
