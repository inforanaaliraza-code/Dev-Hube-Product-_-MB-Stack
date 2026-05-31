import 'dart:async';

import 'package:file_picker/file_picker.dart';
import 'package:get/get.dart';
import '../../core/app_error.dart';
import '../../core/offline_controller.dart';
import '../../data/api_client.dart';
import '../../data/models/blog_model.dart';
import '../../data/models/tool_model.dart';
import '../../data/blog_repository.dart';
import '../../data/offline_store.dart';
import '../../data/tools_repository.dart';
import '../../data/services/devtools_service.dart';
import '../../data/services/qr_service.dart';
import '../../data/services/tools_service.dart';
import '../../data/services/worker_tools_service.dart';
import '../../data/tool_config.dart';
import 'tool_runner.dart';

class ToolController extends GetxController {
  final slug = ''.obs;
  final loading = true.obs;
  final running = false.obs;
  final error = ''.obs;
  final errorScope = AppErrorScope.unknown.obs;
  final backendReachable = false.obs;
  final tool = Rxn<ToolModel>();
  final blog = Rxn<BlogModel>();
  final blogExpanded = false.obs;
  final input = ''.obs;
  final input2 = ''.obs;
  final fieldUrl = ''.obs;
  final output = ''.obs;
  final qrImageBase64 = ''.obs;
  final resultImageBase64 = ''.obs;
  final resultFileBase64 = ''.obs;
  final resultFileName = 'output.bin'.obs;
  final mode = 'encode'.obs;
  final passwordLength = 16.obs;
  final numericOption = 80.obs;
  final pickedFiles = <PlatformFile>[].obs;
  final previewHtml = ''.obs;
  final thumbnailUrls = <String, String>{}.obs;
  final hashResults = <String, String>{}.obs;
  final paletteColors = <String>[].obs;
  final paletteGradient = ''.obs;
  final paletteCssVars = ''.obs;
  final workerOk = Rxn<bool>();
  final pwUpper = true.obs;
  final pwLower = true.obs;
  final pwNumbers = true.obs;
  final pwSymbols = true.obs;
  final pwStrength = ''.obs;
  final resumeSummary = ''.obs;
  final resumeExperience = ''.obs;
  final resumeSkills = ''.obs;
  final resumeEducation = ''.obs;
  final apiHeadersText = ''.obs;
  final apiAuthType = 'none'.obs;
  final apiBearerToken = ''.obs;
  final apiResponseStatus = Rxn<int>();
  final apiResponseDuration = Rxn<int>();
  final encryptPassword = ''.obs;
  final qrMode = 'static'.obs;
  final speedTestDone = false.obs;
  final speedRating = ''.obs;
  final speedTotalMs = 0.obs;
  final speedStatusCode = 0.obs;
  final speedDownloadKb = 0.0.obs;
  final speedThroughput = 0.obs;
  final apiHistoryEpoch = 0.obs;

  ToolsService get _tools => Get.find();
  ToolsRepository get _catalog => Get.find();
  BlogRepository get _blogs => Get.find();
  DevtoolsService get dev => Get.find();
  QrService get qr => Get.find();
  WorkerToolsService get worker => Get.find();
  ApiClient get api => Get.find();

  ToolKind get kind => ToolConfig.kindForSlug(slug.value);
  ToolUiLayout get layout => ToolConfig.layoutFor(kind);

  bool get needsWorker => ToolErrorHints.needsWorker(kind);

  String? get workerBannerMessage {
    if (!needsWorker) return null;
    if (!backendReachable.value) {
      return ToolErrorHints.workerOffline(kind, backendReachable: false);
    }
    if (workerOk.value != false) return null;
    return ToolErrorHints.workerOffline(kind, backendReachable: true);
  }

  @override
  void onInit() {
    super.onInit();
    slug.value = Get.parameters['slug'] ?? '';
    _initMode();
    load();
  }

  void clearError() {
    error.value = '';
    errorScope.value = AppErrorScope.unknown;
  }

  void setErrorFrom(Object e) {
    final info = AppErrorInfo.from(e, api);
    error.value = info.message;
    errorScope.value = info.scope;
  }

  void setValidationError(String message) {
    error.value = message;
    errorScope.value = AppErrorScope.validation;
  }

  void _initMode() {
    switch (kind) {
      case ToolKind.password:
        mode.value = 'generate';
        break;
      case ToolKind.splitPdf:
        mode.value = 'inspect';
        break;
      case ToolKind.imageConverter:
        mode.value = 'png';
        break;
      case ToolKind.apiTester:
        mode.value = 'GET';
        apiAuthType.value = 'none';
        break;
      case ToolKind.qrGenerator:
        qrMode.value = 'static';
        break;
      case ToolKind.paletteGenerator:
        mode.value = 'complementary';
        break;
      case ToolKind.aiCode:
        mode.value = 'typescript';
        break;
      case ToolKind.sqlFormatter:
        mode.value = 'postgresql';
        break;
      case ToolKind.jsonFormat:
        mode.value = 'format';
        break;
      case ToolKind.timestamp:
        mode.value = 'toDate';
        break;
      case ToolKind.caseConvert:
        mode.value = 'camel';
        break;
      case ToolKind.unitConverter:
        mode.value = 'px-rem';
        break;
      case ToolKind.localFormat:
        if (slug.value == 'encrypt-decrypt') {
          mode.value = 'encrypt';
        } else if (slug.value == 'string-utilities') {
          mode.value = 'trim';
        } else if (slug.value == 'json-to-code') {
          mode.value = 'typescript';
        } else {
          mode.value = 'encode';
        }
        break;
      default:
        mode.value = 'encode';
        break;
    }
  }

