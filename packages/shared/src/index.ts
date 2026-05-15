export const RASA_CITY = "Hyderabad";

export const phaseZeroCuisines = [
  "Biryani",
  "Telugu",
  "Cafe",
  "North Indian",
  "South Indian",
  "Desserts",
  "Street Food",
  "Pan Asian",
] as const;

export type PhaseZeroCuisine = (typeof phaseZeroCuisines)[number];

export const demoOtpCode = "123456";

export const minimumCuisineSelections = 3;

export type OnboardingProfile = {
  phone: string;
  city: typeof RASA_CITY;
  cuisines: PhaseZeroCuisine[];
  completedAt: string;
};

export type PlacePriceBand = "budget" | "mid" | "premium" | "luxury";

export type CreatorDisclosure = "organic" | "paid" | "hosted" | "affiliate";

export type PhaseZeroPlace = {
  id: string;
  name: string;
  area: string;
  city: typeof RASA_CITY;
  address: string;
  latitude: number;
  longitude: number;
  cuisines: PhaseZeroCuisine[];
  priceBand: PlacePriceBand;
  vibeTags: string[];
  heroDish: string;
  source: "seed";
  bookingUrl?: string;
  phone?: string;
};

export const hyderabadSeedPlaces = [
  {
    id: "hyd-bawarchi-rtc-x-roads",
    name: "Bawarchi",
    area: "RTC X Roads",
    city: RASA_CITY,
    address: "RTC Cross Road, Chikkadpally, Hyderabad",
    latitude: 17.4066,
    longitude: 78.4977,
    cuisines: ["Biryani", "North Indian"],
    priceBand: "mid",
    vibeTags: ["Iconic", "Group meal", "Late lunch"],
    heroDish: "Chicken biryani",
    source: "seed",
    bookingUrl: "https://www.zomato.com/hyderabad/bawarchi-rtc-x-roads",
  },
  {
    id: "hyd-shah-ghouse-tolichowki",
    name: "Shah Ghouse",
    area: "Tolichowki",
    city: RASA_CITY,
    address: "Tolichowki Main Road, Hyderabad",
    latitude: 17.3993,
    longitude: 78.4138,
    cuisines: ["Biryani", "North Indian"],
    priceBand: "mid",
    vibeTags: ["Iconic", "Dinner rush", "Friends"],
    heroDish: "Mutton biryani",
    source: "seed",
    bookingUrl: "https://www.zomato.com/hyderabad/shah-ghouse-tolichowki",
  },
  {
    id: "hyd-cafe-bahar-basheerbagh",
    name: "Cafe Bahar",
    area: "Basheerbagh",
    city: RASA_CITY,
    address: "Old MLA Quarters Road, Basheerbagh, Hyderabad",
    latitude: 17.4014,
    longitude: 78.4772,
    cuisines: ["Biryani", "North Indian"],
    priceBand: "mid",
    vibeTags: ["Old-school", "Family", "No-fuss"],
    heroDish: "Special biryani",
    source: "seed",
    bookingUrl: "https://www.zomato.com/hyderabad/cafe-bahar-basheerbagh",
  },
  {
    id: "hyd-pista-house-charminar",
    name: "Pista House",
    area: "Charminar",
    city: RASA_CITY,
    address: "Shalibanda Road, Charminar, Hyderabad",
    latitude: 17.3578,
    longitude: 78.4717,
    cuisines: ["Biryani", "Desserts"],
    priceBand: "mid",
    vibeTags: ["Old City", "Haleem", "Tour stop"],
    heroDish: "Haleem",
    source: "seed",
    bookingUrl: "https://www.zomato.com/hyderabad/pista-house-charminar",
  },
  {
    id: "hyd-chutneys-banjara-hills",
    name: "Chutneys",
    area: "Banjara Hills",
    city: RASA_CITY,
    address: "Road No. 3, Banjara Hills, Hyderabad",
    latitude: 17.4249,
    longitude: 78.4384,
    cuisines: ["South Indian", "Telugu"],
    priceBand: "mid",
    vibeTags: ["Breakfast", "Family", "Reliable"],
    heroDish: "Guntur idli",
    source: "seed",
    bookingUrl: "https://www.zomato.com/hyderabad/chutneys-banjara-hills",
  },
  {
    id: "hyd-tatva-jubilee-hills",
    name: "Tatva",
    area: "Jubilee Hills",
    city: RASA_CITY,
    address: "Road No. 36, Jubilee Hills, Hyderabad",
    latitude: 17.4315,
    longitude: 78.4085,
    cuisines: ["North Indian", "Pan Asian"],
    priceBand: "premium",
    vibeTags: ["Date night", "Vegetarian", "Polished"],
    heroDish: "Paneer tikka platter",
    source: "seed",
    bookingUrl: "https://www.zomato.com/hyderabad/tatva-jubilee-hills",
  },
  {
    id: "hyd-roastery-coffee-house-banjara-hills",
    name: "Roastery Coffee House",
    area: "Banjara Hills",
    city: RASA_CITY,
    address: "Road No. 14, Banjara Hills, Hyderabad",
    latitude: 17.4155,
    longitude: 78.4348,
    cuisines: ["Cafe", "Desserts"],
    priceBand: "premium",
    vibeTags: ["Coffee", "Work-friendly", "Date"],
    heroDish: "Cold brew",
    source: "seed",
    bookingUrl: "https://www.zomato.com/hyderabad/roastery-coffee-house-banjara-hills",
  },
  {
    id: "hyd-concu-jubilee-hills",
    name: "Concu",
    area: "Jubilee Hills",
    city: RASA_CITY,
    address: "Road No. 45, Jubilee Hills, Hyderabad",
    latitude: 17.4339,
    longitude: 78.3996,
    cuisines: ["Cafe", "Desserts"],
    priceBand: "premium",
    vibeTags: ["Dessert", "Date", "Quiet"],
    heroDish: "Chocolate eclair",
    source: "seed",
    bookingUrl: "https://www.zomato.com/hyderabad/concu-jubilee-hills",
  },
  {
    id: "hyd-minerva-coffee-shop-himayatnagar",
    name: "Minerva Coffee Shop",
    area: "Himayatnagar",
    city: RASA_CITY,
    address: "Himayatnagar Main Road, Hyderabad",
    latitude: 17.4028,
    longitude: 78.4841,
    cuisines: ["South Indian", "Telugu"],
    priceBand: "budget",
    vibeTags: ["Breakfast", "Classic", "Family"],
    heroDish: "Filter coffee and dosa",
    source: "seed",
    bookingUrl: "https://www.zomato.com/hyderabad/minerva-coffee-shop-himayatnagar",
  },
  {
    id: "hyd-ram-ki-bandi-nampally",
    name: "Ram Ki Bandi",
    area: "Nampally",
    city: RASA_CITY,
    address: "Mozamjahi Market, Nampally, Hyderabad",
    latitude: 17.3843,
    longitude: 78.4744,
    cuisines: ["Street Food", "South Indian"],
    priceBand: "budget",
    vibeTags: ["Late night", "Street", "Quick bite"],
    heroDish: "Cheese dosa",
    source: "seed",
    bookingUrl: "https://www.zomato.com/hyderabad/ram-ki-bandi-nampally",
  },
  {
    id: "hyd-the-hole-in-the-wall-cafe-jubilee-hills",
    name: "The Hole In The Wall Cafe",
    area: "Jubilee Hills",
    city: RASA_CITY,
    address: "Jubilee Hills, Hyderabad",
    latitude: 17.431,
    longitude: 78.409,
    cuisines: ["Cafe", "Desserts"],
    priceBand: "mid",
    vibeTags: ["Brunch", "Friends", "Casual"],
    heroDish: "All-day breakfast",
    source: "seed",
    bookingUrl: "https://www.zomato.com/hyderabad/the-hole-in-the-wall-cafe-jubilee-hills",
  },
  {
    id: "hyd-haiku-banjara-hills",
    name: "Haiku",
    area: "Banjara Hills",
    city: RASA_CITY,
    address: "Banjara Hills, Hyderabad",
    latitude: 17.4149,
    longitude: 78.4342,
    cuisines: ["Pan Asian"],
    priceBand: "premium",
    vibeTags: ["Date night", "Sushi", "Modern"],
    heroDish: "Sushi platter",
    source: "seed",
    bookingUrl: "https://www.zomato.com/hyderabad/haiku-banjara-hills",
  },
] as const satisfies PhaseZeroPlace[];

