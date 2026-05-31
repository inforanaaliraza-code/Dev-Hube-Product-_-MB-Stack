"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PluginForm } from "@/components/admin/plugin-form";
import { WpPageHeader } from "@/components/admin/wp-page-header";
import { WpPostbox } from "@/components/admin/wp-postbox";
import { pluginsApi } from "@/lib/api";
import type { PluginInput } from "@/lib/types";
import { useAppSelector } from "@/store/hooks";

export default function NewPluginPage() {
  const router = useRouter();
  const token = useAppSelector((s) => s.auth.accessToken);

  const onSubmit = async (data: PluginInput) => {
    if (!token) return;
    try {
      const row = await pluginsApi.create(token, data);
      toast.success("Plugin created");
      router.push(`/plugins/${row.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Create failed");
    }
  };

  return (
    <>
      <WpPageHeader title="Add New Plugin" />
      <WpPostbox title="Plugin details">
        <PluginForm submitLabel="Create plugin" onSubmit={onSubmit} />
      </WpPostbox>
    </>
  );
}
