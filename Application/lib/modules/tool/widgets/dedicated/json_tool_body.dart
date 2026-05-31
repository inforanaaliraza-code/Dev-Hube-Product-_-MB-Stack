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

class JsonToolBody extends GetView<ToolController> {
  const JsonToolBody({super.key, required this.tool});

  final ToolModel tool;

  bool get _validator => controller.kind == ToolKind.jsonValidate;

  @override
  Widget build(BuildContext context) {
    final wide = MediaQuery.sizeOf(context).width >= 700;
    return ListView(
      padding: AppLayout.toolScreenPadding(context),
      children: [
        ToolPageHeader(tool: tool, showName: false),
        const SizedBox(height: 16),
        if (!_validator)
          Obx(
            () => Wrap(
              spacing: 8,
              children: [
                ChoiceChip(
                  label: const Text('Format'),
                  selected: controller.mode.value != 'minify',
                  onSelected: (_) => controller.mode.value = 'format',
                ),
                ChoiceChip(
                  label: const Text('Minify'),
                  selected: controller.mode.value == 'minify',
                  onSelected: (_) => controller.mode.value = 'minify',
                ),
              ],
            ),
          ),
        if (!_validator) const SizedBox(height: 12),
        if (wide)
          SizedBox(
            height: 340,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Expanded(child: _inputPane(compact: false)),
                const SizedBox(width: 12),
                Expanded(child: _outputPane(compact: false)),
              ],
            ),
          )
        else ...[
          _inputPane(compact: true),
          const SizedBox(height: 12),
          _outputPane(compact: true),
        ],
        const SizedBox(height: 16),
        Obx(
          () => GradientButton(
            expand: true,
            label: _validator ? 'Validate' : 'Format JSON',
            icon: Icons.data_object,
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
      ],
    );
  }

  Widget _inputPane({required bool compact}) {
    return GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: compact ? MainAxisSize.min : MainAxisSize.max,
        children: [
          const Text('JSON input', style: TextStyle(fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          if (compact)
            TextField(
              onChanged: (v) => controller.input.value = v,
              maxLines: 12,
              style: const TextStyle(fontFamily: 'monospace', fontSize: 13),
              decoration: const InputDecoration(hintText: '{"key": "value"}'),
            )
          else
            Expanded(
              child: TextField(
                onChanged: (v) => controller.input.value = v,
                maxLines: null,
                expands: true,
                style: const TextStyle(fontFamily: 'monospace', fontSize: 13),
                decoration: const InputDecoration(hintText: '{"key": "value"}', border: InputBorder.none),
              ),
            ),
        ],
      ),
    );
  }

  Widget _outputPane({required bool compact}) {
    return Obx(
      () => GlassCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: compact ? MainAxisSize.min : MainAxisSize.max,
          children: [
            Row(
              children: [
                Text(_validator ? 'Result' : 'Formatted', style: const TextStyle(fontWeight: FontWeight.w600)),
                const Spacer(),
                if (controller.output.value.isNotEmpty)
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
            if (compact)
              SelectableText(
                controller.output.value.isEmpty ? 'Output appears here…' : controller.output.value,
                style: const TextStyle(fontFamily: 'monospace', fontSize: 13, height: 1.45),
              )
            else
              Expanded(
                child: SingleChildScrollView(
                  child: SelectableText(
                    controller.output.value.isEmpty ? 'Output appears here…' : controller.output.value,
                    style: const TextStyle(fontFamily: 'monospace', fontSize: 13, height: 1.45),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
