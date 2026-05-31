import 'package:dio/dio.dart';
import 'api_config.dart';

enum ApiFailureKind { network, timeout, server, client, unknown }

class ApiFailure implements Exception {
  ApiFailure({
    required this.message,
    this.kind = ApiFailureKind.unknown,
    this.statusCode,
  });

  final String message;
  final ApiFailureKind kind;
  final int? statusCode;

  factory ApiFailure.fromDio(DioException e, String apiBase) {
    final data = e.response?.data;
    if (data is Map && data['message'] != null) {
      final m = data['message'];
      final text = m is List ? m.join(', ') : m.toString();
      return ApiFailure(
        message: text,
        kind: _kindFromStatus(e.response?.statusCode),
        statusCode: e.response?.statusCode,
      );
    }
    if (e.type == DioExceptionType.connectionError ||
        e.error.toString().contains('Connection refused')) {
      if (ApiConfig.isMobileApp() && ApiConfig.usesLocalhost(apiBase)) {
        return ApiFailure(
          message:
              'Cannot use localhost on a phone. Open Settings → set your PC IP '
              '(e.g. http://192.168.1.10:4000/api/v1) or tap Android emulator.',
          kind: ApiFailureKind.network,
        );
      }
      return ApiFailure(
        message:
            'Cannot reach backend at $apiBase. Start Backend (pnpm start:dev) '
            'and check Settings URL. Phone and PC must use same Wi‑Fi.',
        kind: ApiFailureKind.network,
      );
    }
    if (e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.receiveTimeout ||
        e.type == DioExceptionType.sendTimeout) {
      return ApiFailure(
        message: 'Request timed out. Check your connection and try again.',
        kind: ApiFailureKind.timeout,
      );
    }
    return ApiFailure(
      message: e.message ?? 'Network error',
      kind: _kindFromStatus(e.response?.statusCode),
      statusCode: e.response?.statusCode,
    );
  }

  static ApiFailureKind _kindFromStatus(int? code) {
    if (code == null) return ApiFailureKind.unknown;
    if (code >= 500) return ApiFailureKind.server;
    if (code >= 400) return ApiFailureKind.client;
    return ApiFailureKind.unknown;
  }
}
