import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'constants.dart';
import 'theme.dart';

class ThemeController extends GetxController {
  final themeModeKey = 'dark'.obs;

  final _box = GetStorage();

  ThemeMode get materialThemeMode {
    switch (themeModeKey.value) {
      case 'light':
        return ThemeMode.light;
      case 'system':
        return ThemeMode.system;
      default:
        return ThemeMode.dark;
    }
  }

  ThemeData get activeTheme {
    if (themeModeKey.value == 'light') return AppTheme.light();
    if (themeModeKey.value == 'system') {
      final b = WidgetsBinding.instance.platformDispatcher.platformBrightness;
      return b == Brightness.light ? AppTheme.light() : AppTheme.dark();
    }
    return AppTheme.dark();
  }

  @override
  void onInit() {
    super.onInit();
    themeModeKey.value = _box.read<String>(AppConstants.themeModeKey) ?? 'dark';
    _apply();
  }

  void setThemeMode(String mode) {
    themeModeKey.value = mode;
    _box.write(AppConstants.themeModeKey, mode);
    _apply();
  }

  void _apply() {
    Get.changeThemeMode(materialThemeMode);
    Get.changeTheme(activeTheme);
    final dark = themeModeKey.value == 'dark' ||
        (themeModeKey.value == 'system' &&
            WidgetsBinding.instance.platformDispatcher.platformBrightness ==
                Brightness.dark);
    SystemChrome.setSystemUIOverlayStyle(
      SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: dark ? Brightness.light : Brightness.dark,
      ),
    );
  }
}
