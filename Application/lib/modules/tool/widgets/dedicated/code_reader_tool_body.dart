import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import '../../../../core/colors.dart';
import '../../../../core/responsive.dart';
import '../../../../data/models/tool_model.dart';
import '../../../../widgets/glass_card.dart';
import '../../../../widgets/gradient_button.dart';
import '../../../../widgets/tool_page_header.dart';
import '../../code_reader_controller.dart';

class CodeReaderToolBody extends StatefulWidget {
  const CodeReaderToolBody({super.key, required this.tool});

  final ToolModel tool;

  @override
  State<CodeReaderToolBody> createState() => _CodeReaderToolBodyState();
}

class _CodeReaderToolBodyState extends State<CodeReaderToolBody> {
  @override
  void initState() {
    super.initState();
    if (!Get.isRegistered<CodeReaderController>()) {
      Get.put(CodeReaderController());
    }
  }

  @override
  void dispose() {
    if (Get.isRegistered<CodeReaderController>()) {
      Get.delete<CodeReaderController>();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = Get.find<CodeReaderController>();
    return ListView(
      padding: AppLayout.toolScreenPadding(context),
      children: [
        ToolPageHeader(tool: widget.tool, showName: false),
        const SizedBox(height: 12),
        Obx(() {
          if (c.address.value.isEmpty) {
            return const Text(
              'Create an inbox in Temp Mail first — codes will appear here automatically every 5 seconds.',
              style: TextStyle(color: AppColors.mutedFg, height: 1.4),
            );
          }
          return Text(
            'Listening on ${c.address.value}',
            style: const TextStyle(color: AppColors.mutedFg, fontSize: 13),
          );
        }),
        const SizedBox(height: 16),
        Obx(() {
          if (c.liveCodes.isEmpty) {
            return const GlassCard(
              child: Text('No verification codes yet. Send a test email to your temp inbox.'),
            );
          }
          return Column(
            children: c.liveCodes
                .map(
                  (row) => Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: GlassCard(
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  row.code,
                                  style: const TextStyle(
                                    fontFamily: 'monospace',
                                    fontSize: 26,
                                    fontWeight: FontWeight.w700,
                                    letterSpacing: 2,
                                  ),
                                ),
                                Text(
                                  row.subject.isNotEmpty ? row.subject : row.from,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(fontSize: 11, color: AppColors.mutedFg),
                                ),
                              ],
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.copy),
                            onPressed: () {
                              Clipboard.setData(ClipboardData(text: row.code));
                              Get.snackbar('Copied', 'Code copied');
                            },
                          ),
                        ],
                      ),
                    ),
                  ),
                )
                .toList(),
          );
        }),
        const SizedBox(height: 20),
        const Text('Or paste email text', style: TextStyle(fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        TextField(
          maxLines: 5,
          decoration: const InputDecoration(hintText: 'Paste email body…'),
          onChanged: (v) => c.pasteText.value = v,
        ),
        const SizedBox(height: 12),
        Obx(
          () => GradientButton(
            expand: true,
            label: 'Detect code',
            loading: c.loading.value,
            onPressed: () => c.detectFromPaste(c.pasteText.value, ''),
          ),
        ),
        Obx(() {
          if (c.pastePrimary.value.isEmpty) return const SizedBox.shrink();
          return Padding(
            padding: const EdgeInsets.only(top: 12),
            child: GlassCard(
              child: Text('Detected: ${c.pastePrimary.value}', style: const TextStyle(fontFamily: 'monospace')),
            ),
          );
        }),
        Obx(() {
          if (c.error.value.isEmpty) return const SizedBox.shrink();
          return Padding(
            padding: const EdgeInsets.only(top: 12),
            child: Text(c.error.value, style: const TextStyle(color: AppColors.destructive)),
          );
        }),
      ],
    );
  }
}
