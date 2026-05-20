"use client";

import { useEffect } from "react";
import { AdminHeader } from "@/components/admin/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchCategories } from "@/store/slices/settingsSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function CategoriesPage() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.accessToken);
  const data = useAppSelector((s) => s.settings.categories);

  useEffect(() => {
    if (token) dispatch(fetchCategories(token));
  }, [token, dispatch]);

  return (
    <>
      <AdminHeader title="Categories" />
      <main className="p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Tool categories</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Tools</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.categories ?? []).map((c) => (
                  <TableRow key={c}>
                    <TableCell className="font-medium">{c}</TableCell>
                    <TableCell className="text-right">{data?.counts[c] ?? 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
