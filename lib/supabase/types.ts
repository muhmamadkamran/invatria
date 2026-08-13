import type { Invitation } from "../types";

/* NOTE: these are `type` aliases, not `interface`s, on purpose. supabase-js
   constrains table rows to `Record<string, unknown>`, and an interface has no
   implicit index signature — declaring these as interfaces makes the whole
   schema resolve to `never` and every query lose its types.

   Hand-written to mirror `supabase/migrations/*.sql`. Regenerate with
   `npx supabase gen types typescript --linked > lib/supabase/types.ts`
   once the project is linked, if you'd rather have it derived. */

export type InvitationRow = {
  id: string;
  slug: string;
  owner_id: string;
  published: boolean;
  template_id: string;
  category: string;
  language: string;
  /** The invitation document; nested and edited as one object by the app. */
  data: Invitation;
  created_at: string;
  updated_at: string;
}

export type RsvpRow = {
  id: string;
  invitation_id: string;
  name: string;
  email: string | null;
  status: "attending" | "not-attending" | "maybe";
  guests: number;
  meal: string | null;
  message: string | null;
  created_at: string;
}

export type GuestMessageRow = {
  id: string;
  invitation_id: string;
  name: string;
  message: string;
  hidden: boolean;
  created_at: string;
}

export type RateLimitRow = {
  bucket: string;
  hits: number;
  window_start: string;
}

type Empty = { [_ in never]: never };

export type Database = {
  public: {
    Tables: {
      invitations: {
        Row: InvitationRow;
        // owner_id is set by a trigger; the client must not supply it.
        Insert: {
          id?: string;
          slug: string;
          published?: boolean;
          template_id: string;
          category: string;
          language?: string;
          data: Invitation;
        };
        Update: Partial<Omit<InvitationRow, "owner_id">>;
        Relationships: [];
      };
      rsvps: {
        Row: RsvpRow;
        Insert: Omit<RsvpRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<RsvpRow>;
        Relationships: [];
      };
      guest_messages: {
        Row: GuestMessageRow;
        Insert: Omit<GuestMessageRow, "id" | "created_at" | "hidden"> & {
          id?: string;
          hidden?: boolean;
          created_at?: string;
        };
        Update: Partial<GuestMessageRow>;
        Relationships: [];
      };
      rate_limits: {
        Row: RateLimitRow;
        Insert: { bucket: string; hits?: number; window_start?: string };
        Update: Partial<RateLimitRow>;
        Relationships: [];
      };
    };
    Views: Empty;
    Functions: {
      is_slug_available: {
        Args: { candidate: string; self_id?: string | null };
        Returns: boolean;
      };
      rsvp_summary: {
        Args: { invitation: string };
        Returns: { status: string; replies: number; heads: number }[];
      };
    };
    Enums: Empty;
    CompositeTypes: Empty;
  };
}
