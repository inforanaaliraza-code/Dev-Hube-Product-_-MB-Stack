class AppNotification {
  AppNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.createdAt,
    this.read = false,
    this.type = 'general',
  });

  final String id;
  final String title;
  final String body;
  final DateTime createdAt;
  final bool read;
  final String type;

  AppNotification copyWith({bool? read}) {
    return AppNotification(
      id: id,
      title: title,
      body: body,
      createdAt: createdAt,
      read: read ?? this.read,
      type: type,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'body': body,
        'createdAt': createdAt.toIso8601String(),
        'read': read,
        'type': type,
      };

  factory AppNotification.fromJson(Map<String, dynamic> j) {
    return AppNotification(
      id: j['id']?.toString() ?? '',
      title: j['title']?.toString() ?? '',
      body: j['body']?.toString() ?? '',
      createdAt: DateTime.tryParse(j['createdAt']?.toString() ?? '') ?? DateTime.now(),
      read: j['read'] == true,
      type: j['type']?.toString() ?? 'general',
    );
  }
}
