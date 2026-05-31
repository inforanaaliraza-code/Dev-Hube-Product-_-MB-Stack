"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { BulkActionBar, BulkCheckbox } from "@/components/admin/bulk-action-bar";
import { ListViewToggle } from "@/components/admin/list-view-toggle";
import { WpPageHeader } from "@/components/admin/wp-page-header";
import { useListView } from "@/hooks/use-list-view";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { pluginsApi } from "@/lib/api";
import { useBulkSelection } from "@/hooks/use-bulk-selection";
import type { Plugin, PluginType } from "@/lib/types";
import { useAppSelector } from "@/store/hooks";

const BULK_ACTIONS = [
  { value: "activate", label: "Activate" },
  { value: "deactivate", label: "Deactivate" },
  { value: "delete", label: "Delete permanently" },
];

export default function PluginsPage() {
  const token = useAppSelector((s) => s.auth.accessToken);
  const [items, setItems] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"" | PluginType>("");
  const [applying, setApplying] = useState(false);
  const { view, setView } = useListView("plugins");

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const rows = await pluginsApi.list(token, typeFilter || undefined);
      setItems(rows);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, [token, typeFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }, [items, search]);

  const ids = useMemo(() => filtered.map((p) => p.id), [filtered]);
  const bulk = useBulkSelection(ids);

  const onDelete = async (p: Plugin) => {
    if (!token) return;
    if (p.isSystem) {
      toast.error("System plugins cannot be deleted");
      return;
    }
    if (!confirm(`Delete plugin "${p.name}"?`)) return;
    try {
      await pluginsApi.delete(token, p.id);
      toast.success("Deleted");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const onBulkApply = async (action: string) => {
    if (!token || bulk.count === 0) return;
    const label = BULK_ACTIONS.find((a) => a.value === action)?.label ?? action;
    if (!confirm(`${label} for ${bulk.count} plugin(s)?`)) return;

    setApplying(true);
    try {
      if (action === "delete") {
        const res = await pluginsApi.bulk(token, { ids: bulk.selectedIds, action: "delete" });
        toast.success(`Deleted ${res.affected} plugin(s)`);
      } else {
        const status = action === "activate" ? "active" : "inactive";
        const res = await pluginsApi.bulk(token, {
          ids: bulk.selectedIds,
          action: "setStatus",
          status,
        });
        toast.success(`Updated ${res.affected} plugin(s)`);
      }
      bulk.clear();
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Bulk action failed");
    } finally {
      setApplying(false);
    }
  };

  const active = items.filter((p) => p.status === "active").length;

  return (
    <>
      <WpPageHeader title="Plugins">
        <Link href="/plugins/new" className="wp-button-primary page-title-action">
          <Plus className="h-4 w-4" />
          Add New
        </Link>
      </WpPageHeader>
      <div className="flex flex-wrap gap-2 mb-4 text-sm">
        <span className="wp-stat-pill">Total: {items.length}</span>
        <span className="wp-stat-pill">Active: {active}</span>
        <span className="wp-stat-pill">Inactive: {items.length - active}</span>
      </div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Input
          placeholder="Search plugins…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <select
          className="flex h-9 rounded-lg border border-input bg-background/50 px-3 text-sm"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as "" | PluginType)}
        >
          <option value="">All types</option>
          <option value="integration">Integration</option>
          <option value="worker">Worker</option>
          <option value="extension">Extension</option>
        </select>
        <div className="ml-auto">
          <ListViewToggle value={view} onChange={setView} />
        </div>
      </div>
      <BulkActionBar
        count={bulk.count}
        total={filtered.length}
        actions={BULK_ACTIONS}
        applying={applying}
        onApply={onBulkApply}
        onClear={bulk.clear}
      />
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No plugins found</p>
      ) : view === "grid" ? (
        <div className="wp-admin-grid">
          {filtered.map((p) => (
            <article
              key={p.id}
              className={cn(
                "wp-admin-card",
                bulk.selected.has(p.id) && "ring-1 ring-primary/50",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <BulkCheckbox
                  checked={bulk.selected.has(p.id)}
                  onChange={() => bulk.toggle(p.id)}
                  ariaLabel={`Select ${p.name}`}
                />
                <Badge variant={p.status === "active" ? "default" : "secondary"}>
                  {p.status}
                </Badge>
              </div>
              <h3 className="font-medium mt-2">{p.name}</h3>
              {p.isSystem ? (
                <span className="text-xs text-muted-foreground">System plugin</span>
              ) : null}
              <p className="text-xs text-muted-foreground mt-1">
                <code>{p.slug}</code> · {p.type} · v{p.version}
              </p>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{p.description}</p>
              <div className="wp-admin-card-actions">
                {p.adminPath ? (
                  <Link href={p.adminPath} className="wp-button-secondary text-xs">
                    Open
                  </Link>
                ) : null}
                <Link href={`/plugins/${p.id}`} className="wp-button-secondary text-xs">
                  <Pencil className="h-3 w-3 inline mr-1" />
                  Edit
                </Link>
                {!p.isSystem ? (
                  <button
                    type="button"
                    className="wp-button-secondary text-xs text-destructive"
                    onClick={() => onDelete(p)}
                  >
                    <Trash2 className="h-3 w-3 inline mr-1" />
                    Delete
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : (
      <table className="wp-list-table">
        <thead>
          <tr>
            <th className="w-10">
              <BulkCheckbox
                checked={bulk.isAllSelected}
                indeterminate={bulk.isSomeSelected && !bulk.isAllSelected}
                onChange={bulk.toggleAll}
                ariaLabel="Select all plugins"
              />
            </th>
            <th>Name</th>
            <th>Slug</th>
            <th>Type</th>
            <th>Version</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
            {filtered.map((p) => (
              <tr
                key={p.id}
                className={bulk.selected.has(p.id) ? "wp-row-selected" : undefined}
              >
                <td>
                  <BulkCheckbox
                    checked={bulk.selected.has(p.id)}
                    onChange={() => bulk.toggle(p.id)}
                    ariaLabel={`Select ${p.name}`}
                  />
                </td>
                <td>
                  <strong>{p.name}</strong>
                  {p.isSystem ? (
                    <span className="ml-2 text-xs text-muted-foreground">(system)</span>
                  ) : null}
                  <div className="text-xs text-muted-foreground">{p.description}</div>
                </td>
                <td>
                  <code>{p.slug}</code>
                </td>
                <td>{p.type}</td>
                <td>{p.version}</td>
                <td>
                  <Badge variant={p.status === "active" ? "default" : "secondary"}>
                    {p.status}
                  </Badge>
                </td>
                <td className="flex flex-wrap gap-1">
                  {p.adminPath ? (
                    <Link href={p.adminPath} className="wp-button-secondary text-xs">
                      Open
                    </Link>
                  ) : null}
                  <Link href={`/plugins/${p.id}`} className="wp-button-secondary text-xs">
                    <Pencil className="h-3 w-3" />
                  </Link>
                  {!p.isSystem ? (
                    <button
                      type="button"
                      className="wp-button-secondary text-xs"
                      onClick={() => onDelete(p)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      )}
    </>
  );
}
