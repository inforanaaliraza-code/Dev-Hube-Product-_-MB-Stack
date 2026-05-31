import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../core/colors.dart';
import '../../../core/responsive.dart';
import '../../../data/models/tool_model.dart';
import '../../../data/tool_config.dart';
import '../../../data/tool_spec.dart';
import '../../../core/app_error.dart';
import '../../../widgets/glass_card.dart';
import '../../../widgets/inline_error_banner.dart';
import '../../../widgets/gradient_button.dart';
import '../../../widgets/tool_page_header.dart';
import '../tool_controller.dart';

class FileToolBody extends GetView<ToolController> {
  const FileToolBody({super.key, required this.tool});

  final ToolModel tool;

  @override
  Widget build(BuildContext context) {
    final kind = controller.kind;
    final exts = ToolSpec.fileExtensions(kind);
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
              scope: controller.backendReachable.value
                  ? AppErrorScope.worker
                  : AppErrorScope.network,
              showSettings: true,
              onRetry: controller.load,
              compact: true,
            ),
          );
        }),
        const SizedBox(height: 16),
        if (ToolSpec.modes(kind, controller.slug.value).isNotEmpty)
          _ModeChips(controller: controller, kind: kind),
        if (kind == ToolKind.imageCompressor) ...[
          const SizedBox(height: 12),
          Obx(
            () => Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Quality: ${controller.numericOption.value.round()}%'),
                Slider(
                  min: 10,
                  max: 100,
                  divisions: 18,
                  value: controller.numericOption.value.toDouble(),
                  onChanged: (v) => controller.numericOption.value = v.round(),
                ),
              ],
            ),
          ),
        ],
        if (kind == ToolKind.splitPdf) ...[
          const SizedBox(height: 12),
          TextField(
            onChanged: (v) => controller.input2.value = v,
            decoration: const InputDecoration(
              hintText: 'Page range for split (e.g. 1-3)',
            ),
          ),
        ],
        const SizedBox(height: 12),
        OutlinedButton.icon(
          onPressed: () => controller.pickFiles(
            multiple: ToolSpec.fileMultiple(kind),
            extensions: exts,
          ),
          icon: const Icon(Icons.upload_file),
          label: Text(
            ToolSpec.fileMultiple(kind) ? 'Pick PDF files' : 'Pick file',
          ),
        ),
        Obx(() {
          if (controller.pickedFiles.isEmpty) return const SizedBox.shrink();
          return Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Text(
              controller.pickedFiles.map((f) => f.name).join(', '),
              style: const TextStyle(color: AppColors.mutedFg, fontSize: 12),
            ),
          );
        }),
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
              onRetry: controller.run,
              compact: true,
            ),
          );
        }),
        Obx(() {
          final parts = <Widget>[];
          if (controller.output.value.isNotEmpty) {
            parts.add(
              Padding(
                padding: const EdgeInsets.only(top: 16),
                child: GlassCard(
                  child: SelectableText(
                    controller.output.value,
                    style: const TextStyle(fontSize: 14, height: 1.45),
                  ),
                ),
              ),
            );
          }
          if (controller.resultImageBase64.value.isNotEmpty) {
            try {
              final bytes = base64Decode(
                controller.resultImageBase64.value.replaceAll(RegExp(r'\s+'), ''),
              );
              parts.add(
                Padding(
                  padding: const EdgeInsets.only(top: 16),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: Image.memory(bytes, fit: BoxFit.contain),
                  ),
                ),
              );
            } catch (_) {}
          }
          if (parts.isEmpty) return const SizedBox.shrink();
          return Column(children: parts);
        }),
      ],
    );
  }
}

class _ModeChips extends StatelessWidget {
  const _ModeChips({required this.controller, required this.kind});

  final ToolController controller;
  final ToolKind kind;

  @override
  Widget build(BuildContext context) {
    final modes = ToolSpec.modes(kind, controller.slug.value);
    return Obx(
      () => Wrap(
        spacing: 8,
        runSpacing: 8,
        children: modes.map((m) {
          return ChoiceChip(
            label: Text(m.label),
            selected: controller.mode.value == m.value,
            onSelected: (_) => controller.mode.value = m.value,
          );
        }).toList(),
      ),
    );
  }
}

