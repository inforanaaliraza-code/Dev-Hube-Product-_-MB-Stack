import 'package:flutter/material.dart';

class AppColors {
  static const background = Color(0xFF0A0A0F);
  static const foreground = Color(0xFFF4F4F5);
  static const card = Color(0x0AFFFFFF);
  static const muted = Color(0xFF18181F);
  static const mutedFg = Color(0xFFA1A1AA);
  static const primary = Color(0xFFA855F7);
  static const accent = Color(0xFF2DD4BF);
  static const aurora1 = Color(0xFF7C3AED);
  static const aurora2 = Color(0xFF2DD4BF);
  static const aurora3 = Color(0xFFEC4899);
  static const border = Color(0x1AFFFFFF);
  static const destructive = Color(0xFFEF4444);

  static const gradientBtn = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF8B5CF6), Color(0xFFC026D3), Color(0xFFEC4899)],
  );

  static const gradientText = LinearGradient(
    colors: [accent, Color(0xFF38BDF8), primary, aurora3],
  );
}
