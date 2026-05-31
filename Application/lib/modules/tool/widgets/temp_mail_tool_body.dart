import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../core/colors.dart';
import '../../../core/responsive.dart';
import '../../../core/html_util.dart';
import '../../../data/models/tool_model.dart';
import '../../../widgets/gradient_button.dart';
import '../../../widgets/inline_error_banner.dart';
import '../../../core/app_error.dart';
import '../../../widgets/tool_page_header.dart';
import '../temp_mail_controller.dart';

class TempMailToolBody extends StatelessWidget {
  const TempMailToolBody({super.key, required this.tool});

  final ToolModel tool;

  @override
  Widget build(BuildContext context) {
    if (!Get.isRegistered<TempMailController>()) {
      Get.put(TempMailController());
    }
    final c = Get.find<TempMailController>();
    return Obx(() {
      if (c.loading.value) {
        return const Center(child: CircularProgressIndicator(color: AppColors.primary));
      }
      return ListView(
        padding: AppLayout.toolScreenPadding(context),
        children: [
          ToolPageHeader(tool: tool, showName: false),
          const SizedBox(height: 16),
          if (c.address.value.isNotEmpty) ...[
            _AddressCard(controller: c),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: c.refreshing.value ? null : c.refreshMessages,
                    icon: const Icon(Icons.refresh, size: 18),
                    label: Text(c.refreshing.value ? 'Refreshing…' : 'Refresh inbox'),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  onPressed: c.deleteMailbox,
                  icon: const Icon(Icons.delete_outline, color: AppColors.destructive),
                ),
              ],
            ),
            const SizedBox(height: 12),
            ...c.messages.map(
              (m) => _MessageTile(
                message: m,
                selected: c.selectedMessageId.value == m['id']?.toString(),
                onTap: () => c.openMessage(m['id']?.toString() ?? ''),
              ),
            ),
            if (c.messageDetail.value != null) ...[
              const SizedBox(height: 16),
              _MessageDetailCard(detail: c.messageDetail.value!),
            ],
          ] else ...[
            TextField(
              onChanged: (v) => c.localPart.value = v,
              decoration: const InputDecoration(
                labelText: 'Local name (optional)',
                hintText: 'my-test-inbox',
              ),
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              value: c.selectedDomain.value.isEmpty && c.domains.isNotEmpty
                  ? c.domains.first
                  : (c.selectedDomain.value.isEmpty ? null : c.selectedDomain.value),
              decoration: const InputDecoration(labelText: 'Domain'),
              items: c.domains
                  .map((d) => DropdownMenuItem(value: d, child: Text(d)))
                  .toList(),
              onChanged: (v) {
                if (v != null) c.selectedDomain.value = v;
              },
            ),
            const SizedBox(height: 16),
            GradientButton(
              expand: true,
              label: 'Create inbox',
              loading: c.creating.value,
              icon: Icons.mail_outline,
              onPressed: c.createMailbox,
            ),
          ],
          if (c.error.value.isNotEmpty) ...[
            const SizedBox(height: 12),
            InlineErrorBanner(
              message: c.error.value,
              scope: c.errorScope.value,
              showSettings: true,
              onRetry: c.address.value.isEmpty ? c.createMailbox : c.refreshMessages,
              compact: true,
            ),
          ],
        ],
      );
    });
  }
}

class _AddressCard extends StatelessWidget {
  const _AddressCard({required this.controller});

  final TempMailController controller;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.muted.withValues(alpha: 0.9),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.primary.withValues(alpha: 0.4)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Your temp address', style: TextStyle(color: AppColors.mutedFg, fontSize: 12)),
          const SizedBox(height: 6),
          SelectableText(
            controller.address.value,
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 10),
          OutlinedButton.icon(
            onPressed: controller.copyAddress,
            icon: const Icon(Icons.copy, size: 18),
            label: const Text('Copy address'),
          ),
        ],
      ),
    );
  }
}

class _MessageTile extends StatelessWidget {
  const _MessageTile({
    required this.message,
    required this.selected,
    required this.onTap,
  });

  final Map<String, dynamic> message;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: selected ? AppColors.primary : AppColors.border,
              ),
              color: selected ? AppColors.primary.withValues(alpha: 0.08) : AppColors.card,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  message['subject']?.toString() ?? '(no subject)',
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 4),
                Text(
                  message['from']?.toString() ?? '',
                  style: const TextStyle(color: AppColors.mutedFg, fontSize: 12),
                ),
                if (message['otpCode'] != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 6),
                    child: Text(
                      'OTP: ${message['otpCode']}',
                      style: const TextStyle(color: AppColors.accent, fontWeight: FontWeight.w600),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _MessageDetailCard extends StatelessWidget {
  const _MessageDetailCard({required this.detail});

  final Map<String, dynamic> detail;

  @override
  Widget build(BuildContext context) {
    final body = HtmlUtil.toPlainText(
      detail['text']?.toString() ?? detail['html']?.toString() ?? '',
    );
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.muted.withValues(alpha: 0.85),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: SelectableText(body, style: const TextStyle(fontSize: 14, height: 1.5)),
    );
  }
}
