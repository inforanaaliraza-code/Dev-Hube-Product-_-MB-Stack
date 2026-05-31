"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { BulkActionBar, BulkCheckbox } from "@/components/admin/bulk-action-bar";
import { ListViewToggle } from "@/components/admin/list-view-toggle";
import { WpPageHeader } from "@/components/admin/wp-page-header";
import { Badge } from "@/components/ui/badge";
import { cmsApi } from "@/lib/api";
import { useBulkSelection } from "@/hooks/use-bulk-selection";
import { useListView } from "@/hooks/use-list-view";
import { cn } from "@/lib/utils";
import type { CmsContent, CmsContentType } from "@/lib/types";
import { useAppSelector } from "@/store/hooks";

const BULK_ACTIONS = [
  { value: "publish", label: "Publish" },
  { value: "draft", label: "Move to draft" },
  { value: "delete", label: "Delete permanently" },
];

export function CmsContentList({
  type,
  title,
  newHref,
  editPrefix,
}: {
  type: CmsContentType;
  title: string;
  newHref: string;
  editPrefix: string;
}) {
  const token = useAppSelector((s) => s.auth.accessToken);
  const { view, setView } = useListView(`cms-${type}`);
  const [items, setItems] = useState<CmsContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  const ids = useMemo(() => items.map((i) => i.id), [items]);
  const bulk = useBulkSelection(ids);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const rows = await cmsApi.listContents(token, type);
      setItems(rows);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, [token, type]);

  useEffect(() => {
    load();
  }, [load]);

  const onDelete = async (id: string, itemTitle: string) => {
    if (!token) return;
    if (!confirm(`Delete "${itemTitle}"?`)) return;
    try {
      await cmsApi.deleteContent(token, id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const onBulkApply = async (action: string) => {
    if (!token || bulk.count === 0) return;
    const label = BULK_ACTIONS.find((a) => a.value === action)?.label ?? action;
    if (!confirm(`${label} for ${bulk.count} item(s)?`)) return;

    setApplying(true);
    try {
      if (action === "delete") {
        const res = await cmsApi.bulkContents(token, {
          ids: bulk.selectedIds,
          action: "delete",
        });
        toast.success(`Deleted ${res.affected} item(s)`);
      } else {
        const status = action === "publish" ? "published" : "draft";
        const res = await cmsApi.bulkContents(token, {
          ids: bulk.selectedIds,
          action: "setStatus",
          status,
        });
        toast.success(`Updated ${res.affected} item(s)`);
      }
      bulk.clear();
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Bulk action failed");
    } finally {
      setApplying(false);
    }
  };

  return (
    <>
      <WpPageHeader title={title}>
        <Link href={newHref} className="wp-button-primary page-title-action">
          <Plus className="h-4 w-4" />
          Add New
        </Link>
      </WpPageHeader>
      <div className="flex flex-wrap items-center justify-end gap-3 mb-4">
        <ListViewToggle value={view} onChange={setView} />
      </div>
      <BulkActionBar
        count={bulk.count}
        total={items.length}
        actions={BULK_ACTIONS}
        applying={applying}
        onApply={onBulkApply}
        onClear={bulk.clear}
      />
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No {type === "post" ? "posts" : "pages"} found
        </p>
      ) : view === "grid" ? (
        <div className="wp-admin-grid">
          {items.map((p) => (
            <article
              key={p.id}
              className={cn("wp-admin-card", bulk.selected.has(p.id) && "ring-1 ring-primary/50")}
            >
              <div className="flex items-start gap-2 mb-2">
                <BulkCheckbox
                  checked={bulk.selected.has(p.id)}
                  onChange={() => bulk.toggle(p.id)}
                  ariaLabel={`Select ${p.title}`}
                />
                <Badge variant={p.status === "published" ? "default" : "secondary"}>
                  {p.status}
                </Badge>
              </div>
              <h3 className="font-medium line-clamp-2">{p.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{p.slug}</p>
              {p.excerpt ? (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{p.excerpt}</p>
              ) : null}
              <p className="text-xs text-muted-foreground mt-2">
                {new Date(p.updatedAt).toLocaleDateString()}
              </p>
              <div className="wp-admin-card-actions">
                <Link href={`${editPrefix}/${p.id}`} className="wp-button-secondary text-xs">
                  <Pencil className="h-3 w-3 inline mr-1" />
                  Edit
                </Link>
                <button
                  type="button"
                  className="wp-button-secondary text-xs text-destructive"
                  onClick={() => onDelete(p.id, p.title)}
                >
                  <Trash2 className="h-3 w-3 inline mr-1" />
                  Delete
                </button>
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
                ariaLabel="Select all"
              />
            </th>
            <th>Title</th>
            <th>Slug</th>
            <th>Status</th>
            <th>Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
            {items.map((p) => (
              <tr key={p.id} className={bulk.selected.has(p.id) ? "wp-row-selected" : undefined}>
                <td>
                  <BulkCheckbox
                    checked={bulk.selected.has(p.id)}
                    onChange={() => bulk.toggle(p.id)}
                    ariaLabel={`Select ${p.title}`}
                  />
                </td>
                <td>
                  <strong>{p.title}</strong>
                </td>
                <td>{p.slug}</td>
                <td>
                  <Badge variant={p.status === "published" ? "default" : "secondary"}>
                    {p.status}
                  </Badge>
                </td>
                <td>{new Date(p.updatedAt).toLocaleDateString()}</td>
                <td className="flex gap-2">
                  <Link href={`${editPrefix}/${p.id}`} className="wp-button-secondary text-xs">
                    <Pencil className="h-3 w-3" />
                  </Link>
                  <button
                    type="button"
                    className="wp-button-secondary text-xs"
                    onClick={() => onDelete(p.id, p.title)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      )}
    </>
  );
}
