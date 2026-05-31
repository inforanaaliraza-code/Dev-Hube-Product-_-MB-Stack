"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ListViewToggle } from "@/components/admin/list-view-toggle";
import { WpPageHeader } from "@/components/admin/wp-page-header";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useListView } from "@/hooks/use-list-view";
import { adminApi, mediaFullUrl } from "@/lib/api";
import type { ToolBlog } from "@/lib/types";
import { useAppSelector } from "@/store/hooks";

function resolveThumb(url: string | null) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  const apiHost = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1").replace(
    /\/api\/v1\/?$/,
    "",
  );
  if (url.startsWith("/api/")) return `${apiHost}${url}`;
  return mediaFullUrl(url.replace(/^\/api\/v1\/uploads\//, "").replace(/^\//, ""));
}

function blogState(row: ToolBlog): "none" | "draft" | "published" {
  if (!row.id || (!row.title.trim() && !row.body.trim())) return "none";
  return row.status === "published" ? "published" : "draft";
}

function StatusBadge({ state }: { state: ReturnType<typeof blogState> }) {
  if (state === "published") return <Badge variant="default">Published</Badge>;
  if (state === "draft") return <Badge variant="secondary">Draft</Badge>;
  return <Badge variant="outline">Not started</Badge>;
}

function BlogRowActions({
  row,
  state,
  siteUrl,
  onDelete,
}: {
  row: ToolBlog;
  state: ReturnType<typeof blogState>;
  siteUrl: string;
  onDelete: (row: ToolBlog) => void;
}) {
  return (
    <div className="flex justify-end gap-1">
      <Link
        href={`/posts/${row.toolSlug}`}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
        title="Edit blog"
      >
        <Pencil className="h-4 w-4" />
      </Link>
      {state === "published" && siteUrl ? (
        <a
          href={`${siteUrl.replace(/\/$/, "")}/tools/${row.toolSlug}#tool-blog`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
          title="View on site"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      ) : null}
      {row.id ? (
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-destructive/10 text-destructive"
          title="Delete blog"
          onClick={() => onDelete(row)}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}

export function ToolBlogList() {
  const token = useAppSelector((s) => s.auth.accessToken);
  const siteUrl = useAppSelector((s) => s.settings.site.publicSiteUrl);
  const { view, setView } = useListView("blog-posts");
  const [items, setItems] = useState<ToolBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const rows = await adminApi.listToolBlogs(token);
      setItems(rows);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = items.filter((row) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      row.toolName.toLowerCase().includes(q) ||
      row.toolSlug.toLowerCase().includes(q) ||
      row.title.toLowerCase().includes(q)
    );
  });

  const onDelete = async (row: ToolBlog) => {
    if (!token || !row.id) return;
    if (!confirm(`Delete blog post for "${row.toolName}"?`)) return;
    try {
      await adminApi.deleteToolBlog(token, row.toolSlug);
      toast.success("Blog deleted");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  return (
    <>
      <WpPageHeader title="Blog Posts">
        <Link
          href="/posts/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add New
        </Link>
      </WpPageHeader>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex-1 min-w-[200px] max-w-md">
          <Input
            placeholder="Search by tool or post title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <ListViewToggle value={view} onChange={setView} />
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No tools match your search.</p>
      ) : view === "table" ? (
        <div className="wp-list-table-wrap overflow-x-auto">
          <table className="wp-list-table w-full text-sm">
            <thead>
              <tr>
                <th>Tool</th>
                <th>Post title</th>
                <th>Status</th>
                <th>Updated</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const state = blogState(row);
                return (
                  <tr key={row.toolSlug}>
                    <td>
                      <div className="font-medium">{row.toolName}</div>
                      <div className="text-xs text-muted-foreground">{row.toolSlug}</div>
                    </td>
                    <td>
                      {row.title.trim() ? row.title : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge state={state} />
                    </td>
                    <td className="text-muted-foreground">
                      {row.updatedAt
                        ? new Date(row.updatedAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td>
                      <BlogRowActions
                        row={row}
                        state={state}
                        siteUrl={siteUrl}
                        onDelete={onDelete}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="wp-admin-grid">
          {filtered.map((row) => {
            const state = blogState(row);
            const thumb = resolveThumb(row.featuredImageUrl);
            return (
              <article key={row.toolSlug} className="wp-admin-card">
                {thumb ? (
                  <div className="wp-admin-card-thumb">
                    <img src={thumb} alt="" />
                  </div>
                ) : null}
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {row.toolCategory}
                </p>
                <h3 className="font-medium mt-0.5">{row.toolName}</h3>
                <p className="text-xs text-muted-foreground">{row.toolSlug}</p>
                <p className="text-sm mt-2 line-clamp-2">
                  {row.title.trim() || "No post title yet"}
                </p>
                <div className="mt-2">
                  <StatusBadge state={state} />
                </div>
                <div className="wp-admin-card-actions">
                  <Link href={`/posts/${row.toolSlug}`} className="wp-button-secondary text-xs">
                    <Pencil className="h-3 w-3 inline mr-1" />
                    Edit
                  </Link>
                  {row.id ? (
                    <button
                      type="button"
                      className="wp-button-secondary text-xs text-destructive"
                      onClick={() => onDelete(row)}
                    >
                      <Trash2 className="h-3 w-3 inline mr-1" />
                      Delete
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
