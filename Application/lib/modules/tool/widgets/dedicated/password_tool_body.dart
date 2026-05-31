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

class PasswordToolBody extends GetView<ToolController> {
  const PasswordToolBody({super.key, required this.tool});

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
                label: const Text('Generate'),
                selected: controller.mode.value == 'generate',
                onSelected: (_) => controller.mode.value = 'generate',
              ),
              ChoiceChip(
                label: const Text('Breach check'),
                selected: controller.mode.value == 'breach',
                onSelected: (_) => controller.mode.value = 'breach',
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        Obx(() {
          if (controller.mode.value == 'generate') {
            return Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  children: [
                    const Text('Length'),
                    Expanded(
                      child: Slider(
                        min: 8,
                        max: 64,
                        divisions: 56,
                        value: controller.passwordLength.value.toDouble(),
                        onChanged: (v) => controller.passwordLength.value = v.round(),
                      ),
                    ),
                    Text('${controller.passwordLength.value}'),
                  ],
                ),
                _ToggleRow(label: 'Uppercase', value: controller.pwUpper, onChanged: (v) => controller.pwUpper.value = v),
                _ToggleRow(label: 'Lowercase', value: controller.pwLower, onChanged: (v) => controller.pwLower.value = v),
                _ToggleRow(label: 'Numbers', value: controller.pwNumbers, onChanged: (v) => controller.pwNumbers.value = v),
                _ToggleRow(label: 'Symbols', value: controller.pwSymbols, onChanged: (v) => controller.pwSymbols.value = v),
              ],
            );
          }
          return TextField(
            onChanged: (v) => controller.input.value = v,
            obscureText: true,
            decoration: const InputDecoration(
              labelText: 'Password to check',
              hintText: 'Enter password for breach lookup',
            ),
          );
        }),
        const SizedBox(height: 16),
        Obx(
          () => GradientButton(
            expand: true,
            label: controller.mode.value == 'breach' ? 'Check breach' : 'Generate password',
            loading: controller.running.value,
            onPressed: controller.run,
          ),
        ),
        Obx(() {
          if (controller.error.value.isEmpty) return const SizedBox.shrink();
          return Padding(
            padding: const EdgeInsets.only(top: 12),
            child: InlineErrorBanner(message: controller.error.value, scope: controller.errorScope.value, compact: true),
          );
        }),
        Obx(() {
          if (controller.output.value.isEmpty) return const SizedBox.shrink();
          return Padding(
            padding: const EdgeInsets.only(top: 16),
            child: GlassCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Text('Result', style: TextStyle(fontWeight: FontWeight.w600)),
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
                  if (controller.pwStrength.value.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: Text(
                        'Strength: ${controller.pwStrength.value}',
                        style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600),
                      ),
                    ),
                  SelectableText(
                    controller.output.value,
                    style: const TextStyle(fontFamily: 'monospace', fontSize: 13),
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

class _ToggleRow extends StatelessWidget {
  const _ToggleRow({required this.label, required this.value, required this.onChanged});

  final String label;
  final RxBool value;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    return Obx(
      () => SwitchListTile(
        contentPadding: EdgeInsets.zero,
        title: Text(label),
        value: value.value,
        onChanged: onChanged,
      ),
    );
  }
}
