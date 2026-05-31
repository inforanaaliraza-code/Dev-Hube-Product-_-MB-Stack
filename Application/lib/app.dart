import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'bindings/initial_binding.dart';
import 'bindings/onboarding_binding.dart';
import 'bindings/shell_binding.dart';
import 'bindings/tool_binding.dart';
import 'core/app_preferences.dart';
import 'core/constants.dart';
import 'core/routes.dart';
import 'core/theme.dart';
import 'core/theme_controller.dart';
import 'modules/about/about_view.dart';
import 'modules/blog/blog_detail_view.dart';
import 'core/notifications_controller.dart';
import 'modules/notifications/notifications_view.dart';
import 'modules/search/tool_search_view.dart';
import 'modules/search/tool_search_controller.dart';
import 'modules/onboarding/onboarding_view.dart';
import 'modules/shell/shell_view.dart';
import 'modules/tool/tool_view.dart';

class DevHubeApp extends StatelessWidget {
  const DevHubeApp({super.key});

  @override
  Widget build(BuildContext context) {
    final onboardingDone =
        GetStorage().read(AppConstants.onboardingDoneKey) == true;
    final theme = Get.find<ThemeController>();
    return Obx(
      () => GetMaterialApp(
        title: 'Dev Hube',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light(),
        darkTheme: AppTheme.dark(),
        themeMode: theme.materialThemeMode,
        initialBinding: InitialBinding(),
        initialRoute: onboardingDone ? AppRoutes.shell : AppRoutes.onboarding,
        builder: (context, child) {
          final prefs = Get.find<AppPreferences>();
          return Obx(
            () => MediaQuery(
              data: MediaQuery.of(context).copyWith(
                textScaler: TextScaler.linear(prefs.textScale),
              ),
              child: child ?? const SizedBox.shrink(),
            ),
          );
        },
        getPages: [
          GetPage(
            name: AppRoutes.onboarding,
            page: () => const OnboardingView(),
            binding: OnboardingBinding(),
          ),
          GetPage(
            name: AppRoutes.shell,
            page: () => const ShellView(),
            binding: ShellBinding(),
          ),
          GetPage(
            name: '${AppRoutes.tool}/:slug',
            page: () => const ToolView(),
            binding: ToolBinding(),
          ),
          GetPage(
            name: '${AppRoutes.blogDetail}/:slug',
            page: () => const BlogDetailView(),
          ),
          GetPage(
            name: AppRoutes.about,
            page: () => const AboutView(),
          ),
          GetPage(
            name: AppRoutes.toolSearch,
            page: () => const ToolSearchView(),
            binding: BindingsBuilder(() {
              if (!Get.isRegistered<ToolSearchController>()) {
                Get.put(ToolSearchController());
              }
            }),
          ),
          GetPage(
            name: AppRoutes.notifications,
            page: () => const NotificationsView(),
            binding: BindingsBuilder(() {
              if (!Get.isRegistered<NotificationsController>()) {
                Get.put(NotificationsController());
              }
            }),
          ),
        ],
      ),
    );
  }
}
