import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import '../../../../core/responsive.dart';
import '../../../../data/models/tool_model.dart';
import '../../../../data/tool_config.dart';
import '../../../../widgets/glass_card.dart';
import '../../../../widgets/gradient_button.dart';
import '../../../../widgets/inline_error_banner.dart';
import '../../../../widgets/tool_page_header.dart';
import '../../tool_controller.dart';

class SeoToolBody extends GetView<ToolController> {
  const SeoToolBody({super.key, required this.tool});

  final ToolModel tool;

  bool get _sitemap => controller.kind == ToolKind.sitemap;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: AppLayout.toolScreenPadding(context),
      children: [
        ToolPageHeader(tool: tool, showName: false),
        const SizedBox(height: 16),
        if (_sitemap)
          TextField(
            onChanged: (v) => controller.input.value = v,
            maxLines: 10,
            decoration: const InputDecoration(
              labelText: 'URLs',
              hintText: 'https://example.com/\nhttps://example.com/about',
              alignLabelWithHint: true,
            ),
          )
        else ...[
          TextField(
            onChanged: (v) => controller.input.value = v,
            maxLines: 6,
            decoration: const InputDecoration(
              labelText: 'Disallow paths',
              hintText: '/admin\n/private',
              alignLabelWithHint: true,
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            onChanged: (v) => controller.fieldUrl.value = v,
            decoration: const InputDecoration(
              labelText: 'Sitemap URL (optional)',
              hintText: 'https://example.com/sitemap.xml',
            ),
          ),
        ],
        const SizedBox(height: 16),
        Obx(
          () => GradientButton(
            expand: true,
            label: _sitemap ? 'Generate sitemap' : 'Generate robots.txt',
            icon: Icons.map_outlined,
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
                      Text(_sitemap ? 'sitemap.xml' : 'robots.txt', style: const TextStyle(fontWeight: FontWeight.w600)),
                      const Spacer(),
                      IconButton(
                        icon: const Icon(Icons.copy, size: 20),
                        onPressed: () {
                          Clipboard.setData(ClipboardData(text: controller.output.value));
                          Get.snackbar('Copied', 'Copied');
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  SelectableText(
                    controller.output.value,
                    style: const TextStyle(fontFamily: 'monospace', fontSize: 12, height: 1.45),
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
