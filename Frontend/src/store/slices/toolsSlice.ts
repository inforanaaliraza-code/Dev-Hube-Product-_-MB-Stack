import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ToolCategory } from "@/lib/tools";

export type CategoryFilter = ToolCategory | "All";
export type NavFilter = string | "All";

interface ToolsState {
  searchQuery: string;
  activeCategory: CategoryFilter;
  activeNav: NavFilter;
  globalSearchOpen: boolean;
  globalSearchQuery: string;
}

const initialState: ToolsState = {
  searchQuery: "",
  activeCategory: "All",
  activeNav: "All",
  globalSearchOpen: false,
  globalSearchQuery: "",
};

const toolsSlice = createSlice({
  name: "tools",
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setActiveCategory(state, action: PayloadAction<CategoryFilter>) {
      state.activeCategory = action.payload;
    },
    setActiveNav(state, action: PayloadAction<NavFilter>) {
      state.activeNav = action.payload;
    },
    setGlobalSearchOpen(state, action: PayloadAction<boolean>) {
      state.globalSearchOpen = action.payload;
    },
    setGlobalSearchQuery(state, action: PayloadAction<string>) {
      state.globalSearchQuery = action.payload;
    },
    resetGlobalSearch(state) {
      state.globalSearchQuery = "";
    },
  },
});

export const {
  setSearchQuery,
  setActiveCategory,
  setActiveNav,
  setGlobalSearchOpen,
  setGlobalSearchQuery,
  resetGlobalSearch,
} = toolsSlice.actions;
export default toolsSlice.reducer;
