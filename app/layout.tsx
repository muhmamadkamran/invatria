import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { AdSenseScript } from "@/components/ads";
import { AuthProvider } from "@/components/auth/auth-provider";
import { AuthUIProvider } from "@/components/auth/auth-ui";
import { Toaster } from "sonner";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

/* The type family, loaded from the CDN in one request. Families are declared
   in globals.css so components only ever reference the semantic token. */
const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Amiri:wght@400;700" +
  "&family=Cinzel:wght@400;500;600" +
  "&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,600" +
  "&family=Great+Vibes" +
  "&family=Inter:wght@300;400;500;600;700" +
  "&family=Jost:wght@300;400;500" +
  "&family=Marcellus&display=swap";



export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Invitra — Create Beautiful Digital Invitations in Minutes",
    template: "%s · Invitra",
  },
  description:
    "Design, customize and share elegant invitations for weddings, birthdays, engagements, baby showers, Eid, graduation, corporate events and more. Unlimited invitations, unlimited guests, completely free.",
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
  authors: [{ name: "Invitra" }],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Invitra",
    title: "Invitra — Create Beautiful Digital Invitations in Minutes",
    description:
      "Elegant, animated digital invitations with RSVP, countdown, gallery and music. Unlimited and free, forever.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Invitra — Create Beautiful Digital Invitations in Minutes",
    description:
      "Elegant, animated digital invitations with RSVP, countdown, gallery and music. Unlimited and free, forever.",
  },
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={FONT_HREF} />
      </head>
      <body className="antialiased">
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
