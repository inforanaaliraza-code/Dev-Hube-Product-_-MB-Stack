import 'package:get/get.dart';
import '../blog/blog_controller.dart';
import '../home/home_controller.dart';
import '../tools/tools_controller.dart';

class ShellController extends GetxController {
  final tabIndex = 0.obs;
  final _loadedTabs = <int>{};

  @override
  void onInit() {
    super.onInit();
    _ensureTabData(0);
  }

  void setTab(int i) {
    tabIndex.value = i;
    _ensureTabData(i);
  }

  void _ensureTabData(int i) {
    if (_loadedTabs.contains(i)) return;
    _loadedTabs.add(i);
    switch (i) {
      case 0:
        if (Get.isRegistered<HomeController>()) {
          Get.find<HomeController>().ensureLoaded();
        }
        break;
      case 1:
        if (Get.isRegistered<ToolsController>()) {
          Get.find<ToolsController>().ensureLoaded();
        }
        break;
      case 2:
        if (Get.isRegistered<BlogController>()) {
          Get.find<BlogController>().ensureLoaded();
        }
        break;
    }
  }

  void refreshAllTabs({bool force = true}) {
    _loadedTabs.clear();
    _ensureTabData(tabIndex.value);
    if (Get.isRegistered<HomeController>()) {
      Get.find<HomeController>().ensureLoaded(force: force);
    }
    if (Get.isRegistered<ToolsController>()) {
      Get.find<ToolsController>().ensureLoaded(force: force);
    }
    if (Get.isRegistered<BlogController>()) {
      Get.find<BlogController>().ensureLoaded(force: force);
    }
  }
}
