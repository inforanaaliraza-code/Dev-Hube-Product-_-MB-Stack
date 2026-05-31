import 'package:get/get.dart';
import '../data/api_client.dart';
import 'api_failure.dart';
import 'app_error.dart';

mixin AsyncLoadMixin on GetxController {
  ApiClient get apiClient => Get.find<ApiClient>();

  Future<void> runGuarded(
    Future<void> Function() action, {
    required RxBool loading,
    required RxString error,
    Rx<AppErrorScope>? errorScope,
    bool clearError = true,
  }) async {
    loading.value = true;
    if (clearError) {
      error.value = '';
      errorScope?.value = AppErrorScope.unknown;
    }
    try {
      await action();
      if (clearError) {
        error.value = '';
        errorScope?.value = AppErrorScope.unknown;
      }
    } on ApiFailure catch (e) {
      error.value = e.message;
      errorScope?.value = AppErrorInfo.from(e, apiClient).scope;
    } catch (e) {
      final info = AppErrorInfo.from(e, apiClient);
      error.value = info.message;
      errorScope?.value = info.scope;
    } finally {
      loading.value = false;
    }
  }

  String messageFrom(Object e) => AppErrorInfo.from(e, apiClient).message;
}
