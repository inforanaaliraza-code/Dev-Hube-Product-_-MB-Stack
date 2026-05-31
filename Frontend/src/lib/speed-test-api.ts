import { ApiError } from "@/lib/api";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:4000/api/v1";

export async function runSpeedTest(url: string) {
  const res = await fetch(`${API_BASE}/speed-test/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
    cache: "no-store",
  });
  if (!res.ok) throw new ApiError("Speed test failed", res.status);
  return (await res.json()) as {
    url: string;
    statusCode: number;
    totalMs: number;
    downloadBytes: number;
    contentType: string | null;
    throughputKbps: number;
    rating: string;
  };
}