export const seedPlaceAreas = Array.from(new Set(hyderabadSeedPlaces.map((place) => place.area)));

export const seedPlaceCount = hyderabadSeedPlaces.length;

export const phaseZeroExitTargets = {
  betaUsers: 500,
  creatorsSigned: 50,
  weeklySavesPerUser: 5,
  weeklyReturnRatePct: 30,
  seedPlaces: 12,
} as const;

export const authenticityScoreWeights = {
  preRecommendationVisits: 35,
  disclosureCompliance: 20,
  followThrough: 15,
  outcomeMatch: 20,
  negativeHonesty: 10,
} as const;

export function getSeedPlaceById(placeId: string): PhaseZeroPlace | undefined {
  return hyderabadSeedPlaces.find((place) => place.id === placeId);
}

export type SaveSource = "instagram" | "youtube" | "whatsapp" | "manual" | "unknown";

export const savedPlacesStorageKey = "rasa.phase0.saves";

export const bookingIntentStorageKey = "rasa.phase0.booking-intents";

export type BookingIntentRecord = {
  id: string;
  placeId: string;
  placeName: string;
  affiliateUrl: string;
  source: "affiliate";
  provider: "zomato" | "eazydiner" | "manual";
  creatorHandle?: string;
  savedRecordId?: string;
  createdAt: string;
};

