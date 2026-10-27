import type { CategoryId } from "./types";

export interface InvitationGuide {
  slug: string;
  category: CategoryId;
  label: string;
  title: string;
  description: string;
  intro: string;
  checklist: string[];
  sections: { heading: string; text: string }[];
  wording: string;
  faqs: { question: string; answer: string }[];
}

export const INVITATION_GUIDES: InvitationGuide[] = [
  {
    slug: "wedding", category: "wedding", label: "Wedding invitations",
    title: "Free digital wedding invitations with RSVP",
    description: "Create a free digital wedding invitation with online RSVP. Browse designs, plan your ceremony details, copy sample wording and share one invitation link.",
    intro: "Give your guests one place to find the ceremony time, reception details and RSVP form. Choose a wedding design, add your names and venue, then share your invitation link by message or email.",
    checklist: ["Both partners' names and the hosts, if included", "The wedding date and ceremony start time", "Ceremony and reception addresses, with directions", "A schedule that distinguishes arrival, ceremony and reception", "An RSVP deadline and any meal choices you need to collect", "Dress code and travel details that guests need before attending"],
    sections: [
      { heading: "Make the schedule clear", text: "An arrival time is different from a ceremony start time. Label each part of the day in the schedule, and include the reception venue separately if guests need to travel. Read the finished invitation on your phone to check that names, times and addresses are easy to find." },
      { heading: "Ask for the replies you need", text: "Enable the invitation's RSVP section and decide whether to ask for guest counts, meal choices and a message. Set a reply deadline before your venue or caterer needs final numbers. Guests can respond in their browser without an Invitra account; you review the responses in My invitations." },
      { heading: "Share a link or add it to a printed card", text: "After publishing, copy the invitation link into the message you send to guests. You can also use the invitation's QR code on printed material. Open the published link in a private browser window before sending it, and check your venue details and RSVP settings." },
    ],
    wording: "Together with our families, we invite you to celebrate the wedding of [Name] and [Name]. Join us on [date] at [time] at [ceremony venue]. Reception to follow at [reception venue]. Please reply through this invitation by [RSVP date].",
    faqs: [
      { question: "Can I make a wedding invitation for free?", answer: "Yes. Invitra's designs, editor and online RSVP tools are free to use. You can browse and preview without an account. Sign in with a free account to save your details, upload media and publish." },
      { question: "Can wedding guests RSVP without signing in?", answer: "Yes. Guests open your published invitation link and use its RSVP form without creating an account. You need a host account to manage the invitation and review responses." },
      { question: "Can I include both ceremony and reception details?", answer: "Use the main venue fields for the primary location, then add separate schedule entries for the ceremony and reception. Include any second address clearly in the relevant schedule description." },
    ],
  },
  {
    slug: "birthday", category: "birthday", label: "Birthday invitations",
    title: "Free online birthday invitation maker",
    description: "Make a free birthday invitation with an RSVP link. Find designs, a party-detail checklist and sample wording for children's parties and milestone birthdays.",
    intro: "Make the party details easy to find and the reply easy to send. Start with a birthday design, add the guest of honor's name and party details, and share a link with your guests.",
    checklist: ["The guest of honor's name and age or milestone, if you want to include it", "Party date, start time and expected finish time", "The venue name and full address", "A reply deadline and whether guests should include their group size", "Any theme, dress code or activity instructions", "For children's parties, whether parents should stay or return for pickup"],
    sections: [
      { heading: "Write for the guests you are inviting", text: "For a child's party, make it clear whether siblings are invited and whether a parent needs to stay. For an adult birthday, explain any theme or dress code in plain language. A short, practical note is more useful than leaving guests to guess what to bring or wear." },
      { heading: "Keep surprise plans in the invitation note", text: "If the party is a surprise, say so near the beginning of your invitation note and give guests a separate arrival time. Keep the message you send with the link equally clear. Check that the person being surprised is not included in the group where you share it." },
      { heading: "Collect replies before planning food and activities", text: "Enable the RSVP guest-count question if you need a headcount rather than just a list of names. You can also ask for a message so guests can share relevant information. Review replies in your account before confirming food, seating or activity bookings." },
    ],
    wording: "You're invited to celebrate [Name]'s [age or milestone] birthday! Join us on [date] from [start time] to [finish time] at [venue and address]. [Theme or activity details]. Please RSVP through this invitation by [reply date].",
    faqs: [
      { question: "Can I share a birthday invitation on WhatsApp?", answer: "Yes. Publish your invitation, copy its link and paste it into a WhatsApp message. You can send the same link by text message or email." },
      { question: "Does the birthday invitation include an RSVP form?", answer: "You can enable online RSVP in the editor and choose which response fields to show. Guests reply on the invitation page, and the host reviews responses in My invitations." },
      { question: "Can I make a child's birthday invitation?", answer: "Yes. Use the birthday occasion, enter the child's name and add the age or milestone if you wish. Include parent attendance, pickup and activity details in the invitation note or schedule." },
    ],
  },
  {
    slug: "baby-shower", category: "baby-shower", label: "Baby shower invitations",
    title: "Free digital baby shower invitations",
    description: "Create a free baby shower invitation with online RSVP. Explore designs, copy invitation wording and include the host, venue and gift information guests need.",
    intro: "Bring the shower details together in a shareable invitation. Add the guest of honor, host, time and venue, then let guests reply online so you can plan the gathering.",
    checklist: ["The name of the parent or parents being celebrated", "The host's name and how guests should respond", "The shower date, start time and venue address", "An RSVP deadline and whether partners or children are invited", "Any theme, dress code or activity instructions", "Optional registry or gift information, phrased clearly and without pressure"],
    sections: [
      { heading: "Name the host and guest of honor clearly", text: "A baby shower is often organized by a friend or relative rather than the person being celebrated. Explain who is hosting in the invitation note. If the event is a surprise or has a particular guest list, say that explicitly instead of relying on the design to communicate it." },
      { heading: "Keep gift information optional and easy to find", text: "If you want to include a registry or gift preference, place it in the gifts section rather than mixing it into the date and venue details. Review any link you enter before sharing the invitation. You can turn optional sections off when they are not relevant to your gathering." },
      { heading: "Use RSVP information to plan the gathering", text: "Enable the reply form and guest-count question if you need to plan seating, refreshments or activities. Include a reply deadline that leaves time for arrangements. Guests can open the invitation and respond in their browser without downloading an app." },
    ],
    wording: "Please join us for a baby shower celebrating [Name or Names]. Hosted by [host], on [date] at [time], at [venue and address]. [Optional theme or gift information]. Please reply through this invitation by [RSVP date]. We look forward to celebrating with you.",
    faqs: [
      { question: "What should a baby shower invitation include?", answer: "Include the guest of honor, host, date, time, venue address and reply details. Add guest-list guidance, a theme or optional gift information when relevant." },
      { question: "Can I add gift information to the invitation?", answer: "Yes. The editor includes an optional gifts section for a message and gift details. You can leave it off when you do not need it." },
      { question: "Do guests need an account to reply?", answer: "No. Guests can use the RSVP form on your published invitation without an Invitra account. A free host account is required to save and publish the invitation." },
    ],
  },
  {
    slug: "nikah", category: "nikah", label: "Nikah invitations",
    title: "Free online nikah invitation maker",
    description: "Create a free nikah invitation with online RSVP. Browse designs, customize English wording and add family names, ceremony details and directions.",
    intro: "Prepare a nikah invitation with clear family names, ceremony details and an online reply form. Start with a design, edit the wording for your gathering, and share the finished invitation as a link.",
    checklist: ["Both partners' names, checked for spelling", "The family or host names you want to include", "The nikah date, guest arrival time and ceremony time", "The venue name, address and directions", "Details of any meal or gathering included in this invitation", "An RSVP deadline and any guest instructions"],
    sections: [
      { heading: "Choose wording that fits your family", text: "You can keep the opening brief or include an introduction from the hosts. Check names and relationships with the people concerned before publishing. The sample below is a starting point for an invitation, rather than guidance on religious or legal requirements." },
      { heading: "Distinguish the nikah from other functions", text: "If the invitation is only for the nikah, make that clear in the heading and schedule. If it also includes a meal or another gathering, give each part its own time and location details. For separate guest lists, prepare separate invitations so guests see the details relevant to them." },
      { heading: "Review language and layout before sending", text: "The editor supports English as well as Urdu and Arabic layouts. Preview the invitation on a phone after changing its language, and check that names, addresses and any custom text read correctly. Publish only after checking the venue and RSVP settings." },
    ],
    wording: "Together with our families, we invite you to the nikah of [Name] and [Name]. Please join us on [date] at [time] at [venue and address]. [Meal or gathering details, if applicable]. Kindly reply through this invitation by [RSVP date].",
    faqs: [
      { question: "Can I create a nikah invitation in English?", answer: "Yes. Choose the nikah occasion and edit the names, introduction and invitation note in English. The occasion preset includes family and ceremony sections that you can customize." },
      { question: "Can I use Urdu or Arabic text?", answer: "The editor supports Urdu and Arabic with right-to-left invitation layouts. Preview your chosen language and check the finished wording before publishing." },
      { question: "Can I make separate invitations for different functions?", answer: "Yes. Create separate invitations for events with different dates, venues or guest lists. Choose the appropriate occasion for each invitation, such as nikah, mehndi or walima." },
    ],
  },
];

export function getInvitationGuide(slug: string) {
  return INVITATION_GUIDES.find(guide => guide.slug === slug);
}
