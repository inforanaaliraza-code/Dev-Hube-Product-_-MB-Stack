"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchTools } from "@/store/slices/toolsAdminSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function GalleryPage() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.accessToken);
  const tools = useAppSelector((s) => s.toolsAdmin.items);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  useEffect(() => {
    if (token) dispatch(fetchTools({ token }));
  }, [token, dispatch]);

  return (
    <>
      <AdminHeader title="Gallery" />
      <main className="p-4 md:p-6 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Homepage circular gallery</CardTitle>
            <CardDescription>
              Each tool appears in the scroll gallery with a Picsum image seeded by slug. Edit
              tools to change labels; gallery bend/speed in Settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {tools.length} items in gallery (duplicated in the WebGL loop on the public site).
            </p>
            <Button variant="outline" asChild>
              <Link href={`${siteUrl}/#tool-gallery`} target="_blank" rel="noopener noreferrer">
                Preview on site
              </Link>
            </Button>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 max-h-[480px] overflow-y-auto">
              {tools.map((t) => (
                <div
                  key={t.slug}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border p-3 text-sm"
                >
                  <span className="truncate font-medium">{t.name}</span>
                  <Badge variant="outline">{t.category}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