export const rewardsStorageKey = "rasa.phase0.rewards";

export const referralStorageKey = "rasa.phase0.referrals";

export const analyticsEventsStorageKey = "rasa.phase0.analytics-events";

export const restaurantClaimsStorageKey = "rasa.phase1.restaurant-claims";

export const directBookingsStorageKey = "rasa.phase1.direct-bookings";

export const verifiedReviewsStorageKey = "rasa.phase1.verified-reviews";

export const liveFestReservationsStorageKey = "rasa.phase1.live-fest-reservations";

export const restaurantSubscriptionsStorageKey = "rasa.phase1.restaurant-subscriptions";

export const payPerBookingPromotionsStorageKey = "rasa.phase1.pay-per-booking-promotions";

export const groupPlansStorageKey = "rasa.phase2.group-plans";

export const friendsPrivacyStorageKey = "rasa.phase2.friends-privacy";

export const billScansStorageKey = "rasa.phase2.bill-scans";

export const userIdentityStorageKey = "rasa.phase2.user-identity";

export const creatorDinnerBookingsStorageKey = "rasa.phase2.creator-dinner-bookings";

export const familyProfileStorageKey = "rasa.phase2.family-profile";

export const creatorCampaignsStorageKey = "rasa.phase2.creator-campaigns";

export const cityLaunchStorageKey = "rasa.phase3.city-launches";

export const rasaPlusStorageKey = "rasa.phase3.rasa-plus";

export const voiceSearchStorageKey = "rasa.phase3.voice-search";

export const verticalExperimentsStorageKey = "rasa.phase4.vertical-experiments";

export const serverTipsStorageKey = "rasa.phase4.server-tips";

export type RewardRecord = {
  id: string;
  bookingIntentId: string;
  placeName: string;
  amount: number;
  status: "unlocked";
  createdAt: string;
};

