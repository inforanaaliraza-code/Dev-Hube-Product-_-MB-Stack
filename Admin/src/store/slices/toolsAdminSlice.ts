import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { adminApi } from "@/lib/api";
import type { Tool, ToolInput } from "@/lib/types";

interface ToolsAdminState {
  items: Tool[];
  loading: boolean;
  error: string | null;
  search: string;
}

const initialState: ToolsAdminState = {
  items: [],
  loading: false,
  error: null,
  search: "",
};

export const fetchTools = createAsyncThunk(
  "toolsAdmin/fetch",
  async ({ token, search }: { token: string; search?: string }) => {
    return adminApi.getTools(token, search);
  },
);

export const createTool = createAsyncThunk(
  "toolsAdmin/create",
  async ({ token, data }: { token: string; data: ToolInput }) => {
    return adminApi.createTool(token, data);
  },
);

export const updateTool = createAsyncThunk(
  "toolsAdmin/update",
  async ({
    token,
    slug,
    data,
  }: {
    token: string;
    slug: string;
    data: Partial<ToolInput>;
  }) => {
    return adminApi.updateTool(token, slug, data);
  },
);

export const deleteTool = createAsyncThunk(
  "toolsAdmin/delete",
  async ({ token, slug }: { token: string; slug: string }) => {
    await adminApi.deleteTool(token, slug);
    return slug;
  },
);

const toolsAdminSlice = createSlice({
  name: "toolsAdmin",
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTools.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTools.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTools.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load tools";
      })
      .addCase(createTool.fulfilled, (state, action) => {
        state.items = [...state.items, action.payload].sort((a, b) =>
          a.name.localeCompare(b.name),
        );
      })
      .addCase(createTool.rejected, (state, action) => {
        state.error = action.error.message ?? "Failed to create tool";
      })
      .addCase(updateTool.fulfilled, (state, action) => {
        state.items = state.items
          .map((t) => (t.slug === action.payload.slug ? action.payload : t))
          .sort((a, b) => a.name.localeCompare(b.name));
      })
      .addCase(updateTool.rejected, (state, action) => {
        state.error = action.error.message ?? "Failed to update tool";
      })
      .addCase(deleteTool.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t.slug !== action.payload);
      })
      .addCase(deleteTool.rejected, (state, action) => {
        state.error = action.error.message ?? "Failed to delete tool";
      });
  },
});

export const { setSearch, clearError } = toolsAdminSlice.actions;
export default toolsAdminSlice.reducer;
