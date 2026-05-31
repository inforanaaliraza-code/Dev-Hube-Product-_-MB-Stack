import 'package:flutter/material.dart';
import '../core/app_error.dart';
import 'app_error_state.dart';

class ConnectionErrorCard extends StatelessWidget {
  const ConnectionErrorCard({
    super.key,
    required this.message,
    this.onRetry,
    this.scope,
  });

  final String message;
  final VoidCallback? onRetry;
  final AppErrorScope? scope;

  @override
  Widget build(BuildContext context) {
    return AppErrorState(
      message: message,
      onRetry: onRetry,
      kind: scope?.apiFailureKind,
    );
  }
}
