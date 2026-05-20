"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin/header";
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
      <AdminHeader title="New tool" />
      <main className="p-4 md:p-6">
        <ToolForm submitLabel="Create tool" onSubmit={handleSubmit} />
      </main>
    </>
  );
}
