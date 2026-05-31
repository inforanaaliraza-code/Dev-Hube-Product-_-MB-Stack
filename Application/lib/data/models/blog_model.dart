class BlogModel {
  BlogModel({
    required this.id,
    required this.toolSlug,
    required this.toolName,
    required this.toolCategory,
    required this.title,
    required this.excerpt,
    required this.body,
    this.toolIcon,
    this.toolAccent,
    this.featuredImageUrl,
    this.publishedAt,
  });

  final String? id;
  final String toolSlug;
  final String toolName;
  final String toolCategory;
  final String title;
  final String excerpt;
  final String body;
  final String? toolIcon;
  final String? toolAccent;
  final String? featuredImageUrl;
  final String? publishedAt;

  Map<String, dynamic> toJson() => {
        if (id != null) 'id': id,
        'toolSlug': toolSlug,
        'toolName': toolName,
        'toolCategory': toolCategory,
        'title': title,
        'excerpt': excerpt,
        'body': body,
        if (toolIcon != null) 'toolIcon': toolIcon,
        if (toolAccent != null) 'toolAccent': toolAccent,
        if (featuredImageUrl != null) 'featuredImageUrl': featuredImageUrl,
        if (publishedAt != null) 'publishedAt': publishedAt,
      };

  factory BlogModel.fromJson(Map<String, dynamic> j) {
    return BlogModel(
      id: j['id']?.toString(),
      toolSlug: j['toolSlug'] as String? ?? '',
      toolName: j['toolName'] as String? ?? '',
      toolCategory: j['toolCategory'] as String? ?? '',
      title: j['title'] as String? ?? '',
      excerpt: j['excerpt'] as String? ?? '',
      body: j['body'] as String? ?? '',
      toolIcon: j['toolIcon'] as String?,
      toolAccent: j['toolAccent'] as String?,
      featuredImageUrl: j['featuredImageUrl'] as String?,
      publishedAt: j['publishedAt'] as String?,
    );
  }
}
