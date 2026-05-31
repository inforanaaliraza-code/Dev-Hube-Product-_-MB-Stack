"use client";

import { WpPageHeader } from "@/components/admin/wp-page-header";
import { SettingsFrontendForm } from "@/components/admin/settings-form";

export default function SettingsFrontendPage() {
  return (
    <>
      <WpPageHeader title="Frontend copy" />
      <SettingsFrontendForm />
    </>
  );
}
