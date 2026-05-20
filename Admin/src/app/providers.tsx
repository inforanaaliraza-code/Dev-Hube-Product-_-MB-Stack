"use client";

import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { makeStore } from "@/store/store";
import { hydrateAuth } from "@/store/slices/authSlice";
import { useAppDispatch } from "@/store/hooks";
import { Toaster } from "@/components/ui/sonner";

function AuthHydrator() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(hydrateAuth());
  }, [dispatch]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<ReturnType<typeof makeStore> | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return (
    <Provider store={storeRef.current}>
      <AuthHydrator />
      {children}
      <Toaster richColors position="top-right" />
    </Provider>
  );
}
