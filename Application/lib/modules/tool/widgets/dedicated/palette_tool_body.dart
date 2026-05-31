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

class PaletteToolBody extends GetView<ToolController> {
  const PaletteToolBody({super.key, required this.tool});

  final ToolModel tool;

  static const _modes = [
    'complementary',
    'analogous',
    'triadic',
    'monochrome',
    'random',
  ];

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: AppLayout.toolScreenPadding(context),
      children: [
        ToolPageHeader(tool: tool, showName: false),
        const SizedBox(height: 16),
        Obx(
          () => DropdownButtonFormField<String>(
            value: _modes.contains(controller.mode.value) ? controller.mode.value : 'complementary',
            decoration: const InputDecoration(labelText: 'Palette mode'),
            items: _modes.map((m) => DropdownMenuItem(value: m, child: Text(m))).toList(),
            onChanged: (v) {
              if (v != null) controller.mode.value = v;
            },
          ),
        ),
        const SizedBox(height: 12),
        TextField(
          onChanged: (v) => controller.input.value = v,
          decoration: const InputDecoration(
            labelText: 'Base color',
            hintText: '#6366F1',
          ),
        ),
        const SizedBox(height: 16),
        Obx(
          () => GradientButton(
            expand: true,
            label: 'Generate palette',
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
          if (controller.paletteColors.isEmpty) return const SizedBox.shrink();
          return Padding(
            padding: const EdgeInsets.only(top: 16),
            child: GlassCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Wrap(
                    spacing: 10,
                    runSpacing: 10,
                    children: controller.paletteColors.map((hex) {
                      Color color;
                      try {
                        final h = hex.replaceAll('#', '');
                        color = Color(int.parse('FF$h', radix: 16));
                      } catch (_) {
                        color = AppColors.primary;
                      }
                      return Column(
                        children: [
                          Container(
                            width: 52,
                            height: 52,
                            decoration: BoxDecoration(
                              color: color,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: AppColors.border),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(hex, style: const TextStyle(fontSize: 10, fontFamily: 'monospace')),
                        ],
                      );
                    }).toList(),
                  ),
                  if (controller.paletteGradient.value.isNotEmpty) ...[
                    const SizedBox(height: 16),
                    const Text('Gradient', style: TextStyle(fontWeight: FontWeight.w600)),
                    const SizedBox(height: 6),
                    SelectableText(controller.paletteGradient.value, style: const TextStyle(fontSize: 12)),
                  ],
                  if (controller.paletteCssVars.value.isNotEmpty) ...[
                    const SizedBox(height: 12),
                    const Text('CSS variables', style: TextStyle(fontWeight: FontWeight.w600)),
                    const SizedBox(height: 6),
                    SelectableText(
                      controller.paletteCssVars.value,
                      style: const TextStyle(fontFamily: 'monospace', fontSize: 11),
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
