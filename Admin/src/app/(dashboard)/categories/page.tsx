"use client";

import { useEffect } from "react";
import { WpPageHeader } from "@/components/admin/wp-page-header";
import { WpPostbox } from "@/components/admin/wp-postbox";
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
      <WpPageHeader title="Categories" />
      <WpPostbox title="Tool categories">
        <table className="wp-list-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Tools</th>
            </tr>
          </thead>
          <tbody>
            {data?.categories.map((cat) => (
              <tr key={cat}>
                <td>{cat}</td>
                <td>{data.counts[cat] ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </WpPostbox>
    </>
  );
}
