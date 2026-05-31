"use client";

import { useEffect } from "react";
import Link from "next/link";
import { WpPageHeader } from "@/components/admin/wp-page-header";
import { WpPostbox } from "@/components/admin/wp-postbox";
import { Badge } from "@/components/ui/badge";
import { fetchTools } from "@/store/slices/toolsAdminSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function GalleryPage() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.accessToken);
  const tools = useAppSelector((s) => s.toolsAdmin.items);
  const siteUrl = useAppSelector((s) => s.settings.site.publicSiteUrl);

  useEffect(() => {
    if (token) dispatch(fetchTools({ token }));
  }, [token, dispatch]);

  return (
    <>
      <WpPageHeader title="Gallery" />
      <WpPostbox title="Homepage circular gallery">
        <p className="mb-3 text-muted-foreground">
          Each tool appears in the scroll gallery. Bend and speed are controlled under{" "}
          <Link href="/settings/gallery">Settings → Gallery</Link>.
        </p>
        <p className="mb-4">
          <strong>{tools.length}</strong> tools in gallery.
        </p>
        <Link href={`${siteUrl}/#tool-gallery`} target="_blank" rel="noopener noreferrer" className="wp-button-secondary">
          Preview on site
        </Link>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 max-h-[480px] overflow-y-auto mt-4">
          {tools.map((t) => (
            <div
              key={t.slug}
              className="flex items-center justify-between gap-2 rounded-lg border border-border p-3 text-sm glass"
            >
              <span className="truncate font-medium">{t.name}</span>
              <Badge variant="outline">{t.category}</Badge>
            </div>
          ))}
        </div>
      </WpPostbox>
    </>
  );
}
