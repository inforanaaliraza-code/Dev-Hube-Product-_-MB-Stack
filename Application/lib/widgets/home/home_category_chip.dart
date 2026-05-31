import 'package:flutter/material.dart';
import '../../core/colors.dart';

class HomeCategoryChip extends StatelessWidget {
  const HomeCategoryChip({
    super.key,
    required this.label,
    required this.count,
    required this.onTap,
  });

  final String label;
  final int count;
  final VoidCallback onTap;

  IconData _iconFor(String c) {
    final lower = c.toLowerCase();
    if (lower.contains('ai')) return Icons.auto_awesome;
    if (lower.contains('format')) return Icons.text_format;
    if (lower.contains('generat')) return Icons.build_circle_outlined;
    if (lower.contains('secur')) return Icons.shield_outlined;
    if (lower.contains('pdf') || lower.contains('file')) return Icons.picture_as_pdf_outlined;
    if (lower.contains('image')) return Icons.image_outlined;
    if (lower.contains('network') || lower.contains('api')) return Icons.hub_outlined;
    return Icons.widgets_outlined;
  }

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(24),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: AppColors.muted.withValues(alpha: 0.9),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: AppColors.border),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(_iconFor(label), size: 18, color: AppColors.primary),
              const SizedBox(width: 10),
              Text(
                label,
                style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
              ),
              const SizedBox(width: 8),
              Text(
                '$count tools',
                style: const TextStyle(color: AppColors.mutedFg, fontSize: 12),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
