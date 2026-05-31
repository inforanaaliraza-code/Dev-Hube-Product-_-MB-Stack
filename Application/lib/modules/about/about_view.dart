import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/colors.dart';
import '../../core/constants.dart';
import '../../core/responsive.dart';
import '../../widgets/app_logo.dart';
import '../../widgets/gradient_button.dart';

class AboutView extends StatelessWidget {
  const AboutView({super.key});

  @override
  Widget build(BuildContext context) {
    final pad = AppLayout.screenPadding(context);
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Get.back(),
        ),
        title: Text(
          'About Dev Hube',
          style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.w600),
        ),
      ),
      body: ListView(
        padding: EdgeInsets.fromLTRB(pad.left, 8, pad.right, pad.bottom + 24),
        children: [
          const Center(child: AppLogo(height: 72)),
          const SizedBox(height: 16),
          Center(
            child: Text(
              AppConstants.siteName,
              style: GoogleFonts.spaceGrotesk(
                fontSize: 28,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          const SizedBox(height: 6),
          const Center(
            child: Text(
              AppConstants.tagline,
              textAlign: TextAlign.center,
              style: TextStyle(color: AppColors.mutedFg, fontSize: 15, height: 1.4),
            ),
          ),
          const SizedBox(height: 8),
          Center(
            child: Text(
              'Version ${AppConstants.appVersion}',
              style: const TextStyle(color: AppColors.mutedFg, fontSize: 13),
            ),
          ),
          const SizedBox(height: 28),
          _InfoBlock(
            title: 'What is Dev Hube?',
            body:
                'Dev Hube is your mobile gateway to 60+ developer utilities — temp mail, QR codes, formatters, AI tools, security helpers, and more. Everything runs against your self-hosted backend.',
          ),
          const SizedBox(height: 16),
          _InfoBlock(
            title: 'Built for developers',
            body:
                'Fast, private, and offline-friendly where it matters. Connect to your PC backend on the same Wi‑Fi or use the Android emulator preset in Settings.',
          ),
          const SizedBox(height: 24),
          GradientButton(
            label: 'Got it',
            expand: true,
            onPressed: () => Get.back(),
          ),
        ],
      ),
    );
  }
}

class _InfoBlock extends StatelessWidget {
  const _InfoBlock({required this.title, required this.body});

  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.muted.withValues(alpha: 0.85),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: GoogleFonts.spaceGrotesk(
              fontSize: 17,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            body,
            style: const TextStyle(
              color: AppColors.mutedFg,
              fontSize: 14,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }
}
