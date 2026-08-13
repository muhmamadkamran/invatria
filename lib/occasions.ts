import type { CategoryId, Invitation } from "./types";

/* ============================================================================
   Occasion presets.

   An invitation is not a wedding with the words swapped. A birthday has one
   name and a milestone; a launch has an event title and a company; a nikah has
   two families to name. This file is the single place that knows the
   difference — it drives the builder's labels, the invitation's wording, which
   sections appear, and how the names are typeset.
   ========================================================================= */

/** How the hero names are composed and typeset. */
export type NameMode =
  /** Two names, stacked, joined — weddings, engagements, anniversaries. */
  | "couple"
  /** One name, with an optional line beneath it ("turns thirty"). */
  | "single"
  /** An event title with a host beneath — corporate, school, business. */
  | "org";

export interface OccasionPreset {
  nameMode: NameMode;

  /** Builder — step 3 */
  stepTitle: string;
  stepLead: string;
  primaryLabel: string;
  primaryPlaceholder: string;
  /** Empty label hides the second field entirely. */
  secondaryLabel: string;
  secondaryPlaceholder: string;
  /** Only shown in "couple" mode. */
  joinWord: string;

  /** Invitation copy */
  eyebrow: string;
  tagline: string;
  scheduleHeading: string;
  hostsHeading: string;
  sideALabel: string;
  sideBLabel: string;
  storyHeading: string;
  familyHeading: string;
  giftsHeading: string;
  giftsMessage: string;
  rsvpHeading: string;
  rsvpMessage: string;
  guestbookHeading: string;
  guestbookMessage: string;
  dressCodeTitle: string;

  /** Which optional sections start switched on for this occasion. */
  sections: {
    parents: boolean;
    story: boolean;
    family: boolean;
    gifts: boolean;
    travel: boolean;
    faqs: boolean;
  };

  /** Sample content for previews and the template gallery. */
  demo: {
    primary: string;
    secondary: string;
    venue: string;
    address: string;
    note: string;
    timeline: { time: string; title: string; description: string }[];
  };
}

const COUPLE_SECTIONS = {
  parents: true,
  story: true,
  family: true,
  gifts: true,
  travel: true,
  faqs: true,
};

const PARTY_SECTIONS = {
  parents: false,
  story: false,
  family: false,
  gifts: true,
  travel: false,
  faqs: true,
};

const FORMAL_SECTIONS = {
  parents: false,
  story: false,
  family: false,
  gifts: false,
  travel: true,
  faqs: true,
};

