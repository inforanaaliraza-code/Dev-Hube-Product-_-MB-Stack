"use client";

import { WpPageHeader } from "@/components/admin/wp-page-header";
import { SettingsGalleryForm } from "@/components/admin/settings-form";

export default function SettingsGalleryPage() {
  return (
    <>
      <WpPageHeader title="Gallery Settings" />
      <SettingsGalleryForm />
    </>
  );
}