export type ReferralRecord = {
  code: string;
  inviteCount: number;
  pendingValue: number;
  createdAt: string;
};

export type AnalyticsEventName =
  | "page_view"
  | "save_parsed"
  | "save_created"
  | "booking_intent_created"
  | "reward_unlocked"
  | "referral_invite_added"
  | "restaurant_claim_submitted"
  | "direct_booking_created"
  | "verified_review_created"
  | "live_fest_slot_reserved"
  | "restaurant_subscription_started"
  | "pay_per_booking_promotion_created"
  | "group_plan_created"
  | "friends_privacy_saved"
  | "bill_scan_recorded"
  | "identity_badge_unlocked"
  | "creator_dinner_booked"
  | "family_profile_saved"
  | "creator_campaign_created"
  | "travel_mode_opened"
  | "voice_search_tested"
  | "rasa_plus_started"
  | "city_launch_started"
  | "vertical_experiment_created"
  | "server_tip_recorded";

export type AnalyticsEventRecord = {
  id: string;
  eventName: AnalyticsEventName;
  route: string;
  placeId?: string;
  placeName?: string;
  creatorHandle?: string;
  metadata?: Record<string, string | number | boolean>;
  createdAt: string;
};

export type RestaurantClaimRecord = {
  id: string;
  placeId: string;
  placeName: string;
  ownerName: string;
  ownerPhone: string;
  gstNumber: string;
  fssaiNumber: string;
  status: "submitted" | "needs_review" | "verified";
  submittedAt: string;
};

export type PartnerAvailabilitySlot = {
  id: string;
  placeId: string;
  startsAt: string;
  seatsAvailable: number;
  depositAmount: number;
};

export type DirectBookingRecord = {
  id: string;
  placeId: string;
  placeName: string;
  slotId: string;
  startsAt: string;
  partySize: number;
  customerName: string;
  customerPhone: string;
  depositAmount: number;
  status: "confirmed";
  createdAt: string;
};

export type VerifiedReviewRecord = {
  id: string;
  bookingId: string;
  placeId: string;
  placeName: string;
  rating: number;
  content: string;
  dishCallout: string;
  verifiedEater: true;
  visitDate: string;
  createdAt: string;
};

export type LiveFestStatus = "scheduled" | "live" | "replay";

export type LiveFestRecord = {
  id: string;
  creatorHandle: string;
  placeId: string;
  scheduledStart: string;
  durationMinutes: number;
  discountPct: number;
  replayDiscountPct: number;
  slotCap: number;
  status: LiveFestStatus;
  title: string;
};

export type LiveFestReservationRecord = {
  id: string;
  liveFestId: string;
  placeId: string;
  placeName: string;
  creatorHandle: string;
  discountPct: number;
  status: "reserved";
  createdAt: string;
};

export type RestaurantSaasPlanId = "starter" | "growth" | "pro";

export type RestaurantSaasPlan = {
  id: RestaurantSaasPlanId;
  name: string;
  monthlyPrice: number;
  description: string;
  benefits: string[];
};

export type RestaurantSubscriptionRecord = {
  id: string;
  placeId: string;
  placeName: string;
  planId: RestaurantSaasPlanId;
  planName: string;
  monthlyPrice: number;
  billingStatus: "active";
  invoiceStatus: "draft";
  startedAt: string;
};

export type PayPerBookingPromotionRecord = {
  id: string;
  placeId: string;
  placeName: string;
  mood: string;
  bidPerBooking: number;
  budget: number;
  maxBookings: number;
  status: "active";
  createdAt: string;
};

export type GroupPlanRecord = {
  id: string;
  title: string;
  hostName: string;
  invitedCount: number;
  placeIds: string[];
  votes: Record<string, number>;
  winningPlaceId: string;
  whatsappInviteUrl: string;
  status: "voting";
  createdAt: string;
};

