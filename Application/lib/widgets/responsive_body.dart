import 'package:flutter/material.dart';
import '../core/responsive.dart';

class ResponsiveBody extends StatelessWidget {
  const ResponsiveBody({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.topCenter,
      child: ConstrainedBox(
        constraints: BoxConstraints(
          maxWidth: AppLayout.maxContentWidth(context),
        ),
        child: child,
      ),
    );
  }
}