  String? get workerHealthPath {
    switch (kind) {
      case ToolKind.tempMail:
        return 'temp-mail';
      case ToolKind.imageCompressor:
        return 'image-compressor';
      case ToolKind.pdfToWord:
        return 'pdf-to-word';
      case ToolKind.mergePdf:
        return 'merge-pdf';
      case ToolKind.splitPdf:
        return 'split-pdf';
      case ToolKind.compressPdf:
        return 'compress-pdf';
      case ToolKind.imageToText:
        return 'image-to-text';
      case ToolKind.speechToText:
        return 'speech-to-text';
      case ToolKind.imageConverter:
        return 'image-converter';
      case ToolKind.aiCode:
        return 'ai-code-generator';
      case ToolKind.aiResume:
        return 'ai-resume-builder';
      case ToolKind.aiParaphrase:
        return 'ai-paraphrase';
      case ToolKind.aiHumanizer:
        return 'ai-humanizer';
      case ToolKind.qrGenerator:
        return 'qr-generator';
      case ToolKind.paletteGenerator:
        return 'palette-generator';
      case ToolKind.youtubeThumbnail:
        return 'youtube-thumbnail';
      default:
        return null;
    }
  }

  Future<void> _checkWorkerHealth() async {
    final path = workerHealthPath;
    if (path == null) {
      workerOk.value = null;
      return;
    }
    backendReachable.value = await api.testConnection();
    if (!backendReachable.value) {
      workerOk.value = null;
      return;
    }
    workerOk.value = await api.checkToolHealth(path);
  }

  void _primeFromCache() {
    final s = slug.value;
    final cached = _catalog.findBySlug(s);
    if (cached == null) return;
    tool.value = cached;
    blog.value = _blogs.peekToolBlog(s);
    loading.value = false;
    backendReachable.value = false;
    workerOk.value = null;
    if (Get.isRegistered<OfflineController>()) {
      Get.find<OfflineController>().setOffline(
        true,
        syncedAt: Get.find<OfflineStore>().lastSyncedAt(),
      );
    }
  }

  Future<void> load() async {
    clearError();
    input.value = '';
    input2.value = '';
    fieldUrl.value = '';
    output.value = '';
    previewHtml.value = '';
    thumbnailUrls.clear();
    hashResults.clear();
    paletteColors.clear();
    speedTestDone.value = false;
    speedRating.value = '';
    speedTotalMs.value = 0;
    speedStatusCode.value = 0;
    speedDownloadKb.value = 0;
    speedThroughput.value = 0;
    qrImageBase64.value = '';
    resultImageBase64.value = '';
    resultFileBase64.value = '';
    pickedFiles.clear();
    workerOk.value = null;
    _initMode();
    _primeFromCache();
    if (tool.value == null) loading.value = true;

    try {
      ToolModel? loadedTool;
      try {
        loadedTool =
            await _tools.fetchTool(slug.value).timeout(const Duration(seconds: 5));
        backendReachable.value = true;
      } catch (_) {
        loadedTool = _catalog.findBySlug(slug.value);
        if (loadedTool == null) rethrow;
        backendReachable.value = false;
      }
      tool.value = loadedTool;
      blog.value = await _blogs.loadToolBlog(slug.value);
      if (needsWorker) await _checkWorkerHealth();
      if (backendReachable.value && Get.isRegistered<OfflineController>()) {
        Get.find<OfflineController>().markOnline();
      }
    } catch (e) {
      final cached = _catalog.findBySlug(slug.value);
      if (cached != null) {
        tool.value = cached;
        blog.value = _blogs.peekToolBlog(slug.value);
        workerOk.value = null;
        backendReachable.value = false;
        if (Get.isRegistered<OfflineController>()) {
          Get.find<OfflineController>().setOffline(
            true,
            syncedAt: Get.find<OfflineStore>().lastSyncedAt(),
          );
        }
        clearError();
      } else {
        setErrorFrom(e);
      }
    } finally {
      loading.value = false;
    }
  }

  Future<void> pickFiles({bool multiple = false, List<String>? extensions}) async {
    final result = await FilePicker.platform.pickFiles(
      allowMultiple: multiple,
      type: extensions != null ? FileType.custom : FileType.any,
      allowedExtensions: extensions,
      withData: false,
    );
    if (result != null && result.files.isNotEmpty) {
      pickedFiles.assignAll(result.files);
      clearError();
    }
  }

  void clearFiles() => pickedFiles.clear();

  Future<void> run() async {
    if (Get.isRegistered<OfflineController>() &&
        Get.find<OfflineController>().isOffline.value &&
        !ToolConfig.worksOffline(kind)) {
      error.value = ToolErrorHints.offlineToolRun(kind);
      errorScope.value = AppErrorScope.offline;
      return;
    }
    if (needsWorker && workerOk.value == false) {
      error.value = workerBannerMessage ?? ToolErrorHints.workerOffline(kind, backendReachable: backendReachable.value);
      errorScope.value = AppErrorScope.worker;
      return;
    }
    if (needsWorker && !backendReachable.value) {
      error.value = ToolErrorHints.workerOffline(kind, backendReachable: false);
      errorScope.value = AppErrorScope.network;
      return;
    }

    running.value = true;
    clearError();
    try {
      await ToolRunner.execute(this);
    } catch (e) {
      setErrorFrom(e);
    } finally {
      running.value = false;
    }
  }
}
