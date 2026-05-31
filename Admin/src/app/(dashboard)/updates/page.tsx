"use client";

import Link from "next/link";
import { WpPageHeader } from "@/components/admin/wp-page-header";
import { WpPostbox } from "@/components/admin/wp-postbox";
import { useAppSelector } from "@/store/hooks";

export default function UpdatesPage() {
  const tools = useAppSelector((s) => s.toolsAdmin.items);
  const soon = tools.filter((t) => t.status === "soon");

  return (
    <>
      <WpPageHeader title="Updates" />
      <div className="wp-notice">
        Dev Hube admin — review tools marked &quot;soon&quot; and publish when backend workers are ready.
      </div>
      <WpPostbox title={`Pending tools (${soon.length})`}>
        {soon.length === 0 ? (
          <p>All catalog tools are marked live.</p>
        ) : (
          <ul className="list-disc pl-5 space-y-1">
            {soon.map((t) => (
              <li key={t.slug}>
                <Link href={`/tools/${t.slug}`}>{t.name}</Link> — {t.category}
              </li>
            ))}
          </ul>
        )}
      </WpPostbox>
    </>
  );
}
