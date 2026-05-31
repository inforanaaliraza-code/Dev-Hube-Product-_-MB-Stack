import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import '../../../../core/app_error.dart';
import '../../../../core/responsive.dart';
import '../../../../data/models/tool_model.dart';
import '../../../../data/tool_spec.dart';
import '../../../../widgets/glass_card.dart';
import '../../../../widgets/gradient_button.dart';
import '../../../../widgets/inline_error_banner.dart';
import '../../../../widgets/tool_page_header.dart';
import '../../tool_controller.dart';

class AiTextToolBody extends GetView<ToolController> {
  const AiTextToolBody({super.key, required this.tool});

  final ToolModel tool;

  @override
  Widget build(BuildContext context) {
    final kind = controller.kind;
    final modes = ToolSpec.modes(kind, controller.slug.value);
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
        if (modes.isNotEmpty) ...[
          Obx(
            () => Wrap(
              spacing: 8,
              runSpacing: 8,
              children: modes
                  .map(
                    (m) => ChoiceChip(
                      label: Text(m.label),
                      selected: controller.mode.value == m.value,
                      onSelected: (_) => controller.mode.value = m.value,
                    ),
                  )
                  .toList(),
            ),
          ),
          const SizedBox(height: 12),
        ],
        TextField(
          onChanged: (v) => controller.input.value = v,
          maxLines: 12,
          decoration: InputDecoration(
            labelText: ToolSpec.inputHint(kind, controller.slug.value),
            alignLabelWithHint: true,
          ),
        ),
        const SizedBox(height: 16),
        Obx(
          () => GradientButton(
            expand: true,
            label: ToolSpec.runLabel(kind),
            icon: Icons.auto_awesome,
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
                      const Text('Output', style: TextStyle(fontWeight: FontWeight.w600)),
                      const Spacer(),
                      IconButton(
                        icon: const Icon(Icons.copy, size: 20),
                        onPressed: () {
                          Clipboard.setData(ClipboardData(text: controller.output.value));
                          Get.snackbar('Copied', 'Copied to clipboard');
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  SelectableText(
                    controller.output.value,
                    style: const TextStyle(fontSize: 14, height: 1.5),
                  ),
                ],
              ),
            ),
          );
        }),
      ],
    );
  }
}
