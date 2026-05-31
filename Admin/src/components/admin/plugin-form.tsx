"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PluginInput, PluginType } from "@/lib/types";

const selectClass =
  "flex h-9 w-full rounded-lg border border-input bg-background/50 px-3 py-1 text-sm";

const TYPES: PluginType[] = ["integration", "worker", "extension"];

export function PluginForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: Partial<PluginInput>;
  submitLabel: string;
  onSubmit: (data: PluginInput) => Promise<void>;
}) {
  const [form, setForm] = useState<PluginInput>({
    slug: initial?.slug ?? "",
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    version: initial?.version ?? "1.0.0",
    type: initial?.type ?? "extension",
    status: initial?.status ?? "inactive",
    category: initial?.category ?? "general",
    adminPath: initial?.adminPath ?? "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        ...form,
        adminPath: form.adminPath?.trim() || null,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={3}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="version">Version</Label>
          <Input
            id="version"
            value={form.version}
            onChange={(e) => setForm((f) => ({ ...f, version: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            className={selectClass}
            value={form.type}
            onChange={(e) =>
              setForm((f) => ({ ...f, type: e.target.value as PluginType }))
            }
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            className={selectClass}
            value={form.status}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                status: e.target.value as PluginInput["status"],
              }))
            }
          >
            <option value="active">active</option>
            <option value="inactive">inactive</option>
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="adminPath">Admin path (optional)</Label>
        <Input
          id="adminPath"
          placeholder="/site-kit"
          value={form.adminPath ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, adminPath: e.target.value }))}
        />
      </div>
      <button type="submit" className="wp-button-primary" disabled={saving}>
        {saving ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
