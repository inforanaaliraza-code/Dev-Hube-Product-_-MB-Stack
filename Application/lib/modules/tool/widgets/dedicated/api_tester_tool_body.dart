import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../core/colors.dart';
import '../../../../core/responsive.dart';
import '../../../../data/models/tool_model.dart';
import '../../../../widgets/glass_card.dart';
import '../../../../widgets/gradient_button.dart';
import '../../../../widgets/inline_error_banner.dart';
import '../../../../widgets/tool_page_header.dart';
import '../../api_tester_history.dart';
import '../../tool_controller.dart';

class ApiTesterToolBody extends GetView<ToolController> {
  const ApiTesterToolBody({super.key, required this.tool});

  final ToolModel tool;

  static const _methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: AppLayout.toolScreenPadding(context),
      children: [
        ToolPageHeader(tool: tool, showName: false),
        const SizedBox(height: 16),
        Obx(
          () => SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: _methods
                  .map(
                    (m) => Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: ChoiceChip(
                        label: Text(m),
                        selected: controller.mode.value == m,
                        onSelected: (_) => controller.mode.value = m,
                      ),
                    ),
                  )
                  .toList(),
            ),
          ),
        ),
        const SizedBox(height: 12),
        TextField(
          onChanged: (v) => controller.input.value = v,
          decoration: const InputDecoration(
            labelText: 'Request URL',
            hintText: 'https://api.example.com/users',
          ),
        ),
        const SizedBox(height: 12),
        Obx(
          () => DropdownButtonFormField<String>(
            value: controller.apiAuthType.value,
            decoration: const InputDecoration(labelText: 'Auth'),
            items: const [
              DropdownMenuItem(value: 'none', child: Text('None')),
              DropdownMenuItem(value: 'bearer', child: Text('Bearer token')),
              DropdownMenuItem(value: 'apikey', child: Text('API key header')),
            ],
            onChanged: (v) {
              if (v != null) controller.apiAuthType.value = v;
            },
          ),
        ),
        Obx(() {
          if (controller.apiAuthType.value == 'none') return const SizedBox.shrink();
          return Padding(
            padding: const EdgeInsets.only(top: 12),
            child: TextField(
              onChanged: (v) => controller.apiBearerToken.value = v,
              decoration: InputDecoration(
                labelText: controller.apiAuthType.value == 'bearer' ? 'Bearer token' : 'API key value',
              ),
            ),
          );
        }),
        const SizedBox(height: 12),
        TextField(
          onChanged: (v) => controller.apiHeadersText.value = v,
          maxLines: 4,
          decoration: const InputDecoration(
            labelText: 'Headers (optional)',
            hintText: 'Content-Type: application/json\nX-Custom: value',
          ),
        ),
        const SizedBox(height: 12),
        TextField(
          onChanged: (v) => controller.input2.value = v,
          maxLines: 8,
          decoration: const InputDecoration(
            labelText: 'Body (JSON / raw)',
            hintText: '{"key": "value"}',
          ),
        ),
        const SizedBox(height: 16),
        Obx(
          () => GradientButton(
            expand: true,
            label: 'Send request',
            icon: Icons.send_rounded,
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
                showSettings: true,
                onRetry: controller.run,
                compact: true,
              ),
            );
          }
          if (controller.apiResponseStatus.value == null) return const SizedBox.shrink();
          return Padding(
            padding: const EdgeInsets.only(top: 16),
            child: GlassCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Status ${controller.apiResponseStatus.value} · ${controller.apiResponseDuration.value ?? 0}ms',
                    style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
                  ),
                  const SizedBox(height: 10),
                  SelectableText(
                    controller.output.value,
                    style: const TextStyle(fontFamily: 'monospace', fontSize: 12, height: 1.45),
                  ),
                ],
              ),
            ),
          );
        }),
        Obx(() {
          final _ = controller.apiHistoryEpoch.value;
          final items = ApiTesterHistory.load();
          if (items.isEmpty) return const SizedBox.shrink();
          return Padding(
            padding: const EdgeInsets.only(top: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Text('History', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
                    const Spacer(),
                    TextButton(
                      onPressed: () {
                        ApiTesterHistory.clear();
                        controller.apiHistoryEpoch.value++;
                      },
                      child: const Text('Clear'),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                ...items.take(8).map((e) {
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(10),
                      onTap: () {
                        controller.mode.value = e.method;
                        controller.input.value = e.url;
                      },
                      child: GlassCard(
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: AppColors.primary.withValues(alpha: 0.12),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                e.method,
                                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                e.url,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(fontSize: 12),
                              ),
                            ),
                            Text(
                              '${e.status}',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: e.status >= 200 && e.status < 300 ? AppColors.accent : AppColors.destructive,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                }),
              ],
            ),
          );
        }),
      ],
    );
  }
}
