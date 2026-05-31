import 'package:dio/dio.dart';
import 'package:file_picker/file_picker.dart';
import '../api_client.dart';

class WorkerToolsService {
  WorkerToolsService(this._api);

  final ApiClient _api;

  Future<Map<String, dynamic>> uploadSingle(
    String path,
    PlatformFile file, {
    Map<String, dynamic>? query,
    String fieldName = 'file',
  }) async {
    final form = FormData.fromMap({
      fieldName: await MultipartFile.fromFile(file.path!, filename: file.name),
    });
    return _api.postMultipart(path, form, query: query);
  }

  Future<Map<String, dynamic>> uploadMany(
    String path,
    List<PlatformFile> files, {
    Map<String, dynamic>? query,
  }) async {
    final form = FormData();
    for (final f in files) {
      if (f.path == null) continue;
      form.files.add(
        MapEntry(
          'files',
          await MultipartFile.fromFile(f.path!, filename: f.name),
        ),
      );
    }
    return _api.postMultipart(path, form, query: query);
  }
}
