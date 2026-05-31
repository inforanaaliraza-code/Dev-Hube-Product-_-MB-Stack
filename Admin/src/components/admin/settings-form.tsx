"use client";

import { toast } from "sonner";
import { WpPostbox } from "@/components/admin/wp-postbox";
import { saveSettings, updateSiteSettings } from "@/store/slices/settingsSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export function SettingsGeneralForm() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.accessToken);
  const site = useAppSelector((s) => s.settings.site);
  const saving = useAppSelector((s) => s.settings.saving);

  const save = async () => {
    if (!token) return;
    try {
      await dispatch(saveSettings({ token, site })).unwrap();
      toast.success("Settings saved to database");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  };

  return (
    <WpPostbox title="General Settings">
      <table className="wp-form-table">
        <tbody>
          <tr>
            <th scope="row">Site title</th>
            <td>
              <input
                type="text"
                value={site.siteName}
                onChange={(e) => dispatch(updateSiteSettings({ siteName: e.target.value }))}
              />
            </td>
          </tr>
          <tr>
            <th scope="row">Tagline</th>
            <td>
              <input
                type="text"
                value={site.tagline}
                onChange={(e) => dispatch(updateSiteSettings({ tagline: e.target.value }))}
              />
            </td>
          </tr>
          <tr>
            <th scope="row">Public site URL</th>
            <td>
              <input
                type="url"
                value={site.publicSiteUrl}
                onChange={(e) => dispatch(updateSiteSettings({ publicSiteUrl: e.target.value }))}
              />
            </td>
          </tr>
          <tr>
            <th scope="row">Maintenance mode</th>
            <td>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={site.maintenanceMode}
                  onChange={(e) =>
                    dispatch(updateSiteSettings({ maintenanceMode: e.target.checked }))
                  }
                />
                Discourage visitors (show maintenance notice on frontend)
              </label>
            </td>
          </tr>
        </tbody>
      </table>
      <p className="mt-4">
        <button type="button" className="wp-button-primary" disabled={saving} onClick={() => void save()}>
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </p>
    </WpPostbox>
  );
}

export function SettingsFrontendForm() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.accessToken);
  const site = useAppSelector((s) => s.settings.site);
  const saving = useAppSelector((s) => s.settings.saving);

  const save = async () => {
    if (!token) return;
    try {
      await dispatch(saveSettings({ token, site })).unwrap();
      toast.success("Frontend copy saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  };

  return (
    <WpPostbox title="Homepage copy">
      <table className="wp-form-table">
        <tbody>
          <tr>
            <th scope="row">Hero title</th>
            <td>
              <input
                type="text"
                value={site.heroTitle}
                onChange={(e) => dispatch(updateSiteSettings({ heroTitle: e.target.value }))}
              />
            </td>
          </tr>
          <tr>
            <th scope="row">Hero subtitle</th>
            <td>
              <textarea
                rows={3}
                value={site.heroSubtitle}
                onChange={(e) => dispatch(updateSiteSettings({ heroSubtitle: e.target.value }))}
              />
            </td>
          </tr>
        </tbody>
      </table>
      <p className="mt-4">
        <button type="button" className="wp-button-primary" disabled={saving} onClick={() => void save()}>
          Save Changes
        </button>
      </p>
    </WpPostbox>
  );
}

export function SettingsGalleryForm() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.accessToken);
  const site = useAppSelector((s) => s.settings.site);
  const saving = useAppSelector((s) => s.settings.saving);

  const save = async () => {
    if (!token) return;
    try {
      await dispatch(saveSettings({ token, site })).unwrap();
      toast.success("Gallery settings saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  };

  return (
    <WpPostbox title="Circular gallery (homepage)">
      <table className="wp-form-table">
        <tbody>
          <tr>
            <th scope="row">Bend</th>
            <td>
              <input
                type="number"
                step="0.1"
                value={site.galleryBend}
                onChange={(e) =>
                  dispatch(updateSiteSettings({ galleryBend: Number(e.target.value) }))
                }
              />
            </td>
          </tr>
          <tr>
            <th scope="row">Scroll speed</th>
            <td>
              <input
                type="number"
                step="0.5"
                value={site.galleryScrollSpeed}
                onChange={(e) =>
                  dispatch(updateSiteSettings({ galleryScrollSpeed: Number(e.target.value) }))
                }
              />
            </td>
          </tr>
          <tr>
            <th scope="row">Scroll ease</th>
            <td>
              <input
                type="number"
                step="0.01"
                value={site.galleryScrollEase}
                onChange={(e) =>
                  dispatch(updateSiteSettings({ galleryScrollEase: Number(e.target.value) }))
                }
              />
            </td>
          </tr>
        </tbody>
      </table>
      <p className="mt-4">
        <button type="button" className="wp-button-primary" disabled={saving} onClick={() => void save()}>
          Save Changes
        </button>
      </p>
    </WpPostbox>
  );
}
