import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../core/colors.dart';
import '../../widgets/aurora_background.dart';
import '../../widgets/responsive_body.dart';
import '../blog/blog_view.dart';
import '../home/home_view.dart';
import '../settings/settings_view.dart';
import '../tools/tools_view.dart';
import 'shell_controller.dart';

class ShellView extends GetView<ShellController> {
  const ShellView({super.key});

  @override
  Widget build(BuildContext context) {
    final wide = MediaQuery.sizeOf(context).width >= 900;
    return Obx(() {
      final tab = controller.tabIndex.value;
      return AuroraBackground(
        child: Scaffold(
          backgroundColor: Colors.transparent,
          appBar: null,
          body: Row(
            children: [
              if (wide)
                NavigationRail(
                  selectedIndex: tab,
                  onDestinationSelected: controller.setTab,
                  backgroundColor: AppColors.muted.withValues(alpha: 0.5),
                  labelType: NavigationRailLabelType.all,
                  destinations: const [
                    NavigationRailDestination(icon: Icon(Icons.home_outlined), label: Text('Home')),
                    NavigationRailDestination(icon: Icon(Icons.grid_view), label: Text('Tools')),
                    NavigationRailDestination(icon: Icon(Icons.article_outlined), label: Text('Blog')),
                    NavigationRailDestination(icon: Icon(Icons.settings_outlined), label: Text('Settings')),
                  ],
                ),
              Expanded(
                child: SafeArea(
                  bottom: false,
                  child: IndexedStack(
                    index: tab,
                    sizing: StackFit.expand,
                    children: const [
                      ResponsiveBody(child: HomeView()),
                      ResponsiveBody(child: ToolsView()),
                      ResponsiveBody(child: BlogView()),
                      ResponsiveBody(child: SettingsView()),
                    ],
                  ),
                ),
              ),
            ],
          ),
          bottomNavigationBar: wide
              ? null
              : NavigationBar(
                  selectedIndex: tab,
                  onDestinationSelected: controller.setTab,
                  backgroundColor: AppColors.muted.withValues(alpha: 0.95),
                  indicatorColor: tab == 3
                      ? AppColors.accent.withValues(alpha: 0.32)
                      : AppColors.primary.withValues(alpha: 0.28),
                  labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
                  destinations: const [
                    NavigationDestination(icon: Icon(Icons.home_outlined), label: 'Home'),
                    NavigationDestination(icon: Icon(Icons.grid_view), label: 'Tools'),
                    NavigationDestination(icon: Icon(Icons.article_outlined), label: 'Blog'),
                    NavigationDestination(icon: Icon(Icons.settings_outlined), label: 'Settings'),
                  ],
                ),
        ),
      );
    });
  }
}
