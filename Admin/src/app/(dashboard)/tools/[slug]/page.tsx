"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ToolBlogEditor } from "@/components/admin/tool-blog-editor";
import { WpPageHeader } from "@/components/admin/wp-page-header";
import { WpPostbox } from "@/components/admin/wp-postbox";
import { ToolForm } from "@/components/admin/tool-form";
import { adminApi } from "@/lib/api";
import type { Tool, ToolInput } from "@/lib/types";
import { updateTool } from "@/store/slices/toolsAdminSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { cn } from "@/lib/utils";

type Tab = "tool" | "blog";

export default function EditToolPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.accessToken);
  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("tool");

  useEffect(() => {
    if (!token || !slug) return;
    adminApi
      .getTool(token, slug)
      .then(setTool)
      .catch(() => toast.error("Could not load tool"))
      .finally(() => setLoading(false));
  }, [token, slug]);

  const handleSubmit = async (data: ToolInput) => {
    if (!token || !slug) return;
    try {
      await dispatch(updateTool({ token, slug, data })).unwrap();
      toast.success("Tool updated");
      if (data.slug && data.slug !== slug) {
        router.replace(`/tools/${data.slug}`);
      } else {
        setTool((prev) => (prev ? { ...prev, ...data } : prev));
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  };

  if (loading) {
    return (
      <>
        <WpPageHeader title="Edit Tool" />
        <p className="text-muted-foreground">Loading…</p>
      </>
    );
  }

  if (!tool || !token) {
    return (
      <>
        <WpPageHeader title="Edit Tool" />
        <p className="text-muted-foreground">Tool not found</p>
      </>
    );
  }

  return (
    <>
      <WpPageHeader title={`Edit: ${tool.name}`} />
      <div className="flex gap-2 mb-4 border-b border-border">
        <button
          type="button"
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
            tab === "tool"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
          onClick={() => setTab("tool")}
        >
          Tool details
        </button>
        <button
          type="button"
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
            tab === "blog"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
          onClick={() => setTab("blog")}
        >
          Blog & SEO
        </button>
      </div>
      {tab === "tool" ? (
        <WpPostbox title="Tool details">
          <ToolForm
            initial={tool}
            submitLabel="Save changes"
            onSubmit={handleSubmit}
          />
        </WpPostbox>
      ) : (
        <ToolBlogEditor token={token} tool={tool} />
      )}
    </>
  );
}
