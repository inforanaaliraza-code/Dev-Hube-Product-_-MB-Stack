"use client";

import { useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { hydrateSettings, updateSiteSettings } from "@/store/slices/settingsSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const site = useAppSelector((s) => s.settings.site);

  useEffect(() => {
    dispatch(hydrateSettings());
  }, [dispatch]);

  const save = () => {
    dispatch(updateSiteSettings(site));
    toast.success("Settings saved locally");
  };

  return (
    <>
      <AdminHeader title="Settings" />
      <main className="p-4 md:p-6 space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Site</CardTitle>
            <CardDescription>Branding and public URLs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site name</Label>
              <Input
                id="siteName"
                value={site.siteName}
                onChange={(e) => dispatch(updateSiteSettings({ siteName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="publicUrl">Public site URL</Label>
              <Input
                id="publicUrl"
                value={site.publicSiteUrl}
                onChange={(e) =>
                  dispatch(updateSiteSettings({ publicSiteUrl: e.target.value }))
                }
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={site.maintenanceMode}
                onChange={(e) =>
                  dispatch(updateSiteSettings({ maintenanceMode: e.target.checked }))
                }
              />
              Maintenance mode
            </label>
            <Button onClick={save}>Save settings</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gallery (homepage)</CardTitle>
            <CardDescription>Circular gallery scroll behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bend">Bend</Label>
              <Input
                id="bend"
                type="number"
                step="0.1"
                value={site.galleryBend}
                onChange={(e) =>
                  dispatch(updateSiteSettings({ galleryBend: Number(e.target.value) }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scroll">Scroll speed</Label>
              <Input
                id="scroll"
                type="number"
                step="0.5"
                value={site.galleryScrollSpeed}
                onChange={(e) =>
                  dispatch(
                    updateSiteSettings({ galleryScrollSpeed: Number(e.target.value) }),
                  )
                }
              />
            </div>
            <Button onClick={save}>Save gallery prefs</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API</CardTitle>
            <CardDescription>Backend connection</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              API base:{" "}
              <code className="text-foreground">
                {process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1"}
              </code>
            </p>
            <p>Admin key is set server-side in `.env` (never expose in the browser).</p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/tools">Manage tools via API</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
