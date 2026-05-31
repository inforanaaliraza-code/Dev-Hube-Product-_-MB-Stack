"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { BulkActionBar, BulkCheckbox } from "@/components/admin/bulk-action-bar";
import { ListViewToggle } from "@/components/admin/list-view-toggle";
import { WpPageHeader } from "@/components/admin/wp-page-header";
import { useListView } from "@/hooks/use-list-view";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/api";
import { useBulkSelection } from "@/hooks/use-bulk-selection";
import { deleteTool, fetchTools, setSearch } from "@/store/slices/toolsAdminSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const BULK_ACTIONS = [
  { value: "ready", label: "Mark as ready" },
  { value: "soon", label: "Mark as coming soon" },
  { value: "feature", label: "Set featured" },
  { value: "unfeature", label: "Remove featured" },
  { value: "delete", label: "Delete permanently" },
];

export default function ToolsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.accessToken);
  const { items, loading, search, error } = useAppSelector((s) => s.toolsAdmin);
  const [applying, setApplying] = useState(false);
  const { view, setView } = useListView("tools");

  const slugs = useMemo(() => items.map((t) => t.slug), [items]);
  const bulk = useBulkSelection(slugs);

  useEffect(() => {
    if (!token) return;
    const t = setTimeout(() => {
      dispatch(fetchTools({ token, search }));
    }, 300);
    return () => clearTimeout(t);
  }, [token, search, dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleDelete = async (slug: string, name: string) => {
    if (!token) return;
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await dispatch(deleteTool({ token, slug })).unwrap();
      toast.success("Tool deleted");
    } catch (e) {
      dispatch(fetchTools({ token, search }));
      const msg = e instanceof Error ? e.message : "Delete failed";
      if (msg.toLowerCase().includes("not found")) {
        toast.message("Tool was already removed");
      } else {
        toast.error(msg);
      }
    }
  };

  const onBulkApply = async (action: string) => {
    if (!token || bulk.count === 0) return;
    const label = BULK_ACTIONS.find((a) => a.value === action)?.label ?? action;
    if (!confirm(`${label} for ${bulk.count} tool(s)?`)) return;

    setApplying(true);
    try {
      let res;
      if (action === "delete") {
        res = await adminApi.bulkTools(token, {
          slugs: bulk.selectedIds,
          action: "delete",
        });
      } else if (action === "ready" || action === "soon") {
        res = await adminApi.bulkTools(token, {
          slugs: bulk.selectedIds,
          action: "setStatus",
          status: action,
        });
      } else if (action === "feature" || action === "unfeature") {
        res = await adminApi.bulkTools(token, {
          slugs: bulk.selectedIds,
          action: "setFeatured",
          featured: action === "feature",
        });
      } else {
        return;
      }
      toast.success(`Updated ${res.affected} tool(s)`);
      if (res.failed > 0) toast.warning(`${res.failed} failed`);
      bulk.clear();
      dispatch(fetchTools({ token, search }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Bulk action failed");
    } finally {
      setApplying(false);
    }
  };

  return (
    <>
      <WpPageHeader title="Tools">
        <Link href="/tools/new" className="wp-button-primary page-title-action">
          <Plus className="h-4 w-4" />
          Add New
        </Link>
      </WpPageHeader>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex-1 min-w-[200px] max-w-sm">
          <Input
            placeholder="Search tools…"
            value={search}
            onChange={(e) => dispatch(setSearch(e.target.value))}
          />
        </div>
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
      {loading && items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No tools found</p>
      ) : view === "grid" ? (
        <div className="wp-admin-grid">
          {items.map((t) => (
            <article
              key={t.slug}
              className={cn(
                "wp-admin-card",
                bulk.selected.has(t.slug) && "ring-1 ring-primary/50",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <BulkCheckbox
                  checked={bulk.selected.has(t.slug)}
                  onChange={() => bulk.toggle(t.slug)}
                  ariaLabel={`Select ${t.name}`}
                />
                <Badge variant={t.status === "ready" ? "success" : "warning"}>{t.status}</Badge>
              </div>
              <h3 className="font-medium mt-2">{t.name}</h3>
              <p className="text-xs text-muted-foreground">{t.slug}</p>
              <p className="text-sm text-muted-foreground mt-2">{t.category}</p>
              <p className="text-xs mt-1">{t.featured ? "Featured" : "Not featured"}</p>
              <div className="wp-admin-card-actions">
                <button
                  type="button"
                  className="wp-button-secondary text-xs"
                  onClick={() => router.push(`/tools/${t.slug}`)}
                >
                  <Pencil className="h-3 w-3 inline mr-1" />
                  Edit
                </button>
                <button
                  type="button"
                  className="wp-button-secondary text-xs text-destructive"
                  onClick={() => handleDelete(t.slug, t.name)}
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
                  ariaLabel="Select all tools"
                />
              </th>
              <th>Name</th>
              <th>Category</th>
              <th>Status</th>
              <th>Featured</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((t) => (
              <tr
                key={t.slug}
                className={bulk.selected.has(t.slug) ? "wp-row-selected" : undefined}
              >
                <td>
                  <BulkCheckbox
                    checked={bulk.selected.has(t.slug)}
                    onChange={() => bulk.toggle(t.slug)}
                    ariaLabel={`Select ${t.name}`}
                  />
                </td>
                <td>
                  <strong>{t.name}</strong>
                  <br />
                  <span className="text-muted-foreground">{t.slug}</span>
                </td>
                <td>{t.category}</td>
                <td>
                  <Badge variant={t.status === "ready" ? "success" : "warning"}>{t.status}</Badge>
                </td>
                <td>{t.featured ? "Yes" : "—"}</td>
                <td>
                  <button
                    type="button"
                    className="wp-button-secondary mr-1"
                    onClick={() => router.push(`/tools/${t.slug}`)}
                  >
                    <Pencil className="h-3.5 w-3.5 inline" />
                  </button>
                  <button
                    type="button"
                    className="wp-button-secondary"
                    onClick={() => handleDelete(t.slug, t.name)}
                  >
                    <Trash2 className="h-3.5 w-3.5 inline text-destructive" />
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
