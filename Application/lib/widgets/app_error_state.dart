import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../core/api_failure.dart';
import '../core/colors.dart';
import '../modules/shell/shell_controller.dart';

class AppErrorState extends StatelessWidget {
  const AppErrorState({
    super.key,
    required this.message,
    this.onRetry,
    this.showSettings = true,
    this.kind,
  });

  final String message;
  final VoidCallback? onRetry;
  final bool showSettings;
  final ApiFailureKind? kind;

  IconData get _icon {
    switch (kind) {
      case ApiFailureKind.timeout:
        return Icons.schedule;
      case ApiFailureKind.server:
        return Icons.cloud_off_outlined;
      case ApiFailureKind.network:
        return Icons.wifi_off_rounded;
      default:
        return Icons.error_outline_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(_icon, size: 48, color: AppColors.mutedFg),
          const SizedBox(height: 16),
          Text(
            message,
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: AppColors.foreground,
              fontSize: 14,
              height: 1.5,
            ),
          ),
          if (onRetry != null) ...[
            const SizedBox(height: 20),
            FilledButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh, size: 18),
              label: const Text('Retry'),
            ),
          ],
          if (showSettings) ...[
            const SizedBox(height: 10),
            OutlinedButton.icon(
              onPressed: () => Get.find<ShellController>().setTab(3),
              icon: const Icon(Icons.settings_outlined, size: 18),
              label: const Text('Open Settings'),
            ),
          ],
        ],
      ),
    );
  }
}
