"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { ContentEditor } from "@/components/admin/content-editor";
import { WpPageHeader } from "@/components/admin/wp-page-header";
import { cmsApi } from "@/lib/api";
import type { CmsContent, CmsContentInput } from "@/lib/types";
import { useAppSelector } from "@/store/hooks";

export default function EditPagePage() {
  const { id } = useParams<{ id: string }>();
  const token = useAppSelector((s) => s.auth.accessToken);
  const [item, setItem] = useState<CmsContent | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    cmsApi
      .getContent(token, id)
      .then(setItem)
      .catch((e) => toast.error(e instanceof Error ? e.message : "Load failed"));
  }, [token, id]);

  const onSubmit = async (data: CmsContentInput) => {
    if (!token || !id) return;
    setSaving(true);
    try {
      await cmsApi.updateContent(token, id, data);
      toast.success("Page saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (!item) {
    return <p className="text-sm">Loading…</p>;
  }

  return (
    <>
      <WpPageHeader title={`Edit: ${item.title}`} />
      <ContentEditor
        type="page"
        initial={{
          slug: item.slug,
          title: item.title,
          body: item.body,
          status: item.status,
        }}
        onSubmit={onSubmit}
        saving={saving}
      />
    </>
  );
}
