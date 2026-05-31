import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import '../../../core/colors.dart';
import '../../../core/responsive.dart';
import '../../../core/html_util.dart';
import '../../../data/models/tool_model.dart';
import '../../../data/tool_config.dart';
import '../../../data/tool_spec.dart';
import '../../../widgets/cached_app_image.dart';
import '../../../widgets/inline_error_banner.dart';
import '../../../core/app_error.dart';
import '../../../widgets/glass_card.dart';
import '../../../widgets/gradient_button.dart';
import '../../../widgets/tool_page_header.dart';
import '../tool_controller.dart';

class WorkflowToolBody extends GetView<ToolController> {
  const WorkflowToolBody({super.key, required this.tool});

  final ToolModel tool;

  @override
  Widget build(BuildContext context) {
    final kind = controller.kind;
    final modes = ToolSpec.modes(kind, controller.slug.value);
    final hint2 = ToolSpec.input2Hint(kind, controller.slug.value);
    final urlHint = ToolSpec.fieldUrlHint(kind);

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
        if (kind == ToolKind.password)
          Obx(
            () => Row(
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
          ),
        if (modes.isNotEmpty) ...[
          Obx(
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
          ),
          const SizedBox(height: 12),
        ],
        TextField(
          onChanged: (v) => controller.input.value = v,
          maxLines: ToolSpec.inputLines(kind),
          decoration: InputDecoration(hintText: ToolSpec.inputHint(kind, controller.slug.value)),
        ),
        if (hint2 != null) ...[
          const SizedBox(height: 12),
          TextField(
            onChanged: (v) => controller.input2.value = v,
            maxLines: kind == ToolKind.regex ? 4 : 6,
            decoration: InputDecoration(hintText: hint2),
          ),
        ],
        if (urlHint != null) ...[
          const SizedBox(height: 12),
          TextField(
            onChanged: (v) => controller.fieldUrl.value = v,
            decoration: InputDecoration(hintText: urlHint),
          ),
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
              onRetry: controller.errorScope.value == AppErrorScope.worker
                  ? controller.load
                  : controller.run,
              compact: true,
            ),
          );
        }),
        Obx(() {
          final html = controller.previewHtml.value;
          if (html.isEmpty) return const SizedBox.shrink();
          return Padding(
            padding: const EdgeInsets.only(top: 16),
            child: GlassCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('HTML preview', style: TextStyle(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 8),
                  SelectableText(
                    HtmlUtil.toPlainText(html),
                    style: const TextStyle(fontSize: 14, height: 1.5),
                  ),
                ],
              ),
            ),
          );
        }),
        Obx(() {
          if (controller.thumbnailUrls.isEmpty) return const SizedBox.shrink();
          return Padding(
            padding: const EdgeInsets.only(top: 16),
            child: GlassCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Thumbnails', style: TextStyle(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 12),
                  ...controller.thumbnailUrls.entries.map((e) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(e.key, style: const TextStyle(fontSize: 12, color: AppColors.mutedFg)),
                          const SizedBox(height: 6),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(10),
                            child: CachedAppImage(
                              url: e.value,
                              height: 120,
                              fit: BoxFit.cover,
                            ),
                          ),
                        ],
                      ),
                    );
                  }),
                ],
              ),
            ),
          );
        }),
        Obx(() {
          if (controller.paletteColors.isEmpty) return const SizedBox.shrink();
          return Padding(
            padding: const EdgeInsets.only(top: 16),
            child: GlassCard(
              child: Wrap(
                spacing: 8,
                runSpacing: 8,
                children: controller.paletteColors.map((hex) {
                  Color color;
                  try {
                    final h = hex.replaceAll('#', '');
                    color = Color(int.parse('FF$h', radix: 16));
                  } catch (_) {
                    color = AppColors.primary;
                  }
                  return Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: color,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppColors.border),
                    ),
                  );
                }).toList(),
              ),
            ),
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
                    style: const TextStyle(fontFamily: 'monospace', fontSize: 13, height: 1.45),
                  ),
                ],
              ),
            ),
          );
        }),
        Obx(() {
          final b64 = controller.qrImageBase64.value;
          if (b64.isEmpty) return const SizedBox.shrink();
          try {
            final bytes = base64Decode(b64.replaceAll(RegExp(r'\s+'), ''));
            return Padding(
              padding: const EdgeInsets.only(top: 16),
              child: GlassCard(
                child: Center(
                  child: Image.memory(bytes, width: 260, height: 260, fit: BoxFit.contain),
                ),
              ),
            );
          } catch (_) {
            return const SizedBox.shrink();
          }
        }),
        _AboutSection(controller: controller),
      ],
    );
  }
}

class _AboutSection extends StatelessWidget {
  const _AboutSection({required this.controller});

  final ToolController controller;

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final b = controller.blog.value;
      if (b == null || (b.body.isEmpty && b.excerpt.isEmpty)) {
        return const SizedBox.shrink();
      }
      final plain = HtmlUtil.preview(
        b.body.isNotEmpty ? b.body : b.excerpt,
        maxChars: controller.blogExpanded.value ? 8000 : 280,
      );
      return Padding(
        padding: const EdgeInsets.only(top: 20),
        child: GlassCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                b.title.isNotEmpty ? b.title : 'About',
                style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
              ),
              const SizedBox(height: 10),
              Text(plain, style: const TextStyle(fontSize: 14, height: 1.55)),
              if (plain.length >= 280)
                TextButton(
                  onPressed: () => controller.blogExpanded.toggle(),
                  child: Text(controller.blogExpanded.value ? 'Show less' : 'Read more'),
                ),
            ],
          ),
        ),
      );
    });
  }
}
