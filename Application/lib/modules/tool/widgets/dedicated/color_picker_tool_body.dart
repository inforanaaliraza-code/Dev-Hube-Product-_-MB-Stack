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

class ColorPickerToolBody extends GetView<ToolController> {
  const ColorPickerToolBody({super.key, required this.tool});

  final ToolModel tool;

  Color? _parseHex(String raw) {
    try {
      var h = raw.trim().replaceAll('#', '');
      if (h.length == 3) {
        h = h.split('').map((c) => '$c$c').join();
      }
      if (h.length == 6) h = 'FF$h';
      if (h.length == 8) return Color(int.parse(h, radix: 16));
    } catch (_) {}
    return null;
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: AppLayout.toolScreenPadding(context),
      children: [
        ToolPageHeader(tool: tool, showName: false),
        const SizedBox(height: 16),
        Obx(() {
          final swatch = _parseHex(controller.input.value);
          return Row(
            children: [
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: swatch ?? AppColors.muted,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: TextField(
                  onChanged: (v) => controller.input.value = v,
                  decoration: const InputDecoration(
                    labelText: 'HEX color',
                    hintText: '#A855F7',
                  ),
                ),
              ),
            ],
          );
        }),
        const SizedBox(height: 16),
        Obx(
          () => GradientButton(
            expand: true,
            label: 'Convert',
            icon: Icons.palette_outlined,
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
                      const Text('Formats', style: TextStyle(fontWeight: FontWeight.w600)),
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
                    style: const TextStyle(fontFamily: 'monospace', fontSize: 13, height: 1.5),
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
