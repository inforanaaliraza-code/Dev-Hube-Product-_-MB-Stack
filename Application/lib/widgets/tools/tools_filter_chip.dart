import 'package:flutter/material.dart';
import '../../core/colors.dart';

class ToolsFilterChip extends StatelessWidget {
  const ToolsFilterChip({
    super.key,
    required this.label,
    required this.selected,
    required this.onTap,
    this.icon,
    this.gradientWhenSelected = false,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;
  final IconData? icon;
  final bool gradientWhenSelected;

  @override
  Widget build(BuildContext context) {
    final useGradient = selected && gradientWhenSelected;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(24),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(24),
            gradient: useGradient ? AppColors.gradientBtn : null,
            color: useGradient
                ? null
                : selected
                    ? AppColors.primary.withValues(alpha: 0.2)
                    : AppColors.muted.withValues(alpha: 0.85),
            border: Border.all(
              color: useGradient
                  ? Colors.transparent
                  : selected
                      ? AppColors.primary.withValues(alpha: 0.5)
                      : AppColors.border,
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (icon != null) ...[
                Icon(
                  icon,
                  size: 16,
                  color: useGradient ? Colors.white : AppColors.mutedFg,
                ),
                const SizedBox(width: 6),
              ],
              Text(
                label,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: useGradient ? Colors.white : AppColors.foreground,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
