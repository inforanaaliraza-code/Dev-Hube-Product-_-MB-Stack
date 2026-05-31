"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ContentEditor } from "@/components/admin/content-editor";
import { WpPageHeader } from "@/components/admin/wp-page-header";
import { cmsApi } from "@/lib/api";
import type { CmsContentInput } from "@/lib/types";
import { useAppSelector } from "@/store/hooks";

export default function NewPagePage() {
  const router = useRouter();
  const token = useAppSelector((s) => s.auth.accessToken);
  const [saving, setSaving] = useState(false);

  const onSubmit = async (data: CmsContentInput) => {
    if (!token) return;
    setSaving(true);
    try {
      const row = await cmsApi.createContent(token, data);
      toast.success("Page created");
      router.push(`/pages/${row.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <WpPageHeader title="Add New Page" />
      <ContentEditor type="page" onSubmit={onSubmit} saving={saving} />
    </>
  );
}
