import 'package:flutter/material.dart';
import '../core/colors.dart';

class CachedAppImage extends StatelessWidget {
  const CachedAppImage({
    super.key,
    required this.url,
    this.fit = BoxFit.contain,
    this.width,
    this.height,
    this.alignment = Alignment.center,
    this.error,
  });

  final String url;
  final BoxFit fit;
  final double? width;
  final double? height;
  final Alignment alignment;
  final Widget? error;

  static int? _cachePixels(double? logical, double dpr, double screenFallback) {
    final base = (logical != null && logical.isFinite && logical > 0)
        ? logical
        : screenFallback;
    if (!base.isFinite || base <= 0) return null;
    final px = (base * dpr).round();
    if (!px.isFinite || px <= 0) return null;
    return px.clamp(120, 1600);
  }

  @override
  Widget build(BuildContext context) {
    if (url.isEmpty) return error ?? const SizedBox.shrink();

    final media = MediaQuery.sizeOf(context);
    final dpr = MediaQuery.devicePixelRatioOf(context);
    final cacheW = _cachePixels(width, dpr, media.width);
    final cacheH = _cachePixels(height, dpr, media.width);

    final layoutW = width != null && width!.isFinite ? width : null;
    final layoutH = height != null && height!.isFinite ? height : null;

    return Image.network(
      url,
      fit: fit,
      width: layoutW,
      height: layoutH,
      alignment: alignment,
      cacheWidth: cacheW,
      cacheHeight: cacheH,
      filterQuality: FilterQuality.medium,
      gaplessPlayback: true,
      errorBuilder: (_, __, ___) =>
          error ??
          const Center(
            child: Icon(Icons.broken_image_outlined, color: AppColors.mutedFg),
          ),
      loadingBuilder: (context, child, progress) {
        if (progress == null) return child;
        return Center(
          child: SizedBox(
            width: 28,
            height: 28,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              color: AppColors.primary.withValues(alpha: 0.7),
              value: progress.expectedTotalBytes != null
                  ? progress.cumulativeBytesLoaded / progress.expectedTotalBytes!
                  : null,
            ),
          ),
        );
      },
    );
  }
}
