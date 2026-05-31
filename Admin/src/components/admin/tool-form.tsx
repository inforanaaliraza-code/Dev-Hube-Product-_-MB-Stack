"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TOOL_ACCENTS, TOOL_CATEGORIES, TOOL_STATUSES } from "@/lib/constants";
import type { ToolInput } from "@/lib/types";
import { cn } from "@/lib/utils";

const selectClass =
  "flex h-9 w-full rounded-lg border border-input bg-background/50 px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

interface ToolFormProps {
  initial?: Partial<ToolInput>;
  submitLabel: string;
  onSubmit: (data: ToolInput) => Promise<void>;
}

const empty: ToolInput = {
  slug: "",
  name: "",
  tagline: "",
  description: "",
  category: "Formatting",
  icon: "wrench",
  accent: "violet",
  status: "soon",
  keywords: [],
  featured: false,
};

export function ToolForm({ initial, submitLabel, onSubmit }: ToolFormProps) {
  const [form, setForm] = useState<ToolInput>({ ...empty, ...initial });
  const [keywordsText, setKeywordsText] = useState((initial?.keywords ?? []).join(", "));
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof ToolInput>(key: K, value: ToolInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: ToolInput = {
        slug: form.slug,
        name: form.name,
        tagline: form.tagline,
        description: form.description,
        category: form.category,
        icon: form.icon,
        accent: form.accent,
        status: form.status,
        featured: form.featured ?? false,
        keywords: keywordsText
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
      };
      await onSubmit(payload);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={form.slug}
            onChange={(e) => update("slug", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="tagline">Tagline</Label>
        <Input
          id="tagline"
          value={form.tagline}
          onChange={(e) => update("tagline", e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            className={selectClass}
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
          >
            {TOOL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="icon">Icon key</Label>
          <Input
            id="icon"
            value={form.icon}
            onChange={(e) => update("icon", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="accent">Accent</Label>
          <select
            id="accent"
            className={selectClass}
            value={form.accent}
            onChange={(e) => update("accent", e.target.value as ToolInput["accent"])}
          >
            {TOOL_ACCENTS.map((a) => (
              <option key={a} value={a}>
                {a}
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
            onChange={(e) => update("status", e.target.value as ToolInput["status"])}
          >
            {TOOL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="keywords">Keywords (comma separated)</Label>
        <Input
          id="keywords"
          value={keywordsText}
          onChange={(e) => setKeywordsText(e.target.value)}
        />
      </div>
      <label className={cn("flex items-center gap-2 text-sm")}>
        <input
          type="checkbox"
          checked={form.featured ?? false}
          onChange={(e) => update("featured", e.target.checked)}
          className="rounded border-input"
        />
        Featured on homepage
      </label>
      <button type="submit" className="wp-button-primary" disabled={saving}>
        {saving ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
