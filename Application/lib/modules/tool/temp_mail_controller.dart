import 'dart:async';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import '../../core/app_error.dart';
import '../../data/api_client.dart';
import '../../core/temp_mail_session.dart';
import '../../data/services/temp_mail_service.dart';

class TempMailController extends GetxController {
  final loading = true.obs;
  final creating = false.obs;
  final refreshing = false.obs;
  final error = ''.obs;
  final errorScope = AppErrorScope.unknown.obs;
  final domains = <String>[].obs;
  final selectedDomain = ''.obs;
  final localPart = ''.obs;
  final address = ''.obs;
  final mailboxId = ''.obs;
  final messages = <Map<String, dynamic>>[].obs;
  final selectedMessageId = ''.obs;
  final messageDetail = Rxn<Map<String, dynamic>>();

  TempMailService get _mail => Get.find();
  ApiClient get _api => Get.find();

  Timer? _poll;

  @override
  void onInit() {
    super.onInit();
    _bootstrap();
  }

  @override
  void onClose() {
    _poll?.cancel();
    super.onClose();
  }

  void clearError() {
    error.value = '';
    errorScope.value = AppErrorScope.unknown;
  }

  void setErrorFrom(Object e) {
    final info = AppErrorInfo.from(e, _api);
    error.value = info.message;
    errorScope.value = info.scope;
  }

  Future<void> _bootstrap() async {
    loading.value = true;
    clearError();
    try {
      domains.assignAll(await _mail.domains());
      if (domains.isNotEmpty) selectedDomain.value = domains.first;
    } catch (e) {
      setErrorFrom(e);
    } finally {
      loading.value = false;
    }
  }

  Future<void> createMailbox() async {
    creating.value = true;
    clearError();
    try {
      final res = await _mail.createMailbox(
        domain: selectedDomain.value.isEmpty ? null : selectedDomain.value,
        localPart: localPart.value.trim().isEmpty ? null : localPart.value.trim(),
      );
      mailboxId.value = res['id']?.toString() ?? '';
      address.value = res['address']?.toString() ?? '';
      if (mailboxId.value.isNotEmpty) {
        TempMailSession.save(id: mailboxId.value, address: address.value);
      }
      await refreshMessages();
      _startPoll();
    } catch (e) {
      setErrorFrom(e);
    } finally {
      creating.value = false;
    }
  }

  void _startPoll() {
    _poll?.cancel();
    _poll = Timer.periodic(const Duration(seconds: 8), (_) => refreshMessages());
  }

  Future<void> refreshMessages() async {
    if (mailboxId.value.isEmpty) return;
    refreshing.value = true;
    try {
      messages.assignAll(await _mail.messages(mailboxId.value));
    } catch (e) {
      setErrorFrom(e);
    } finally {
      refreshing.value = false;
    }
  }

  Future<void> openMessage(String id) async {
    selectedMessageId.value = id;
    try {
      messageDetail.value = await _mail.message(mailboxId.value, id);
    } catch (e) {
      setErrorFrom(e);
    }
  }

  Future<void> copyAddress() async {
    if (address.value.isEmpty) return;
    await Clipboard.setData(ClipboardData(text: address.value));
    Get.snackbar('Copied', 'Email address copied');
  }

  Future<void> deleteMailbox() async {
    if (mailboxId.value.isEmpty) return;
    try {
      await _mail.deleteMailbox(mailboxId.value);
      mailboxId.value = '';
      address.value = '';
      TempMailSession.clear();
      messages.clear();
      messageDetail.value = null;
      _poll?.cancel();
      clearError();
    } catch (e) {
      setErrorFrom(e);
    }
  }
}
