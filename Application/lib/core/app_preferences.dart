import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'constants.dart';

class AppPreferences extends GetxController {
  final fontSizeKey = 'Medium'.obs;
  final hapticEnabled = true.obs;
  final soundEnabled = false.obs;

  final _box = GetStorage();

  double get textScale {
    switch (fontSizeKey.value) {
      case 'Small':
        return 0.9;
      case 'Large':
        return 1.12;
      default:
        return 1.0;
    }
  }

  @override
  void onInit() {
    super.onInit();
    fontSizeKey.value = _box.read<String>(AppConstants.fontSizeKey) ?? 'Medium';
    hapticEnabled.value = _box.read<bool>(AppConstants.hapticKey) ?? true;
    soundEnabled.value = _box.read<bool>(AppConstants.soundKey) ?? false;
  }

  void setFontSize(String v) {
    fontSizeKey.value = v;
    _box.write(AppConstants.fontSizeKey, v);
  }

  void setHaptic(bool v) {
    hapticEnabled.value = v;
    _box.write(AppConstants.hapticKey, v);
    if (v) lightTap();
  }

  void setSound(bool v) {
    soundEnabled.value = v;
    _box.write(AppConstants.soundKey, v);
    if (v) playClick();
  }

  void lightTap() {
    if (!hapticEnabled.value) return;
    HapticFeedback.lightImpact();
  }

  void playClick() {
    if (!soundEnabled.value) return;
    SystemSound.play(SystemSoundType.click);
  }
}
