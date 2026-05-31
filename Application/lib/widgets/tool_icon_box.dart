import 'package:flutter/material.dart';
import '../core/colors.dart';
import '../core/tool_icons.dart';
import '../data/models/tool_model.dart';

Color accentColorFor(String accent) {
  switch (accent) {
    case 'cyan':
      return AppColors.accent;
    case 'fuchsia':
      return AppColors.aurora3;
    case 'amber':
      return const Color(0xFFFBBF24);
    case 'emerald':
      return const Color(0xFF34D399);
    case 'rose':
      return const Color(0xFFFB7185);
    default:
      return AppColors.primary;
  }
}

class ToolIconBox extends StatelessWidget {
  const ToolIconBox({
    super.key,
    required this.iconName,
    required this.accent,
    this.size = 40,
    this.iconSize,
  });

  final String iconName;
  final String accent;
  final double size;
  final double? iconSize;

  factory ToolIconBox.fromTool(ToolModel tool, {double size = 40}) {
    return ToolIconBox(
      iconName: tool.icon,
      accent: tool.accent,
      size: size,
    );
  }

  @override
  Widget build(BuildContext context) {
    final color = accentColorFor(accent);
    final iSize = iconSize ?? size * 0.48;
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(size * 0.28),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [color, color.withValues(alpha: 0.5)],
        ),
      ),
      child: Icon(iconForToolName(iconName), color: Colors.white, size: iSize),
    );
  }
}
