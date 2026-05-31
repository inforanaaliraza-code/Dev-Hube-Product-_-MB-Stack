import 'dart:async';

import 'package:get/get.dart';
import 'blog_offline_seed.dart';
import 'models/blog_model.dart';
import 'offline_store.dart';
import 'services/blog_service.dart';

const _networkTimeout = Duration(seconds: 5);

class BlogsResult {
  const BlogsResult({
    required this.posts,
    this.offline = false,
  });

  final List<BlogModel> posts;
  final bool offline;
}

class BlogRepository extends GetxService {
  BlogRepository(this._blog, this._store);

  final BlogService _blog;
  final OfflineStore _store;

  List<BlogModel> peekPosts() {
    final disk = _store.readBlogs();
    if (disk != null && disk.isNotEmpty) return disk;
    return BlogOfflineSeed.posts();
  }

  BlogModel? peekToolBlog(String slug) {
    return _store.readToolBlog(slug) ?? _findSeedPost(slug);
  }

  BlogModel? _findSeedPost(String slug) {
    for (final p in BlogOfflineSeed.posts()) {
      if (p.toolSlug == slug) return p;
    }
    return null;
  }

  Future<BlogsResult> loadPosts({bool force = false}) async {
    try {
      final posts = await _blog.fetchBlogs().timeout(_networkTimeout);
      _store.saveBlogs(posts);
      return BlogsResult(posts: posts);
    } on TimeoutException {
      return _offlinePostsResult();
    } catch (_) {
      return _offlinePostsResult();
    }
  }

  BlogsResult _offlinePostsResult() {
    final disk = _store.readBlogs();
    if (disk != null && disk.isNotEmpty) {
      return BlogsResult(posts: disk, offline: true);
    }
    final seed = BlogOfflineSeed.posts();
    return BlogsResult(posts: seed, offline: true);
  }

  Future<BlogModel?> loadToolBlog(String slug) async {
    final cached = peekToolBlog(slug);
    try {
      final blog = await _blog.fetchToolBlog(slug).timeout(_networkTimeout);
      if (blog != null) _store.saveToolBlog(slug, blog);
      return blog ?? cached;
    } on TimeoutException {
      return cached;
    } catch (_) {
      return cached;
    }
  }
}