export type FriendsPrivacyRecord = {
  shareMode: "private" | "friends_only" | "public";
  optedInFriendCount: number;
  showSocialProof: boolean;
  updatedAt: string;
};

export type BillScanRecord = {
  id: string;
  placeId: string;
  placeName: string;
  billAmount: number;
  cashbackAmount: number;
  creatorHandle?: string;
  status: "credited";
  createdAt: string;
};

export type UserIdentityRecord = {
  tier: "Bronze" | "Silver" | "Gold" | "Connoisseur";
  badges: string[];
  weeklyStreak: number;
  placesVisited: number;
  updatedAt: string;
};

export type CreatorDinnerBookingRecord = {
  id: string;
  creatorHandle: string;
  placeId: string;
  placeName: string;
  seatCount: number;
  pricePerSeat: number;
  status: "booked";
  createdAt: string;
};

export type FamilyProfileRecord = {
  ownerName: string;
  members: Array<{ name: string; dietaryTags: string[]; ageBand: string }>;
  preferredPlaceIds: string[];
  updatedAt: string;
};

export type CreatorCampaignRecord = {
  id: string;
  restaurantName: string;
  creatorHandle: string;
  payoutPerBooking: number;
  campaignBudget: number;
  status: "open";
  createdAt: string;
};

export type CityLaunchRecord = {
  id: string;
  city: "Bangalore" | "Mumbai";
  targetCreators: number;
  targetRestaurants: number;
  status: "started";
  createdAt: string;
};

export type VoiceSearchRecord = {
  id: string;
  query: string;
  language: "Hindi" | "Telugu" | "Hinglish";
  matchedIntent: string;
  createdAt: string;
};

export type RasaPlusSubscriptionRecord = {
  plan: "monthly" | "annual";
  price: number;
  status: "active";
  startedAt: string;
};

export type VerticalExperimentRecord = {
  id: string;
  vertical: "weddings" | "experiences" | "api-data" | "server-tipping";
  title: string;
  status: "prototype";
  createdAt: string;
};

export type ServerTipRecord = {
  id: string;
  placeName: string;
  serverName: string;
  amount: number;
  status: "recorded";
  createdAt: string;
};

export const promotionMoodSlots = [
  "Date Night",
  "Working Lunch",
  "Family Sunday",
  "Friday Night",
  "Empty Restaurant Radar",
] as const;

export const phaseOneExitTargets = {
  monthlyRecurringRevenue: 500000,
  liveFestFillRatePct: 80,
  paidSaasAttachPct: 20,
  restaurantCount: 200,
  creatorCount: 100,
  userCount: 25000,
} as const;

export const phaseTwoExitTargets = {
  users: 100000,
  creators: 250,
  restaurants: 500,
  dauMauPct: 32,
  nonAffiliateRevenuePct: 40,
} as const;

export const phaseThreeCities = [
  {
    city: "Bangalore",
    launchMonth: "T+12",
    targetCreators: 120,
    targetRestaurants: 350,
    status: "foundation",
  },
  {
    city: "Mumbai",
    launchMonth: "T+18",
    targetCreators: 180,
    targetRestaurants: 500,
    status: "foundation",
  },
] as const;

export const voiceSearchSamples = [
  "Hyderabad mein achhi biryani kahaan milegi?",
  "Telugu lo family dinner places chupinchu",
  "Hinglish: date night but not too expensive",
] as const;

export const phaseFourVerticals = [
  { id: "weddings", title: "Wedding Planning", revenueModel: "venue commission" },
  { id: "experiences", title: "Experiences & Events", revenueModel: "ticket take rate" },
  { id: "api-data", title: "API/Data Products", revenueModel: "B2B contracts" },
  { id: "server-tipping", title: "Server Tipping", revenueModel: "network goodwill" },
] as const;

