import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import '../core/colors.dart';
import '../core/offline_controller.dart';
import '../modules/shell/shell_controller.dart';

class OfflineBanner extends StatelessWidget {
  const OfflineBanner({super.key});

  @override
  Widget build(BuildContext context) {
    final offline = Get.find<OfflineController>();
    return Obx(() {
      if (!offline.isOffline.value) return const SizedBox.shrink();
      final synced = offline.lastSyncedAt.value;
      final syncedLabel = synced != null
          ? 'Saved ${DateFormat('MMM d, h:mm a').format(synced)}'
          : 'Built-in catalog · connect once to refresh from server';
      return SafeArea(
        bottom: false,
        child: Material(
          color: AppColors.aurora3.withValues(alpha: 0.18),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(12, 8, 4, 8),
            child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.cloud_off_outlined, size: 20, color: AppColors.aurora3),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Offline mode',
                      style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                    ),
                    Text(
                      '$syncedLabel · Local tools work; server tools need connection.',
                      style: const TextStyle(color: AppColors.mutedFg, fontSize: 11, height: 1.35),
                    ),
                  ],
                ),
              ),
              TextButton(
                onPressed: () {
                  if (Get.isRegistered<ShellController>()) {
                    Get.find<ShellController>().refreshAllTabs(force: true);
                  }
                },
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
        ),
      );
    });
  }
}
