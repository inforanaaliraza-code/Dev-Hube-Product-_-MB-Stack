import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/colors.dart';
import '../../core/app_preferences.dart';
import '../../core/theme_controller.dart';
import '../../core/constants.dart';
import '../../core/responsive.dart';
import '../../widgets/gradient_button.dart';
import '../../widgets/app_screen_header.dart';
import '../../widgets/settings/settings_pref_row.dart';
import '../../widgets/settings/settings_section_card.dart';
import 'settings_controller.dart';

class SettingsView extends GetView<SettingsController> {
  const SettingsView({super.key});

  @override
  Widget build(BuildContext context) {
    final pad = AppLayout.screenPadding(context);
    final narrow = MediaQuery.sizeOf(context).width < 400;

    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(
          child: AppScreenHeader(
            onSearch: controller.focusSearch,
            onNotify: controller.onNotifyTap,
          ),
        ),
        SliverPadding(
          padding: EdgeInsets.fromLTRB(pad.left, 8, pad.right, AppLayout.bottomInset(context)),
          sliver: SliverList(
            delegate: SliverChildListDelegate([
              Text(
                'Settings',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 32,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 6),
              const Text(
                'Customize your experience and app preferences',
                style: TextStyle(color: AppColors.mutedFg, fontSize: 14, height: 1.4),
              ),
              const SizedBox(height: 20),
              _AppearanceSection(controller: controller),
              const SizedBox(height: 16),
              _BackendSection(controller: controller, narrow: narrow),
              const SizedBox(height: 16),
              _PreferencesSection(controller: controller),
              const SizedBox(height: 16),
              _OtherSection(controller: controller),
            ]),
          ),
        ),
      ],
    );
  }
}

class _AppearanceSection extends StatelessWidget {
  const _AppearanceSection({required this.controller});

  final SettingsController controller;

  @override
  Widget build(BuildContext context) {
    final themeCtrl = Get.find<ThemeController>();
    return Obx(
      () {
        final mode = themeCtrl.themeModeKey.value;
        controller.themeMode.value = mode;
        return SettingsSectionCard(
        title: 'Appearance',
        subtitle: 'Choose your preferred theme',
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            IntrinsicHeight(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Expanded(
                    child: _ThemeOption(
                      label: 'Light',
                      icon: Icons.light_mode_outlined,
                      selected: mode == 'light',
                      onTap: () => controller.setThemeMode('light'),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _ThemeOption(
                      label: 'Dark',
                      icon: Icons.dark_mode_outlined,
                      selected: mode == 'dark',
                      onTap: () => controller.setThemeMode('dark'),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _ThemeOption(
                      label: 'System',
                      icon: Icons.desktop_windows_outlined,
                      selected: mode == 'system',
                      onTap: () => controller.setThemeMode('system'),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'Accent color',
              style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              alignment: WrapAlignment.spaceBetween,
              children: SettingsController.accentOptions.map((o) {
                final selected = controller.accentColor.value == o.$1;
                return GestureDetector(
                  onTap: () => controller.setAccent(o.$1),
                  child: Container(
                    width: 40,
                    height: 40,
                    padding: const EdgeInsets.all(3),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: selected ? Colors.white : AppColors.border,
                        width: selected ? 2 : 1,
                      ),
                      boxShadow: selected
                          ? [
                              BoxShadow(
                                color: o.$2.withValues(alpha: 0.45),
                                blurRadius: 12,
                                spreadRadius: 1,
                              ),
                            ]
                          : null,
                    ),
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        color: o.$2,
                        shape: BoxShape.circle,
                      ),
                      child: selected
                          ? const Icon(Icons.check, size: 18, color: Colors.white)
                          : null,
                    ),
                  ),
                );
              }).toList(),
            ),
          ],
        ),
      );
      },
    );
  }
}

