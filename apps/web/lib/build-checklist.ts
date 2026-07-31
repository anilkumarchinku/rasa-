export type BuildStatus = "complete" | "in_progress" | "blocked" | "planned";

export type BuildChecklistItem = {
  id: string;
  title: string;
  status: BuildStatus;
  detail: string;
  route?: string;
};

export type BuildPhase = {
  id: string;
  title: string;
  timing: string;
  goal: string;
  items: BuildChecklistItem[];
};

export const buildPhases: BuildPhase[] = [
  {
    id: "phase-0",
    title: "Phase 0: Save and book wedge",
    timing: "Months 1-2",
    goal: "Prove that a saved creator recommendation can become a restaurant visit.",
    items: [
      {
        id: "0.1",
        title: "Lock the MVP scope",
        status: "complete",
        detail: "The save-to-map-to-book wedge and founder test gates are documented.",
        route: "/qa",
      },
      {
        id: "0.2",
        title: "Set up the web app, repository, deployment, and base tooling",
        status: "complete",
        detail: "Next.js app, shadcn primitives, GitHub, Vercel, and Supabase are connected.",
      },
      {
        id: "0.3",
        title: "Phone auth and diner onboarding",
        status: "in_progress",
        detail: "A demo onboarding flow exists. Real OTP, sessions, and consent storage are not built.",
        route: "/",
      },
      {
        id: "0.4",
        title: "Hyderabad place database",
        status: "in_progress",
        detail: "Seed places work for demos. A verified, searchable Hyderabad restaurant catalog is still needed.",
        route: "/places",
      },
      {
        id: "0.5",
        title: "Universal Save and automatic Reel resolver",
        status: "in_progress",
        detail: "Paste, save, cloud sync, known-place matches, and safe pending states work. Reliable unknown-Reel detection needs Meta access, OCR/AI, and a larger place database.",
        route: "/save",
      },
      {
        id: "0.6",
        title: "Personal saved map",
        status: "in_progress",
        detail: "Matched saves appear as pins on the Hyderabad map and open Google Maps. Pending links are visible but cannot be pinned until identified.",
        route: "/map",
      },
      {
        id: "0.7",
        title: "For You creator feed",
        status: "in_progress",
        detail: "A seeded interactive feed exists; it is not yet personalized from real creator content or behavior.",
        route: "/feed",
      },
      {
        id: "0.8",
        title: "Affiliate booking",
        status: "in_progress",
        detail: "Booking intent and affiliate-style handoff are demonstrated; a live affiliate partner contract and conversion callback are still required.",
        route: "/book",
      },
      {
        id: "0.9",
        title: "Scratch cards and referrals",
        status: "in_progress",
        detail: "The interaction is implemented locally. Wallet balances, fraud controls, and real payouts are not connected.",
        route: "/rewards",
      },
      {
        id: "0.10",
        title: "Creator vanity pages and onboarding",
        status: "in_progress",
        detail: "Sample creator pages are present. Creator identity verification and real social account linking remain.",
        route: "/creators",
      },
      {
        id: "0.11",
        title: "Launch analytics",
        status: "in_progress",
        detail: "Browser event tracking is available. A real analytics warehouse and retention cohorts are not connected.",
        route: "/analytics",
      },
      {
        id: "0.12",
        title: "Phase 0 beta readiness",
        status: "blocked",
        detail: "Blocked until resolver accuracy, real authentication, booking partners, device testing, and customer discovery evidence meet the PRD exit criteria.",
        route: "/qa",
      },
    ],
  },
  {
    id: "phase-1",
    title: "Phase 1: Monetize the B-side",
    timing: "Months 3-6",
    goal: "Give restaurants attributable demand and prove revenue.",
    items: [
      {
        id: "1.1",
        title: "Restaurant claim and verification",
        status: "planned",
        detail: "Prototype screens exist, but GST/FSSAI verification and partner operations are not live.",
        route: "/restaurants/claim",
      },
      {
        id: "1.2",
        title: "Restaurant attribution dashboard",
        status: "planned",
        detail: "Dashboard UI is a prototype; it has no real booking, POS, or creator attribution data.",
        route: "/restaurants/dashboard",
      },
      {
        id: "1.3",
        title: "Direct booking and availability",
        status: "planned",
        detail: "Booking UI is simulated. POS integration, inventory holds, payments, and confirmations are not live.",
        route: "/book/direct",
      },
      {
        id: "1.4",
        title: "Verified-eater reviews",
        status: "planned",
        detail: "The review flow is only a prototype until completed bookings and bill verification are connected.",
        route: "/reviews",
      },
      {
        id: "1.5",
        title: "Creator Authenticity Score",
        status: "planned",
        detail: "Score presentation exists, but the source-of-truth signals, anti-gaming rules, and weekly calculation job do not.",
        route: "/creators/trust",
      },
      {
        id: "1.6",
        title: "Rasa Live Fest",
        status: "planned",
        detail: "Event board is a demo; Mux streaming, live chat, tickets, and settlement are not integrated.",
        route: "/live",
      },
      {
        id: "1.7",
        title: "Restaurant SaaS plans and billing",
        status: "planned",
        detail: "Pricing screens are present; Razorpay subscriptions and GST invoicing are not connected.",
        route: "/restaurants/billing",
      },
      {
        id: "1.8",
        title: "Pay-per-booking promotions",
        status: "planned",
        detail: "Campaign creation is a local prototype. Budget enforcement and verified conversions are not live.",
        route: "/restaurants/promotions",
      },
      {
        id: "1.9",
        title: "Phase 1 revenue readiness",
        status: "blocked",
        detail: "Cannot start the revenue gate until Phase 0 has a working, tested demand loop.",
        route: "/phase-1-qa",
      },
    ],
  },
  {
    id: "phase-2",
    title: "Phase 2: Creator economy and social",
    timing: "Months 7-12",
    goal: "Make dining discovery more social, repeatable, and economically useful for creators.",
    items: [
      { id: "2.1", title: "Group planning and WhatsApp invites", status: "planned", detail: "Prototype only; no real sharing, voting sync, or group booking.", route: "/plan/group" },
      { id: "2.2", title: "Friends' saves and privacy", status: "planned", detail: "Prototype privacy controls; no authenticated social graph.", route: "/friends" },
      { id: "2.3", title: "Bill OCR cashback", status: "planned", detail: "Prototype interface; receipt OCR, validation, and wallet credit are not connected.", route: "/bill-scan" },
      { id: "2.4", title: "Tiers, badges, and Rasa identity", status: "planned", detail: "Presentation exists, but verified activity and reward rules are not live.", route: "/you/identity" },
      { id: "2.5", title: "Eat With the Creator", status: "planned", detail: "Event booking prototype only; contracts, payments, and seating operations are not live.", route: "/experiences/creator-dinners" },
      { id: "2.6", title: "Family Mode", status: "planned", detail: "Prototype matching UI only; family profiles and constraint-based inventory are not live.", route: "/family" },
      { id: "2.7", title: "Creator premium and campaign marketplace", status: "planned", detail: "Prototype marketplace only; applications, contracts, and payouts are not live.", route: "/creators/marketplace" },
      { id: "2.8", title: "Phase 2 engagement readiness", status: "blocked", detail: "Blocked behind validated Phase 0 and Phase 1 demand, bookings, and revenue.", route: "/phase-2-qa" },
    ],
  },
  {
    id: "phase-3",
    title: "Phase 3: Geographic expansion",
    timing: "Year 2",
    goal: "Repeat a validated Hyderabad playbook in Bangalore and Mumbai.",
    items: [
      { id: "3.1", title: "Bangalore launch foundation", status: "planned", detail: "Requires proven Hyderabad supply, creators, operations, and unit economics.", route: "/cities/bangalore" },
      { id: "3.2", title: "Mumbai launch foundation", status: "planned", detail: "Requires proven Hyderabad supply, creators, operations, and unit economics.", route: "/cities/mumbai" },
      { id: "3.3", title: "Travel Mode", status: "planned", detail: "Prototype only; real city detection and cross-city inventory are not ready.", route: "/travel" },
      { id: "3.4", title: "Voice search", status: "planned", detail: "Prototype only; speech recognition and multilingual search need product validation.", route: "/voice-search" },
      { id: "3.5", title: "Rasa Plus", status: "planned", detail: "Pricing UI only; benefits, payments, and membership operations are not live.", route: "/plus" },
      { id: "3.6", title: "Multi-city operations and expansion QA", status: "blocked", detail: "Blocked until one city is economically proven first.", route: "/phase-3-qa" },
    ],
  },
  {
    id: "phase-4",
    title: "Phase 4: Vertical expansion",
    timing: "Year 3",
    goal: "Expand the trusted creator-to-transaction system after dining is proven.",
    items: [
      { id: "4.1", title: "Wedding planning", status: "planned", detail: "Exploration UI only; no supply, contracts, or transactions.", route: "/weddings" },
      { id: "4.2", title: "Experiences and events", status: "planned", detail: "Exploration UI only; no live inventory, tickets, or operations.", route: "/experiences" },
      { id: "4.3", title: "API and data products", status: "planned", detail: "Exploration UI only; no privacy-safe data product or customer contracts.", route: "/data-products" },
      { id: "4.4", title: "Server tipping via UPI", status: "planned", detail: "Exploration only; payments, KYC, and payout compliance are not in place.", route: "/tips" },
      { id: "4.5", title: "Scale readiness", status: "blocked", detail: "Blocked until dining is a proven multi-city business.", route: "/phase-4-qa" },
    ],
  },
];

export const activeBuildGate = {
  title: "Universal Save must resolve unknown Reels reliably",
  description:
    "The plain-link save works. The active gap is converting unknown Instagram Reel URLs into verified restaurants in under two minutes without inventing a location.",
  route: "/save",
};
