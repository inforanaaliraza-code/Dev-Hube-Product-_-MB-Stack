import 'api_failure.dart';
import '../data/api_client.dart';
import '../data/tool_config.dart';

enum AppErrorScope { network, timeout, server, client, worker, offline, validation, unknown }

extension AppErrorScopeX on AppErrorScope {
  ApiFailureKind? get apiFailureKind => switch (this) {
        AppErrorScope.network || AppErrorScope.offline => ApiFailureKind.network,
        AppErrorScope.timeout => ApiFailureKind.timeout,
        AppErrorScope.server => ApiFailureKind.server,
        AppErrorScope.client => ApiFailureKind.client,
        _ => ApiFailureKind.unknown,
      };
}

class AppErrorInfo {
  const AppErrorInfo({
    required this.message,
    this.scope = AppErrorScope.unknown,
    this.statusCode,
  });

  final String message;
  final AppErrorScope scope;
  final int? statusCode;

  static AppErrorInfo from(Object e, ApiClient api) {
    if (e is ApiFailure) {
      return AppErrorInfo(
        message: e.message,
        scope: _scopeFromKind(e.kind),
        statusCode: e.statusCode,
      );
    }
    return AppErrorInfo(
      message: api.messageFromError(e),
      scope: AppErrorScope.unknown,
    );
  }

  static AppErrorScope _scopeFromKind(ApiFailureKind kind) {
    switch (kind) {
      case ApiFailureKind.network:
        return AppErrorScope.network;
      case ApiFailureKind.timeout:
        return AppErrorScope.timeout;
      case ApiFailureKind.server:
        return AppErrorScope.server;
      case ApiFailureKind.client:
        return AppErrorScope.client;
      case ApiFailureKind.unknown:
        return AppErrorScope.unknown;
    }
  }
}

class ToolErrorHints {
  static bool needsWorker(ToolKind kind) => switch (kind) {
        ToolKind.tempMail ||
        ToolKind.imageCompressor ||
        ToolKind.pdfToWord ||
        ToolKind.mergePdf ||
        ToolKind.splitPdf ||
        ToolKind.compressPdf ||
        ToolKind.imageToText ||
        ToolKind.speechToText ||
        ToolKind.imageConverter ||
        ToolKind.aiCode ||
        ToolKind.aiResume ||
        ToolKind.aiParaphrase ||
        ToolKind.aiHumanizer ||
        ToolKind.qrGenerator ||
        ToolKind.paletteGenerator ||
        ToolKind.youtubeThumbnail =>
          true,
        _ => false,
      };

  static String workerOffline(ToolKind kind, {required bool backendReachable}) {
    if (!backendReachable) {
      return 'Backend is not reachable. Open Settings → set your PC API URL (same Wi‑Fi), start Backend (pnpm start:dev), then tap Retry.';
    }
    final service = _workerLabel(kind);
    return 'Start the $service worker on your PC (Services folder), keep Backend running, then tap Generate again.';
  }

  static String _workerLabel(ToolKind kind) => switch (kind) {
        ToolKind.tempMail => 'temp-mail',
        ToolKind.imageCompressor => 'image-compressor',
        ToolKind.pdfToWord => 'pdf-to-word',
        ToolKind.mergePdf => 'merge-pdf',
        ToolKind.splitPdf => 'split-pdf',
        ToolKind.compressPdf => 'compress-pdf',
        ToolKind.imageToText => 'image-to-text',
        ToolKind.speechToText => 'speech-to-text',
        ToolKind.imageConverter => 'image-converter',
        ToolKind.aiCode => 'ai-code-generator',
        ToolKind.aiResume => 'ai-resume-builder',
        ToolKind.aiParaphrase => 'ai-paraphrase',
        ToolKind.aiHumanizer => 'ai-humanizer',
        ToolKind.qrGenerator => 'qr-generator',
        ToolKind.paletteGenerator => 'palette-generator',
        ToolKind.youtubeThumbnail => 'youtube-thumbnail',
        _ => 'tool',
      };

  static String offlineToolRun(ToolKind kind) {
    if (ToolConfig.worksOffline(kind)) {
      return 'You are offline. This formatter runs on-device; server tools need a connection.';
    }
    return 'You are offline. Connect to the backend in Settings to use this tool.';
  }
}
