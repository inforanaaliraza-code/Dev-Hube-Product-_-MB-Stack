import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../core/colors.dart';
import '../../../../core/responsive.dart';
import '../../../../data/models/tool_model.dart';
import '../../../../widgets/glass_card.dart';
import '../../../../widgets/gradient_button.dart';
import '../../../../widgets/inline_error_banner.dart';
import '../../../../widgets/tool_page_header.dart';
import '../../tool_controller.dart';

class QrGeneratorToolBody extends GetView<ToolController> {
  const QrGeneratorToolBody({super.key, required this.tool});

  final ToolModel tool;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: AppLayout.toolScreenPadding(context),
      children: [
        ToolPageHeader(tool: tool, showName: false),
        const SizedBox(height: 16),
        Obx(
          () => Wrap(
            spacing: 8,
            children: [
              ChoiceChip(
                label: const Text('Static'),
                selected: controller.qrMode.value == 'static',
                onSelected: (_) => controller.qrMode.value = 'static',
              ),
              ChoiceChip(
                label: const Text('Dynamic'),
                selected: controller.qrMode.value == 'dynamic',
                onSelected: (_) => controller.qrMode.value = 'dynamic',
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        TextField(
          onChanged: (v) => controller.input.value = v,
          maxLines: 3,
          decoration: const InputDecoration(
            labelText: 'URL or text',
            hintText: 'https://your-site.com',
          ),
        ),
        const SizedBox(height: 12),
        TextField(
          onChanged: (v) => controller.fieldUrl.value = v,
          decoration: const InputDecoration(
            labelText: 'Foreground color (optional)',
            hintText: '#000000',
          ),
        ),
        const SizedBox(height: 16),
        Obx(
          () => GradientButton(
            expand: true,
            label: 'Generate QR',
            icon: Icons.qr_code_2,
            loading: controller.running.value,
            onPressed: controller.run,
          ),
        ),
        Obx(() {
          if (controller.error.value.isNotEmpty) {
            return Padding(
              padding: const EdgeInsets.only(top: 12),
              child: InlineErrorBanner(
                message: controller.error.value,
                scope: controller.errorScope.value,
                showSettings: true,
                onRetry: controller.run,
                compact: true,
              ),
            );
          }
          final b64 = controller.qrImageBase64.value;
          if (b64.isEmpty) return const SizedBox.shrink();
          try {
            final bytes = base64Decode(b64.replaceAll(RegExp(r'\s+'), ''));
            return Padding(
              padding: const EdgeInsets.only(top: 16),
              child: GlassCard(
                child: Column(
                  children: [
                    Image.memory(bytes, height: 260, fit: BoxFit.contain),
                    if (controller.output.value.isNotEmpty) ...[
                      const SizedBox(height: 12),
                      SelectableText(
                        controller.output.value,
                        style: const TextStyle(fontSize: 12, color: AppColors.mutedFg),
                      ),
                    ],
                  ],
                ),
              ),
            );
          } catch (_) {
            return const SizedBox.shrink();
          }
        }),
      ],
    );
  }
}
