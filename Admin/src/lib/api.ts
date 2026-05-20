import type { CategoriesResponse, Tool, ToolInput } from "@/lib/types";

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
};
