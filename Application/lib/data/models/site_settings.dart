class SiteSettings {
  SiteSettings({
    required this.siteName,
    required this.tagline,
    required this.heroTitle,
    required this.heroSubtitle,
  });

  final String siteName;
  final String tagline;
  final String heroTitle;
  final String heroSubtitle;

  factory SiteSettings.defaults() => SiteSettings(
        siteName: 'Dev Hube',
        tagline: "The developer's utility hub",
        heroTitle: 'Build faster with',
        heroSubtitle:
            '60+ developer utilities. All in one place. Fast, private & always updated.',
      );

  Map<String, dynamic> toJson() => {
        'siteName': siteName,
        'tagline': tagline,
        'heroTitle': heroTitle,
        'heroSubtitle': heroSubtitle,
      };

  factory SiteSettings.fromJson(Map<String, dynamic> j) {
    final d = SiteSettings.defaults();
    return SiteSettings(
      siteName: (j['siteName'] as String?)?.trim().isNotEmpty == true
          ? j['siteName'] as String
          : d.siteName,
      tagline: (j['tagline'] as String?)?.trim().isNotEmpty == true
          ? j['tagline'] as String
          : d.tagline,
      heroTitle: (j['heroTitle'] as String?)?.trim().isNotEmpty == true
          ? j['heroTitle'] as String
          : d.heroTitle,
      heroSubtitle: (j['heroSubtitle'] as String?)?.trim().isNotEmpty == true
          ? j['heroSubtitle'] as String
          : d.heroSubtitle,
    );
  }
}
