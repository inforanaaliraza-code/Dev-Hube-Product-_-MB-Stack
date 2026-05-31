import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'constants.dart';
import 'notifications_controller.dart';
import 'routes.dart';

class OfflineController extends GetxController {
  final isOffline = false.obs;
  final lastSyncedAt = Rxn<DateTime>();

  bool get _shouldRecordNotifications {
    if (Get.currentRoute == AppRoutes.onboarding) return false;
    return GetStorage().read(AppConstants.onboardingDoneKey) == true;
  }

  void setOffline(
    bool value, {
    DateTime? syncedAt,
    bool bundledCatalog = false,
  }) {
    final wasOffline = isOffline.value;
    isOffline.value = value;
    if (syncedAt != null) lastSyncedAt.value = syncedAt;
    if (value &&
        !wasOffline &&
        Get.isRegistered<NotificationsController>() &&
        _shouldRecordNotifications) {
      Get.find<NotificationsController>().notifyOffline(
        syncedAt: syncedAt ?? lastSyncedAt.value,
        bundledCatalog: bundledCatalog,
      );
    }
  }

  void markOnline() => isOffline.value = false;
}
