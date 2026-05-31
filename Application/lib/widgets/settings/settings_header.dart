import 'package:flutter/material.dart';
import '../../core/colors.dart';
import '../app_logo.dart';

class SettingsHeader extends StatelessWidget {
  const SettingsHeader({
    super.key,
    required this.onThemeToggle,
    required this.onNotify,
  });

  final VoidCallback onThemeToggle;
  final VoidCallback onNotify;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 4, 4),
      child: Row(
        children: [
          const AppLogo(height: 32),
          const SizedBox(width: 10),
          const Text(
            'DevHub',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w700,
              letterSpacing: -0.3,
            ),
          ),
          const Spacer(),
          IconButton(
            onPressed: onThemeToggle,
            icon: const Icon(Icons.dark_mode_outlined, size: 24),
          ),
          Stack(
            clipBehavior: Clip.none,
            children: [
              IconButton(
                onPressed: onNotify,
                icon: const Icon(Icons.notifications_outlined, size: 24),
              ),
              Positioned(
                right: 12,
                top: 12,
                child: Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: AppColors.aurora3,
                    shape: BoxShape.circle,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
