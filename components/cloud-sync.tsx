"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { supabaseConfigured } from "@/lib/supabase/config";

/**
 * Runs once per browser, on the first visit after the backend is configured,
 * to lift any invitations made before then out of IndexedDB and into Supabase.
 * Renders nothing and does nothing at all when there's no backend.
 */
export function CloudSync() {
  useEffect(() => {
    if (!supabaseConfigured) return;
    let alive = true;

    /* Imported lazily so the Supabase SDK never lands in the root layout
       bundle, which every page pays for. */
    import("@/lib/migrate")
      .then((m) => m.migrateLocalToCloud())
      .then((result) => {
        if (!alive || !result || !result.migrated) return;
        toast.success(
          result.migrated === 1
            ? "Your invitation is now synced to your account"
            : `${result.migrated} invitations are now synced to your account`,
          { description: "They'll open on any device you share the link with." },
        );
      })
      .catch(() => {
        /* Never block the page on a background migration. */
      });
    return () => {
      alive = false;
    };
  }, []);

  return null;
}
