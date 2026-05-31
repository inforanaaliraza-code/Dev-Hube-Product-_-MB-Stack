import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import '../../../../core/app_error.dart';
import '../../../../core/responsive.dart';
import '../../../../data/models/tool_model.dart';
import '../../../../data/tool_config.dart';
import '../../../../data/tool_spec.dart';
import '../../../../widgets/glass_card.dart';
import '../../../../widgets/gradient_button.dart';
import '../../../../widgets/inline_error_banner.dart';
import '../../../../widgets/tool_page_header.dart';
import '../../tool_controller.dart';

class SplitIoToolBody extends GetView<ToolController> {
  const SplitIoToolBody({super.key, required this.tool});

  final ToolModel tool;

  @override
  Widget build(BuildContext context) {
    final kind = controller.kind;
    final modes = ToolSpec.modes(kind, controller.slug.value);
    final hint2 = ToolSpec.input2Hint(kind, controller.slug.value);
    final urlHint = ToolSpec.fieldUrlHint(kind);
    final wide = MediaQuery.sizeOf(context).width >= 700;
    final paneH = wide ? 320.0 : null;

    return ListView(
      padding: AppLayout.toolScreenPadding(context),
      children: [
        ToolPageHeader(tool: tool, showName: false),
        Obx(() {
          final msg = controller.workerBannerMessage;
          if (msg == null) return const SizedBox.shrink();
          return Padding(
            padding: const EdgeInsets.only(top: 12),
            child: InlineErrorBanner(
              title: 'Service not ready',
              message: msg,
              scope: controller.backendReachable.value ? AppErrorScope.worker : AppErrorScope.network,
              showSettings: true,
              onRetry: controller.load,
              compact: true,
            ),
          );
        }),
        const SizedBox(height: 16),
        if (controller.slug.value == 'file-encode-decode')
          Obx(
            () => controller.mode.value == 'encode'
                ? Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: OutlinedButton.icon(
                      onPressed: () => controller.pickFiles(),
                      icon: const Icon(Icons.upload_file),
                      label: Text(
                        controller.pickedFiles.isEmpty
                            ? 'Pick file to encode'
                            : controller.pickedFiles.first.name,
                      ),
                    ),
                  )
                : const SizedBox.shrink(),
          ),
        if (modes.isNotEmpty) ...[
          Obx(
            () => Wrap(
              spacing: 8,
              runSpacing: 8,
              children: modes
                  .map(
                    (m) => ChoiceChip(
                      label: Text(m.label),
                      selected: controller.mode.value == m.value,
                      onSelected: (_) => controller.mode.value = m.value,
                    ),
                  )
                  .toList(),
            ),
          ),
          const SizedBox(height: 12),
        ],
        if (wide && paneH != null)
          SizedBox(
            height: paneH,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Expanded(child: _inputCard(kind, hint2, urlHint, compact: false)),
                const SizedBox(width: 12),
                Expanded(child: _outputCard(compact: false)),
              ],
            ),
          )
        else ...[
          _inputCard(kind, hint2, urlHint, compact: true),
          const SizedBox(height: 12),
          _outputCard(compact: true),
        ],
        const SizedBox(height: 16),
        Obx(
          () => GradientButton(
            expand: true,
            label: ToolSpec.runLabel(kind),
            loading: controller.running.value,
            onPressed: controller.run,
          ),
        ),
        Obx(() {
          if (controller.error.value.isEmpty) return const SizedBox.shrink();
          return Padding(
            padding: const EdgeInsets.only(top: 12),
            child: InlineErrorBanner(
              message: controller.error.value,
              scope: controller.errorScope.value,
              showSettings: controller.errorScope.value == AppErrorScope.network ||
                  controller.errorScope.value == AppErrorScope.offline,
              onRetry: controller.errorScope.value == AppErrorScope.worker ? controller.load : controller.run,
              compact: true,
            ),
          );
        }),
      ],
    );
  }

  Widget _inputCard(ToolKind kind, String? hint2, String? urlHint, {required bool compact}) {
    return GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: compact ? MainAxisSize.min : MainAxisSize.max,
        children: [
          const Text('Input', style: TextStyle(fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          if (compact)
            TextField(
              onChanged: (v) => controller.input.value = v,
              maxLines: 10,
              style: const TextStyle(fontFamily: 'monospace', fontSize: 13),
              decoration: InputDecoration(hintText: ToolSpec.inputHint(kind, controller.slug.value)),
            )
          else
            Expanded(
              child: TextField(
                onChanged: (v) => controller.input.value = v,
                maxLines: null,
                expands: true,
                style: const TextStyle(fontFamily: 'monospace', fontSize: 13),
                decoration: InputDecoration(
                  hintText: ToolSpec.inputHint(kind, controller.slug.value),
                  border: InputBorder.none,
                ),
              ),
            ),
          if (hint2 != null) ...[
            const SizedBox(height: 8),
            TextField(
              onChanged: (v) => controller.input2.value = v,
              maxLines: compact ? 3 : 2,
              decoration: InputDecoration(hintText: hint2),
            ),
          ],
          if (urlHint != null) ...[
            const SizedBox(height: 8),
            TextField(
              onChanged: (v) => controller.fieldUrl.value = v,
              decoration: InputDecoration(hintText: urlHint),
            ),
          ],
        ],
      ),
    );
  }

  Widget _outputCard({required bool compact}) {
    return Obx(
      () => GlassCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: compact ? MainAxisSize.min : MainAxisSize.max,
          children: [
            Row(
              children: [
                const Text('Output', style: TextStyle(fontWeight: FontWeight.w600)),
                const Spacer(),
                if (controller.output.value.isNotEmpty)
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
            if (compact)
              SelectableText(
                controller.output.value.isEmpty ? 'Result appears here…' : controller.output.value,
                style: const TextStyle(fontFamily: 'monospace', fontSize: 13, height: 1.45),
              )
            else
              Expanded(
                child: SingleChildScrollView(
                  child: SelectableText(
                    controller.output.value.isEmpty ? 'Result appears here…' : controller.output.value,
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
