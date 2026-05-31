import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../core/app_error.dart';
import '../core/colors.dart';
import '../modules/shell/shell_controller.dart';

class InlineErrorBanner extends StatelessWidget {
  const InlineErrorBanner({
    super.key,
    required this.message,
    this.scope = AppErrorScope.unknown,
    this.title,
    this.onRetry,
    this.showSettings = false,
    this.compact = false,
  });

  final String message;
  final AppErrorScope scope;
  final String? title;
  final VoidCallback? onRetry;
  final bool showSettings;
  final bool compact;

  IconData get _icon => switch (scope) {
        AppErrorScope.network || AppErrorScope.offline => Icons.wifi_off_rounded,
        AppErrorScope.timeout => Icons.schedule,
        AppErrorScope.server => Icons.cloud_off_outlined,
        AppErrorScope.worker => Icons.precision_manufacturing_outlined,
        AppErrorScope.validation => Icons.info_outline,
        AppErrorScope.client => Icons.warning_amber_rounded,
        _ => Icons.error_outline_rounded,
      };

  Color get _accent => switch (scope) {
        AppErrorScope.validation => AppColors.aurora3,
        AppErrorScope.worker => AppColors.primary,
        _ => AppColors.destructive,
      };

  @override
  Widget build(BuildContext context) {
    final pad = compact ? 10.0 : 12.0;
    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(pad),
      decoration: BoxDecoration(
        color: _accent.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: _accent.withValues(alpha: 0.35)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(_icon, size: compact ? 18 : 20, color: _accent),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (title != null && title!.isNotEmpty) ...[
                      Text(
                        title!,
                        style: TextStyle(
                          color: _accent,
                          fontWeight: FontWeight.w600,
                          fontSize: compact ? 12 : 13,
                        ),
                      ),
                      const SizedBox(height: 4),
                    ],
                    Text(
                      message,
                      style: TextStyle(
                        color: AppColors.foreground.withValues(alpha: 0.92),
                        fontSize: compact ? 11 : 12,
                        height: 1.45,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          if (onRetry != null || showSettings) ...[
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 6,
              children: [
                if (onRetry != null)
                  TextButton.icon(
                    onPressed: onRetry,
                    icon: const Icon(Icons.refresh, size: 16),
                    label: const Text('Retry'),
                    style: TextButton.styleFrom(
                      foregroundColor: _accent,
                      padding: EdgeInsets.zero,
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                  ),
                if (showSettings)
                  TextButton.icon(
                    onPressed: () => Get.find<ShellController>().setTab(3),
                    icon: const Icon(Icons.settings_outlined, size: 16),
                    label: const Text('Settings'),
                    style: TextButton.styleFrom(
                      foregroundColor: AppColors.mutedFg,
                      padding: EdgeInsets.zero,
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                  ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
