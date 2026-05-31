import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../../../../core/responsive.dart';
import '../../../../data/models/tool_model.dart';
import '../../../../widgets/glass_card.dart';
import '../../../../widgets/gradient_button.dart';
import '../../../../widgets/inline_error_banner.dart';
import '../../../../widgets/tool_page_header.dart';
import '../../tool_controller.dart';

class MarkdownToolBody extends StatefulWidget {
  const MarkdownToolBody({super.key, required this.tool});

  final ToolModel tool;

  @override
  State<MarkdownToolBody> createState() => _MarkdownToolBodyState();
}

class _MarkdownToolBodyState extends State<MarkdownToolBody> {
  WebViewController? _web;

  ToolController get controller => Get.find<ToolController>();

  void _loadPreview(String html) {
    _web ??= WebViewController()
      ..setJavaScriptMode(JavaScriptMode.disabled)
      ..setBackgroundColor(const Color(0xFF0F0F14));
    _web!.loadHtmlString(_wrapHtml(html));
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: AppLayout.toolScreenPadding(context),
      children: [
        ToolPageHeader(tool: widget.tool, showName: false),
        const SizedBox(height: 16),
        TextField(
          onChanged: (v) => controller.input.value = v,
          maxLines: 12,
          decoration: const InputDecoration(
            labelText: 'Markdown',
            hintText: '# Heading\n\nWrite markdown here…',
            alignLabelWithHint: true,
          ),
        ),
        const SizedBox(height: 16),
        Obx(
          () => GradientButton(
            expand: true,
            label: 'Preview',
            icon: Icons.visibility_outlined,
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
                compact: true,
              ),
            );
          }
          final html = controller.previewHtml.value;
          if (html.isEmpty) return const SizedBox.shrink();
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (mounted) _loadPreview(html);
          });
          return Padding(
            padding: const EdgeInsets.only(top: 16),
            child: GlassCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text('Live preview', style: TextStyle(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 10),
                  SizedBox(
                    height: 360,
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: WebViewWidget(controller: _web!),
                    ),
                  ),
                ],
              ),
            ),
          );
        }),
      ],
    );
  }

  String _wrapHtml(String body) {
    return '''
<!DOCTYPE html>
<html><head><meta name="viewport" content="width=device-width, initial-scale=1">
<style>body{font-family:system-ui;background:#0f0f14;color:#e4e4e7;padding:16px;line-height:1.55}
a{color:#a855f7}code{background:#18181f;padding:2px 6px;border-radius:4px}</style></head>
<body>$body</body></html>''';
  }
}
