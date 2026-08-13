"use client";

import dynamic from "next/dynamic";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { AuthMode } from "./auth-dialog";

/* Loaded on demand: nobody pays for the auth dialog until they open it. */
const AuthDialog = dynamic(
  () => import("./auth-dialog").then((m) => m.AuthDialog),
  { ssr: false },
);

export interface AuthOptions {
  redirectPath?: string;
  skipLabel?: string;
  onSkip?: () => void;
  onSuccess?: () => void;
}

interface AuthUI {
  openAuth: (mode?: AuthMode, options?: AuthOptions) => void;
}

const Ctx = createContext<AuthUI>({ openAuth: () => {} });

export const useAuthUI = () => useContext(Ctx);

export function AuthUIProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("claim");
  const [options, setOptions] = useState<AuthOptions>({});

  const openAuth = useCallback((next: AuthMode = "claim", opts: AuthOptions = {}) => {
    setMode(next);
    setOptions(opts);
    setOpen(true);
  }, []);

  const value = useMemo(() => ({ openAuth }), [openAuth]);

  return (
    <Ctx.Provider value={value}>
      {children}
      {open ? (
        <AuthDialog
          open={open}
          mode={mode}
          onClose={() => setOpen(false)}
          {...options}
        />
      ) : null}
    </Ctx.Provider>
  );
}
