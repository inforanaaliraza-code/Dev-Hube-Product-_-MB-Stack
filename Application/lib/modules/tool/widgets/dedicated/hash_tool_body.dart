import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import '../../../../core/colors.dart';
import '../../../../core/responsive.dart';
import '../../../../data/models/tool_model.dart';
import '../../../../widgets/glass_card.dart';
import '../../../../widgets/gradient_button.dart';
import '../../../../widgets/inline_error_banner.dart';
import '../../../../widgets/tool_page_header.dart';
import '../../tool_controller.dart';

class HashToolBody extends GetView<ToolController> {
  const HashToolBody({super.key, required this.tool});

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
          maxLines: 6,
          decoration: const InputDecoration(
            labelText: 'Text to hash',
            hintText: 'Enter any string…',
          ),
        ),
        const SizedBox(height: 16),
        Obx(
          () => GradientButton(
            expand: true,
            label: 'Generate hashes',
            icon: Icons.fingerprint,
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
          if (controller.hashResults.isEmpty) return const SizedBox.shrink();
          return Padding(
            padding: const EdgeInsets.only(top: 16),
            child: Column(
              children: controller.hashResults.entries.map((e) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: GlassCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: AppColors.primary.withValues(alpha: 0.12),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                e.key.toUpperCase(),
                                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700),
                              ),
                            ),
                            const Spacer(),
                            IconButton(
                              icon: const Icon(Icons.copy, size: 18),
                              onPressed: () {
                                Clipboard.setData(ClipboardData(text: e.value));
                                Get.snackbar('Copied', '${e.key} copied');
                              },
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        SelectableText(
                          e.value,
                          style: const TextStyle(fontFamily: 'monospace', fontSize: 12, height: 1.4),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
          );
        }),
      ],
    );
  }
}
