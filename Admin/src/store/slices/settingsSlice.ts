import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { adminApi } from "@/lib/api";
import type { CategoriesResponse, SiteSettings } from "@/lib/types";

const defaultSettings: SiteSettings = {
  siteName: "Dev Hube",
  publicSiteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  maintenanceMode: false,
  tagline: "The developer's utility hub",
  heroTitle: "Build faster with",
  heroSubtitle: "50+ utilities in one premium hub.",
  galleryBend: 1,
  galleryScrollSpeed: 2,
  galleryScrollEase: 0.05,
};

function mapApiToSite(all: Record<string, Record<string, unknown>>): SiteSettings {
  const site = all.site ?? {};
  const gallery = all.gallery ?? {};
  return {
    siteName: String(site.siteName ?? defaultSettings.siteName),
    publicSiteUrl: String(site.publicSiteUrl ?? defaultSettings.publicSiteUrl),
    maintenanceMode: Boolean(site.maintenanceMode ?? false),
    tagline: String(site.tagline ?? defaultSettings.tagline),
    heroTitle: String(site.heroTitle ?? defaultSettings.heroTitle),
    heroSubtitle: String(site.heroSubtitle ?? defaultSettings.heroSubtitle),
    galleryBend: Number(gallery.bend ?? defaultSettings.galleryBend),
    galleryScrollSpeed: Number(gallery.scrollSpeed ?? defaultSettings.galleryScrollSpeed),
    galleryScrollEase: Number(gallery.scrollEase ?? defaultSettings.galleryScrollEase),
  };
}

interface SettingsState {
  site: SiteSettings;
  categories: CategoriesResponse | null;
  loading: boolean;
  saving: boolean;
  synced: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  site: defaultSettings,
  categories: null,
  loading: false,
  saving: false,
  synced: false,
  error: null,
};

export const fetchSettings = createAsyncThunk(
  "settings/fetchSettings",
  async (token: string) => {
    const all = await adminApi.getSettings(token);
    return mapApiToSite(all);
  },
);

export const saveSettings = createAsyncThunk(
  "settings/saveSettings",
  async ({ token, site }: { token: string; site: SiteSettings }) => {
    await adminApi.updateSetting(token, "site", {
      siteName: site.siteName,
      publicSiteUrl: site.publicSiteUrl,
      maintenanceMode: site.maintenanceMode,
      tagline: site.tagline,
      heroTitle: site.heroTitle,
      heroSubtitle: site.heroSubtitle,
    });
    await adminApi.updateSetting(token, "gallery", {
      bend: site.galleryBend,
      scrollSpeed: site.galleryScrollSpeed,
      scrollEase: site.galleryScrollEase,
    });
    return site;
  },
);

export const fetchCategories = createAsyncThunk(
  "settings/fetchCategories",
  async (token: string) => adminApi.getCategories(token),
);

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    updateSiteSettings(state, action: PayloadAction<Partial<SiteSettings>>) {
      state.site = { ...state.site, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.site = action.payload;
        state.synced = true;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load settings";
      })
      .addCase(saveSettings.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveSettings.fulfilled, (state, action) => {
        state.saving = false;
        state.site = action.payload;
        state.synced = true;
      })
      .addCase(saveSettings.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message ?? "Failed to save settings";
      })
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { updateSiteSettings } = settingsSlice.actions;
export default settingsSlice.reducer;
