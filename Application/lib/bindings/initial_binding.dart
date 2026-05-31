import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import '../core/app_preferences.dart';
import '../core/notifications_controller.dart';
import '../core/offline_controller.dart';
import '../core/theme_controller.dart';
import '../data/api_client.dart';
import '../data/blog_repository.dart';
import '../data/offline_store.dart';
import '../data/services/blog_service.dart';
import '../data/services/devtools_service.dart';
import '../data/services/settings_service.dart';
import '../data/services/qr_service.dart';
import '../data/services/temp_mail_service.dart';
import '../data/services/tools_service.dart';
import '../data/tools_repository.dart';
import '../data/services/worker_tools_service.dart';
import 'shell_binding.dart';
import '../modules/shell/shell_controller.dart';

class InitialBinding extends Bindings {
  @override
  void dependencies() {
    if (!Get.isRegistered<ThemeController>()) {
      Get.put(ThemeController(), permanent: true);
    }
    if (!Get.isRegistered<AppPreferences>()) {
      Get.put(AppPreferences(), permanent: true);
    }
    if (!Get.isRegistered<OfflineController>()) {
      Get.put(OfflineController(), permanent: true);
    }
    if (!Get.isRegistered<NotificationsController>()) {
      Get.put(NotificationsController(), permanent: true);
    }
    final box = GetStorage();
    final api = ApiClient(box);
    Get.put(api, permanent: true);
    Get.put(OfflineStore(), permanent: true);
    Get.put(ToolsService(api), permanent: true);
    Get.put(
      ToolsRepository(Get.find<ToolsService>(), Get.find<OfflineStore>()),
      permanent: true,
    );
    Get.put(BlogService(api), permanent: true);
    Get.put(
      BlogRepository(Get.find<BlogService>(), Get.find<OfflineStore>()),
      permanent: true,
    );
    Get.put(
      SettingsService(api, Get.find<OfflineStore>()),
      permanent: true,
    );
    Get.put(DevtoolsService(api), permanent: true);
    Get.put(QrService(api), permanent: true);
    Get.put(WorkerToolsService(api), permanent: true);
    Get.put(TempMailService(api), permanent: true);
    ShellBinding().dependencies();
    Get.put(ShellController(), permanent: true);
  }
}
