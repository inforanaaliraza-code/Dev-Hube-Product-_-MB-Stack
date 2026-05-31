import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../core/app_error.dart';
import '../../core/colors.dart';
import '../../data/models/tool_model.dart';
import '../../data/tool_config.dart';
import '../../widgets/app_error_state.dart';
import '../../widgets/responsive_body.dart';
import 'temp_mail_controller.dart';
import 'tool_controller.dart';
import 'tool_body_resolver.dart';

class ToolView extends GetView<ToolController> {
  const ToolView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () {
            if (Get.isRegistered<TempMailController>()) {
              Get.delete<TempMailController>();
            }
            if (Get.isRegistered<ToolController>()) {
              Get.delete<ToolController>();
            }
            Get.back();
          },
        ),
        title: Obx(() => Text(controller.tool.value?.name ?? 'Tool')),
      ),
      body: Obx(() {
        if (controller.loading.value && controller.tool.value == null) {
          return const Center(
            child: CircularProgressIndicator(color: AppColors.primary),
          );
        }
        final t = controller.tool.value;
        if (t == null) {
          return AppErrorState(
            message: controller.error.value.isEmpty
                ? 'Tool not found'
                : controller.error.value,
            onRetry: controller.load,
            showSettings: controller.error.value.isNotEmpty,
            kind: controller.errorScope.value.apiFailureKind,
          );
        }
        return ResponsiveBody(
          child: _ToolBody(tool: t),
        );
      }),
    );
  }
}

class _ToolBody extends StatelessWidget {
  const _ToolBody({required this.tool});

  final ToolModel tool;

  @override
  Widget build(BuildContext context) {
    return ToolBodyResolver.build(Get.find<ToolController>(), tool);
  }
}
