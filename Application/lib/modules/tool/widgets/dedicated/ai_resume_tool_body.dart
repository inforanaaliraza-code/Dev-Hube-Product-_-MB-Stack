import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import '../../../../core/responsive.dart';
import '../../../../data/models/tool_model.dart';
import '../../../../widgets/glass_card.dart';
import '../../../../widgets/gradient_button.dart';
import '../../../../widgets/inline_error_banner.dart';
import '../../../../core/app_error.dart';
import '../../../../widgets/tool_page_header.dart';
import '../../tool_controller.dart';

class AiResumeToolBody extends GetView<ToolController> {
  const AiResumeToolBody({super.key, required this.tool});

  final ToolModel tool;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: AppLayout.toolScreenPadding(context),
      children: [
        ToolPageHeader(tool: tool, showName: false),
        Obx(() {
          final msg = controller.workerBannerMessage;
          if (msg == null) return const SizedBox.shrink();
          return Padding(
            padding: const EdgeInsets.only(top: 12),
            child: InlineErrorBanner(
              title: 'Service not ready',
              message: msg,
              scope: controller.backendReachable.value ? AppErrorScope.worker : AppErrorScope.network,
              showSettings: true,
              onRetry: controller.load,
              compact: true,
            ),
          );
        }),
        const SizedBox(height: 16),
        _field('Full name', (v) => controller.input.value = v),
        const SizedBox(height: 12),
        _field('Job title', (v) => controller.input2.value = v),
        const SizedBox(height: 12),
        _field('Summary', (v) => controller.resumeSummary.value = v, lines: 2),
        const SizedBox(height: 12),
        _field('Experience', (v) => controller.resumeExperience.value = v, lines: 4),
        const SizedBox(height: 12),
        _field('Skills', (v) => controller.resumeSkills.value = v, lines: 2),
        const SizedBox(height: 12),
        _field('Education', (v) => controller.resumeEducation.value = v, lines: 2),
        const SizedBox(height: 16),
        Obx(
          () => GradientButton(
            expand: true,
            label: 'Build resume',
            icon: Icons.description_outlined,
            loading: controller.running.value,
            onPressed: controller.run,
          ),
        ),
        Obx(() {
          if (controller.error.value.isNotEmpty) {
            return Padding(
              padding: const EdgeInsets.only(top: 12),
              child: InlineErrorBanner(message: controller.error.value, scope: controller.errorScope.value, compact: true),
            );
          }
          if (controller.output.value.isEmpty) return const SizedBox.shrink();
          return Padding(
            padding: const EdgeInsets.only(top: 16),
            child: GlassCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Text('Resume preview', style: TextStyle(fontWeight: FontWeight.w600)),
                      const Spacer(),
                      IconButton(
                        icon: const Icon(Icons.copy, size: 20),
                        onPressed: () {
                          Clipboard.setData(ClipboardData(text: controller.output.value));
                          Get.snackbar('Copied', 'Resume markdown copied');
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  SelectableText(
                    controller.output.value,
                    style: const TextStyle(fontSize: 13, height: 1.5),
                  ),
                ],
              ),
            ),
          );
        }),
      ],
    );
  }

  Widget _field(String label, ValueChanged<String> onChanged, {int lines = 1}) {
    return TextField(
      onChanged: onChanged,
      maxLines: lines,
      decoration: InputDecoration(labelText: label),
    );
  }
}
