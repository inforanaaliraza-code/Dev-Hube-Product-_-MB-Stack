import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:share_plus/share_plus.dart';
import '../../core/api_config.dart';
import '../../core/app_error.dart';
import '../../core/notifications_controller.dart';
import '../../core/tool_search_launcher.dart';
import '../../core/app_preferences.dart';
import '../../core/constants.dart';
import '../../core/routes.dart';
import '../../core/theme_controller.dart';
import '../../data/api_client.dart';
import '../../data/offline_store.dart';
import '../../data/tools_repository.dart';
import '../blog/blog_controller.dart';
import '../home/home_controller.dart';
import '../shell/shell_controller.dart';
import '../tools/tools_controller.dart';

class SettingsController extends GetxController {
  static const accentOptions = <(String label, Color color)>[
    ('purple', Color(0xFFA855F7)),
    ('blue', Color(0xFF3B82F6)),
    ('teal', Color(0xFF2DD4BF)),
    ('green', Color(0xFF22C55E)),
    ('orange', Color(0xFFF97316)),
    ('red', Color(0xFFEF4444)),
  ];

  final saved = false.obs;
  final testing = false.obs;
  final testOk = Rxn<bool>();
  final testMessage = ''.obs;
  final themeMode = 'dark'.obs;
  final accentColor = 'purple'.obs;
  final fontSize = 'Medium'.obs;
  final hapticEnabled = true.obs;
  final soundEnabled = false.obs;

  late final TextEditingController urlController;
  late final TextEditingController lanController;

  ApiClient get _api => Get.find();
  final _box = GetStorage();

  ThemeController get _theme => Get.find<ThemeController>();
  AppPreferences get _prefs => Get.find<AppPreferences>();

  @override
  void onInit() {
    super.onInit();
    urlController = TextEditingController(text: _api.apiBase);
    lanController = TextEditingController(
      text: _box.read<String>(AppConstants.lanHostKey) ?? '192.168.1.12',
    );
    themeMode.value = _theme.themeModeKey.value;
    accentColor.value = _box.read<String>(AppConstants.accentColorKey) ?? 'purple';
    fontSize.value = _prefs.fontSizeKey.value;
    hapticEnabled.value = _prefs.hapticEnabled.value;
    soundEnabled.value = _prefs.soundEnabled.value;
  }

  @override
  void onClose() {
    urlController.dispose();
    lanController.dispose();
    super.onClose();
  }

  void setThemeMode(String mode) {
    themeMode.value = mode;
    _theme.setThemeMode(mode);
    _prefs.lightTap();
  }

  void cycleThemeQuick() {
    final next = switch (themeMode.value) {
      'dark' => 'light',
      'light' => 'system',
      _ => 'dark',
    };
    setThemeMode(next);
  }

  void setAccent(String name) {
    accentColor.value = name;
    _box.write(AppConstants.accentColorKey, name);
    _prefs.lightTap();
  }

  void setFontSize(String value) {
    fontSize.value = value;
    _prefs.setFontSize(value);
  }

  void toggleHaptic(bool v) {
    hapticEnabled.value = v;
    _prefs.setHaptic(v);
  }

  void toggleSound(bool v) {
    soundEnabled.value = v;
    _prefs.setSound(v);
  }

  void copyApiUrl() {
    Clipboard.setData(ClipboardData(text: urlController.text));
    _prefs.lightTap();
    Get.snackbar('Copied', 'API URL copied');
  }

  void save() {
    _api.setApiBase(urlController.text);
    saved.value = true;
    testOk.value = null;
    Future.delayed(const Duration(seconds: 2), () => saved.value = false);
    Get.snackbar('Saved', 'API URL updated');
    _reloadData();
  }

  void useAndroidEmulator() {
    urlController.text = 'http://10.0.2.2:${ApiConfig.port}${ApiConfig.apiPath}';
    _api.setApiBase(urlController.text);
    _reloadData();
    Get.snackbar('Preset', 'Android emulator URL applied');
  }

