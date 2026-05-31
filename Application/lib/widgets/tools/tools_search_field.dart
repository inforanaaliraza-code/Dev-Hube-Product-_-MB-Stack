import 'package:flutter/material.dart';
import '../../core/colors.dart';

class ToolsSearchField extends StatelessWidget {
  const ToolsSearchField({
    super.key,
    required this.hint,
    required this.onChanged,
    this.focusNode,
    this.controller,
  });

  final String hint;
  final ValueChanged<String> onChanged;
  final FocusNode? focusNode;
  final TextEditingController? controller;

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      focusNode: focusNode,
      onChanged: onChanged,
      style: const TextStyle(fontSize: 15),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: AppColors.mutedFg, fontSize: 14),
        prefixIcon: const Icon(Icons.search, color: AppColors.mutedFg),
        suffixIcon: Container(
          margin: const EdgeInsets.all(10),
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: AppColors.muted,
            borderRadius: BorderRadius.circular(6),
            border: Border.all(color: AppColors.border),
          ),
          child: const Text(
            '/',
            style: TextStyle(
              color: AppColors.mutedFg,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        filled: true,
        fillColor: AppColors.muted.withValues(alpha: 0.9),
        contentPadding: const EdgeInsets.symmetric(vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: AppColors.primary.withValues(alpha: 0.6)),
        ),
      ),
    );
  }
}
