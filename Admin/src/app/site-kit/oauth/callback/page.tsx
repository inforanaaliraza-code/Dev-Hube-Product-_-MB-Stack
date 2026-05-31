"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { siteKitApi } from "@/lib/site-kit-api";
import { useAppSelector } from "@/store/hooks";

function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const token = useAppSelector((s) => s.auth.accessToken);
  const [message, setMessage] = useState("Connecting Google Site Kit…");

  useEffect(() => {
    const code = params.get("code");
    const error = params.get("error");
    if (error) {
      setMessage(`Google sign-in cancelled: ${error}`);
      return;
    }
    if (!code || !token) {
      setMessage("Missing authorization. Please log in and try again.");
      return;
    }
    siteKitApi
      .oauthCallback(token, code)
      .then(() => {
        router.replace("/site-kit?connected=1");
      })
      .catch((e) => {
        setMessage(e instanceof Error ? e.message : "Connection failed");
      });
  }, [params, token, router]);

  return <p className="text-sm font-medium">{message}</p>;
}

export default function SiteKitOAuthCallbackPage() {
  return (
    <div className="min-h-screen grid place-items-center bg-[#f8f9fa] text-[#3c4043] p-6">
      <Suspense fallback={<p className="text-sm">Loading…</p>}>
        <CallbackInner />
      </Suspense>
    </div>
  );
}
