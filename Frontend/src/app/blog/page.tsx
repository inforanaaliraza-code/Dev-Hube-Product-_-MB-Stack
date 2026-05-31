import Link from "next/link";
import { fetchPublishedToolBlogs } from "@/lib/tool-blog";

export const metadata = {
  title: "Blog",
};

export default async function BlogPage() {
  const posts = await fetchPublishedToolBlogs();

  return (
    <main className="blog-page mx-auto max-w-6xl px-4 pt-28 pb-16">
      <h1 className="font-display text-3xl font-semibold mb-2">Blog</h1>
      <p className="text-muted-foreground mb-10">
        In-depth guides and SEO articles for each Dev Hube tool.
      </p>
      {posts.length === 0 ? (
        <p className="text-muted-foreground">No tool blog posts published yet.</p>
      ) : (
        <ul className="blog-grid">
          {posts.map((post) => (
            <li key={post.id ?? post.toolSlug}>
              <Link
                href={`/tools/${post.toolSlug}#tool-blog`}
                className="blog-card group block h-full"
              >
                {post.featuredImageUrl ? (
                  <div className="blog-list-featured">
                    <img
                      src={post.featuredImageUrl}
                      alt={post.featuredImageAlt || post.title}
                      className="blog-list-featured-img"
                    />
                  </div>
                ) : (
                  <div className="blog-card-placeholder" />
                )}
                <div className="blog-card-body">
                  <p className="blog-card-eyebrow">
                    {post.toolCategory} · {post.toolName}
                  </p>
                  <h2 className="blog-card-title">{post.title}</h2>
                  {post.excerpt ? (
                    <p className="blog-card-excerpt">{post.excerpt}</p>
                  ) : null}
                  {post.publishedAt ? (
                    <p className="blog-card-date">
                      {new Date(post.publishedAt).toLocaleDateString()}
                    </p>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
