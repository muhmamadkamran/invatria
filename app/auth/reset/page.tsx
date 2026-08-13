import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ResetPassword } from "@/components/auth/reset-password";

export const metadata: Metadata = {
  title: "Choose a new password",
  robots: { index: false, follow: false },
};

export default function ResetPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="paper grid min-h-[80vh] place-items-center px-5 pt-32">
        <ResetPassword />
      </main>
      <SiteFooter />
    </>
  );
}
