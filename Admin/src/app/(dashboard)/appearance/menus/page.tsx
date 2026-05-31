"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { WpPageHeader } from "@/components/admin/wp-page-header";
import { WpPostbox } from "@/components/admin/wp-postbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cmsApi } from "@/lib/api";
import type { NavMenuItem } from "@/lib/types";
import { useAppSelector } from "@/store/hooks";

function newItem(order: number): NavMenuItem {
  return {
    id: `item-${Date.now()}`,
    label: "New link",
    href: "/",
    target: "_self",
    sortOrder: order,
    enabled: true,
  };
}

export default function MenusPage() {
  const token = useAppSelector((s) => s.auth.accessToken);
  const [items, setItems] = useState<NavMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    cmsApi
      .getNavigation(token)
      .then((rows) => setItems([...rows].sort((a, b) => a.sortOrder - b.sortOrder)))
      .catch((e) => toast.error(e instanceof Error ? e.message : "Load failed"))
      .finally(() => setLoading(false));
  }, [token]);

  const move = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= items.length) return;
    const copy = [...items];
    const tmp = copy[index];
    copy[index] = copy[next];
    copy[next] = tmp;
    setItems(copy.map((i, idx) => ({ ...i, sortOrder: idx })));
  };

  const update = (index: number, patch: Partial<NavMenuItem>) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  };

  const remove = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index).map((item, idx) => ({
      ...item,
      sortOrder: idx,
    })));
  };

  const onSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const saved = await cmsApi.updateNavigation(
        token,
        items.map((item, idx) => ({ ...item, sortOrder: idx })),
      );
      setItems(saved);
      toast.success("Menu saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <WpPageHeader title="Menus">
        <button
          type="button"
          className="wp-button-primary page-title-action"
          onClick={onSave}
          disabled={saving || loading}
        >
          {saving ? "Saving…" : "Save Menu"}
        </button>
      </WpPageHeader>
      <WpPostbox title="Header navigation">
        {loading ? (
          <p className="text-sm">Loading…</p>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="wp-menu-row grid-cols-1 sm:grid-cols-[1fr_1fr_auto_auto] items-end"
              >
                <div>
                  <Label>Label</Label>
                  <Input
                    value={item.label}
                    onChange={(e) => update(index, { label: e.target.value })}
                  />
                </div>
                <div>
                  <Label>URL</Label>
                  <Input
                    value={item.href}
                    onChange={(e) => update(index, { href: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Target</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                    value={item.target}
                    onChange={(e) =>
                      update(index, {
                        target: e.target.value as "_self" | "_blank",
                      })
                    }
                  >
                    <option value="_self">Same tab</option>
                    <option value="_blank">New tab</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pb-1">
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={item.enabled}
                      onChange={(e) => update(index, { enabled: e.target.checked })}
                    />
                    Show
                  </label>
                  <button
                    type="button"
                    className="wp-button-secondary p-1"
                    onClick={() => move(index, -1)}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="wp-button-secondary p-1"
                    onClick={() => move(index, 1)}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="wp-button-secondary p-1"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="wp-button-secondary"
              onClick={() => setItems((prev) => [...prev, newItem(prev.length)])}
            >
              <Plus className="h-4 w-4 inline mr-1" />
              Add menu item
            </button>
          </div>
        )}
      </WpPostbox>
    </>
  );
}
