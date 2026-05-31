"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { ToolBlogEditor } from "@/components/admin/tool-blog-editor";
import { WpPageHeader } from "@/components/admin/wp-page-header";
import { adminApi } from "@/lib/api";
import type { Tool } from "@/lib/types";
import { useAppSelector } from "@/store/hooks";

export default function EditToolBlogPostPage() {
  const { toolSlug } = useParams<{ toolSlug: string }>();
  const token = useAppSelector((s) => s.auth.accessToken);
  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !toolSlug) return;
    adminApi
      .getTool(token, toolSlug)
      .then(setTool)
      .catch(() => toast.error("Tool not found"))
      .finally(() => setLoading(false));
  }, [token, toolSlug]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (!tool || !token) {
    return (
      <>
        <WpPageHeader title="Blog post" />
        <p className="text-muted-foreground">Tool not found.</p>
        <Link href="/posts" className="text-sm text-primary hover:underline mt-2 inline-block">
          ← All blog posts
        </Link>
      </>
    );
  }

  return (
    <>
      <WpPageHeader title={`Blog: ${tool.name}`}>
        <Link href="/posts" className="text-sm text-muted-foreground hover:text-foreground">
          ← All blog posts
        </Link>
      </WpPageHeader>
      <ToolBlogEditor token={token} tool={tool} />
    </>
  );
}
