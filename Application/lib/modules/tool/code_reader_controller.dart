import 'dart:async';

import 'package:get/get.dart';
import '../../core/temp_mail_session.dart';
import '../../data/services/devtools_service.dart';
import '../../data/services/temp_mail_service.dart';

class CodeReaderEntry {
  CodeReaderEntry({required this.code, required this.subject, required this.from});

  final String code;
  final String subject;
  final String from;
}

class CodeReaderController extends GetxController {
  final loading = false.obs;
  final error = ''.obs;
  final address = ''.obs;
  final liveCodes = <CodeReaderEntry>[].obs;
  final pastePrimary = ''.obs;
  final pasteText = ''.obs;

  TempMailService get _mail => Get.find();
  DevtoolsService get _dev => Get.find();

  Timer? _poll;

  @override
  void onInit() {
    super.onInit();
    address.value = TempMailSession.address ?? '';
    _pollInbox();
    _poll = Timer.periodic(const Duration(seconds: 5), (_) => _pollInbox());
  }

  @override
  void onClose() {
    _poll?.cancel();
    super.onClose();
  }

  Future<void> _pollInbox() async {
    final id = TempMailSession.mailboxId;
    if (id == null || id.isEmpty) {
      address.value = '';
      liveCodes.clear();
      return;
    }
    try {
      address.value = TempMailSession.address ?? '';
      final msgs = await _mail.messages(id);
      final rows = <CodeReaderEntry>[];
      final seen = <String>{};
      for (final m in msgs.take(15)) {
        final subject = m['subject']?.toString() ?? '';
        final from = m['from']?.toString() ?? '';
        var code = m['otpCode']?.toString();
        if (code != null && code.isNotEmpty) {
          if (seen.add(code)) rows.add(CodeReaderEntry(code: code, subject: subject, from: from));
          continue;
        }
        final mid = m['id']?.toString() ?? '';
        if (mid.isEmpty) continue;
        try {
          final detail = await _mail.message(id, mid);
          final codes = detail['otpCodes'];
          if (codes is List) {
            for (final c in codes) {
              final s = c.toString();
              if (s.isNotEmpty && seen.add(s)) {
                rows.add(CodeReaderEntry(code: s, subject: subject, from: from));
              }
            }
          }
        } catch (_) {}
      }
      liveCodes.assignAll(rows);
      error.value = '';
    } catch (e) {
      error.value = e.toString();
    }
  }

  Future<void> detectFromPaste(String text, String subject) async {
    loading.value = true;
    error.value = '';
    try {
      final res = await _dev.post('/code-reader/detect', {
        'text': text,
        if (subject.isNotEmpty) 'subject': subject,
      });
      pastePrimary.value = res['primary']?.toString() ?? '';
      if (pastePrimary.value.isEmpty && res['codes'] is List) {
        final list = res['codes'] as List;
        if (list.isNotEmpty) pastePrimary.value = list.first.toString();
      }
    } catch (e) {
      error.value = e.toString();
    } finally {
      loading.value = false;
    }
  }
}
