import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/colors.dart';
import '../../widgets/app_logo.dart';
import '../../widgets/gradient_button.dart';
import 'onboarding_controller.dart';
import 'onboarding_slide.dart';

class OnboardingView extends GetView<OnboardingController> {
  const OnboardingView({super.key});

  @override
  Widget build(BuildContext context) {
    final bottomPad = MediaQuery.paddingOf(context).bottom;
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          const _AuroraLayer(),
          SafeArea(
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(8, 4, 16, 0),
                  child: Row(
                    children: [
                      const Spacer(),
                      Obx(
                        () => controller.isLast
                            ? const SizedBox(width: 64)
                            : TextButton(
                                onPressed: controller.skip,
                                child: const Text(
                                  'Skip',
                                  style: TextStyle(color: AppColors.mutedFg),
                                ),
                              ),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: PageView.builder(
                    controller: controller.pageController,
                    onPageChanged: controller.onPageChanged,
                    itemCount: OnboardingController.slideCount,
                    itemBuilder: (_, i) => _SlidePage(
                      slide: controller.slides[i],
                      isFirst: i == 0,
                    ),
                  ),
                ),
                Obx(() => _Dots(count: OnboardingController.slideCount, index: controller.pageIndex.value)),
                const SizedBox(height: 20),
                Padding(
                  padding: EdgeInsets.fromLTRB(24, 0, 24, 16 + bottomPad),
                  child: Obx(
                    () => SizedBox(
                      width: double.infinity,
                      child: GradientButton(
                        label: controller.isLast ? 'Get started' : 'Next',
                        icon: controller.isLast ? Icons.check_rounded : Icons.arrow_forward_rounded,
                        onPressed: controller.next,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _AuroraLayer extends StatelessWidget {
  const _AuroraLayer();

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Positioned(
          top: -80,
          left: -60,
          child: _orb(AppColors.aurora1.withValues(alpha: 0.45), 220),
        ),
        Positioned(
          top: 120,
          right: -40,
          child: _orb(AppColors.aurora3.withValues(alpha: 0.35), 180),
        ),
        Positioned(
          bottom: -60,
          left: MediaQuery.sizeOf(context).width * 0.2,
          child: _orb(AppColors.aurora2.withValues(alpha: 0.3), 200),
        ),
      ],
    );
  }

  Widget _orb(Color color, double size) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(shape: BoxShape.circle, color: color),
    );
  }
}

class _SlidePage extends StatelessWidget {
  const _SlidePage({required this.slide, required this.isFirst});

  final OnboardingSlide slide;
  final bool isFirst;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 28),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          if (isFirst) ...[
            const AppLogo(height: 52),
            const SizedBox(height: 36),
          ] else
            _IconHero(slide: slide),
          if (!isFirst) const SizedBox(height: 40),
          if (isFirst) _IconHero(slide: slide, compact: true),
          const SizedBox(height: 36),
          ShaderMask(
            shaderCallback: (b) => AppColors.gradientText.createShader(b),
            child: Text(
              slide.title,
              textAlign: TextAlign.center,
              style: GoogleFonts.spaceGrotesk(
                fontSize: 32,
                fontWeight: FontWeight.w700,
                color: Colors.white,
                height: 1.1,
              ),
            ),
          ),
          const SizedBox(height: 10),
          Text(
            slide.subtitle,
            textAlign: TextAlign.center,
            style: GoogleFonts.spaceGrotesk(
              fontSize: 17,
              fontWeight: FontWeight.w500,
              color: slide.accent,
            ),
          ),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
            decoration: BoxDecoration(
              color: AppColors.card,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.border),
            ),
            child: Text(
              slide.body,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 15,
                height: 1.55,
                color: AppColors.mutedFg,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _IconHero extends StatelessWidget {
  const _IconHero({required this.slide, this.compact = false});

  final OnboardingSlide slide;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final size = compact ? 88.0 : 140.0;
    final iconSize = compact ? 40.0 : 64.0;
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            slide.accent.withValues(alpha: 0.9),
            slide.secondaryAccent.withValues(alpha: 0.7),
          ],
        ),
        boxShadow: [
          BoxShadow(
            color: slide.accent.withValues(alpha: 0.45),
            blurRadius: compact ? 24 : 40,
            spreadRadius: compact ? 0 : 4,
          ),
        ],
      ),
      child: Icon(slide.icon, size: iconSize, color: Colors.white),
    );
  }
}

class _Dots extends StatelessWidget {
  const _Dots({required this.count, required this.index});

  final int count;
  final int index;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(count, (i) {
        final active = i == index;
        return AnimatedContainer(
          duration: const Duration(milliseconds: 280),
          margin: const EdgeInsets.symmetric(horizontal: 4),
          width: active ? 28 : 8,
          height: 8,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8),
            gradient: active ? AppColors.gradientBtn : null,
            color: active ? null : AppColors.muted,
          ),
        );
      }),
    );
  }
}