export const restaurantSaasPlans: RestaurantSaasPlan[] = [
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 999,
    description: "Claimed listing plus basic attribution for owner-led experiments.",
    benefits: ["Creator save tracking", "Booking intent report", "Monthly owner summary"],
  },
  {
    id: "growth",
    name: "Growth",
    monthlyPrice: 2499,
    description: "Best for active partners running creator campaigns and live drops.",
    benefits: ["Creator matchmaking", "Live Fest analytics", "Weekly conversion report"],
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 4999,
    description: "Full analytics and optimization layer for high-AOV restaurant teams.",
    benefits: ["Menu A/B insights", "Customer cohort view", "Priority launch support"],
  },
];

export const phaseOneLiveFests: LiveFestRecord[] = [
  {
    id: "live-biryani-crawl-launch",
    creatorHandle: "biryani_diaries",
    placeId: "hyd-shah-ghouse-tolichowki",
    scheduledStart: "2026-05-08T20:00:00+05:30",
    durationMinutes: 90,
    discountPct: 35,
    replayDiscountPct: 15,
    slotCap: 50,
    status: "scheduled",
    title: "Hyderabad Biryani Crawl",
  },
  {
    id: "live-cafe-night",
    creatorHandle: "cafesofhyd",
    placeId: "hyd-roastery-coffee-house-banjara-hills",
    scheduledStart: "2026-05-09T18:30:00+05:30",
    durationMinutes: 75,
    discountPct: 30,
    replayDiscountPct: 10,
    slotCap: 40,
    status: "live",
    title: "Cafe Night Live",
  },
  {
    id: "live-old-city-replay",
    creatorHandle: "oldcitybites",
    placeId: "hyd-pista-house-charminar",
    scheduledStart: "2026-05-05T19:00:00+05:30",
    durationMinutes: 60,
    discountPct: 35,
    replayDiscountPct: 15,
    slotCap: 35,
    status: "replay",
    title: "Old City Haleem Replay",
  },
];

export const phaseOneAvailabilitySlots: PartnerAvailabilitySlot[] = [
  {
    id: "slot-roastery-fri-1930",
    placeId: "hyd-roastery-coffee-house-banjara-hills",
    startsAt: "2026-05-08T19:30:00+05:30",
    seatsAvailable: 12,
    depositAmount: 200,
  },
  {
    id: "slot-chutneys-sat-1030",
    placeId: "hyd-chutneys-banjara-hills",
    startsAt: "2026-05-09T10:30:00+05:30",
    seatsAvailable: 18,
    depositAmount: 0,
  },
  {
    id: "slot-tatva-sat-2030",
    placeId: "hyd-tatva-jubilee-hills",
    startsAt: "2026-05-09T20:30:00+05:30",
    seatsAvailable: 8,
    depositAmount: 500,
  },
  {
    id: "slot-concu-sun-1300",
    placeId: "hyd-concu-jubilee-hills",
    startsAt: "2026-05-10T13:00:00+05:30",
    seatsAvailable: 10,
    depositAmount: 300,
  },
];

export type ParsedSaveInput = {
  source: SaveSource;
  url?: string;
  creatorHandle?: string;
  matchedPlace?: PhaseZeroPlace;
  confidence: number;
};

export type SavedPlaceRecord = {
  id: string;
  placeId: string;
  placeName: string;
  area: string;
  source: SaveSource;
  sourceUrl?: string;
  creatorHandle?: string;
  rawInput: string;
  confidence: number;
  resolutionStatus?: "matched" | "pending" | "review";
  resolverNote?: string;
  resolvedAt?: string;
  createdAt: string;
};

export type InstagramResolverResult = {
  status: "resolved" | "pending" | "review";
  confidence: number;
  candidateText: string;
  creatorHandle?: string;
  note: string;
  place?: PhaseZeroPlace;
  source: "direct-text" | "demo-fixture" | "meta-oembed" | "unresolved";
  thumbnailUrl?: string;
};

export type FeedCreator = {
  handle: string;
  name: string;
  authenticityScore: number;
};

