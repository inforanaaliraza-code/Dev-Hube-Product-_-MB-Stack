"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { PluginForm } from "@/components/admin/plugin-form";
import { WpPageHeader } from "@/components/admin/wp-page-header";
import { WpPostbox } from "@/components/admin/wp-postbox";
import { pluginsApi } from "@/lib/api";
import type { Plugin, PluginInput } from "@/lib/types";
import { useAppSelector } from "@/store/hooks";

export default function EditPluginPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const token = useAppSelector((s) => s.auth.accessToken);
  const [plugin, setPlugin] = useState<Plugin | null>(null);

  useEffect(() => {
    if (!token || !id) return;
    pluginsApi
      .get(token, id)
      .then(setPlugin)
      .catch(() => toast.error("Could not load plugin"));
  }, [token, id]);

  const onSubmit = async (data: PluginInput) => {
    if (!token || !id) return;
    try {
      await pluginsApi.update(token, id, data);
      toast.success("Plugin saved");
      const fresh = await pluginsApi.get(token, id);
      setPlugin(fresh);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  };

  const onDelete = async () => {
    if (!token || !id || !plugin) return;
    if (plugin.isSystem) {
      toast.error("System plugins cannot be deleted");
      return;
    }
    if (!confirm(`Delete "${plugin.name}"?`)) return;
    try {
      await pluginsApi.delete(token, id);
      toast.success("Deleted");
      router.push("/plugins");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  if (!plugin) {
    return <p className="text-muted-foreground">Loading…</p>;
  }

  return (
    <>
      <WpPageHeader title={`Edit: ${plugin.name}`}>
        {!plugin.isSystem ? (
          <button type="button" className="wp-button-secondary page-title-action" onClick={onDelete}>
            Delete
          </button>
        ) : null}
      </WpPageHeader>
      <WpPostbox title="Plugin details">
        <PluginForm
          initial={plugin}
          submitLabel="Save changes"
          onSubmit={onSubmit}
        />
      </WpPostbox>
    </>
  );
}
