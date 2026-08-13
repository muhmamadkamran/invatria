import type { Metadata } from "next";
import { Builder } from "@/components/builder/builder";

export const metadata: Metadata = {
  title: "Create an invitation",
  description:
    "Design your invitation in fourteen guided steps — template, photos, names, date, venue, schedule, RSVP and publish. Free, with no account required.",
  robots: { index: false },
};

export default function CreatePage() {
  return <Builder />;
}
