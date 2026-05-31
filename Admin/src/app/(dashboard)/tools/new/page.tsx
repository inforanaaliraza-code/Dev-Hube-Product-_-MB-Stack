"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { WpPageHeader } from "@/components/admin/wp-page-header";
import { WpPostbox } from "@/components/admin/wp-postbox";
import { ToolForm } from "@/components/admin/tool-form";
import { createTool } from "@/store/slices/toolsAdminSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { ToolInput } from "@/lib/types";

export default function NewToolPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.accessToken);

  const handleSubmit = async (data: ToolInput) => {
    if (!token) return;
    try {
      const tool = await dispatch(createTool({ token, data })).unwrap();
      toast.success("Tool created");
      router.push(`/tools/${tool.slug}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Create failed");
    }
  };

  return (
    <>
      <WpPageHeader title="Add New Tool" />
      <WpPostbox title="Tool details">
        <ToolForm submitLabel="Create tool" onSubmit={handleSubmit} />
      </WpPostbox>
    </>
  );
}
