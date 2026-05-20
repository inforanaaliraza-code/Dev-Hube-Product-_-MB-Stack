"use client";

import { useEffect } from "react";
import Link from "next/link";
import { FolderTree, Sparkles, Wrench } from "lucide-react";
import { AdminHeader } from "@/components/admin/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchCategories } from "@/store/slices/settingsSlice";
import { fetchTools } from "@/store/slices/toolsAdminSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.accessToken);
  const tools = useAppSelector((s) => s.toolsAdmin.items);
  const categories = useAppSelector((s) => s.settings.categories);
  const loading = useAppSelector((s) => s.toolsAdmin.loading);

  useEffect(() => {
    if (!token) return;
    dispatch(fetchTools({ token }));
    dispatch(fetchCategories(token));
  }, [token, dispatch]);

  const ready = tools.filter((t) => t.status === "ready").length;
  const featured = tools.filter((t) => t.featured).length;

  return (
    <>
      <AdminHeader title="Dashboard" />
      <main className="p-4 md:p-6 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total tools</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{loading ? "…" : tools.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Live</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{ready}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Featured</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{featured}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{categories?.categories.length ?? "…"}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/tools/new">
                <Wrench className="h-4 w-4" />
                Add tool
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/tools">Manage tools</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/categories">
                <FolderTree className="h-4 w-4" />
                Categories
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/gallery">
                <Sparkles className="h-4 w-4" />
                Gallery
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {tools.slice(0, 8).map((t) => (
              <div
                key={t.slug}
                className="flex items-center justify-between gap-2 text-sm border-b border-border pb-2 last:border-0"
              >
                <span className="font-medium truncate">{t.name}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline">{t.category}</Badge>
                  <Badge variant={t.status === "ready" ? "success" : "warning"}>{t.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
