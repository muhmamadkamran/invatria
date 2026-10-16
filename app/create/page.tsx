import type { Metadata } from "next";
import { Builder } from "@/components/builder/builder";

export const metadata: Metadata = {
  title: "Create an invitation",
  description:
    "Design your invitation in fourteen guided steps. Sign in to save it online and publish a link for your guests. Every design is free.",
  robots: { index: false },
};

export default function CreatePage() {
  return <Builder />;
}
