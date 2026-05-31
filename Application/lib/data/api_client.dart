import 'package:dio/dio.dart';
import 'package:get_storage/get_storage.dart';
import '../core/api_config.dart';
import '../core/api_failure.dart';
import '../core/constants.dart';
import 'api_parse.dart';

class ApiClient {
  ApiClient(this._box) {
    ensurePlatformDefaults();
    dio = Dio(
      BaseOptions(
        baseUrl: apiBase,
        connectTimeout: const Duration(seconds: 5),
        receiveTimeout: const Duration(seconds: 20),
        headers: {'Accept': 'application/json'},
      ),
    );
  }

  final GetStorage _box;
  late final Dio dio;

  String get apiBase {
    final saved = _box.read<String>(AppConstants.apiBaseKey);
    if (saved != null && saved.trim().isNotEmpty) {
      return saved.trim().replaceAll(RegExp(r'/+$'), '');
    }
    return ApiConfig.defaultForPlatform();
  }

  void ensurePlatformDefaults() {
    final saved = _box.read<String>(AppConstants.apiBaseKey);
    if (saved == null || saved.trim().isEmpty) {
      _persistApiBase(ApiConfig.defaultForPlatform());
      return;
    }
    if (ApiConfig.shouldResetLocalhostUrl(saved)) {
      _persistApiBase(ApiConfig.defaultForPlatform());
    }
  }

  void _persistApiBase(String url) {
    _box.write(
      AppConstants.apiBaseKey,
      url.trim().replaceAll(RegExp(r'/+$'), ''),
    );
  }

  void setApiBase(String url) {
    _persistApiBase(url);
    dio.options.baseUrl = apiBase;
  }

  Future<bool> testConnection({Duration timeout = const Duration(seconds: 4)}) async {
    try {
      await dio
          .get<dynamic>(
            '/health',
            options: Options(
              sendTimeout: timeout,
              receiveTimeout: timeout,
            ),
          )
          .timeout(timeout);
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> checkToolHealth(
    String toolPrefix, {
    Duration timeout = const Duration(seconds: 4),
  }) async {
    try {
      final res = await dio
          .get<dynamic>(
            '/$toolPrefix/health',
            options: Options(
              sendTimeout: timeout,
              receiveTimeout: timeout,
            ),
          )
          .timeout(timeout);
      final map = ApiParse.map(res.data);
      return map['ok'] == true;
    } catch (_) {
      return false;
    }
  }

  Future<T> guard<T>(Future<T> Function() action) async {
    try {
      return await action();
    } on DioException catch (e) {
      throw ApiFailure.fromDio(e, apiBase);
    }
  }

  Future<T> getJson<T>(String path, {Map<String, dynamic>? query}) async {
    return guard(() async {
      final res = await dio.get<dynamic>(path, queryParameters: query);
      return res.data as T;
    });
  }

  Future<List<dynamic>> getList(String path, {Map<String, dynamic>? query}) async {
    final data = await getJson<dynamic>(path, query: query);
    return ApiParse.list(data);
  }

  Future<Map<String, dynamic>> getMap(String path, {Map<String, dynamic>? query}) async {
    final data = await getJson<dynamic>(path, query: query);
    return ApiParse.map(data);
  }

  Future<T> postJson<T>(String path, Map<String, dynamic> body) async {
    return guard(() async {
      final res = await dio.post<dynamic>(
        path,
        data: body,
        options: Options(headers: {'Content-Type': 'application/json'}),
      );
      return res.data as T;
    });
  }

  Future<Map<String, dynamic>> postMultipart(
    String path,
    FormData formData, {
    Map<String, dynamic>? query,
  }) async {
    return guard(() async {
      final res = await dio.post<dynamic>(
        path,
        data: formData,
        queryParameters: query,
      );
      return ApiParse.map(res.data);
    });
  }

  String messageFromError(Object e) {
    if (e is ApiFailure) return e.message;
    if (e is DioException) {
      final data = e.response?.data;
      if (data is Map && data['message'] != null) {
        final m = data['message'];
        if (m is List) return m.join(', ');
        return m.toString();
      }
      if (e.type == DioExceptionType.connectionError ||
          e.error.toString().contains('Connection refused')) {
        if (ApiConfig.isMobileApp() && ApiConfig.usesLocalhost(apiBase)) {
          return 'Cannot use localhost on a phone. Open Settings → set your PC IP '
              '(e.g. http://192.168.1.10:4000/api/v1) or tap Android emulator.';
        }
        return 'Cannot reach backend at $apiBase. Start Backend (pnpm start:dev) '
            'and check Settings URL. Phone and PC must use same Wi‑Fi.';
      }
      return e.message ?? 'Network error';
    }
    return e.toString();
  }
}
