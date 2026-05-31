import type {
  AdminUserRow,
  CategoriesResponse,
  CmsContent,
  CmsContentInput,
  MediaAsset,
  NavMenuItem,
  Plugin,
  PluginInput,
  Tool,
  ToolBlog,
  ToolBlogInput,
  ToolInput,
} from "@/lib/types";

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      typeof body.message === "string"
        ? body.message
        : Array.isArray(body.message)
          ? body.message.join(", ")
          : `Request failed (${res.status})`;
    throw new ApiError(message, res.status);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
  };
}

export const authApi = {
  adminLogin(email: string, password: string) {
    return fetch(`${baseUrl}/auth/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }).then(async (res) => {
      const body = await res.json();
      if (!res.ok) {
        throw new ApiError(body.message ?? "Login failed", res.status);
      }
      return body as LoginResponse;
    });
  },
};

export const adminApi = {
  getTools(token: string, search?: string) {
    const q = search?.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
    return request<Tool[]>(`/admin/tools${q}`, token);
  },
  getTool(token: string, slug: string) {
    return request<Tool>(`/admin/tools/${slug}`, token);
  },
  createTool(token: string, data: ToolInput) {
    return request<Tool>(`/admin/tools`, token, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  updateTool(token: string, slug: string, data: Partial<ToolInput>) {
    return request<Tool>(`/admin/tools/${slug}`, token, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  deleteTool(token: string, slug: string) {
    return request<void>(`/admin/tools/${slug}`, token, { method: "DELETE" });
  },
  getCategories(token: string) {
    return request<CategoriesResponse>(`/admin/categories`, token);
  },
  getSettings(token: string) {
    return request<Record<string, Record<string, unknown>>>(`/admin/settings`, token);
  },
  updateSetting(token: string, key: string, value: Record<string, unknown>) {
    return request(`/admin/settings/${key}`, token, {
      method: "PATCH",
      body: JSON.stringify({ value }),
    });
  },
  getAdmins(token: string) {
    return request<AdminUserRow[]>(`/admin/users/admins`, token);
  },
  bulkTools(
    token: string,
    body: {
      slugs: string[];
      action: "delete" | "setStatus" | "setFeatured";
      status?: "ready" | "soon";
      featured?: boolean;
    },
  ) {
    return request<{ affected: number; failed: number; errors: string[] }>(
      `/admin/tools/bulk`,
      token,
      { method: "POST", body: JSON.stringify(body) },
    );
  },
  listToolBlogs(token: string) {
    return request<ToolBlog[]>(`/admin/tool-blogs`, token);
  },
  getToolBlog(token: string, slug: string) {
    return request<ToolBlog>(`/admin/tools/${slug}/blog`, token);
  },
  deleteToolBlog(token: string, slug: string) {
    return request<void>(`/admin/tools/${slug}/blog`, token, { method: "DELETE" });
  },
  upsertToolBlog(token: string, slug: string, data: ToolBlogInput) {
    return request<ToolBlog>(`/admin/tools/${slug}/blog`, token, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};

export type BulkResult = { affected: number; failed: number; errors: string[] };

export function mediaFullUrl(urlPath: string) {
  const base = baseUrl.replace(/\/api\/v1\/?$/, "");
  return `${base}/api/v1/uploads/${urlPath.replace(/^\//, "")}`;
}

export const cmsApi = {
  listMedia(token: string) {
    return request<MediaAsset[]>(`/admin/cms/media`, token);
  },
  uploadMedia(token: string, file: File, alt?: string) {
    const form = new FormData();
    form.append("file", file);
    if (alt) form.append("alt", alt);
    return fetch(`${baseUrl}/admin/cms/media`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    }).then(async (res) => {
      const body = await res.json();
      if (!res.ok) {
        throw new ApiError(
          typeof body.message === "string" ? body.message : "Upload failed",
          res.status,
        );
      }
      return body as MediaAsset;
    });
  },
  deleteMedia(token: string, id: string) {
    return request<void>(`/admin/cms/media/${id}`, token, { method: "DELETE" });
  },
  listContents(token: string, type?: "page" | "post") {
    const q = type ? `?type=${type}` : "";
    return request<CmsContent[]>(`/admin/cms/contents${q}`, token);
  },
  getContent(token: string, id: string) {
    return request<CmsContent>(`/admin/cms/contents/${id}`, token);
  },
  createContent(token: string, data: CmsContentInput) {
    return request<CmsContent>(`/admin/cms/contents`, token, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  updateContent(token: string, id: string, data: Partial<CmsContentInput>) {
    return request<CmsContent>(`/admin/cms/contents/${id}`, token, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  deleteContent(token: string, id: string) {
    return request<void>(`/admin/cms/contents/${id}`, token, { method: "DELETE" });
  },
  getNavigation(token: string) {
    return request<NavMenuItem[]>(`/admin/cms/navigation`, token);
  },
  updateNavigation(token: string, items: NavMenuItem[]) {
    return request<NavMenuItem[]>(`/admin/cms/navigation`, token, {
      method: "PATCH",
      body: JSON.stringify({ items }),
    });
  },
  bulkContents(
    token: string,
    body: {
      ids: string[];
      action: "delete" | "setStatus";
      status?: "draft" | "published";
    },
  ) {
    return request<BulkResult>(`/admin/cms/contents/bulk`, token, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  bulkMedia(token: string, ids: string[]) {
    return request<BulkResult>(`/admin/cms/media/bulk`, token, {
      method: "POST",
      body: JSON.stringify({ ids, action: "delete" }),
    });
  },
};

export const pluginsApi = {
  list(token: string, type?: string) {
    const q = type ? `?type=${encodeURIComponent(type)}` : "";
    return request<Plugin[]>(`/admin/plugins${q}`, token);
  },
  get(token: string, id: string) {
    return request<Plugin>(`/admin/plugins/${id}`, token);
  },
  create(token: string, data: PluginInput) {
    return request<Plugin>(`/admin/plugins`, token, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  update(token: string, id: string, data: Partial<PluginInput>) {
    return request<Plugin>(`/admin/plugins/${id}`, token, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  delete(token: string, id: string) {
    return request<void>(`/admin/plugins/${id}`, token, { method: "DELETE" });
  },
  bulk(
    token: string,
    body: {
      ids: string[];
      action: "delete" | "setStatus";
      status?: "active" | "inactive";
    },
  ) {
    return request<BulkResult>(`/admin/plugins/bulk/actions`, token, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
};
