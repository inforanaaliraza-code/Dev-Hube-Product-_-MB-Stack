"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cmsApi, mediaFullUrl } from "@/lib/api";
import type { MediaAsset } from "@/lib/types";

export function MediaImageField({
  token,
  label,
  value,
  previewUrl,
  onChange,
}: {
  token: string;
  label: string;
  value: string | null;
  previewUrl: string | null;
  onChange: (id: string | null, url: string | null) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !token) return;
    setLoading(true);
    cmsApi
      .listMedia(token)
      .then(setMedia)
      .finally(() => setLoading(false));
  }, [open, token]);

  const resolveUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    const apiHost = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1").replace(
      /\/api\/v1\/?$/,
      "",
    );
    if (url.startsWith("/api/")) return `${apiHost}${url}`;
    return mediaFullUrl(url);
  };

  const displayUrl =
    previewUrl ?? (value ? media.find((m) => m.id === value)?.urlPath : null);
  const resolved = resolveUrl(displayUrl);

  const pick = (asset: MediaAsset) => {
    onChange(asset.id, mediaFullUrl(asset.urlPath));
    setOpen(false);
  };

  const upload = async (file: File) => {
    const asset = await cmsApi.uploadMedia(token, file);
    onChange(asset.id, mediaFullUrl(asset.urlPath));
    setMedia((prev) => [asset, ...prev]);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {resolved ? (
        <div className="media-image-preview-frame w-full max-w-full">
          <img src={resolved} alt="" className="media-image-preview-img" />
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen((o) => !o)}>
          {open ? "Close library" : "Media library"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
          Upload image
        </Button>
        {value ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(null, null)}
          >
            Remove
          </Button>
        ) : null}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
          e.target.value = "";
        }}
      />
      {open ? (
        <div className="max-h-48 overflow-y-auto rounded-lg border border-border p-2 grid grid-cols-4 gap-2">
          {loading ? (
            <p className="col-span-4 text-sm text-muted-foreground">Loading…</p>
          ) : media.length === 0 ? (
            <p className="col-span-4 text-sm text-muted-foreground">No media yet.</p>
          ) : (
            media.map((asset) => (
              <button
                key={asset.id}
                type="button"
                className="media-thumb-btn"
                onClick={() => pick(asset)}
              >
                <img
                  src={mediaFullUrl(asset.urlPath)}
                  alt={asset.alt ?? asset.originalName}
                  className="media-thumb-img"
                />
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
