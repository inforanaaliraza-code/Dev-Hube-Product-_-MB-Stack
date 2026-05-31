import 'package:get/get.dart';
import '../modules/blog/blog_controller.dart';
import '../modules/home/home_controller.dart';
import '../modules/settings/settings_controller.dart';
import '../modules/tools/tools_controller.dart';

class ShellBinding extends Bindings {
  @override
  void dependencies() {
    if (!Get.isRegistered<HomeController>()) {
      Get.put(HomeController(), permanent: true);
    }
    if (!Get.isRegistered<ToolsController>()) {
      Get.put(ToolsController(), permanent: true);
    }
    if (!Get.isRegistered<BlogController>()) {
      Get.put(BlogController(), permanent: true);
    }
    if (!Get.isRegistered<SettingsController>()) {
      Get.put(SettingsController(), permanent: true);
    }
  }
}
