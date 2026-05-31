import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import '../../../../core/responsive.dart';
import '../../../../data/models/tool_model.dart';
import '../../../../data/tool_spec.dart';
import '../../../../widgets/glass_card.dart';
import '../../../../widgets/gradient_button.dart';
import '../../../../widgets/inline_error_banner.dart';
import '../../../../widgets/tool_page_header.dart';
import '../../tool_controller.dart';

class DualInputToolBody extends GetView<ToolController> {
  const DualInputToolBody({super.key, required this.tool});

  final ToolModel tool;

  @override
  Widget build(BuildContext context) {
    final kind = controller.kind;
    final hint2 = ToolSpec.input2Hint(kind, controller.slug.value);
    final urlHint = ToolSpec.fieldUrlHint(kind);
    return ListView(
      padding: AppLayout.toolScreenPadding(context),
      children: [
        ToolPageHeader(tool: tool, showName: false),
        const SizedBox(height: 16),
        TextField(
          onChanged: (v) => controller.input.value = v,
          maxLines: 8,
          decoration: InputDecoration(hintText: ToolSpec.inputHint(kind, controller.slug.value)),
        ),
        if (hint2 != null) ...[
          const SizedBox(height: 12),
          TextField(
            onChanged: (v) => controller.input2.value = v,
            maxLines: 8,
            decoration: InputDecoration(hintText: hint2),
          ),
        ],
        if (urlHint != null) ...[
          const SizedBox(height: 12),
          TextField(
            onChanged: (v) => controller.fieldUrl.value = v,
            decoration: InputDecoration(hintText: urlHint),
          ),
        ],
        const SizedBox(height: 16),
        Obx(
          () => GradientButton(
            expand: true,
            label: ToolSpec.runLabel(kind),
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
                          Get.snackbar('Copied', 'Output copied');
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  SelectableText(
                    controller.output.value,
                    style: const TextStyle(fontFamily: 'monospace', fontSize: 13, height: 1.45),
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
