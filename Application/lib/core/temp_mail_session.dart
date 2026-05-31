import 'package:get_storage/get_storage.dart';

class TempMailSession {
  static const _idKey = 'temp_mail_active_id';
  static const _addressKey = 'temp_mail_active_address';

  static final _box = GetStorage();

  static void save({required String id, required String address}) {
    _box.write(_idKey, id);
    _box.write(_addressKey, address);
  }

  static void clear() {
    _box.remove(_idKey);
    _box.remove(_addressKey);
  }

  static String? get mailboxId => _box.read<String>(_idKey);
  static String? get address => _box.read<String>(_addressKey);
}
