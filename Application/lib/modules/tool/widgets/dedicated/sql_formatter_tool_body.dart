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

class SqlFormatterToolBody extends GetView<ToolController> {
  const SqlFormatterToolBody({super.key, required this.tool});

  final ToolModel tool;

  static const _dialects = [
    'sql',
    'postgresql',
    'mysql',
    'sqlite',
    'transactsql',
    'plsql',
  ];

  @override
  Widget build(BuildContext context) {
    final wide = MediaQuery.sizeOf(context).width >= 700;
    return ListView(
      padding: AppLayout.toolScreenPadding(context),
      children: [
        ToolPageHeader(tool: tool, showName: false),
        const SizedBox(height: 12),
        Obx(
          () => DropdownButtonFormField<String>(
            value: _dialects.contains(controller.mode.value) ? controller.mode.value : 'postgresql',
            decoration: const InputDecoration(labelText: 'SQL dialect'),
            items: _dialects.map((d) => DropdownMenuItem(value: d, child: Text(d))).toList(),
            onChanged: (v) {
              if (v != null) controller.mode.value = v;
            },
          ),
        ),
        const SizedBox(height: 16),
        if (wide)
          SizedBox(
            height: 420,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Expanded(child: _inputPane()),
                const SizedBox(width: 12),
                Expanded(child: _outputPane()),
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
            label: 'Format SQL',
            icon: Icons.storage,
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

  Widget _inputPane({bool compact = false}) {
    return GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: compact ? MainAxisSize.min : MainAxisSize.max,
        children: [
          const Text('Input SQL', style: TextStyle(fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          if (compact)
            TextField(
              onChanged: (v) => controller.input.value = v,
              maxLines: 10,
              style: const TextStyle(fontFamily: 'monospace', fontSize: 13),
              decoration: const InputDecoration(hintText: 'SELECT * FROM users…'),
            )
          else
            Expanded(
              child: TextField(
                onChanged: (v) => controller.input.value = v,
                maxLines: null,
                expands: true,
                style: const TextStyle(fontFamily: 'monospace', fontSize: 13),
                decoration: const InputDecoration(
                  hintText: 'SELECT * FROM users…',
                  border: InputBorder.none,
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _outputPane({bool compact = false}) {
    return Obx(
      () => GlassCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: compact ? MainAxisSize.min : MainAxisSize.max,
          children: [
            Row(
              children: [
                const Text('Formatted', style: TextStyle(fontWeight: FontWeight.w600)),
                const Spacer(),
                if (controller.output.value.isNotEmpty)
                  IconButton(
                    icon: const Icon(Icons.copy, size: 20),
                    onPressed: () {
                      Clipboard.setData(ClipboardData(text: controller.output.value));
                      Get.snackbar('Copied', 'SQL copied');
                    },
                  ),
              ],
            ),
            const SizedBox(height: 8),
            if (compact)
              SelectableText(
                controller.output.value.isEmpty ? 'Formatted SQL appears here…' : controller.output.value,
                style: const TextStyle(fontFamily: 'monospace', fontSize: 13, height: 1.45),
              )
            else
              Expanded(
                child: SingleChildScrollView(
                  child: SelectableText(
                    controller.output.value.isEmpty ? 'Formatted SQL appears here…' : controller.output.value,
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
