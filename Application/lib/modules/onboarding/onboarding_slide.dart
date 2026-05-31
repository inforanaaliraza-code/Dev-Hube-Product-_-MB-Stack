import 'package:flutter/material.dart';

class OnboardingSlide {
  const OnboardingSlide({
    required this.title,
    required this.subtitle,
    required this.body,
    required this.icon,
    required this.accent,
    required this.secondaryAccent,
  });

  final String title;
  final String subtitle;
  final String body;
  final IconData icon;
  final Color accent;
  final Color secondaryAccent;
}
