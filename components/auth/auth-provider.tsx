"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabaseConfigured } from "@/lib/supabase/config";

/* This module must not import the Supabase SDK at the top level — it is
   mounted in the root layout, so a static import would put ~75 kB into the
   bundle of every marketing page. The client is fetched inside the effect. */

export interface AuthState {
  /** Null until resolved, or when there is no backend at all. */
  email: string | null;
  userId: string | null;
  /** True for a visitor who has not yet claimed an account. */
  isAnonymous: boolean;
  /** False once the first session lookup has settled. */
  loading: boolean;
  /** True when a backend exists at all. */
  enabled: boolean;
  refresh: () => void;
}

const Ctx = createContext<AuthState>({
  email: null,
  userId: null,
  isAnonymous: false,
  loading: false,
  enabled: false,
  refresh: () => {},
});

export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(supabaseConfigured);
  const [nonce, setNonce] = useState(0);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    if (!supabaseConfigured) return;
    let alive = true;
    let unsubscribe: (() => void) | undefined;

    import("@/lib/supabase/client").then(async ({ getSupabase }) => {
      const sb = getSupabase();
      if (!sb || !alive) return;

      const apply = (user: { email?: string; id: string; is_anonymous?: boolean } | null) => {
        if (!alive) return;
        setEmail(user?.email ?? null);
        setUserId(user?.id ?? null);
        setIsAnonymous(Boolean(user?.is_anonymous));
        setLoading(false);
      };

      const { data } = await sb.auth.getSession();
      apply(data.session?.user ?? null);

      const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
        apply(session?.user ?? null);
      });
      unsubscribe = () => sub.subscription.unsubscribe();
    });

    return () => {
      alive = false;
      unsubscribe?.();
    };
  }, [nonce]);

  const value = useMemo<AuthState>(
    () => ({
      email,
      userId,
      isAnonymous,
      loading,
      enabled: supabaseConfigured,
      refresh,
    }),
    [email, userId, isAnonymous, loading, refresh],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** True when the visitor has a real, claimed account. */
export function useHasAccount() {
  const { email, isAnonymous, enabled } = useAuth();
  return enabled && Boolean(email) && !isAnonymous;
}