export const OCCASIONS: Record<CategoryId, OccasionPreset> = {
  wedding: {
    nameMode: "couple",
    stepTitle: "Bride & groom",
    stepLead:
      "The two names that carry the whole invitation. They are set in the design's script face, one above the other.",
    primaryLabel: "Bride's name",
    primaryPlaceholder: "Amara",
    secondaryLabel: "Groom's name",
    secondaryPlaceholder: "Zayn",
    joinWord: "&",
    eyebrow: "Together with their families",
    tagline: "request the pleasure of your company",
    scheduleHeading: "Order of the Day",
    hostsHeading: "With the blessings of",
    sideALabel: "Parents of the Bride",
    sideBLabel: "Parents of the Groom",
    storyHeading: "How We Got Here",
    familyHeading: "The Wedding Party",
    giftsHeading: "Gifts",
    giftsMessage: "Your presence is the only gift we ask for.",
    rsvpHeading: "Will you join us?",
    rsvpMessage: "Kindly reply by the date below so we can give the kitchen a number.",
    guestbookHeading: "Guest Book",
    guestbookMessage: "Leave a note we can read for years to come.",
    dressCodeTitle: "Black Tie",
    sections: COUPLE_SECTIONS,
    demo: {
      primary: "Amara",
      secondary: "Zayn",
      venue: "The Orangery at Ashcombe Hall",
      address: "Ashcombe Hall, Elmswood Lane, Chester CH3 9QR",
      note: "We have spent seven years finding our way to this evening. It would mean everything to have you in the room when it happens.",
      timeline: [
        { time: "18:30", title: "Arrival & Welcome", description: "Drinks on the terrace" },
        { time: "19:15", title: "The Ceremony", description: "In the Orangery" },
        { time: "20:45", title: "Dinner", description: "Seated, four courses" },
        { time: "22:30", title: "First Dance", description: "Followed by dancing" },
      ],
    },
  },

  engagement: {
    nameMode: "couple",
    stepTitle: "The happy couple",
    stepLead: "Both names, as you'd like them to appear on the announcement.",
    primaryLabel: "First name",
    primaryPlaceholder: "Amara",
    secondaryLabel: "Second name",
    secondaryPlaceholder: "Zayn",
    joinWord: "&",
    eyebrow: "With joy in our hearts",
    tagline: "invite you to celebrate our engagement",
    scheduleHeading: "The Evening",
    hostsHeading: "With the blessings of",
    sideALabel: "Her Parents",
    sideBLabel: "His Parents",
    storyHeading: "How It Started",
    familyHeading: "Our Closest",
    giftsHeading: "Gifts",
    giftsMessage: "Your company is more than enough — please don't bring anything.",
    rsvpHeading: "Can you make it?",
    rsvpMessage: "Let us know by the date below.",
    guestbookHeading: "Leave Us a Note",
    guestbookMessage: "Say something we can keep.",
    dressCodeTitle: "Smart Casual",
    sections: { ...COUPLE_SECTIONS, family: false, travel: false },
    demo: {
      primary: "Amara",
      secondary: "Zayn",
      venue: "The Garden Room",
      address: "12 Elmswood Lane, Chester CH3 9QR",
      note: "He asked on a cold beach in Anglesey. She said yes before he finished the sentence.",
      timeline: [
        { time: "18:00", title: "Drinks", description: "On arrival" },
        { time: "19:00", title: "The Toast", description: "A few short words" },
        { time: "19:30", title: "Dinner", description: "Sharing plates" },
      ],
    },
  },

  birthday: {
    nameMode: "single",
    stepTitle: "Whose birthday is it?",
    stepLead:
      "One name, set large in the design's script face. Add a milestone underneath if it's one of the big ones.",
    primaryLabel: "Birthday name",
    primaryPlaceholder: "Ayaan",
    secondaryLabel: "Milestone",
    secondaryPlaceholder: "turns thirty",
    joinWord: "",
    eyebrow: "Please join us to celebrate",
    tagline: "for an evening of cake, music and far too much dancing",
    scheduleHeading: "The Evening",
    hostsHeading: "Hosted by",
    sideALabel: "Hosted by",
    sideBLabel: "With help from",
    storyHeading: "A Few Highlights",
    familyHeading: "The Usual Suspects",
    giftsHeading: "Gifts",
    giftsMessage: "No presents please — just turn up and stay late.",
    rsvpHeading: "Are you coming?",
    rsvpMessage: "Let us know so we can order enough cake.",
    guestbookHeading: "Birthday Wishes",
    guestbookMessage: "Leave a message for the birthday star.",
    dressCodeTitle: "Come as you are",
    sections: PARTY_SECTIONS,
    demo: {
      primary: "Ayaan",
      secondary: "turns thirty",
      venue: "The Rooftop at Neale's",
      address: "40 Watergate Street, Chester CH1 2LA",
      note: "Thirty years, and still no idea what he wants for his birthday. Just bring yourself.",
      timeline: [
        { time: "19:00", title: "Doors & Drinks", description: "Come whenever" },
        { time: "20:30", title: "Food", description: "Something informal" },
        { time: "21:30", title: "Cake", description: "Do not be late for this" },
        { time: "22:00", title: "Music", description: "Until they throw us out" },
      ],
    },
  },

  anniversary: {
    nameMode: "couple",
    stepTitle: "The two of you",
    stepLead: "Both names, and the years you're marking.",
    primaryLabel: "First name",
    primaryPlaceholder: "Hassan",
    secondaryLabel: "Second name",
    secondaryPlaceholder: "Nadia",
    joinWord: "&",
    eyebrow: "Twenty-five years together",
    tagline: "invite you to share the evening with us",
    scheduleHeading: "The Evening",
    hostsHeading: "Hosted by",
    sideALabel: "Hosted by",
    sideBLabel: "With",
    storyHeading: "Our Years",
    familyHeading: "Our Family",
    giftsHeading: "Gifts",
    giftsMessage: "We have everything we need. Your company is the whole point.",
    rsvpHeading: "Will you join us?",
    rsvpMessage: "Please reply by the date below.",
    guestbookHeading: "Guest Book",
    guestbookMessage: "Leave us a note.",
    dressCodeTitle: "Formal",
    sections: { ...COUPLE_SECTIONS, parents: false },
    demo: {
      primary: "Hassan",
      secondary: "Nadia",
      venue: "The Long Room",
      address: "Ashcombe Hall, Chester CH3 9QR",
      note: "Twenty-five years, three houses, two cats and one very long argument about a boiler.",
      timeline: [
        { time: "18:30", title: "Reception", description: "Drinks and photographs" },
        { time: "19:30", title: "Dinner", description: "Seated" },
        { time: "21:00", title: "Speeches", description: "Kept mercifully short" },
      ],
    },
  },

  "baby-shower": {
    nameMode: "single",
    stepTitle: "Who are we celebrating?",
    stepLead:
      "The parent-to-be's name. Add a partner or a due date underneath if you'd like.",
    primaryLabel: "Parent's name",
    primaryPlaceholder: "Leila",
    secondaryLabel: "Second line",
    secondaryPlaceholder: "due in April",
    joinWord: "",
    eyebrow: "A little one is on the way",
    tagline: "join us to shower them with love",
    scheduleHeading: "The Afternoon",
    hostsHeading: "Hosted by",
    sideALabel: "Hosted by",
    sideBLabel: "With",
    storyHeading: "The News",
    familyHeading: "The Family",
    giftsHeading: "Gifts",
    giftsMessage:
      "If you'd like to bring something, there's a small registry — but nothing is expected.",
    rsvpHeading: "Can you come?",
    rsvpMessage: "Let us know so we can set enough places.",
    guestbookHeading: "Wishes for the Baby",
    guestbookMessage: "Leave a note for the little one to read one day.",
    dressCodeTitle: "Soft and comfortable",
    sections: { ...PARTY_SECTIONS, gifts: true },
    demo: {
      primary: "Leila",
      secondary: "due in April",
      venue: "The Conservatory",
      address: "8 Hollybank Road, Chester CH2 3AB",
      note: "Tea, cake and far too much advice about sleep. Come and be part of it.",
      timeline: [
        { time: "14:00", title: "Arrival", description: "Tea and cake" },
        { time: "15:00", title: "Games", description: "Briefly, we promise" },
        { time: "16:00", title: "Gifts", description: "Opened together" },
      ],
    },
  },

  "bridal-shower": {
    nameMode: "single",
    stepTitle: "Who's the bride?",
    stepLead: "One name, set large. Add a line underneath if you'd like.",
    primaryLabel: "Bride's name",
    primaryPlaceholder: "Amara",
    secondaryLabel: "Second line",
    secondaryPlaceholder: "before the big day",
    joinWord: "",
    eyebrow: "Before the big day",
    tagline: "join us to celebrate the bride",
    scheduleHeading: "The Afternoon",
    hostsHeading: "Hosted by",
    sideALabel: "Hosted by",
    sideBLabel: "With",
    storyHeading: "A Few Highlights",
    familyHeading: "The Bridal Party",
    giftsHeading: "Gifts",
    giftsMessage: "Nothing is expected — your company is the point.",
    rsvpHeading: "Can you come?",
    rsvpMessage: "Please reply by the date below.",
    guestbookHeading: "Notes for the Bride",
    guestbookMessage: "Leave her something to read.",
    dressCodeTitle: "Anything floral",
    sections: { ...PARTY_SECTIONS, family: true },
    demo: {
      primary: "Amara",
      secondary: "before the big day",
      venue: "The Garden Room",
      address: "12 Elmswood Lane, Chester CH3 9QR",
      note: "An afternoon of flowers, fizz and stories she'd rather we didn't tell.",
      timeline: [
        { time: "13:00", title: "Arrival", description: "Fizz on the lawn" },
        { time: "14:00", title: "Lunch", description: "Sharing plates" },
        { time: "15:30", title: "Toasts", description: "Bring tissues" },
      ],
    },
  },

  graduation: {
    nameMode: "single",
    stepTitle: "Who's graduating?",
    stepLead: "The graduate's name, with their year or degree underneath.",
    primaryLabel: "Graduate's name",
    primaryPlaceholder: "Omar",
    secondaryLabel: "Class or degree",
    secondaryPlaceholder: "Class of 2026",
    joinWord: "",
    eyebrow: "With a great deal of pride",
    tagline: "we invite you to celebrate this milestone",
    scheduleHeading: "The Day",
    hostsHeading: "Hosted by",
    sideALabel: "Hosted by",
    sideBLabel: "With",
    storyHeading: "The Road Here",
    familyHeading: "The Family",
    giftsHeading: "Gifts",
    giftsMessage: "Your presence is more than enough.",
    rsvpHeading: "Will you be there?",
    rsvpMessage: "Let us know by the date below.",
    guestbookHeading: "Congratulations",
    guestbookMessage: "Leave a message for the graduate.",
    dressCodeTitle: "Smart",
    sections: { ...PARTY_SECTIONS, family: true, travel: true },
    demo: {
      primary: "Omar",
      secondary: "Class of 2026",
      venue: "The Great Hall",
      address: "University of Chester, Parkgate Road CH1 4BJ",
      note: "Four years, one dissertation and an unreasonable amount of coffee later.",
      timeline: [
        { time: "11:00", title: "Ceremony", description: "The Great Hall" },
        { time: "13:00", title: "Photographs", description: "On the lawn" },
        { time: "14:00", title: "Lunch", description: "The Old Refectory" },
      ],
    },
  },

  corporate: {
    nameMode: "org",
    stepTitle: "What's the event?",
    stepLead:
      "The event title carries the invitation, with the hosting company beneath it.",
    primaryLabel: "Event title",
    primaryPlaceholder: "Annual Partners Dinner",
    secondaryLabel: "Hosted by",
    secondaryPlaceholder: "Aquila Group",
    joinWord: "",
    eyebrow: "You are cordially invited",
    tagline: "to an evening of conversation, dinner and thanks",
    scheduleHeading: "Agenda",
    hostsHeading: "Hosted by",
    sideALabel: "Hosted by",
    sideBLabel: "In partnership with",
    storyHeading: "The Year",
    familyHeading: "Your Hosts",
    giftsHeading: "Gifts",
    giftsMessage: "",
    rsvpHeading: "Please confirm your attendance",
    rsvpMessage: "Numbers are needed for catering and security by the date below.",
    guestbookHeading: "Messages",
    guestbookMessage: "Leave a note for the team.",
    dressCodeTitle: "Business Formal",
    sections: FORMAL_SECTIONS,
    demo: {
      primary: "Annual Partners Dinner",
      secondary: "Aquila Group",
      venue: "The Pavilion, Aquila House",
      address: "1 Broadgate, Manchester M1 2AB",
      note: "An evening to thank the people who made this year work, with dinner and rather fewer slides than usual.",
      timeline: [
        { time: "18:00", title: "Registration", description: "Drinks in the atrium" },
        { time: "18:45", title: "Welcome", description: "From the Chair" },
        { time: "19:15", title: "Dinner", description: "Seated, three courses" },
        { time: "21:00", title: "Awards", description: "Followed by networking" },
      ],
    },
  },

  ramadan: {
    nameMode: "single",
    stepTitle: "Who's hosting?",
    stepLead: "The host's name or the family name, as you'd like it to appear.",
    primaryLabel: "Host name",
    primaryPlaceholder: "The Rahman Family",
    secondaryLabel: "Second line",
    secondaryPlaceholder: "invite you to iftar",
    joinWord: "",
    eyebrow: "Ramadan Kareem",
    tagline: "join us for iftar and an evening of reflection",
    scheduleHeading: "The Evening",
    hostsHeading: "Hosted by",
    sideALabel: "Hosted by",
    sideBLabel: "With",
    storyHeading: "A Note",
    familyHeading: "The Family",
    giftsHeading: "Sadaqah",
    giftsMessage: "Please bring nothing. If you wish to give, give it to those in need.",
    rsvpHeading: "Will you join us for iftar?",
    rsvpMessage: "Let us know so we can prepare enough.",
    guestbookHeading: "Duas & Messages",
    guestbookMessage: "Leave a message for the family.",
    dressCodeTitle: "Modest and comfortable",
    sections: { ...PARTY_SECTIONS, gifts: false },
    demo: {
      primary: "The Rahman Family",
      secondary: "invite you to iftar",
      venue: "The Rahman Residence",
      address: "22 Sandy Lane, Manchester M20 5RT",
      note: "Our door is open every evening this month. Come and break your fast with us.",
      timeline: [
        { time: "18:45", title: "Maghrib", description: "Adhan and dates" },
        { time: "19:15", title: "Iftar", description: "Dinner served" },
        { time: "20:30", title: "Isha & Taraweeh", description: "For those staying" },
      ],
    },
  },

  eid: {
    nameMode: "single",
    stepTitle: "Who's hosting?",
    stepLead: "The host or family name, as you'd like it to appear.",
    primaryLabel: "Host name",
    primaryPlaceholder: "The Rahman Family",
    secondaryLabel: "Second line",
    secondaryPlaceholder: "open house",
    joinWord: "",
    eyebrow: "Eid Mubarak",
    tagline: "our home is open — please come and celebrate with us",
    scheduleHeading: "The Day",
    hostsHeading: "Hosted by",
    sideALabel: "Hosted by",
    sideBLabel: "With",
    storyHeading: "A Note",
    familyHeading: "The Family",
    giftsHeading: "Gifts",
    giftsMessage: "Nothing needed — just come.",
    rsvpHeading: "Are you coming?",
    rsvpMessage: "A rough number helps us cook.",
    guestbookHeading: "Eid Wishes",
    guestbookMessage: "Leave a message for the family.",
    dressCodeTitle: "Your best Eid clothes",
    sections: PARTY_SECTIONS,
    demo: {
      primary: "The Rahman Family",
      secondary: "open house",
      venue: "The Rahman Residence",
      address: "22 Sandy Lane, Manchester M20 5RT",
      note: "Doors open after prayers and stay open all day. Bring the children.",
      timeline: [
        { time: "09:00", title: "Eid Prayers", description: "At the mosque" },
        { time: "11:00", title: "Open House", description: "Food from midday" },
        { time: "16:00", title: "Tea & Sweets", description: "Until late" },
      ],
    },
  },

  nikah: {
    nameMode: "couple",
    stepTitle: "The couple",
    stepLead: "Both names, as they should appear on the nikah invitation.",
    primaryLabel: "Bride's name",
    primaryPlaceholder: "Amara",
    secondaryLabel: "Groom's name",
    secondaryPlaceholder: "Zayn",
    joinWord: "&",
    eyebrow: "Bismillah ir-Rahman ir-Rahim",
    tagline: "request the honour of your presence at their nikah",
    scheduleHeading: "Order of the Day",
    hostsHeading: "With the blessings of",
    sideALabel: "Parents of the Bride",
    sideBLabel: "Parents of the Groom",
    storyHeading: "Our Story",
    familyHeading: "The Families",
    giftsHeading: "Gifts",
    giftsMessage: "Your duas are the only gift we ask for.",
    rsvpHeading: "Will you join us?",
    rsvpMessage: "Please reply by the date below.",
    guestbookHeading: "Duas & Messages",
    guestbookMessage: "Leave a dua for the couple.",
    dressCodeTitle: "Traditional",
    sections: COUPLE_SECTIONS,
    demo: {
      primary: "Amara",
      secondary: "Zayn",
      venue: "Masjid Al-Falah",
      address: "14 Wilmslow Road, Manchester M14 5TQ",
      note: "With gratitude to Allah, we invite you to witness our nikah and join us afterwards for lunch.",
      timeline: [
        { time: "13:00", title: "Guests Arrive", description: "Prayer hall" },
        { time: "13:30", title: "Nikah Ceremony", description: "Followed by dua" },
        { time: "14:30", title: "Lunch", description: "In the community hall" },
      ],
    },
  },

  mehndi: {
    nameMode: "couple",
    stepTitle: "The couple",
    stepLead: "Both names — or just one, if the mehndi is for one side only.",
    primaryLabel: "First name",
    primaryPlaceholder: "Amara",
    secondaryLabel: "Second name",
    secondaryPlaceholder: "Zayn",
    joinWord: "&",
    eyebrow: "Colour, music and henna",
    tagline: "join us for the mehndi celebration",
    scheduleHeading: "The Evening",
    hostsHeading: "With the blessings of",
    sideALabel: "Bride's Family",
    sideBLabel: "Groom's Family",
    storyHeading: "Our Story",
    familyHeading: "The Families",
    giftsHeading: "Gifts",
    giftsMessage: "Bring nothing but your dancing shoes.",
    rsvpHeading: "Are you coming?",
    rsvpMessage: "Let us know by the date below.",
    guestbookHeading: "Messages",
    guestbookMessage: "Leave a note for the couple.",
    dressCodeTitle: "Bright colours, please",
    sections: { ...COUPLE_SECTIONS, travel: false },
    demo: {
      primary: "Amara",
      secondary: "Zayn",
      venue: "The Marquee, Sandy Lane",
      address: "22 Sandy Lane, Manchester M20 5RT",
      note: "Henna, dholki and dancing until the neighbours complain. Wear something you can move in.",
      timeline: [
        { time: "17:00", title: "Guests Arrive", description: "Chai and snacks" },
        { time: "18:00", title: "Mehndi", description: "Henna artists all evening" },
        { time: "19:30", title: "Dholki & Dancing", description: "Everyone joins in" },
        { time: "21:00", title: "Dinner", description: "Served in the marquee" },
      ],
    },
  },

  walima: {
    nameMode: "couple",
    stepTitle: "The couple",
    stepLead: "Both names, as they should appear on the walima invitation.",
    primaryLabel: "Bride's name",
    primaryPlaceholder: "Amara",
    secondaryLabel: "Groom's name",
    secondaryPlaceholder: "Zayn",
    joinWord: "&",
    eyebrow: "With the blessings of both families",
    tagline: "request the pleasure of your company at their walima",
    scheduleHeading: "Order of the Evening",
    hostsHeading: "Hosted by",
    sideALabel: "Parents of the Bride",
    sideBLabel: "Parents of the Groom",
    storyHeading: "Our Story",
    familyHeading: "The Families",
    giftsHeading: "Gifts",
    giftsMessage: "No boxed gifts, please.",
    rsvpHeading: "Will you join us?",
    rsvpMessage: "Please reply by the date below.",
    guestbookHeading: "Messages",
    guestbookMessage: "Leave a note for the couple.",
    dressCodeTitle: "Formal Traditional",
    sections: COUPLE_SECTIONS,
    demo: {
      primary: "Amara",
      secondary: "Zayn",
      venue: "The Grand Hall, Mercure",
      address: "Piccadilly, Manchester M1 3AQ",
      note: "The reception dinner, given by the groom's family, and we would be honoured to have you there.",
      timeline: [
        { time: "18:00", title: "Guests Seated", description: "Grand Hall" },
        { time: "18:45", title: "Entrance", description: "The couple arrive" },
        { time: "19:30", title: "Dinner", description: "Buffet service" },
        { time: "21:00", title: "Speeches", description: "Followed by photographs" },
      ],
    },
  },

  reception: {
    nameMode: "couple",
    stepTitle: "The couple",
    stepLead: "Both names, as they should appear on the reception invitation.",
    primaryLabel: "First name",
    primaryPlaceholder: "Amara",
    secondaryLabel: "Second name",
    secondaryPlaceholder: "Zayn",
    joinWord: "&",
    eyebrow: "The celebration continues",
    tagline: "join us for dinner, dancing and a very late night",
    scheduleHeading: "The Evening",
    hostsHeading: "Hosted by",
    sideALabel: "Hosted by",
    sideBLabel: "With",
    storyHeading: "Our Story",
    familyHeading: "The Party",
    giftsHeading: "Gifts",
    giftsMessage: "Your presence is the gift.",
    rsvpHeading: "Will you be there?",
    rsvpMessage: "Please reply by the date below.",
    guestbookHeading: "Guest Book",
    guestbookMessage: "Leave a note.",
    dressCodeTitle: "Cocktail",
    sections: { ...COUPLE_SECTIONS, parents: false, story: false },
    demo: {
      primary: "Amara",
      secondary: "Zayn",
      venue: "The Long Room",
      address: "Ashcombe Hall, Chester CH3 9QR",
      note: "Doors open at eight. There is a band, there is cake, and there is no seating plan.",
      timeline: [
        { time: "20:00", title: "Doors", description: "Drinks on arrival" },
        { time: "21:00", title: "First Dance", description: "Then everyone" },
        { time: "23:00", title: "Late Food", description: "For the survivors" },
      ],
    },
  },

  "house-warming": {
    nameMode: "single",
    stepTitle: "Who's moving in?",
    stepLead: "Your name, or both names if you'd rather.",
    primaryLabel: "Host name",
    primaryPlaceholder: "The Okoro Family",
    secondaryLabel: "Second line",
    secondaryPlaceholder: "have found their place",
    joinWord: "",
    eyebrow: "We've found our place",
    tagline: "come and see the new house",
    scheduleHeading: "The Day",
    hostsHeading: "Hosted by",
    sideALabel: "Hosted by",
    sideBLabel: "With",
    storyHeading: "The Move",
    familyHeading: "The Household",
    giftsHeading: "Gifts",
    giftsMessage: "Please don't — we have quite enough boxes already.",
    rsvpHeading: "Can you come?",
    rsvpMessage: "A rough number helps with the food.",
    guestbookHeading: "Guest Book",
    guestbookMessage: "Sign the new house's first guest book.",
    dressCodeTitle: "Comfortable",
    sections: { ...PARTY_SECTIONS, gifts: true },
    demo: {
      primary: "The Okoro Family",
      secondary: "have found their place",
      venue: "14 Hollybank Road",
      address: "14 Hollybank Road, Chester CH2 3AB",
      note: "New keys, an empty fridge and a garden we have big plans for. Come and see it.",
      timeline: [
        { time: "15:00", title: "Doors Open", description: "Come any time" },
        { time: "17:00", title: "Food", description: "Something on the barbecue" },
        { time: "19:00", title: "Drinks", description: "In the garden" },
      ],
    },
  },

  farewell: {
    nameMode: "single",
    stepTitle: "Who are we sending off?",
    stepLead: "The name of the guest of honour, with a line underneath if you like.",
    primaryLabel: "Guest of honour",
    primaryPlaceholder: "Daniel",
    secondaryLabel: "Second line",
    secondaryPlaceholder: "after eleven years",
    joinWord: "",
    eyebrow: "One last evening together",
    tagline: "join us to send them off properly",
    scheduleHeading: "The Evening",
    hostsHeading: "Hosted by",
    sideALabel: "Hosted by",
    sideBLabel: "With",
    storyHeading: "The Years",
    familyHeading: "The Team",
    giftsHeading: "Gifts",
    giftsMessage: "There's a card going round — see the organiser.",
    rsvpHeading: "Are you coming?",
    rsvpMessage: "Let us know by the date below.",
    guestbookHeading: "Farewell Messages",
    guestbookMessage: "Leave something for them to take with them.",
    dressCodeTitle: "Smart casual",
    sections: { ...PARTY_SECTIONS, family: true },
    demo: {
      primary: "Daniel",
      secondary: "after eleven years",
      venue: "The Old Harkers Arms",
      address: "1 Russell Street, Chester CH3 5AL",
      note: "Eleven years, four desks and one legendary spreadsheet. Come and say goodbye properly.",
      timeline: [
        { time: "18:00", title: "Drinks", description: "Back room reserved" },
        { time: "19:30", title: "Speeches", description: "Short, we promise" },
        { time: "20:00", title: "Dinner", description: "Then wherever the night goes" },
      ],
    },
  },

  school: {
    nameMode: "org",
    stepTitle: "What's the event?",
    stepLead: "The event title, with the school name beneath it.",
    primaryLabel: "Event title",
    primaryPlaceholder: "Summer Prize Giving",
    secondaryLabel: "School",
    secondaryPlaceholder: "Elmswood Primary",
    joinWord: "",
    eyebrow: "You are warmly invited",
    tagline: "to join us for the afternoon",
    scheduleHeading: "Programme",
    hostsHeading: "Hosted by",
    sideALabel: "Hosted by",
    sideBLabel: "With",
    storyHeading: "The Year",
    familyHeading: "Staff",
    giftsHeading: "Contributions",
    giftsMessage: "",
    rsvpHeading: "Please let us know",
    rsvpMessage: "Numbers help us set out enough seating.",
    guestbookHeading: "Messages",
    guestbookMessage: "Leave a note for the school.",
    dressCodeTitle: "Smart",
    sections: FORMAL_SECTIONS,
    demo: {
      primary: "Summer Prize Giving",
      secondary: "Elmswood Primary",
      venue: "The School Hall",
      address: "Elmswood Primary, Chester CH2 1DE",
      note: "An afternoon of music, prizes and a great deal of clapping. Families very welcome.",
      timeline: [
        { time: "13:30", title: "Doors", description: "Tea in the foyer" },
        { time: "14:00", title: "Performance", description: "Years 3 to 6" },
        { time: "15:00", title: "Prize Giving", description: "In the hall" },
      ],
    },
  },

  business: {
    nameMode: "org",
    stepTitle: "What's the event?",
    stepLead: "The event title carries the invitation, with your company beneath it.",
    primaryLabel: "Event title",
    primaryPlaceholder: "The Opening Night",
    secondaryLabel: "Company",
    secondaryPlaceholder: "Aquila Studio",
    joinWord: "",
    eyebrow: "You are invited",
    tagline: "to join us for the opening",
    scheduleHeading: "Programme",
    hostsHeading: "Hosted by",
    sideALabel: "Hosted by",
    sideBLabel: "In partnership with",
    storyHeading: "The Story So Far",
    familyHeading: "The Team",
    giftsHeading: "Gifts",
    giftsMessage: "",
    rsvpHeading: "Please confirm your place",
    rsvpMessage: "Places are limited, so a reply by the date below is appreciated.",
    guestbookHeading: "Messages",
    guestbookMessage: "Leave a note for the team.",
    dressCodeTitle: "Smart",
    sections: FORMAL_SECTIONS,
    demo: {
      primary: "The Opening Night",
      secondary: "Aquila Studio",
      venue: "Aquila Studio",
      address: "1 Broadgate, Manchester M1 2AB",
      note: "Two years in the making. Come and see the space, meet the team and have a drink on us.",
      timeline: [
        { time: "18:00", title: "Doors", description: "Drinks on arrival" },
        { time: "18:45", title: "Introductions", description: "From the founders" },
        { time: "19:30", title: "Studio Tours", description: "In small groups" },
      ],
    },
  },
};

