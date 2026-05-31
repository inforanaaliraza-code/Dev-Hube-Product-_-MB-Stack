import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../core/colors.dart';
import '../../core/html_util.dart';
import '../../core/media_url.dart';
import '../../data/models/blog_model.dart';
import '../cached_app_image.dart';
import '../tool_icon_box.dart';

class BlogPostCard extends StatelessWidget {
  const BlogPostCard({
    super.key,
    required this.post,
    required this.onTap,
    required this.isBookmarked,
    required this.onBookmarkToggle,
    required this.dateLabel,
    required this.readMinutes,
  });

  final BlogModel post;
  final VoidCallback onTap;
  final bool isBookmarked;
  final VoidCallback onBookmarkToggle;
  final String dateLabel;
  final int readMinutes;

  static int estimateReadMinutes(BlogModel post) {
    final text = HtmlUtil.toPlainText(
      post.body.isNotEmpty ? post.body : post.excerpt,
    );
    final words = text.split(RegExp(r'\s+')).where((w) => w.isNotEmpty).length;
    return (words / 200).ceil().clamp(1, 30);
  }

  static String formatDate(String? iso) {
    if (iso == null || iso.isEmpty) return 'Recently';
    try {
      return DateFormat('MMM d, yyyy').format(DateTime.parse(iso));
    } catch (_) {
      return 'Recently';
    }
  }

  Color _accent() => accentColorFor(post.toolAccent ?? 'violet');

  @override
  Widget build(BuildContext context) {
    final accent = _accent();
    final excerpt = HtmlUtil.preview(
      post.excerpt.isNotEmpty ? post.excerpt : post.body,
      maxChars: 140,
    );
    final tag = '${post.toolCategory.toUpperCase()} · ${post.toolName.toUpperCase()}';
    final imageUrl = MediaUrl.resolve(post.featuredImageUrl);
    final iconName = post.toolIcon ?? 'file-text';

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Container(
          decoration: BoxDecoration(
            color: AppColors.muted.withValues(alpha: 0.85),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.border),
          ),
          clipBehavior: Clip.antiAlias,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (imageUrl.isNotEmpty)
                AspectRatio(
                  aspectRatio: 1,
                  child: Container(
                    color: Colors.black.withValues(alpha: 0.28),
                    padding: const EdgeInsets.all(10),
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        Positioned.fill(
                          child: CachedAppImage(
                            url: imageUrl,
                            fit: BoxFit.contain,
                            alignment: Alignment.center,
                            error: _imageFallback(accent, iconName),
                          ),
                        ),
                        Positioned(
                          top: 4,
                          right: 4,
                          child: _bookmarkButton(accent),
                        ),
                      ],
                    ),
                  ),
                )
              else
                Padding(
                  padding: const EdgeInsets.fromLTRB(12, 12, 12, 0),
                  child: Row(
                    children: [
                      ToolIconBox(iconName: iconName, accent: post.toolAccent ?? 'violet', size: 48),
                      const Spacer(),
                      _bookmarkButton(accent),
                    ],
                  ),
                ),
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 14, 16, 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      tag,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 0.8,
                        color: accent,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      post.title,
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 17,
                        fontWeight: FontWeight.w600,
                        height: 1.2,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      excerpt,
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: AppColors.mutedFg,
                        fontSize: 13,
                        height: 1.4,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Icon(Icons.calendar_today_outlined, size: 13, color: accent),
                        const SizedBox(width: 4),
                        Text(
                          dateLabel,
                          style: const TextStyle(fontSize: 11, color: AppColors.mutedFg),
                        ),
                        const SizedBox(width: 14),
                        const Icon(Icons.schedule, size: 13, color: AppColors.mutedFg),
                        const SizedBox(width: 4),
                        Text(
                          '$readMinutes min read',
                          style: const TextStyle(fontSize: 11, color: AppColors.mutedFg),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _bookmarkButton(Color accent) {
    return Material(
      color: Colors.black45,
      shape: const CircleBorder(),
      child: IconButton(
        onPressed: onBookmarkToggle,
        icon: Icon(
          isBookmarked ? Icons.bookmark : Icons.bookmark_border,
          color: isBookmarked ? accent : Colors.white,
        ),
      ),
    );
  }

  Widget _imageFallback(Color accent, String iconName) {
    return Container(
      color: accent.withValues(alpha: 0.2),
      child: Center(
        child: ToolIconBox(iconName: iconName, accent: post.toolAccent ?? 'violet', size: 56),
      ),
    );
  }
}
