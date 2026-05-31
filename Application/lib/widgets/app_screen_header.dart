import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../core/colors.dart';
import '../core/notifications_controller.dart';
import 'app_logo.dart';

class AppScreenHeader extends StatelessWidget {
  const AppScreenHeader({
    super.key,
    required this.onSearch,
    required this.onNotify,
    this.leading,
  });

  final VoidCallback onSearch;
  final VoidCallback onNotify;
  final Widget? leading;

  static const double _sideSlotWidth = 88;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(4, 4, 4, 4),
      child: Row(
        children: [
          SizedBox(
            width: _sideSlotWidth,
            child: leading != null
                ? Align(alignment: Alignment.centerLeft, child: leading!)
                : null,
          ),
          const Expanded(
            child: Center(
              child: AppLogo(height: 32),
            ),
          ),
          SizedBox(
            width: _sideSlotWidth,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                IconButton(
                  onPressed: onSearch,
                  icon: const Icon(Icons.search, size: 22),
                  visualDensity: VisualDensity.compact,
                  padding: const EdgeInsets.all(8),
                  constraints: const BoxConstraints(minWidth: 40, minHeight: 40),
                ),
                Obx(() {
                  final unread = Get.isRegistered<NotificationsController>()
                      ? Get.find<NotificationsController>().unreadCount
                      : 0;
                  return Stack(
                    clipBehavior: Clip.none,
                    children: [
                      IconButton(
                        onPressed: onNotify,
                        icon: const Icon(Icons.notifications_outlined, size: 22),
                        visualDensity: VisualDensity.compact,
                        padding: const EdgeInsets.all(8),
                        constraints: const BoxConstraints(minWidth: 40, minHeight: 40),
                      ),
                      if (unread > 0)
                        Positioned(
                          right: 8,
                          top: 8,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                            constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                            decoration: const BoxDecoration(
                              color: AppColors.primary,
                              shape: BoxShape.circle,
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              unread > 9 ? '9+' : '$unread',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 9,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                        ),
                    ],
                  );
                }),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
