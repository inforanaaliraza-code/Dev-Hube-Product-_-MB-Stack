import 'package:flutter/material.dart';
import '../../core/colors.dart';
import '../app_logo.dart';

class ToolsHeader extends StatelessWidget {
  const ToolsHeader({
    super.key,
    this.onMenu,
    required this.onSearch,
    required this.onNotify,
  });

  final VoidCallback? onMenu;
  final VoidCallback onSearch;
  final VoidCallback onNotify;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(4, 8, 4, 4),
      child: Row(
        children: [
          IconButton(
            onPressed: onMenu,
            icon: const Icon(Icons.menu, size: 26),
          ),
          Expanded(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              mainAxisSize: MainAxisSize.min,
              children: [
                const AppLogo(height: 30),
                const SizedBox(width: 8),
                const Text(
                  'DevHub',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    letterSpacing: -0.3,
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: onSearch,
            icon: const Icon(Icons.search, size: 24),
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
                    color: AppColors.primary,
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
