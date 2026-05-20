import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { adminApi } from "@/lib/api";
import type { CategoriesResponse, SiteSettings } from "@/lib/types";

const SETTINGS_KEY = "dev-hube-site-settings";

const defaultSettings: SiteSettings = {
  siteName: "Dev Hube",
  publicSiteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  maintenanceMode: false,
  galleryBend: 1,
  galleryScrollSpeed: 2,
};

function loadSettings(): SiteSettings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
}

interface SettingsState {
  site: SiteSettings;
  categories: CategoriesResponse | null;
  loading: boolean;
}

const initialState: SettingsState = {
  site: defaultSettings,
  categories: null,
  loading: false,
};

export const fetchCategories = createAsyncThunk(
  "settings/fetchCategories",
  async (token: string) => adminApi.getCategories(token),
);

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    hydrateSettings(state) {
      state.site = loadSettings();
    },
    updateSiteSettings(state, action: PayloadAction<Partial<SiteSettings>>) {
      state.site = { ...state.site, ...action.payload };
      if (typeof window !== "undefined") {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.site));
      }
    },
  },
  extraReducers: (builder) => {
    builder
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

export const { hydrateSettings, updateSiteSettings } = settingsSlice.actions;
export default settingsSlice.reducer;