export type FeedRecommendation = {
  id: string;
  placeId: string;
  creator: FeedCreator;
  disclosure: CreatorDisclosure;
  hook: string;
  note: string;
  mood: string;
  saves: number;
  bookingIntent: number;
  isLiveTease?: boolean;
};

export const phaseZeroCreators = [
  {
    handle: "hyderabadfoodie",
    name: "Hyderabad Foodie",
    authenticityScore: 8.7,
  },
  {
    handle: "biryani_diaries",
    name: "Biryani Diaries",
    authenticityScore: 8.9,
  },
  {
    handle: "cafesofhyd",
    name: "Cafes of Hyd",
    authenticityScore: 8.3,
  },
  {
    handle: "oldcitybites",
    name: "Old City Bites",
    authenticityScore: 9.1,
  },
] as const satisfies FeedCreator[];

export const phaseZeroFeedRecommendations = [
  {
    id: "feed-bawarchi",
    placeId: "hyd-bawarchi-rtc-x-roads",
    creator: phaseZeroCreators[0],
    disclosure: "organic",
    hook: "The biryani save that never fails a hungry group.",
    note: "Go late lunch if you want the best odds of fast seating and fresh turnover.",
    mood: "Group lunch",
    saves: 428,
    bookingIntent: 72,
  },
  {
    id: "feed-shah-ghouse",
    placeId: "hyd-shah-ghouse-tolichowki",
    creator: phaseZeroCreators[1],
    disclosure: "organic",
    hook: "For the friend who asks where the serious mutton biryani is.",
    note: "The recommendation is about the biryani, not the room. Expect rush, still worth it.",
    mood: "Biryani run",
    saves: 512,
    bookingIntent: 89,
  },
  {
    id: "feed-roastery",
    placeId: "hyd-roastery-coffee-house-banjara-hills",
    creator: phaseZeroCreators[2],
    disclosure: "hosted",
    hook: "Coffee, quiet corners, and one of the easiest date saves.",
    note: "Best as a low-pressure evening plan. Save it for when dinner feels too much.",
    mood: "Coffee date",
    saves: 301,
    bookingIntent: 48,
  },
  {
    id: "feed-pista-house-live",
    placeId: "hyd-pista-house-charminar",
    creator: phaseZeroCreators[3],
    disclosure: "affiliate",
    hook: "Live tease: Old City haleem walk this Friday.",
    note: "Replay discount opens after the live. Good one to watch before taking visitors out.",
    mood: "Live fest",
    saves: 188,
    bookingIntent: 39,
    isLiveTease: true,
  },
  {
    id: "feed-concu",
    placeId: "hyd-concu-jubilee-hills",
    creator: phaseZeroCreators[2],
    disclosure: "organic",
    hook: "Dessert-first date night, no overthinking.",
    note: "Save this for after-dinner plans around Jubilee Hills.",
    mood: "Dessert",
    saves: 276,
    bookingIntent: 44,
  },
  {
    id: "feed-ram-ki-bandi",
    placeId: "hyd-ram-ki-bandi-nampally",
    creator: phaseZeroCreators[0],
    disclosure: "organic",
    hook: "The late-night dosa save that makes sense after everything else closes.",
    note: "Not fancy, not quiet, very Hyderabad.",
    mood: "Late night",
    saves: 355,
    bookingIntent: 61,
  },
] as const satisfies FeedRecommendation[];

export function getCreatorByHandle(handle: string): FeedCreator | undefined {
  return phaseZeroCreators.find((creator) => creator.handle === handle);
}

export function getRecommendationsByCreator(handle: string): FeedRecommendation[] {
  return phaseZeroFeedRecommendations.filter(
    (recommendation) => recommendation.creator.handle === handle,
  );
}

function normalizeMatchText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ");
}

function extractFirstUrl(value: string) {
  return value.match(/https?:\/\/[^\s]+/)?.[0];
}

