import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import '../../../../core/html_util.dart';
import '../../../../core/responsive.dart';
import '../../../../data/models/tool_model.dart';
import '../../../../widgets/glass_card.dart';
import '../../../../widgets/gradient_button.dart';
import '../../../../widgets/inline_error_banner.dart';
import '../../../../widgets/tool_page_header.dart';
import '../../tool_controller.dart';

class MetaTagsToolBody extends GetView<ToolController> {
  const MetaTagsToolBody({super.key, required this.tool});

  final ToolModel tool;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: AppLayout.toolScreenPadding(context),
      children: [
        ToolPageHeader(tool: tool, showName: false),
        const SizedBox(height: 16),
        TextField(
          onChanged: (v) => controller.input.value = v,
          decoration: const InputDecoration(labelText: 'Page title', hintText: 'Dev Hube'),
        ),
        const SizedBox(height: 12),
        TextField(
          onChanged: (v) => controller.input2.value = v,
          maxLines: 3,
          decoration: const InputDecoration(labelText: 'Meta description', hintText: 'Free developer tools'),
        ),
        const SizedBox(height: 12),
        TextField(
          onChanged: (v) => controller.fieldUrl.value = v,
          decoration: const InputDecoration(labelText: 'Canonical URL', hintText: 'https://yoursite.com'),
        ),
        const SizedBox(height: 16),
        Obx(
          () => GradientButton(
            expand: true,
            label: 'Generate meta tags',
            icon: Icons.code,
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
                      const Text('HTML meta tags', style: TextStyle(fontWeight: FontWeight.w600)),
                      const Spacer(),
                      IconButton(
                        icon: const Icon(Icons.copy, size: 20),
                        onPressed: () {
                          Clipboard.setData(ClipboardData(text: controller.output.value));
                          Get.snackbar('Copied', 'Meta tags copied');
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  SelectableText(
                    controller.output.value,
                    style: const TextStyle(fontFamily: 'monospace', fontSize: 12, height: 1.45),
                  ),
                  if (controller.previewHtml.value.isNotEmpty) ...[
                    const SizedBox(height: 16),
                    const Text('Preview', style: TextStyle(fontWeight: FontWeight.w600)),
                    const SizedBox(height: 8),
                    SelectableText(
                      HtmlUtil.toPlainText(controller.previewHtml.value),
                      style: const TextStyle(fontSize: 13, height: 1.5),
                    ),
                  ],
                ],
              ),
            ),
          );
        }),
      ],
    );
  }
}
