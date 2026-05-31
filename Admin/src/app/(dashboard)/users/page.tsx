"use client";

import { useEffect, useState } from "react";
import { WpPageHeader } from "@/components/admin/wp-page-header";
import { WpPostbox } from "@/components/admin/wp-postbox";
import { adminApi } from "@/lib/api";
import type { AdminUserRow } from "@/lib/types";
import { useAppSelector } from "@/store/hooks";

export default function UsersPage() {
  const token = useAppSelector((s) => s.auth.accessToken);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    adminApi
      .getAdmins(token)
      .then(setUsers)
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <>
      <WpPageHeader title="Users" />
      <WpPostbox title="Administrators">
        {loading ? (
          <p>Loading…</p>
        ) : (
          <table className="wp-list-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>{u.name ?? "—"}</td>
                  <td>{u.role}</td>
                  <td>{u.isActive ? "Active" : "Inactive"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </WpPostbox>
    </>
  );
}
