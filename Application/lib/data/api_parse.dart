class ApiParse {
  static List<dynamic> list(dynamic data) {
    if (data == null) return [];
    if (data is List) return data;
    if (data is Map) {
      for (final key in const [
        'data',
        'items',
        'tools',
        'results',
        'posts',
        'blogs',
        'rows',
      ]) {
        final v = data[key];
        if (v is List) return v;
      }
    }
    return [];
  }

  static Map<String, dynamic> map(dynamic data) {
    if (data is Map<String, dynamic>) return data;
    if (data is Map) return Map<String, dynamic>.from(data);
    return {};
  }

  static List<String> categories(dynamic data) {
    if (data is List) {
      return data.map((e) => e.toString()).toList();
    }
    if (data is Map) {
      final cats = data['categories'];
      if (cats is List) {
        return cats.map((e) => e.toString()).toList();
      }
    }
    return [];
  }
}
