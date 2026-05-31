"use client";

import { useState } from "react";
import { WpPostbox } from "@/components/admin/wp-postbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CmsContentInput, CmsContentType } from "@/lib/types";

export function ContentEditor({
  type,
  initial,
  onSubmit,
  saving,
}: {
  type: CmsContentType;
  initial?: Partial<CmsContentInput>;
  onSubmit: (data: CmsContentInput) => Promise<void>;
  saving: boolean;
}) {
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [status, setStatus] = useState<"draft" | "published">(
    initial?.status ?? "draft",
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      slug,
      title,
      excerpt,
      body,
      type,
      status,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <div className="space-y-4">
        <WpPostbox title={type === "post" ? "Post" : "Page"}>
          <div className="space-y-3">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
              />
            </div>
            {type === "post" ? (
              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={3}
                />
              </div>
            ) : null}
            <div>
              <Label htmlFor="body">Content</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={16}
                className="font-mono text-sm"
              />
            </div>
          </div>
        </WpPostbox>
      </div>
      <div className="space-y-4">
        <WpPostbox title="Publish">
          <div className="space-y-3">
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as "draft" | "published")
                }
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <button type="submit" className="wp-button-primary w-full" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </WpPostbox>
      </div>
    </form>
  );
}
