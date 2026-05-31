"use client";

import { useEffect } from "react";
import { AuthGuard } from "@/components/admin/auth-guard";
import { WpShell } from "@/components/admin/wp-shell";
import { fetchSettings } from "@/store/slices/settingsSlice";
import { fetchTools } from "@/store/slices/toolsAdminSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.accessToken);

  useEffect(() => {
    if (!token) return;
    dispatch(fetchSettings(token));
    dispatch(fetchTools({ token }));
  }, [token, dispatch]);

  return (
    <AuthGuard>
      <WpShell>{children}</WpShell>
    </AuthGuard>
  );
}