export function getOccasion(id: CategoryId | string | undefined): OccasionPreset {
  return OCCASIONS[id as CategoryId] ?? OCCASIONS.wedding;
}

/** Fields the occasion owns. Anything the guest has personalised is kept. */
type Owned = Pick<
  Invitation,
  "eyebrow" | "tagline" | "joinWord"
>;

function ownedDefaults(p: OccasionPreset): Owned {
  return { eyebrow: p.eyebrow, tagline: p.tagline, joinWord: p.joinWord };
}

/**
 * Re-point an invitation at a different occasion.
 *
 * Wording that still matches the old occasion's default is swapped for the new
 * one; anything the user has actually typed is left exactly as it is. Section
 * toggles follow the new occasion only where the user hasn't diverged.
 */
export function applyOccasion(
  inv: Invitation,
  next: CategoryId,
): Partial<Invitation> {
  const from = getOccasion(inv.category);
  const to = getOccasion(next);
  const oldDefaults = ownedDefaults(from);
  const patch: Partial<Invitation> = { category: next };

  const keep = <K extends keyof Owned>(key: K) =>
    inv[key] && inv[key] !== oldDefaults[key];

  if (!keep("eyebrow")) patch.eyebrow = to.eyebrow;
  if (!keep("tagline")) patch.tagline = to.tagline;
  /* joinWord is structural: couples need one, single/org modes must not show
     a stray ampersand, so it always follows the occasion. */
  patch.joinWord = to.joinWord;

  /* Moving to a mode with no second name shouldn't strand wedding content in
     a field the new occasion labels differently — but we never delete typing. */
  if (inv.parents.heading === from.hostsHeading) {
    patch.parents = {
      ...inv.parents,
      heading: to.hostsHeading,
      sideALabel:
        inv.parents.sideALabel === from.sideALabel ? to.sideALabel : inv.parents.sideALabel,
      sideBLabel:
        inv.parents.sideBLabel === from.sideBLabel ? to.sideBLabel : inv.parents.sideBLabel,
      enabled: to.sections.parents,
    };
  }
  if (inv.story.heading === from.storyHeading) {
    patch.story = { ...inv.story, heading: to.storyHeading, enabled: to.sections.story };
  }
  if (inv.family.heading === from.familyHeading) {
    patch.family = { ...inv.family, heading: to.familyHeading, enabled: to.sections.family };
  }
  if (inv.gifts.message === from.giftsMessage) {
    patch.gifts = {
      ...inv.gifts,
      heading: to.giftsHeading,
      message: to.giftsMessage,
      enabled: to.sections.gifts,
    };
  }
  if (inv.rsvp.heading === from.rsvpHeading) {
    patch.rsvp = { ...inv.rsvp, heading: to.rsvpHeading, message: to.rsvpMessage };
  }
  if (inv.guestbook.heading === from.guestbookHeading) {
    patch.guestbook = {
      ...inv.guestbook,
      heading: to.guestbookHeading,
      message: to.guestbookMessage,
    };
  }
  if (!inv.travel.transportation && !inv.travel.accommodation.length) {
    patch.travel = { ...inv.travel, enabled: to.sections.travel };
  }
  if (!inv.faqs.items.length) {
    patch.faqs = { ...inv.faqs, enabled: to.sections.faqs };
  }

  return patch;
}
