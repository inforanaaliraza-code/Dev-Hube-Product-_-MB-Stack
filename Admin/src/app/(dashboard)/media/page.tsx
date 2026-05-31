"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Copy, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { BulkActionBar, BulkCheckbox } from "@/components/admin/bulk-action-bar";
import { ListViewToggle } from "@/components/admin/list-view-toggle";
import { WpPageHeader } from "@/components/admin/wp-page-header";
import { useListView } from "@/hooks/use-list-view";
import { WpPostbox } from "@/components/admin/wp-postbox";
import { cmsApi, mediaFullUrl } from "@/lib/api";
import { useBulkSelection } from "@/hooks/use-bulk-selection";
import type { MediaAsset } from "@/lib/types";
import { useAppSelector } from "@/store/hooks";
import { cn } from "@/lib/utils";

const BULK_ACTIONS = [{ value: "delete", label: "Delete permanently" }];

export default function MediaPage() {
  const token = useAppSelector((s) => s.auth.accessToken);
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { view, setView } = useListView("media", "grid");

  const ids = useMemo(() => items.map((m) => m.id), [items]);
  const bulk = useBulkSelection(ids);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const rows = await cmsApi.listMedia(token);
      setItems(rows);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load media");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const onUpload = async (files: FileList | null) => {
    if (!token || !files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await cmsApi.uploadMedia(token, file);
      }
      toast.success("Uploaded");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const onDelete = async (id: string) => {
    if (!token || deletingId) return;
    if (!confirm("Delete this file?")) return;
    setDeletingId(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (bulk.selected.has(id)) bulk.toggle(id);
    try {
      await cmsApi.deleteMedia(token, id);
      toast.success("Deleted");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.toLowerCase().includes("not found")) {
        toast.success("Already removed");
      } else {
        toast.error(msg || "Delete failed");
        await load();
      }
    } finally {
      setDeletingId(null);
    }
  };

  const onBulkApply = async (action: string) => {
    if (!token || bulk.count === 0 || action !== "delete") return;
    if (!confirm(`Delete ${bulk.count} file(s)?`)) return;
    setApplying(true);
    try {
      const res = await cmsApi.bulkMedia(token, bulk.selectedIds);
      toast.success(`Deleted ${res.affected} file(s)`);
      if (res.failed > 0) toast.warning(`${res.failed} failed`);
      bulk.clear();
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Bulk delete failed");
    } finally {
      setApplying(false);
    }
  };

  const copyUrl = (path: string) => {
    const url = mediaFullUrl(path);
    navigator.clipboard.writeText(url);
    toast.success("URL copied");
  };

  return (
    <>
      <WpPageHeader title="Media Library">
        <button
          type="button"
          className="wp-button-primary page-title-action"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading…" : "Add New"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => onUpload(e.target.files)}
        />
      </WpPageHeader>
      <BulkActionBar
        count={bulk.count}
        total={items.length}
        actions={BULK_ACTIONS}
        applying={applying}
        onApply={onBulkApply}
        onClear={bulk.clear}
      />
      <WpPostbox title="Library">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-border">
          {items.length > 0 ? (
            <div className="flex items-center gap-2">
              <BulkCheckbox
                checked={bulk.isAllSelected}
                indeterminate={bulk.isSomeSelected && !bulk.isAllSelected}
                onChange={bulk.toggleAll}
                ariaLabel="Select all media"
              />
              <span className="text-sm text-muted-foreground">Select all</span>
            </div>
          ) : (
            <span />
          )}
          <ListViewToggle value={view} onChange={setView} />
        </div>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No media files yet.</p>
        ) : view === "table" ? (
          <table className="wp-list-table">
            <thead>
              <tr>
                <th className="w-10" />
                <th>Preview</th>
                <th>Name</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((m) => (
                <tr
                  key={m.id}
                  className={bulk.selected.has(m.id) ? "wp-row-selected" : undefined}
                >
                  <td>
                    <BulkCheckbox
                      checked={bulk.selected.has(m.id)}
                      onChange={() => bulk.toggle(m.id)}
                      ariaLabel={`Select ${m.originalName}`}
                    />
                  </td>
                  <td>
                    <div className="h-12 w-16 rounded overflow-hidden bg-black/20">
                      <img
                        src={mediaFullUrl(m.urlPath)}
                        alt={m.alt ?? m.originalName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </td>
                  <td>
                    <strong className="text-sm">{m.originalName}</strong>
                  </td>
                  <td className="text-xs text-muted-foreground">{m.mimeType}</td>
                  <td className="flex gap-1">
                    <button
                      type="button"
                      className="wp-button-secondary text-xs"
                      onClick={() => copyUrl(m.urlPath)}
                    >
                      <Copy className="h-3 w-3 inline" />
                    </button>
                    <button
                      type="button"
                      className="wp-button-secondary text-xs"
                      disabled={deletingId === m.id}
                      onClick={() => onDelete(m.id)}
                    >
                      <Trash2 className="h-3 w-3 inline text-destructive" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {items.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "wp-media-card relative",
                  bulk.selected.has(m.id) && "wp-media-card-selected",
                )}
              >
                <div className="absolute top-2 left-2 z-10">
                  <BulkCheckbox
                    checked={bulk.selected.has(m.id)}
                    onChange={() => bulk.toggle(m.id)}
                    ariaLabel={`Select ${m.originalName}`}
                  />
                </div>
                <div className="wp-media-thumb">
                  <img
                    src={mediaFullUrl(m.urlPath)}
                    alt={m.alt ?? m.originalName}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="p-2 text-xs space-y-1">
                  <p className="truncate font-medium" title={m.originalName}>
                    {m.originalName}
                  </p>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className="wp-button-secondary flex-1 text-xs py-1"
                      onClick={() => copyUrl(m.urlPath)}
                    >
                      <Copy className="h-3 w-3 inline mr-1" />
                      URL
                    </button>
                    <button
                      type="button"
                      className="wp-button-secondary text-xs py-1 px-2"
                      disabled={deletingId === m.id}
                      onClick={() => onDelete(m.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </WpPostbox>
    </>
  );
}
