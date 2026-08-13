import type { CategoryId, Invitation, TemplateId } from "./types";
import { getOccasion } from "./occasions";
import { newId, shortSlug } from "./utils";

function inMonths(n: number) {
  const d = new Date();
  d.setMonth(d.getMonth() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

/** A blank invitation, pre-worded for the occasion it's being made for. */
export function blankInvitation(
  templateId: TemplateId = "royal-gold",
  category: CategoryId = "wedding",
): Invitation {
  const id = newId();
  const o = getOccasion(category);

  return {
    id,
    slug: shortSlug(),
    templateId,
    category,
    language: "en",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    published: false,

    cover: null,
    coverFocus: { x: 50, y: 50 },

    eyebrow: o.eyebrow,
    hostPrimary: "",
    hostSecondary: "",
    joinWord: o.joinWord,
    tagline: o.tagline,
    invitationNote: "",

    date: inMonths(3),
    time: "18:00",
    endTime: "",
    timezone:
      typeof Intl !== "undefined"
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : "UTC",

    venueName: "",
    venueAddress: "",
    mapsUrl: "",

    gallery: [],
    music: { source: null, title: "", autoplay: false },
    video: { url: "", title: "" },
    timeline: [],
    dressCode: { title: "", description: "", palette: [] },
    story: { enabled: o.sections.story, heading: o.storyHeading, chapters: [] },
    parents: {
      enabled: o.sections.parents,
      heading: o.hostsHeading,
      sideALabel: o.sideALabel,
      sideA: [],
      sideBLabel: o.sideBLabel,
      sideB: [],
    },
    family: { enabled: o.sections.family, heading: o.familyHeading, members: [] },
    gifts: {
      enabled: o.sections.gifts,
      heading: o.giftsHeading,
      message: o.giftsMessage,
      details: [],
    },
    travel: { enabled: o.sections.travel, transportation: "", accommodation: [] },
    faqs: { enabled: o.sections.faqs, items: [] },
    rsvp: {
      enabled: true,
      heading: o.rsvpHeading,
      message: o.rsvpMessage,
      deadline: "",
      askGuestCount: true,
      maxGuests: 4,
      askMeal: false,
      mealOptions: ["Standard", "Vegetarian", "Halal", "No preference"],
      askMessage: true,
    },
    guestbook: {
      enabled: true,
      heading: o.guestbookHeading,
      message: o.guestbookMessage,
    },

    options: {
      envelope: true,
      particles: true,
      countdown: true,
      qrCode: true,
      darkMode: false,
    },
  };
}

/** A fully-filled invitation for previews and the template gallery, written
 *  for whichever occasion is being shown. Dates are pinned to a year boundary
 *  so a statically-rendered page and its hydration always agree. */
const DEMO_YEAR = new Date().getFullYear() + 1;

export function demoInvitation(
  templateId: TemplateId = "royal-gold",
  category: CategoryId = "wedding",
): Invitation {
  const base = blankInvitation(templateId, category);
  const o = getOccasion(category);
  const d = o.demo;

  return {
    ...base,
    id: `demo_${templateId}_${category}`,
    slug: `demo-${templateId}-${category}`,
    published: true,
    hostPrimary: d.primary,
    hostSecondary: d.secondary,
    invitationNote: d.note,
    date: `${DEMO_YEAR}-06-13`,
    time: d.timeline[0]?.time ?? "18:30",
    endTime: "23:30",
    venueName: d.venue,
    venueAddress: d.address,

    timeline: d.timeline.map((t, i) => ({ id: `t${i}`, ...t })),

    dressCode: {
      title: o.dressCodeTitle,
      description:
        "Wear what makes you feel like yourself — this is only ever a suggestion.",
      palette: [],
    },

    story: {
      ...base.story,
      chapters: base.story.enabled
        ? [
            { id: "c1", date: "2018", title: "A queue for coffee", body: "One of them took the last almond croissant. It has never been forgotten.", image: null },
            { id: "c2", date: "2021", title: "The move north", body: "One car, two cats, and a boiler that only worked on Thursdays.", image: null },
            { id: "c3", date: "2024", title: "The question", body: "On a cold beach in Anglesey, with the ring in a coat pocket for three days.", image: null },
          ]
        : [],
    },

    parents: {
      ...base.parents,
      sideA: base.parents.enabled ? ["Mr. Hassan Iqbal", "Mrs. Nadia Iqbal"] : [],
      sideB: base.parents.enabled ? ["Mr. Idris Rahman", "Mrs. Sofia Rahman"] : [],
    },

    family: {
      ...base.family,
      members: base.family.enabled
        ? [
            { id: "f1", name: "Leila Iqbal", relation: "Maid of Honour", note: "", image: null },
            { id: "f2", name: "Omar Rahman", relation: "Best Man", note: "", image: null },
            { id: "f3", name: "Priya Nair", relation: "Bridesmaid", note: "", image: null },
            { id: "f4", name: "Daniel Okoro", relation: "Groomsman", note: "", image: null },
          ]
        : [],
    },

    gifts: {
      ...base.gifts,
      details: base.gifts.enabled ? ["No boxed gifts, please"] : [],
    },

    travel: {
      ...base.travel,
      transportation: base.travel.enabled
        ? "Parking on site is free, and taxis can be booked at the welcome desk."
        : "",
      accommodation: base.travel.enabled
        ? [
            { id: "a1", name: "The Grosvenor", detail: "Eight minutes away", link: "" },
            { id: "a2", name: "Elmswood Lodge", detail: "Walking distance", link: "" },
          ]
        : [],
    },

    faqs: {
      ...base.faqs,
      items: base.faqs.enabled
        ? [
            { id: "q1", question: "Can I bring someone?", answer: "If your invitation names two people, absolutely. If you'd like to ask, just ask — we'd rather that than you assumed." },
            { id: "q2", question: "Is there parking?", answer: "Yes, free and on site, and you may leave a car overnight." },
            { id: "q3", question: "Are children welcome?", answer: "Very. There's a quiet room off the main hall with games and a film running all evening." },
            { id: "q4", question: "What about dietary needs?", answer: "Tell us in your reply and the kitchen will take care of it." },
          ]
        : [],
    },

    rsvp: {
      ...base.rsvp,
      deadline: `${DEMO_YEAR}-05-09`,
      askMeal: true,
    },
  };
}
