"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin/header";
import { ToolForm } from "@/components/admin/tool-form";
import { adminApi } from "@/lib/api";
import type { Tool, ToolInput } from "@/lib/types";
import { updateTool } from "@/store/slices/toolsAdminSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function EditToolPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.accessToken);
  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);

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
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  };

  if (loading) {
    return (
      <>
        <AdminHeader title="Edit tool" />
        <main className="p-6 text-muted-foreground text-sm">Loading…</main>
      </>
    );
  }

  if (!tool) {
    return (
      <>
        <AdminHeader title="Edit tool" />
        <main className="p-6 text-muted-foreground text-sm">Tool not found</main>
      </>
    );
  }

  return (
    <>
      <AdminHeader title={`Edit: ${tool.name}`} />
      <main className="p-4 md:p-6">
        <ToolForm
          initial={tool}
          submitLabel="Save changes"
          onSubmit={handleSubmit}
        />
      </main>
    </>
  );
}
