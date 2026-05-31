class ToolModel {
  ToolModel({
    required this.id,
    required this.slug,
    required this.name,
    required this.tagline,
    required this.description,
    required this.category,
    required this.icon,
    required this.accent,
    required this.status,
    required this.keywords,
    this.featured = false,
  });

  final String id;
  final String slug;
  final String name;
  final String tagline;
  final String description;
  final String category;
  final String icon;
  final String accent;
  final String status;
  final List<String> keywords;
  final bool featured;

  bool get isReady => status == 'ready';

  Map<String, dynamic> toJson() => {
        'id': id,
        'slug': slug,
        'name': name,
        'tagline': tagline,
        'description': description,
        'category': category,
        'icon': icon,
        'accent': accent,
        'status': status,
        'keywords': keywords,
        'featured': featured,
      };

  factory ToolModel.fromJson(Map<String, dynamic> j) {
    return ToolModel(
      id: j['id']?.toString() ?? j['slug']?.toString() ?? '',
      slug: j['slug'] as String? ?? '',
      name: j['name'] as String? ?? '',
      tagline: j['tagline'] as String? ?? '',
      description: j['description'] as String? ?? '',
      category: j['category'] as String? ?? 'Web',
      icon: j['icon'] as String? ?? 'wrench',
      accent: j['accent'] as String? ?? 'violet',
      status: j['status'] as String? ?? 'ready',
      keywords: (j['keywords'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      featured: j['featured'] == true,
    );
  }
}