export function extractInstagramShortcode(value: string) {
  return value.match(/instagram\.com\/(?:reel|reels|p|tv)\/([A-Za-z0-9_-]+)/i)?.[1];
}

export function detectSaveSource(value: string): SaveSource {
  const normalized = value.toLowerCase();

  if (normalized.includes("instagram.com") || normalized.includes("instagr.am")) {
    return "instagram";
  }

  if (normalized.includes("youtube.com") || normalized.includes("youtu.be")) {
    return "youtube";
  }

  if (normalized.includes("whatsapp") || normalized.includes("wa.me")) {
    return "whatsapp";
  }

  if (normalized.trim().length > 0) {
    return "manual";
  }

  return "unknown";
}

export function extractCreatorHandle(value: string) {
  const instagramHandle = value.match(/instagram\.com\/([A-Za-z0-9._]+)/i)?.[1];

  if (instagramHandle && !["p", "reel", "reels", "stories"].includes(instagramHandle)) {
    return instagramHandle;
  }

  const atHandle = value.match(/@([A-Za-z0-9._]+)/)?.[1];
  return atHandle;
}

export function matchSeedPlace(value: string) {
  const normalized = normalizeMatchText(value);

  return hyderabadSeedPlaces.find((place) => {
    const placeTokens = [
      place.name,
      place.area,
      place.address,
      place.heroDish,
      ...place.cuisines,
      ...place.vibeTags,
    ].map(normalizeMatchText);

    return placeTokens.some((token) => token.length > 2 && normalized.includes(token));
  });
}

export function parseSaveInput(value: string): ParsedSaveInput {
  const source = detectSaveSource(value);
  const matchedPlace = matchSeedPlace(value);

  return {
    source,
    url: extractFirstUrl(value),
    creatorHandle: extractCreatorHandle(value),
    matchedPlace,
    confidence: matchedPlace ? 0.92 : 0.2,
  };
}

const demoInstagramResolverText: Record<string, string> = {
  bawarchi: "Bawarchi RTC X Roads chicken biryani via @hyderabadfoodie",
  c7bawarchi: "Bawarchi RTC X Roads chicken biryani via @hyderabadfoodie",
  c7concu: "Concu Jubilee Hills chocolate eclair via @cafesofhyd",
  c7roastery: "Roastery Coffee House Banjara Hills cold brew via @cafesofhyd",
  c7shahghouse: "Shah Ghouse Tolichowki mutton biryani via @biryani_diaries",
  c7tatva: "Tatva Jubilee Hills paneer tikka platter via @hyderabadfoodie",
};

export function resolveInstagramSaveCandidate(value: string): InstagramResolverResult {
  const directMatch = matchSeedPlace(value);

  if (directMatch) {
    return {
      status: "resolved",
      confidence: 0.92,
      candidateText: value,
      creatorHandle: extractCreatorHandle(value),
      note: "Resolved from pasted text.",
      place: directMatch,
      source: "direct-text",
    };
  }

  const shortcode = extractInstagramShortcode(value)?.toLowerCase();
  const fixtureText = shortcode ? demoInstagramResolverText[shortcode] : undefined;

  if (fixtureText) {
    const fixturePlace = matchSeedPlace(fixtureText);

    if (fixturePlace) {
      return {
        status: "resolved",
        confidence: 0.88,
        candidateText: fixtureText,
        creatorHandle: extractCreatorHandle(fixtureText),
        note: "Resolved by demo Instagram resolver fixture. Production replaces this with Meta/oEmbed + OCR + AI matching.",
        place: fixturePlace,
        source: "demo-fixture",
      };
    }
  }

  return {
    status: "pending",
    confidence: 0.2,
    candidateText: value,
    creatorHandle: extractCreatorHandle(value),
    note: "Queued for the backend resolver: Meta metadata, thumbnail OCR, AI place match, then ops review if confidence is low.",
    source: "unresolved",
  };
}
