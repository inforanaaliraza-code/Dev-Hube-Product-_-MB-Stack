import type { ToolBlogPublic } from "@/lib/tool-blog";

export function ToolBlogSection({ blog }: { blog: ToolBlogPublic }) {
  const hasFeatured = Boolean(blog.featuredImageUrl);

  return (
    <section id="tool-blog" className="tool-blog-section scroll-mt-28">
      <div className="tool-blog-shell">
        <div
          className={
            hasFeatured ? "tool-blog-hero" : "tool-blog-hero tool-blog-hero--solo"
          }
        >
          <header className="tool-blog-header">
            <span className="tool-blog-eyebrow">
              Guide & SEO article · {blog.toolName}
            </span>
            <h2 className="tool-blog-title">{blog.title}</h2>
            {blog.excerpt ? <p className="tool-blog-lead">{blog.excerpt}</p> : null}
            <div className="tool-blog-meta-row">
              {blog.publishedAt ? (
                <time className="tool-blog-date" dateTime={blog.publishedAt}>
                  Published{" "}
                  {new Date(blog.publishedAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              ) : null}
              {blog.readingTimeMinutes ? (
                <span className="tool-blog-reading-time">
                  {blog.readingTimeMinutes} min read
                </span>
              ) : null}
            </div>
          </header>

          {hasFeatured ? (
            <figure className="tool-blog-featured">
              <img
                src={blog.featuredImageUrl!}
                alt={blog.featuredImageAlt || blog.title}
                className="tool-blog-featured-img"
                loading="eager"
                decoding="async"
              />
            </figure>
          ) : null}
        </div>

        {blog.body ? (
          <article className="tool-blog-article">
            <div
              className="tool-blog-body"
              dangerouslySetInnerHTML={{ __html: blog.body }}
            />
          </article>
        ) : null}

        {blog.schemaJson ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: blog.schemaJson }}
          />
        ) : null}
      </div>
    </section>
  );
}