class _ThemeOption extends StatelessWidget {
  const _ThemeOption({
    required this.label,
    required this.icon,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final accent = selected ? AppColors.primary : AppColors.mutedFg;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          constraints: const BoxConstraints(minHeight: 100),
          padding: const EdgeInsets.fromLTRB(12, 14, 12, 14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: selected ? AppColors.primary : AppColors.border,
              width: selected ? 1.5 : 1,
            ),
            color: selected
                ? AppColors.primary.withValues(alpha: 0.1)
                : AppColors.card.withValues(alpha: 0.4),
          ),
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: accent.withValues(alpha: 0.14),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(icon, size: 24, color: accent),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      label,
                      textAlign: TextAlign.center,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        height: 1.2,
                        color: selected ? AppColors.foreground : AppColors.mutedFg,
                      ),
                    ),
                  ],
                ),
              ),
              if (selected)
                Positioned(
                  right: 4,
                  top: 4,
                  child: Container(
                    width: 20,
                    height: 20,
                    alignment: Alignment.center,
                    decoration: const BoxDecoration(
                      color: AppColors.primary,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.check, size: 13, color: Colors.white),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class _BackendSection extends StatelessWidget {
  const _BackendSection({required this.controller, required this.narrow});

  final SettingsController controller;
  final bool narrow;

  @override
  Widget build(BuildContext context) {
    return SettingsSectionCard(
      icon: Icons.storage_outlined,
      title: 'Backend & Connection',
      subtitle: 'Configure API and connection settings',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text('Backend API URL', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
          const SizedBox(height: 8),
          TextField(
            controller: controller.urlController,
            decoration: InputDecoration(
              hintText: 'http://192.168.1.12:4000/api/v1',
              suffixIcon: IconButton(
                icon: const Icon(Icons.copy, size: 20),
                onPressed: controller.copyApiUrl,
              ),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: controller.useAndroidEmulator,
                  icon: const Icon(Icons.android, size: 18),
                  label: const Text('Android emulator'),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: controller.useIosSimulator,
                  icon: const Icon(Icons.apple, size: 18),
                  label: const Text('iOS simulator'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          const Text(
            'Real device (same Wi‑Fi)',
            style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
          ),
          const SizedBox(height: 4),
          const Text(
            'Your PC IP will be used to connect to the backend.',
            style: TextStyle(color: AppColors.mutedFg, fontSize: 12),
          ),
          const SizedBox(height: 8),
          if (narrow)
            Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                TextField(
                  controller: controller.lanController,
                  decoration: const InputDecoration(hintText: '192.168.1.12'),
                  keyboardType: TextInputType.url,
                ),
                const SizedBox(height: 8),
                GradientButton(
                  expand: true,
                  label: 'Apply',
                  onPressed: controller.usePhysicalDevice,
                ),
              ],
            )
          else
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: controller.lanController,
                    decoration: const InputDecoration(hintText: '192.168.1.12'),
                    keyboardType: TextInputType.url,
                  ),
                ),
                const SizedBox(width: 8),
                SizedBox(
                  width: 100,
                  child: GradientButton(
                    expand: true,
                    label: 'Apply',
                    onPressed: controller.usePhysicalDevice,
                  ),
                ),
              ],
            ),
          const SizedBox(height: 16),
          Obx(() {
            final testing = controller.testing.value;
            final ok = controller.testOk.value;
            return SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: testing ? null : controller.testConnection,
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.primary,
                  side: BorderSide(color: AppColors.primary.withValues(alpha: 0.5)),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
                icon: testing
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : Icon(
                        ok == true ? Icons.check_circle : Icons.wifi,
                        size: 20,
                      ),
                label: Text(testing ? 'Testing…' : 'Test connection'),
              ),
            );
          }),
          Obx(() {
            final msg = controller.testMessage.value;
            if (msg.isEmpty) return const SizedBox.shrink();
            return Padding(
              padding: const EdgeInsets.only(top: 12),
              child: Text(
                msg,
                style: TextStyle(
                  fontSize: 12,
                  color: controller.testOk.value == true
                      ? AppColors.primary
                      : AppColors.destructive.withValues(alpha: 0.9),
                ),
              ),
            );
          }),
        ],
      ),
    );
  }
}

