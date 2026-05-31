import 'package:flutter/material.dart';

IconData? iconForToolCategory(String category) {
  final lower = category.toLowerCase();
  if (lower.contains('ai')) return Icons.auto_awesome;
  if (lower.contains('format')) return Icons.text_format;
  if (lower.contains('encod')) return Icons.lock_outline;
  if (lower.contains('generat')) return Icons.build_circle_outlined;
  if (lower.contains('secur')) return Icons.shield_outlined;
  if (lower.contains('pdf') || lower.contains('file')) return Icons.picture_as_pdf_outlined;
  if (lower.contains('image')) return Icons.image_outlined;
  if (lower.contains('network') || lower.contains('api')) return Icons.hub_outlined;
  return Icons.widgets_outlined;
}
