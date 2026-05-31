"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { WpPageHeader } from "@/components/admin/wp-page-header";
import { WpPostbox } from "@/components/admin/wp-postbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { adminApi } from "@/lib/api";
import type { Tool } from "@/lib/types";
import { useAppSelector } from "@/store/hooks";

const selectClass =
  "flex h-9 w-full rounded-lg border border-input bg-background/50 px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export default function NewBlogPostPage() {
  const router = useRouter();
  const token = useAppSelector((s) => s.auth.accessToken);
  const [tools, setTools] = useState<Tool[]>([]);
  const [toolSlug, setToolSlug] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    adminApi
      .getTools(token)
      .then(setTools)
      .catch(() => toast.error("Could not load tools"))
      .finally(() => setLoading(false));
  }, [token]);

  const onContinue = () => {
    if (!toolSlug) {
      toast.error("Select a tool first");
      return;
    }
    router.push(`/posts/${toolSlug}`);
  };

  return (
    <>
      <WpPageHeader title="Add New Blog Post" />
      <WpPostbox title="Choose tool">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading tools…</p>
        ) : (
          <div className="space-y-4 max-w-md">
            <div>
              <Label htmlFor="tool-pick">Blog post for tool</Label>
              <select
                id="tool-pick"
                className={selectClass}
                value={toolSlug}
                onChange={(e) => setToolSlug(e.target.value)}
              >
                <option value="">Select a tool…</option>
                {tools.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.name} ({t.slug})
                  </option>
                ))}
              </select>
            </div>
            <Button type="button" onClick={onContinue}>
              Continue to editor
            </Button>
          </div>
        )}
      </WpPostbox>
    </>
  );
}
