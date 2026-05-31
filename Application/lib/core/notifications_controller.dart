import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:intl/intl.dart';
import '../data/models/app_notification.dart';
import 'routes.dart';

class NotificationsController extends GetxController {
  static const _storageKey = 'app_notifications_v1';
  static const offlineId = 'offline_mode';

  final items = <AppNotification>[].obs;
  final _box = GetStorage();

  int get unreadCount => items.where((n) => !n.read).length;

  @override
  void onInit() {
    super.onInit();
    _load();
  }

  void _load() {
    final raw = _box.read<List<dynamic>>(_storageKey);
    if (raw == null) return;
    items.assignAll(
      raw
          .map((e) => AppNotification.fromJson(Map<String, dynamic>.from(e as Map)))
          .where((n) => n.id.isNotEmpty)
          .toList(),
    );
    items.sort((a, b) => b.createdAt.compareTo(a.createdAt));
  }

  void _persist() {
    _box.write(_storageKey, items.map((n) => n.toJson()).toList());
  }

  void openScreen() => Get.toNamed(AppRoutes.notifications);

  void notifyOffline({DateTime? syncedAt, bool bundledCatalog = false}) {
    final syncedLabel = syncedAt != null
        ? 'Saved ${DateFormat('MMM d, h:mm a').format(syncedAt)}.'
        : 'Built-in catalog — connect once to refresh from server.';
    final body =
        '$syncedLabel Local tools work on-device; server tools need a backend connection.';

    final existing = items.indexWhere((n) => n.id == offlineId);
    final notice = AppNotification(
      id: offlineId,
      title: 'Offline mode',
      body: body,
      createdAt: DateTime.now(),
      read: false,
      type: 'offline',
    );
    if (existing >= 0) {
      items[existing] = notice;
    } else {
      items.insert(0, notice);
    }
    items.refresh();
    _persist();
  }

  void markRead(String id) {
    final i = items.indexWhere((n) => n.id == id);
    if (i < 0) return;
    items[i] = items[i].copyWith(read: true);
    items.refresh();
    _persist();
  }

  void markAllRead() {
    items.assignAll(items.map((n) => n.copyWith(read: true)));
    _persist();
  }

  void clearAll() {
    items.clear();
    _persist();
  }
}
