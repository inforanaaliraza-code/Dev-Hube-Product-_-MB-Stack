import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/colors.dart';

class BlogHero extends StatelessWidget {
  const BlogHero({super.key});

  @override
  Widget build(BuildContext context) {
    final narrow = MediaQuery.sizeOf(context).width < 400;
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 4, 16, 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Blog',
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: narrow ? 26 : 30,
                    fontWeight: FontWeight.w700,
                    height: 1.05,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Insights, tutorials and guides to help you build faster.',
                  style: TextStyle(
                    color: AppColors.mutedFg,
                    fontSize: 14,
                    height: 1.45,
                  ),
                ),
              ],
            ),
          ),
          if (!narrow) ...[
            const SizedBox(width: 8),
            const _BlogHeroVisual(),
          ],
        ],
      ),
    );
  }
}

class _BlogHeroVisual extends StatelessWidget {
  const _BlogHeroVisual();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 88,
      height: 100,
      child: Stack(
        alignment: Alignment.center,
        children: [
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: AppColors.primary.withValues(alpha: 0.45),
                  blurRadius: 24,
                ),
              ],
            ),
          ),
          ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 8, sigmaY: 8),
              child: Container(
                width: 80,
                height: 88,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      AppColors.primary.withValues(alpha: 0.35),
                      AppColors.aurora2.withValues(alpha: 0.15),
                    ],
                  ),
                  border: Border.all(color: AppColors.border),
                ),
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    const Icon(Icons.article_outlined, size: 36, color: Colors.white70),
                    Positioned(
                      right: 10,
                      bottom: 14,
                      child: Icon(
                        Icons.edit_note,
                        size: 22,
                        color: AppColors.aurora2.withValues(alpha: 0.9),
                      ),
                    ),
                    Positioned(
                      left: 12,
                      top: 16,
                      child: Text(
                        '</>',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: AppColors.primary.withValues(alpha: 0.9),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
