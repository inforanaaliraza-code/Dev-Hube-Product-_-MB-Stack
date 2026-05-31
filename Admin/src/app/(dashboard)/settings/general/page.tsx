"use client";

import { WpPageHeader } from "@/components/admin/wp-page-header";
import { SettingsGeneralForm } from "@/components/admin/settings-form";

export default function SettingsGeneralPage() {
  return (
    <>
      <WpPageHeader title="General Settings" />
      <SettingsGeneralForm />
    </>
  );
}
