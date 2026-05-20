"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteTool, fetchTools, setSearch } from "@/store/slices/toolsAdminSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function ToolsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.accessToken);
  const { items, loading, search, error } = useAppSelector((s) => s.toolsAdmin);

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
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  return (
    <>
      <AdminHeader title="Tools" />
      <main className="p-4 md:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <Input
            placeholder="Search tools…"
            value={search}
            onChange={(e) => dispatch(setSearch(e.target.value))}
            className="max-w-sm"
          />
          <Button asChild>
            <Link href="/tools/new">
              <Plus className="h-4 w-4" />
              New tool
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="p-0 pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Loading…
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No tools found
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((t) => (
                    <TableRow key={t.slug}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{t.name}</p>
                          <p className="text-xs text-muted-foreground">{t.slug}</p>
                        </div>
                      </TableCell>
                      <TableCell>{t.category}</TableCell>
                      <TableCell>
                        <Badge variant={t.status === "ready" ? "success" : "warning"}>
                          {t.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{t.featured ? "Yes" : "—"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/tools/${t.slug}`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(t.slug, t.name)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
