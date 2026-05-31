import { ApiError } from "@/lib/api";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:4000/api/v1";

export async function formatSql(sql: string, dialect: string) {
  const res = await fetch(`${API_BASE}/sql-formatter/format`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ sql, dialect }),
    cache: "no-store",
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { message?: string | string[] };
      if (body.message) message = Array.isArray(body.message) ? body.message.join(", ") : body.message;
    } catch {}
    throw new ApiError(message, res.status);
  }
  return (await res.json()) as { formatted: string; dialect: string };
}
