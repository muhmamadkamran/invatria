import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { AdSenseScript } from "@/components/ads";
import { AuthProvider } from "@/components/auth/auth-provider";
import { AuthUIProvider } from "@/components/auth/auth-ui";
import { Toaster } from "sonner";
import { SITE_URL } from "@/lib/site";
import { DeferredFonts } from "@/components/deferred-fonts";
import { socialMetadata } from "@/lib/social-metadata";
import "./globals.css";

// Self-hosted font families retain their licenses under public/fonts.
const FONT_HREF = "/fonts/invitra.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
  title: {
    default: "Invitra — Create Beautiful Digital Invitations in Minutes",
    template: "%s · Invitra",
  },
  description:
    "Create free digital invitations for weddings, birthdays and more. Customize a template, share your invitation link and collect guest RSVPs online.",
  keywords: [
    "digital invitation",
    "wedding invitation",
    "online invite",
    "e-invite",
    "nikah invitation",
    "mehndi invitation",
    "walima card",
    "RSVP",
    "free invitation maker",
  ],
  authors: [{ name: "Invitra", url: `${SITE_URL}/about` }],
  publisher: "Invitra",
  ...socialMetadata(
    "Invitra — Free Online Invitation Card Maker",
    "Create free digital invitations for weddings, birthdays and more. Customize a template, share your invitation link and collect guest RSVPs online.",
    "/",
  ),
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fffdf8" },
    { media: "(prefers-color-scheme: dark)", color: "#17150f" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <DeferredFonts href={FONT_HREF} />
      </head>
      <body className="antialiased">
        {/* Netlify inserts whitespace in head; keep this hydratable fallback
            in body so that insertion cannot displace its expected DOM node. */}
        <noscript><link rel="stylesheet" href={FONT_HREF} /></noscript>
        <ThemeProvider>
          <AuthProvider>
          <AuthUIProvider>
          <a href="#main" className="skip-link">
            Skip to content
          </a>
          {children}
          <Toaster
            position="bottom-center"
            toastOptions={{
              classNames: {
                toast:
                  "!bg-[var(--color-surface-raised)] !border-[var(--color-line)] !text-[var(--color-heading)] !rounded-2xl !font-sans !shadow-[var(--shadow-lifted)]",
                description: "!text-[var(--color-body)]",
              },
            }}
          />
          </AuthUIProvider>
          </AuthProvider>
        </ThemeProvider>
        <AdSenseScript />
      </body>
    </html>
  );
}
