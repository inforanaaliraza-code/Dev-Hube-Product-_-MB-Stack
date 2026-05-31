import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import '../../core/constants.dart';
import '../../core/colors.dart';
import '../../core/routes.dart';
import 'onboarding_slide.dart';

class OnboardingController extends GetxController {
  final pageIndex = 0.obs;
  late final PageController pageController;

  static const slideCount = 5;

  final slides = const [
    OnboardingSlide(
      title: 'Dev Hube',
      subtitle: 'The developer\'s utility hub',
      body: 'Encode, convert, test APIs, and ship faster one premium app for every dev workflow.',
      icon: Icons.hub_outlined,
      accent: AppColors.primary,
      secondaryAccent: AppColors.aurora2,
    ),
    OnboardingSlide(
      title: '50+ tools',
      subtitle: 'One place for everything',
      body: 'JSON, PDF, security, AI helpers, generators, and more browse by category or search instantly.',
      icon: Icons.apps_rounded,
      accent: AppColors.aurora2,
      secondaryAccent: AppColors.primary,
    ),
    OnboardingSlide(
      title: 'API Tester',
      subtitle: 'Postman-style, built in',
      body: 'Send REST requests, inspect responses, and debug endpoints without leaving Dev Hube.',
      icon: Icons.send_rounded,
      accent: AppColors.aurora3,
      secondaryAccent: AppColors.primary,
    ),
    OnboardingSlide(
      title: 'Powered by your stack',
      subtitle: 'Backend + workers',
      body: 'NestJS API on your network. Heavy jobs run on Python workers same power as the website.',
      icon: Icons.cloud_sync_outlined,
      accent: AppColors.aurora1,
      secondaryAccent: AppColors.aurora2,
    ),
    OnboardingSlide(
      title: 'You\'re set',
      subtitle: 'Start building',
      body: 'Set your API URL in Settings if needed, then explore trending tools on Home.',
      icon: Icons.rocket_launch_rounded,
      accent: AppColors.primary,
      secondaryAccent: AppColors.aurora3,
    ),
  ];

  bool get isLast => pageIndex.value >= slideCount - 1;

  @override
  void onInit() {
    super.onInit();
    pageController = PageController();
  }

  @override
  void onClose() {
    pageController.dispose();
    super.onClose();
  }

  void onPageChanged(int i) => pageIndex.value = i;

  void next() {
    if (isLast) {
      finish();
      return;
    }
    pageController.nextPage(
      duration: const Duration(milliseconds: 420),
      curve: Curves.easeOutCubic,
    );
  }

  void skip() => finish();

  void finish() {
    GetStorage().write(AppConstants.onboardingDoneKey, true);
    Get.offNamed(AppRoutes.shell);
  }
}
