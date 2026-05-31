import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../core/colors.dart';
import '../../core/media_url.dart';
import '../../core/html_util.dart';
import '../../core/responsive.dart';
import '../../data/models/blog_model.dart';
import '../../widgets/app_error_state.dart';
import '../../widgets/aurora_background.dart';
import '../../widgets/cached_app_image.dart';
import '../../widgets/glass_card.dart';
import '../../widgets/responsive_body.dart';

class BlogDetailView extends StatelessWidget {
  const BlogDetailView({super.key});

  @override
  Widget build(BuildContext context) {
    final post = Get.arguments as BlogModel?;
    if (post == null) {
      return Scaffold(
        appBar: AppBar(),
        body: const AppErrorState(
          message: 'Post not found',
          showSettings: false,
        ),
      );
    }
    final body = HtmlUtil.toPlainText(
      post.body.isNotEmpty ? post.body : post.excerpt,
    );
    final imageUrl = MediaUrl.resolve(post.featuredImageUrl);
    return AuroraBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => Get.back()),
          title: Text(post.toolName, overflow: TextOverflow.ellipsis),
        ),
        body: ResponsiveBody(
          child: ListView(
            padding: AppLayout.screenPadding(context),
            children: [
              if (imageUrl.isNotEmpty) ...[
                ClipRRect(
                  borderRadius: BorderRadius.circular(16),
                  child: AspectRatio(
                    aspectRatio: 1,
                    child: Container(
                      color: Colors.black.withValues(alpha: 0.28),
                      padding: const EdgeInsets.all(12),
                      child: CachedAppImage(
                        url: imageUrl,
                        fit: BoxFit.contain,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
              ],
              Text(
                '${post.toolCategory} · ${post.toolName}',
                style: const TextStyle(fontSize: 12, color: AppColors.mutedFg),
              ),
              const SizedBox(height: 8),
              Text(
                post.title,
                style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w600, height: 1.2),
              ),
              const SizedBox(height: 16),
              GlassCard(
                child: SelectableText(
                  body,
                  style: const TextStyle(fontSize: 15, height: 1.6),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
