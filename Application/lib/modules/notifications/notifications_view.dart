import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../core/colors.dart';
import '../../core/notifications_controller.dart';
import '../../data/models/app_notification.dart';
import '../../widgets/aurora_background.dart';

class NotificationsView extends GetView<NotificationsController> {
  const NotificationsView({super.key});

  @override
  Widget build(BuildContext context) {
    return AuroraBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          title: Text(
            'Notifications',
            style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.w600),
          ),
          actions: [
            Obx(() {
              if (controller.unreadCount == 0) return const SizedBox.shrink();
              return TextButton(
                onPressed: controller.markAllRead,
                child: const Text('Mark all read'),
              );
            }),
          ],
        ),
        body: Obx(() {
          if (controller.items.isEmpty) {
            return const Center(
              child: Padding(
                padding: EdgeInsets.all(32),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.notifications_none_outlined, size: 56, color: AppColors.mutedFg),
                    SizedBox(height: 16),
                    Text(
                      'No notifications yet',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                    ),
                    SizedBox(height: 8),
                    Text(
                      'Alerts about offline mode and sync will appear here.',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: AppColors.mutedFg, height: 1.4),
                    ),
                  ],
                ),
              ),
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
            itemCount: controller.items.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (context, i) {
              final n = controller.items[i];
              return _NotificationTile(
                notification: n,
                onTap: () => controller.markRead(n.id),
              );
            },
          );
        }),
      ),
    );
  }
}

class _NotificationTile extends StatelessWidget {
  const _NotificationTile({required this.notification, required this.onTap});

  final AppNotification notification;
  final VoidCallback onTap;

  IconData get _icon => switch (notification.type) {
        'offline' => Icons.cloud_off_outlined,
        'online' => Icons.cloud_done_outlined,
        _ => Icons.info_outline,
      };

  Color get _accent => switch (notification.type) {
        'offline' => AppColors.aurora3,
        'online' => AppColors.primary,
        _ => AppColors.mutedFg,
      };

  @override
  Widget build(BuildContext context) {
    final time = DateFormat('MMM d · h:mm a').format(notification.createdAt);
    final isRead = notification.read;
    return Material(
      color: isRead ? const Color(0xFF14141C) : AppColors.muted,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        splashColor: AppColors.primary.withValues(alpha: 0.18),
        highlightColor: AppColors.primary.withValues(alpha: 0.1),
        child: Ink(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isRead
                  ? AppColors.border
                  : AppColors.primary.withValues(alpha: 0.4),
            ),
          ),
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: _accent.withValues(alpha: 0.18),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(_icon, color: _accent, size: 22),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              notification.title,
                              style: TextStyle(
                                fontWeight: FontWeight.w600,
                                fontSize: 15,
                                color: isRead
                                    ? AppColors.foreground.withValues(alpha: 0.82)
                                    : AppColors.foreground,
                              ),
                            ),
                          ),
                          if (!isRead)
                            Container(
                              width: 8,
                              height: 8,
                              decoration: const BoxDecoration(
                                color: AppColors.primary,
                                shape: BoxShape.circle,
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        notification.body,
                        style: TextStyle(
                          color: isRead
                              ? AppColors.mutedFg.withValues(alpha: 0.95)
                              : AppColors.mutedFg,
                          fontSize: 13,
                          height: 1.35,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        time,
                        style: TextStyle(
                          color: AppColors.mutedFg.withValues(alpha: 0.75),
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