class _PreferencesSection extends StatelessWidget {
  const _PreferencesSection({required this.controller});

  final SettingsController controller;

  @override
  Widget build(BuildContext context) {
    final prefs = Get.find<AppPreferences>();
    return Obx(
      () {
        controller.fontSize.value = prefs.fontSizeKey.value;
        controller.hapticEnabled.value = prefs.hapticEnabled.value;
        controller.soundEnabled.value = prefs.soundEnabled.value;
        return SettingsSectionCard(
        icon: Icons.tune,
        title: 'Preferences',
        subtitle: 'General app preferences',
        child: Column(
          children: [
            SettingsPrefRow(
              icon: Icons.text_fields,
              title: 'Font size',
              subtitle: 'Adjust the app font size',
              trailing: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    prefs.fontSizeKey.value,
                    style: const TextStyle(color: AppColors.mutedFg, fontSize: 13),
                  ),
                  const Icon(Icons.chevron_right, color: AppColors.mutedFg),
                ],
              ),
              onTap: controller.pickFontSize,
            ),
            const Divider(height: 8, color: AppColors.border),
            SettingsPrefRow(
              icon: Icons.vibration,
              title: 'Haptic feedback',
              subtitle: 'Vibration on actions and interactions',
              trailing: Switch(
                value: prefs.hapticEnabled.value,
                onChanged: controller.toggleHaptic,
                activeTrackColor: AppColors.primary.withValues(alpha: 0.45),
                activeThumbColor: AppColors.primary,
              ),
            ),
            const Divider(height: 8, color: AppColors.border),
            SettingsPrefRow(
              icon: Icons.volume_up_outlined,
              title: 'Sound effects',
              subtitle: 'Play sounds on actions',
              trailing: Switch(
                value: prefs.soundEnabled.value,
                onChanged: controller.toggleSound,
                activeTrackColor: AppColors.primary.withValues(alpha: 0.45),
                activeThumbColor: AppColors.primary,
              ),
            ),
          ],
        ),
      );
      },
    );
  }
}

class _OtherSection extends StatelessWidget {
  const _OtherSection({required this.controller});

  final SettingsController controller;

  @override
  Widget build(BuildContext context) {
    return SettingsSectionCard(
      icon: Icons.apps_rounded,
      title: 'Other',
      subtitle: 'More options',
      child: Column(
        children: [
          SettingsPrefRow(
            icon: Icons.rocket_launch_outlined,
            title: 'Intro screens',
            subtitle: 'Show the 5 welcome screens again',
            trailing: TextButton(
              onPressed: controller.showOnboardingAgain,
              child: const Text('Show again'),
            ),
          ),
          const Divider(height: 8, color: AppColors.border),
          SettingsPrefRow(
            icon: Icons.delete_outline,
            title: 'Clear cache',
            subtitle: 'Free up storage by clearing cached data',
            trailing: const Icon(Icons.chevron_right, color: AppColors.mutedFg),
            onTap: controller.clearCache,
          ),
          const Divider(height: 8, color: AppColors.border),
          SettingsPrefRow(
            icon: Icons.info_outline,
            title: 'About DevHub',
            subtitle: 'Version ${AppConstants.appVersion}',
            trailing: const Icon(Icons.chevron_right, color: AppColors.mutedFg),
            onTap: controller.showAbout,
          ),
          const Divider(height: 8, color: AppColors.border),
          SettingsPrefRow(
            icon: Icons.share_outlined,
            title: 'Share DevHub',
            subtitle: 'Share the app with your friends',
            trailing: const Icon(Icons.chevron_right, color: AppColors.mutedFg),
            onTap: controller.shareApp,
          ),
          const Divider(height: 8, color: AppColors.border),
          SettingsPrefRow(
            icon: Icons.logout,
            title: 'Logout',
            subtitle: 'Sign out from the app',
            titleColor: AppColors.destructive,
            trailing: const Icon(Icons.chevron_right, color: AppColors.mutedFg),
            onTap: controller.logout,
          ),
        ],
      ),
    );
  }
}
