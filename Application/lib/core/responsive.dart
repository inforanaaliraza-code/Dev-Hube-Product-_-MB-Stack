import 'package:flutter/material.dart';

class AppLayout {
  static int gridColumns(double width) {
    if (width >= 900) return 4;
    if (width >= 600) return 3;
    return 2;
  }

  static double maxContentWidth(BuildContext context) {
    final w = MediaQuery.sizeOf(context).width;
    if (w >= 1200) return 1080;
    if (w >= 900) return 920;
    if (w >= 600) return 680;
    return w;
  }

  static bool isTablet(BuildContext context) => MediaQuery.sizeOf(context).width >= 600;

  static bool isWide(BuildContext context) => MediaQuery.sizeOf(context).width >= 900;

  static EdgeInsets toolScreenPadding(BuildContext context) {
    final base = screenPadding(context);
    final extra = isTablet(context) ? 4.0 : 0.0;
    return EdgeInsets.fromLTRB(
      base.left + extra,
      base.top,
      base.right + extra,
      base.bottom,
    );
  }

  static double _textScale(BuildContext context) {
    return MediaQuery.textScalerOf(context).scale(1.0);
  }

  static double homeCardHeight(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    final scale = _textScale(context);
    final scaler = MediaQuery.textScalerOf(context);
    final pad = 24.0;
    final header = scaler.scale(40) + 10;
    final title = scaler.scale(14) * 1.15 * 2 + 6;
    final tagline = scaler.scale(11) * 1.25 * 2 + 6;
    final computed = pad + header + title + tagline;
    final floor = width < 360 ? 128.0 : 132.0;
    final scaledFloor = floor + (scale - 1.0) * 56;
    return computed.clamp(scaledFloor, 220);
  }

  static double toolCardHeight(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    final scale = _textScale(context);
    final scaler = MediaQuery.textScalerOf(context);
    final pad = 20.0;
    final header = scaler.scale(38) + 12;
    final title = scaler.scale(14) * 1.12 * 2 + 6;
    final tagline = scaler.scale(11) * 1.22 * 2 + 6;
    final computed = pad + header + title + tagline;
    final floor = width < 360 ? 142.0 : 148.0;
    final scaledFloor = floor + (scale - 1.0) * 64;
    return computed.clamp(scaledFloor, 240);
  }

  static EdgeInsets screenPadding(BuildContext context) {
    final media = MediaQuery.of(context);
    final w = media.size.width;
    final hPad = w >= 600 ? 24.0 : 16.0;
    return EdgeInsets.fromLTRB(hPad, 4, hPad, 12);
  }

  static double bottomInset(BuildContext context) {
    return MediaQuery.paddingOf(context).bottom + 88;
  }
}