  void useIosSimulator() {
    urlController.text = 'http://127.0.0.1:${ApiConfig.port}${ApiConfig.apiPath}';
    _api.setApiBase(urlController.text);
    _reloadData();
    Get.snackbar('Preset', 'iOS simulator URL applied');
  }

  void usePhysicalDevice() {
    final host = lanController.text.trim();
    _box.write(AppConstants.lanHostKey, host);
    urlController.text = ApiConfig.fromLanHost(host);
    _api.setApiBase(urlController.text);
    _reloadData();
    Get.snackbar('Applied', 'Physical device URL updated');
  }

  Future<void> testConnection() async {
    testing.value = true;
    testOk.value = null;
    testMessage.value = '';
    _api.setApiBase(urlController.text);
    try {
      await _api.guard(() => _api.dio.get<dynamic>('/health'));
      testOk.value = true;
      testMessage.value = 'Backend is reachable at ${urlController.text.trim()}';
      Get.snackbar('OK', testMessage.value);
      save();
    } catch (e) {
      testOk.value = false;
      testMessage.value = AppErrorInfo.from(e, _api).message;
      Get.snackbar('Failed', testMessage.value, duration: const Duration(seconds: 5));
    } finally {
      testing.value = false;
    }
  }

  void _reloadData() {
    if (Get.isRegistered<OfflineStore>()) {
      Get.find<OfflineStore>().clearAll();
    }
    if (Get.isRegistered<ToolsRepository>()) {
      Get.find<ToolsRepository>().invalidate();
    }
    if (Get.isRegistered<ShellController>()) {
      Get.find<ShellController>().refreshAllTabs(force: true);
      return;
    }
    if (Get.isRegistered<HomeController>()) {
      Get.find<HomeController>().ensureLoaded(force: true);
    }
    if (Get.isRegistered<ToolsController>()) {
      Get.find<ToolsController>().ensureLoaded(force: true);
    }
    if (Get.isRegistered<BlogController>()) {
      Get.find<BlogController>().ensureLoaded(force: true);
    }
  }

  void showOnboardingAgain() {
    GetStorage().remove(AppConstants.onboardingDoneKey);
    Get.offAllNamed(AppRoutes.onboarding);
  }

  void clearCache() {
    _box.remove(AppConstants.toolFavoritesKey);
    _box.remove(AppConstants.blogBookmarksKey);
    _reloadData();
    Get.snackbar('Done', 'Favorites and bookmarks cleared');
  }

  void showAbout() {
    Get.toNamed(AppRoutes.about);
  }

  Future<void> shareApp() async {
    _prefs.lightTap();
    await Share.share(
      'Dev Hube — ${AppConstants.tagline}\n'
      '60+ developer tools in one app.\n'
      'https://devhube.com',
      subject: AppConstants.siteName,
    );
  }

  void logout() {
    Get.defaultDialog(
      title: 'Logout',
      middleText: 'You will leave the app. Open again to continue from home.',
      textConfirm: 'Logout',
      textCancel: 'Cancel',
      onConfirm: () {
        Get.back();
        _box.write(AppConstants.onboardingDoneKey, true);
        _box.remove(AppConstants.toolFavoritesKey);
        _box.remove(AppConstants.blogBookmarksKey);
        SystemNavigator.pop();
      },
    );
  }

  void pickFontSize() {
    _pickOption('Font size', ['Small', 'Medium', 'Large'], fontSize.value, setFontSize);
  }

  void _pickOption(
    String title,
    List<String> options,
    String current,
    void Function(String) onPick,
  ) {
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
        decoration: BoxDecoration(
          color: Theme.of(Get.context!).colorScheme.surface,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
            const SizedBox(height: 12),
            ...options.map(
              (o) => ListTile(
                title: Text(o),
                trailing: o == current ? const Icon(Icons.check, color: Color(0xFFA855F7)) : null,
                onTap: () {
                  onPick(o);
                  Get.back();
                  _prefs.lightTap();
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  void onNotifyTap() {
    if (Get.isRegistered<NotificationsController>()) {
      Get.find<NotificationsController>().openScreen();
    }
  }

  void focusSearch() => ToolSearchLauncher.open();
}
