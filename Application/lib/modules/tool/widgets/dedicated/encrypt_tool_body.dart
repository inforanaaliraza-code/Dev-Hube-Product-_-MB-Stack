import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import '../../../../core/responsive.dart';
import '../../../../data/models/tool_model.dart';
import '../../../../widgets/glass_card.dart';
import '../../../../widgets/gradient_button.dart';
import '../../../../widgets/inline_error_banner.dart';
import '../../../../widgets/tool_page_header.dart';
import '../../tool_controller.dart';

class EncryptToolBody extends GetView<ToolController> {
  const EncryptToolBody({super.key, required this.tool});

  final ToolModel tool;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: AppLayout.toolScreenPadding(context),
      children: [
        ToolPageHeader(tool: tool, showName: false),
        const SizedBox(height: 8),
        const Text(
          'AES-GCM with PBKDF2 (same as website). Works fully on-device.',
          style: TextStyle(fontSize: 12, color: Colors.grey),
        ),
        const SizedBox(height: 16),
        Obx(
          () => Wrap(
            spacing: 8,
            children: [
              ChoiceChip(
                label: const Text('Encrypt'),
                selected: controller.mode.value == 'encrypt',
                onSelected: (_) => controller.mode.value = 'encrypt',
              ),
              ChoiceChip(
                label: const Text('Decrypt'),
                selected: controller.mode.value == 'decrypt',
                onSelected: (_) => controller.mode.value = 'decrypt',
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        TextField(
          onChanged: (v) => controller.encryptPassword.value = v,
          obscureText: true,
          decoration: const InputDecoration(labelText: 'Password'),
        ),
        const SizedBox(height: 12),
        Obx(
          () => TextField(
            onChanged: (v) => controller.input.value = v,
            maxLines: 6,
            decoration: InputDecoration(
              labelText: controller.mode.value == 'encrypt' ? 'Plain text' : 'Base64 payload',
            ),
          ),
        ),
        const SizedBox(height: 16),
        Obx(
          () => GradientButton(
            expand: true,
            label: controller.mode.value == 'encrypt' ? 'Encrypt' : 'Decrypt',
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
                    style: const TextStyle(fontFamily: 'monospace', fontSize: 12),
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
