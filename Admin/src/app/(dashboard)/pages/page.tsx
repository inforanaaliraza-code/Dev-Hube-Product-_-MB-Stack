"use client";

import { CmsContentList } from "@/components/admin/cms-content-list";

export default function PagesListPage() {
  return (
    <CmsContentList
      type="page"
      title="Pages"
      newHref="/pages/new"
      editPrefix="/pages"
    />
  );
}
