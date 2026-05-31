import 'package:get/get.dart';
import '../modules/tool/tool_controller.dart';

class ToolBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut(ToolController.new, fenix: true);
  }
}
