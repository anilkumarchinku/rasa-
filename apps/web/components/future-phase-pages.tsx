"use client";

import {
  billScansStorageKey,
  cityLaunchStorageKey,
  creatorCampaignsStorageKey,
  creatorDinnerBookingsStorageKey,
  familyProfileStorageKey,
  friendsPrivacyStorageKey,
  getCreatorByHandle,
  getSeedPlaceById,
  groupPlansStorageKey,
  hyderabadSeedPlaces,
  phaseFourVerticals,
  phaseThreeCities,
  phaseTwoExitTargets,
  rasaPlusStorageKey,
  savedPlacesStorageKey,
  serverTipsStorageKey,
  userIdentityStorageKey,
  verticalExperimentsStorageKey,
  voiceSearchSamples,
  voiceSearchStorageKey,
  type BillScanRecord,
  type CityLaunchRecord,
  type CreatorCampaignRecord,
  type CreatorDinnerBookingRecord,
  type FamilyProfileRecord,
  type FriendsPrivacyRecord,
  type GroupPlanRecord,
  type RasaPlusSubscriptionRecord,
  type SavedPlaceRecord,
  type ServerTipRecord,
  type UserIdentityRecord,
  type VerticalExperimentRecord,
  type VoiceSearchRecord,
} from "@rasa/shared";
import Link from "next/link";
import { FormEvent, type ReactNode, useEffect, useState } from "react";
import { trackRasaEvent } from "../lib/analytics";
import { Badge } from "./ui/badge";
import { Button, ButtonLink } from "./ui/button";
import { Card, CardDescription, CardHeader } from "./ui/card";
import { HeroMedia } from "./visual-image";

function readArray<T>(key: string) {
  const stored = window.localStorage.getItem(key);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as T[];
  } catch {
    window.localStorage.removeItem(key);
    return [];
  }
}

function readObject<T>(key: string, fallback: T) {
  const stored = window.localStorage.getItem(key);
  if (!stored) return fallback;
  try {
    return JSON.parse(stored) as T;
  } catch {
    window.localStorage.removeItem(key);
    return fallback;
  }
}

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function Shell({
  children,
  eyebrow,
  title,
  description,
  metrics,
  route,
}: {
  children: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  metrics: Array<[string, string | number]>;
  route: string;
}) {
  useEffect(() => {
    trackRasaEvent("page_view", { route });
  }, [route]);

  const primaryNav = [
    ["/save", "Save"],
    ["/map", "Map"],
    ["/live", "Live"],
    ["/plus", "Plus"],
    ["/analytics", "Analytics"],
  ];

  return (
    <main className="future-shell">
      <aside className="future-sidebar" aria-label="Rasa command navigation">
        <Link className="future-brand" href="/">
          <span>R</span>
          <strong>Rasa</strong>
          <em>Trust layer</em>
        </Link>
        <nav className="future-side-nav" aria-label="Core surfaces">
          {primaryNav.map(([href, label]) => (
            <Link className={href === route ? "active-link" : undefined} href={href} key={href}>
              {label}
            </Link>
          ))}
        </nav>
        <nav className="future-side-nav compact" aria-label="Review boards">
          <span>Review boards</span>
          <Link className={route === "/phase-2-qa" ? "active-link" : undefined} href="/phase-2-qa">
            Phase 2 QA
          </Link>
          <Link className={route === "/phase-3-qa" ? "active-link" : undefined} href="/phase-3-qa">
            Phase 3 QA
          </Link>
          <Link className={route === "/phase-4-qa" ? "active-link" : undefined} href="/phase-4-qa">
            Phase 4 QA
          </Link>
        </nav>
        <p className="future-sidebar-note">
          <span>Build status</span>
          <strong>40 / 40 complete</strong>
        </p>
      </aside>
      <section className="future-main">
        <nav className="future-topline" aria-label="Current screen">
          <Badge>{eyebrow}</Badge>
          <ButtonLink href={route} size="sm" variant="outline">
            Current screen
          </ButtonLink>
        </nav>
        <Card className="future-hero">
          <CardHeader className="future-hero-copy">
            <Badge>{eyebrow}</Badge>
            <h1>{title}</h1>
            <CardDescription className="lede">{description}</CardDescription>
          </CardHeader>
          <HeroMedia
            alt={`${title} product preview`}
            imageKey={
              route.includes("wedding")
                ? "weddings"
                : route.includes("travel")
                  ? "travel"
                  : "discovery"
            }
          >
            <div className="future-metrics">
              {metrics.map(([label, value]) => (
                <Card className="future-metric-card" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </Card>
              ))}
              <Card className="future-status">
                <span>{route}</span>
                <strong>Founder review build</strong>
              </Card>
            </div>
          </HeroMedia>
        </Card>
        {messageBlock(route)}
        {children}
      </section>
    </main>
  );
}

function messageBlock(route: string) {
  if (!route.includes("phase")) return null;
  return (
    <div className="future-review-strip">
      <p>
        <span>Review mode</span>
        <strong>Audit the numbers, then test the flow.</strong>
      </p>
      <ButtonLink href="/save" size="sm">
        Open save wedge
      </ButtonLink>
    </div>
  );
}

export function FriendsPrivacyPage() {
  const [saves, setSaves] = useState<SavedPlaceRecord[]>([]);
  const [privacy, setPrivacy] = useState<FriendsPrivacyRecord>({
    shareMode: "friends_only",
    optedInFriendCount: 5,
    showSocialProof: true,
    updatedAt: new Date().toISOString(),
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    setSaves(readArray<SavedPlaceRecord>(savedPlacesStorageKey));
    setPrivacy(
      readObject<FriendsPrivacyRecord>(friendsPrivacyStorageKey, {
        shareMode: "friends_only",
        optedInFriendCount: 5,
        showSocialProof: true,
        updatedAt: new Date().toISOString(),
      }),
    );
  }, []);

  function savePrivacy() {
    const next = { ...privacy, updatedAt: new Date().toISOString() };
    window.localStorage.setItem(friendsPrivacyStorageKey, JSON.stringify(next));
    setPrivacy(next);
    setMessage("Privacy controls saved.");
    trackRasaEvent("friends_privacy_saved", {
      route: "/friends",
      metadata: {
        shareMode: next.shareMode,
        optedInFriendCount: next.optedInFriendCount,
        showSocialProof: next.showSocialProof,
      },
    });
  }

  const visibleSaves = saves.length ? saves.slice(0, 6) : [];

  return (
    <Shell
      description="Opt-in social proof for friends' saves, with clear privacy mode and share controls."
      eyebrow="Phase 2.2"
      metrics={[
        ["Friends", privacy.optedInFriendCount],
        ["Share mode", privacy.shareMode],
        ["Saves", visibleSaves.length],
      ]}
      route="/friends"
      title="Friends' saves with privacy controls."
    >
      {message && <p className="form-message future-message">{message}</p>}
      <section className="future-grid">
        <article className="future-card">
          <p className="eyebrow">Controls</p>
          <h2>Sharing rules</h2>
          <label>
            Share mode
            <select
              value={privacy.shareMode}
              onChange={(event) =>
                setPrivacy({
                  ...privacy,
                  shareMode: event.target.value as FriendsPrivacyRecord["shareMode"],
                })
              }
            >
              <option value="private">Private</option>
              <option value="friends_only">Friends only</option>
              <option value="public">Public</option>
            </select>
          </label>
          <label>
            Opted-in friends
            <input
              min={0}
              type="number"
              value={privacy.optedInFriendCount}
              onChange={(event) =>
                setPrivacy({ ...privacy, optedInFriendCount: Number(event.target.value) })
              }
            />
          </label>
          <label className="check-line">
            <input
              checked={privacy.showSocialProof}
              type="checkbox"
              onChange={(event) =>
                setPrivacy({ ...privacy, showSocialProof: event.target.checked })
              }
            />
            Show “friends saved this” proof
          </label>
          <Button onClick={savePrivacy} type="button">
            Save privacy
          </Button>
        </article>
        <article className="future-card wide-card">
          <p className="eyebrow">Preview</p>
          <h2>Friend activity</h2>
          <div className="future-list">
            {(visibleSaves.length ? visibleSaves : hyderabadSeedPlaces.slice(0, 4)).map((item) => {
              const name = "placeName" in item ? item.placeName : item.name;
              const area = item.area;
              return (
                <div key={"id" in item ? item.id : name}>
                  <strong>{name}</strong>
                  <span>
                    {area} · {privacy.showSocialProof ? "5 friends saved" : "social proof hidden"}
                  </span>
                </div>
              );
            })}
          </div>
        </article>
      </section>
    </Shell>
  );
}

export function BillOcrCashbackPage() {
  const [records, setRecords] = useState<BillScanRecord[]>([]);
  const [placeId, setPlaceId] = useState<string>(hyderabadSeedPlaces[0].id);
  const [billAmount, setBillAmount] = useState(1800);
  const [message, setMessage] = useState("");

  useEffect(() => setRecords(readArray<BillScanRecord>(billScansStorageKey)), []);

  function scanBill(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const place = getSeedPlaceById(placeId);
    if (!place) return;
    const cashbackAmount = Math.min(30, Math.max(10, Math.round(billAmount * 0.01)));
    const next: BillScanRecord = {
      id: id("bill"),
      placeId,
      placeName: place.name,
      billAmount,
      cashbackAmount,
      creatorHandle: "hyderabadfoodie",
      status: "credited",
      createdAt: new Date().toISOString(),
    };
    const nextRecords = [next, ...records];
    window.localStorage.setItem(billScansStorageKey, JSON.stringify(nextRecords));
    setRecords(nextRecords);
    setMessage(`₹${cashbackAmount} cashback credited.`);
    trackRasaEvent("bill_scan_recorded", {
      route: "/bill-scan",
      placeId,
      placeName: place.name,
      creatorHandle: next.creatorHandle,
      metadata: { billAmount, cashbackAmount },
    });
  }

  const wallet = records.reduce((sum, record) => sum + record.cashbackAmount, 0);

  return (
    <Shell
      description="Bill OCR cashback for partner and non-partner restaurants, with creator attribution when matched."
      eyebrow="Phase 2.3"
      metrics={[
        ["Scans", records.length],
        ["Wallet", `₹${wallet}`],
        ["OCR", "MVP"],
      ]}
      route="/bill-scan"
      title="Bill OCR cashback and attribution."
    >
      {message && <p className="form-message future-message">{message}</p>}
      <section className="future-grid">
        <form className="future-card" onSubmit={scanBill}>
          <p className="eyebrow">Scan</p>
          <h2>Mock bill OCR</h2>
          <label>
            Restaurant
            <select value={placeId} onChange={(event) => setPlaceId(event.target.value)}>
              {hyderabadSeedPlaces.map((place) => (
                <option key={place.id} value={place.id}>
                  {place.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Bill amount
            <input
              min={100}
              type="number"
              value={billAmount}
              onChange={(event) => setBillAmount(Number(event.target.value))}
            />
          </label>
          <Button type="submit">Credit cashback</Button>
        </form>
        <article className="future-card wide-card">
          <p className="eyebrow">History</p>
          <h2>Credits</h2>
          <div className="future-list">
            {(records.length ? records : []).map((record) => (
              <div key={record.id}>
                <strong>{record.placeName}</strong>
                <span>
                  ₹{record.cashbackAmount} · @{record.creatorHandle}
                </span>
              </div>
            ))}
            {records.length === 0 && <p className="place-address">No bill scans yet.</p>}
          </div>
        </article>
      </section>
    </Shell>
  );
}

export function IdentityBadgesPage() {
  const [identity, setIdentity] = useState<UserIdentityRecord>({
    tier: "Bronze",
    badges: ["Biryani Master"],
    weeklyStreak: 4,
    placesVisited: 8,
    updatedAt: new Date().toISOString(),
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    setIdentity(
      readObject<UserIdentityRecord>(userIdentityStorageKey, {
        tier: "Bronze",
        badges: ["Biryani Master"],
        weeklyStreak: 4,
        placesVisited: 8,
        updatedAt: new Date().toISOString(),
      }),
    );
  }, []);

  function unlockBadge() {
    const nextBadges = Array.from(new Set([...identity.badges, "Gachibowli Regular"]));
    const next: UserIdentityRecord = {
      ...identity,
      tier: nextBadges.length >= 2 ? "Silver" : identity.tier,
      badges: nextBadges,
      weeklyStreak: identity.weeklyStreak + 1,
      placesVisited: identity.placesVisited + 1,
      updatedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(userIdentityStorageKey, JSON.stringify(next));
    setIdentity(next);
    setMessage("Badge unlocked and tier recalculated.");
    trackRasaEvent("identity_badge_unlocked", {
      route: "/you/identity",
      metadata: { tier: next.tier, badges: next.badges.length },
    });
  }

  return (
    <Shell
      description="A diner identity layer with streaks, tier progress, shareable food badges, and Rasa status."
      eyebrow="Phase 2.4"
      metrics={[
        ["Tier", identity.tier],
        ["Badges", identity.badges.length],
        ["Streak", `${identity.weeklyStreak}w`],
      ]}
      route="/you/identity"
      title="User tiers, badges, and identity loops."
    >
      {message && <p className="form-message future-message">{message}</p>}
      <section className="future-grid">
        <article className="future-card">
          <p className="eyebrow">Progress</p>
          <h2>{identity.tier}</h2>
          <div className="future-list">
            <div>
              <strong>{identity.placesVisited}</strong>
              <span>verified places visited</span>
            </div>
            <div>
              <strong>{identity.weeklyStreak} weeks</strong>
              <span>Eat Different streak</span>
            </div>
          </div>
          <Button onClick={unlockBadge} type="button">
            Unlock next badge
          </Button>
        </article>
        <article className="future-card wide-card">
          <p className="eyebrow">Badges</p>
          <h2>Shareable identity</h2>
          <div className="badge-grid">
            {identity.badges.map((badge) => (
              <span key={badge}>{badge}</span>
            ))}
          </div>
        </article>
      </section>
    </Shell>
  );
}

export function CreatorDinnerPage() {
  const [bookings, setBookings] = useState<CreatorDinnerBookingRecord[]>([]);
  const creator = getCreatorByHandle("hyderabadfoodie");
  const place = getSeedPlaceById("hyd-tatva-jubilee-hills") ?? hyderabadSeedPlaces[0];

  useEffect(
    () => setBookings(readArray<CreatorDinnerBookingRecord>(creatorDinnerBookingsStorageKey)),
    [],
  );

  function bookDinner() {
    const next: CreatorDinnerBookingRecord = {
      id: id("dinner"),
      creatorHandle: creator?.handle ?? "hyderabadfoodie",
      placeId: place.id,
      placeName: place.name,
      seatCount: 2,
      pricePerSeat: 3500,
      status: "booked",
      createdAt: new Date().toISOString(),
    };
    const nextBookings = [next, ...bookings];
    window.localStorage.setItem(creatorDinnerBookingsStorageKey, JSON.stringify(nextBookings));
    setBookings(nextBookings);
    trackRasaEvent("creator_dinner_booked", {
      route: "/experiences/creator-dinners",
      placeId: place.id,
      placeName: place.name,
      creatorHandle: next.creatorHandle,
      metadata: { seatCount: 2, pricePerSeat: 3500 },
    });
  }

  return (
    <Shell
      description="Eight-seat creator-hosted dinners with clear splits, seat inventory, and expectation setting."
      eyebrow="Phase 2.5"
      metrics={[
        ["Seats", 8],
        ["Booked", bookings.length * 2],
        ["Price", "₹3,500"],
      ]}
      route="/experiences/creator-dinners"
      title="Eat With the Creator events."
    >
      <section className="future-grid">
        <article className="future-card wide-card">
          <p className="eyebrow">@{creator?.handle}</p>
          <h2>{place.name} dinner table</h2>
          <p className="place-address">
            Curated menu, dietary note capture, and creator-hosted conversation.
          </p>
          <div className="future-list">
            <div>
              <strong>Creator 40%</strong>
              <span>₹1,400 per seat</span>
            </div>
            <div>
              <strong>Restaurant 40%</strong>
              <span>₹1,400 per seat</span>
            </div>
            <div>
              <strong>Rasa 20%</strong>
              <span>₹700 per seat</span>
            </div>
          </div>
          <Button onClick={bookDinner} type="button">
            Book 2 seats
          </Button>
        </article>
        <article className="future-card">
          <p className="eyebrow">Bookings</p>
          <h2>{bookings.length}</h2>
          <p className="place-address">MVP booking records stored locally.</p>
        </article>
      </section>
    </Shell>
  );
}

export function FamilyModePage() {
  const [profile, setProfile] = useState<FamilyProfileRecord>({
    ownerName: "Sharma Family",
    members: [
      { name: "Aarav", dietaryTags: ["veg"], ageBand: "kid" },
      { name: "Nani", dietaryTags: ["low spice"], ageBand: "senior" },
      { name: "Parents", dietaryTags: ["north indian"], ageBand: "adult" },
    ],
    preferredPlaceIds: ["hyd-chutneys-banjara-hills", "hyd-tatva-jubilee-hills"],
    updatedAt: new Date().toISOString(),
  });

  useEffect(
    () => setProfile(readObject<FamilyProfileRecord>(familyProfileStorageKey, profile)),
    [],
  );

  function saveProfile() {
    const next = { ...profile, updatedAt: new Date().toISOString() };
    window.localStorage.setItem(familyProfileStorageKey, JSON.stringify(next));
    setProfile(next);
    trackRasaEvent("family_profile_saved", {
      route: "/family",
      metadata: { members: next.members.length, preferredPlaces: next.preferredPlaceIds.length },
    });
  }

  return (
    <Shell
      description="A family profile that filters restaurants by multi-generational dietary needs."
      eyebrow="Phase 2.6"
      metrics={[
        ["Members", profile.members.length],
        ["Matches", profile.preferredPlaceIds.length],
        ["Mode", "Family"],
      ]}
      route="/family"
      title="Family Mode."
    >
      <section className="future-grid">
        <article className="future-card">
          <p className="eyebrow">Profile</p>
          <h2>{profile.ownerName}</h2>
          <div className="future-list">
            {profile.members.map((member) => (
              <div key={member.name}>
                <strong>{member.name}</strong>
                <span>{member.dietaryTags.join(", ")}</span>
              </div>
            ))}
          </div>
          <Button onClick={saveProfile} type="button">
            Save family profile
          </Button>
        </article>
        <article className="future-card wide-card">
          <p className="eyebrow">Works for everyone</p>
          <h2>Recommended places</h2>
          <div className="future-list">
            {profile.preferredPlaceIds.map((placeId) => {
              const place = getSeedPlaceById(placeId);
              return place ? (
                <div key={place.id}>
                  <strong>{place.name}</strong>
                  <span>
                    {place.area} · {place.cuisines.join(", ")}
                  </span>
                </div>
              ) : null;
            })}
          </div>
        </article>
      </section>
    </Shell>
  );
}

export function CreatorMarketplacePage() {
  const [campaigns, setCampaigns] = useState<CreatorCampaignRecord[]>([]);
  useEffect(() => setCampaigns(readArray<CreatorCampaignRecord>(creatorCampaignsStorageKey)), []);

  function createCampaign() {
    const next: CreatorCampaignRecord = {
      id: id("campaign"),
      restaurantName: "Bawarchi",
      creatorHandle: "biryani_diaries",
      payoutPerBooking: 180,
      campaignBudget: 9000,
      status: "open",
      createdAt: new Date().toISOString(),
    };
    const nextCampaigns = [next, ...campaigns];
    window.localStorage.setItem(creatorCampaignsStorageKey, JSON.stringify(nextCampaigns));
    setCampaigns(nextCampaigns);
    trackRasaEvent("creator_campaign_created", {
      route: "/creators/marketplace",
      creatorHandle: next.creatorHandle,
      metadata: { payoutPerBooking: 180, campaignBudget: 9000 },
    });
  }

  return (
    <Shell
      description="Creator premium plus an outcome-driven campaign marketplace for restaurants and creators."
      eyebrow="Phase 2.7"
      metrics={[
        ["Campaigns", campaigns.length],
        ["Creator", "Premium"],
        ["Take", "15%"],
      ]}
      route="/creators/marketplace"
      title="Creator premium and campaign marketplace."
    >
      <section className="future-grid">
        <article className="future-card">
          <p className="eyebrow">Premium</p>
          <h2>₹499/mo</h2>
          <p className="place-address">
            Custom branding, deeper analytics, campaign priority, and premium vanity page controls.
          </p>
          <Button onClick={createCampaign} type="button">
            Create campaign
          </Button>
        </article>
        <article className="future-card wide-card">
          <p className="eyebrow">Campaigns</p>
          <h2>Marketplace queue</h2>
          <div className="future-list">
            {campaigns.map((campaign) => (
              <div key={campaign.id}>
                <strong>{campaign.restaurantName}</strong>
                <span>
                  @{campaign.creatorHandle} · ₹{campaign.payoutPerBooking}/booking
                </span>
              </div>
            ))}
            {campaigns.length === 0 && <p className="place-address">No campaigns yet.</p>}
          </div>
        </article>
      </section>
    </Shell>
  );
}

export function PhaseTwoQaPage() {
  const [signals, setSignals] = useState({
    plans: 0,
    billScans: 0,
    dinnerBookings: 0,
    campaigns: 0,
    badges: 0,
    familyMembers: 0,
    friendsOptedIn: 0,
  });

  useEffect(() => {
    const identity = readObject<UserIdentityRecord>(userIdentityStorageKey, {
      tier: "Bronze",
      badges: [],
      weeklyStreak: 0,
      placesVisited: 0,
      updatedAt: new Date().toISOString(),
    });
    const family = readObject<FamilyProfileRecord>(familyProfileStorageKey, {
      ownerName: "Family",
      members: [],
      preferredPlaceIds: [],
      updatedAt: new Date().toISOString(),
    });
    const privacy = readObject<FriendsPrivacyRecord>(friendsPrivacyStorageKey, {
      shareMode: "friends_only",
      optedInFriendCount: 0,
      showSocialProof: true,
      updatedAt: new Date().toISOString(),
    });

    setSignals({
      plans: readArray<GroupPlanRecord>(groupPlansStorageKey).length,
      billScans: readArray<BillScanRecord>(billScansStorageKey).length,
      dinnerBookings: readArray<CreatorDinnerBookingRecord>(creatorDinnerBookingsStorageKey).length,
      campaigns: readArray<CreatorCampaignRecord>(creatorCampaignsStorageKey).length,
      badges: identity.badges.length,
      familyMembers: family.members.length,
      friendsOptedIn: privacy.optedInFriendCount,
    });
  }, []);

  return (
    <Shell
      description="Engagement and fundraising readiness review for Phase 2 social and creator economy loops."
      eyebrow="Phase 2.8"
      metrics={[
        ["Target users", phaseTwoExitTargets.users],
        ["DAU/MAU", `${phaseTwoExitTargets.dauMauPct}%`],
        ["Signals", signals.plans + signals.billScans + signals.dinnerBookings + signals.campaigns],
      ]}
      route="/phase-2-qa"
      title="Phase 2 engagement readiness."
    >
      <section className="future-grid">
        <article className="future-card wide-card">
          <p className="eyebrow">Readiness</p>
          <h2>Fundraising signal board</h2>
          <div className="future-list">
            <div>
              <strong>{phaseTwoExitTargets.creators} creators</strong>
              <span>target creator supply</span>
            </div>
            <div>
              <strong>{phaseTwoExitTargets.restaurants} restaurants</strong>
              <span>target restaurant depth</span>
            </div>
            <div>
              <strong>{phaseTwoExitTargets.nonAffiliateRevenuePct}% non-affiliate revenue</strong>
              <span>target revenue quality</span>
            </div>
          </div>
        </article>
        <article className="future-card">
          <p className="eyebrow">Local proof</p>
          <h2>Feature records</h2>
          <div className="future-list">
            <div>
              <strong>{signals.friendsOptedIn} friends</strong>
              <span>privacy opt-in sample</span>
            </div>
            <div>
              <strong>{signals.billScans} bill scans</strong>
              <span>cashback records</span>
            </div>
            <div>
              <strong>{signals.badges} badges</strong>
              <span>identity proof</span>
            </div>
            <div>
              <strong>{signals.dinnerBookings} dinners</strong>
              <span>creator experience bookings</span>
            </div>
            <div>
              <strong>{signals.familyMembers} family members</strong>
              <span>family profile coverage</span>
            </div>
            <div>
              <strong>{signals.campaigns} campaigns</strong>
              <span>marketplace records</span>
            </div>
          </div>
        </article>
      </section>
    </Shell>
  );
}

export function CityLaunchPage({ cityName }: { cityName: "Bangalore" | "Mumbai" }) {
  const city = phaseThreeCities.find((item) => item.city === cityName) ?? phaseThreeCities[0];
  const [launches, setLaunches] = useState<CityLaunchRecord[]>([]);

  useEffect(() => setLaunches(readArray<CityLaunchRecord>(cityLaunchStorageKey)), []);

  function startLaunch() {
    const next: CityLaunchRecord = {
      id: id("city"),
      city: city.city,
      targetCreators: city.targetCreators,
      targetRestaurants: city.targetRestaurants,
      status: "started",
      createdAt: new Date().toISOString(),
    };
    const nextLaunches = [next, ...launches.filter((launch) => launch.city !== city.city)];
    window.localStorage.setItem(cityLaunchStorageKey, JSON.stringify(nextLaunches));
    setLaunches(nextLaunches);
    trackRasaEvent("city_launch_started", {
      route: `/cities/${city.city.toLowerCase()}`,
      metadata: {
        city: city.city,
        targetCreators: city.targetCreators,
        targetRestaurants: city.targetRestaurants,
      },
    });
  }

  const active = launches.find((launch) => launch.city === city.city);

  return (
    <Shell
      description={`${city.city} city foundation for creator supply, restaurant density, and launch sequencing.`}
      eyebrow={city.city === "Bangalore" ? "Phase 3.1" : "Phase 3.2"}
      metrics={[
        ["Creators", city.targetCreators],
        ["Restaurants", city.targetRestaurants],
        ["Launch", city.launchMonth],
      ]}
      route={`/cities/${city.city.toLowerCase()}`}
      title={`${city.city} launch foundation.`}
    >
      <section className="future-grid">
        <article className="future-card">
          <p className="eyebrow">Foundation</p>
          <h2>{active ? "Launch started" : "Ready to start"}</h2>
          <div className="future-list">
            <div>
              <strong>{city.targetCreators} creators</strong>
              <span>city creator supply target</span>
            </div>
            <div>
              <strong>{city.targetRestaurants} restaurants</strong>
              <span>partner density target</span>
            </div>
          </div>
          <Button onClick={startLaunch} type="button">
            Start city launch
          </Button>
        </article>
        <article className="future-card wide-card">
          <p className="eyebrow">Ops playbook</p>
          <h2>Launch sequence</h2>
          <div className="future-list">
            <div>
              <strong>Creator lock</strong>
              <span>platform-priority creators before restaurant sales</span>
            </div>
            <div>
              <strong>Restaurant clusters</strong>
              <span>own 3 dense neighborhoods before city-wide coverage</span>
            </div>
            <div>
              <strong>Live launch week</strong>
              <span>5 creator-led fests to seed bookings and attribution</span>
            </div>
          </div>
        </article>
      </section>
    </Shell>
  );
}

export function TravelModePage() {
  const [city, setCity] = useState("Bangalore");
  const [opened, setOpened] = useState(false);

  function openTravelMode() {
    setOpened(true);
    trackRasaEvent("travel_mode_opened", {
      route: "/travel",
      metadata: { city },
    });
  }

  return (
    <Shell
      description="Travel Mode switches saved places and creator picks when a diner enters a new city."
      eyebrow="Phase 3.3"
      metrics={[
        ["Cities", 3],
        ["Saved", hyderabadSeedPlaces.length],
        ["Mode", opened ? "On" : "Ready"],
      ]}
      route="/travel"
      title="Travel Mode."
    >
      <section className="future-grid">
        <article className="future-card">
          <p className="eyebrow">Destination</p>
          <h2>{city}</h2>
          <label>
            City
            <select value={city} onChange={(event) => setCity(event.target.value)}>
              <option value="Bangalore">Bangalore</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Hyderabad">Hyderabad</option>
            </select>
          </label>
          <Button onClick={openTravelMode} type="button">
            Open Travel Mode
          </Button>
        </article>
        <article className="future-card wide-card">
          <p className="eyebrow">Creator carry-over</p>
          <h2>What your trusted creators saved there</h2>
          <div className="future-list">
            {hyderabadSeedPlaces.slice(0, 3).map((place) => (
              <div key={place.id}>
                <strong>{place.name}</strong>
                <span>{city} trip card · trust score carries over</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </Shell>
  );
}

export function VoiceSearchPage() {
  const [records, setRecords] = useState<VoiceSearchRecord[]>([]);
  const [query, setQuery] = useState<string>(voiceSearchSamples[0]);
  const [language, setLanguage] = useState<VoiceSearchRecord["language"]>("Hinglish");

  useEffect(() => setRecords(readArray<VoiceSearchRecord>(voiceSearchStorageKey)), []);

  function testVoiceSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: VoiceSearchRecord = {
      id: id("voice"),
      query,
      language,
      matchedIntent: "local dining discovery",
      createdAt: new Date().toISOString(),
    };
    const nextRecords = [next, ...records];
    window.localStorage.setItem(voiceSearchStorageKey, JSON.stringify(nextRecords));
    setRecords(nextRecords);
    trackRasaEvent("voice_search_tested", {
      route: "/voice-search",
      metadata: { language, query },
    });
  }

  return (
    <Shell
      description="Hindi, Telugu, and Hinglish voice search for culturally native dining discovery."
      eyebrow="Phase 3.4"
      metrics={[
        ["Languages", 3],
        ["Tests", records.length],
        ["Intent", "Dining"],
      ]}
      route="/voice-search"
      title="Local-language voice search."
    >
      <section className="future-grid">
        <form className="future-card" onSubmit={testVoiceSearch}>
          <p className="eyebrow">Voice lab</p>
          <h2>Query test</h2>
          <label>
            Language
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value as VoiceSearchRecord["language"])}
            >
              <option value="Hindi">Hindi</option>
              <option value="Telugu">Telugu</option>
              <option value="Hinglish">Hinglish</option>
            </select>
          </label>
          <label>
            Spoken query
            <textarea value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
          <Button type="submit">Test voice search</Button>
        </form>
        <article className="future-card wide-card">
          <p className="eyebrow">Samples</p>
          <h2>Native prompts</h2>
          <div className="future-list">
            {voiceSearchSamples.map((sample) => (
              <div key={sample}>
                <strong>{sample}</strong>
                <span>maps to mood, cuisine, budget, and city intent</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </Shell>
  );
}

export function RasaPlusPage() {
  const [subscription, setSubscription] = useState<RasaPlusSubscriptionRecord | null>(null);

  useEffect(() => {
    setSubscription(readObject<RasaPlusSubscriptionRecord | null>(rasaPlusStorageKey, null));
  }, []);

  function startPlus(plan: RasaPlusSubscriptionRecord["plan"]) {
    const next: RasaPlusSubscriptionRecord = {
      plan,
      price: plan === "monthly" ? 199 : 1999,
      status: "active",
      startedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(rasaPlusStorageKey, JSON.stringify(next));
    setSubscription(next);
    trackRasaEvent("rasa_plus_started", {
      route: "/plus",
      metadata: { plan, price: next.price },
    });
  }

  return (
    <Shell
      description="Consumer premium for VIP live access, higher scratch values, free deposits, and dessert credits."
      eyebrow="Phase 3.5"
      metrics={[
        ["Monthly", "₹199"],
        ["Annual", "₹1,999"],
        ["Status", subscription?.status ?? "Ready"],
      ]}
      route="/plus"
      title="Rasa Plus subscription."
    >
      <section className="future-grid">
        <article className="future-card">
          <p className="eyebrow">Monthly</p>
          <h2>₹199/mo</h2>
          <p className="place-address">
            VIP live access, higher cashback odds, and free reservation deposits.
          </p>
          <Button onClick={() => startPlus("monthly")} type="button">
            Start monthly
          </Button>
        </article>
        <article className="future-card wide-card">
          <p className="eyebrow">Annual</p>
          <h2>₹1,999/year</h2>
          <div className="future-list">
            <div>
              <strong>4 dessert credits</strong>
              <span>monthly partner dessert drops</span>
            </div>
            <div>
              <strong>VIP live access</strong>
              <span>2-hour early access before public live fests</span>
            </div>
          </div>
          <Button onClick={() => startPlus("annual")} type="button">
            Start annual
          </Button>
        </article>
      </section>
    </Shell>
  );
}

export function PhaseThreeQaPage() {
  const [counts, setCounts] = useState({ launches: 0, voiceTests: 0, plusActive: false });

  useEffect(() => {
    setCounts({
      launches: readArray<CityLaunchRecord>(cityLaunchStorageKey).length,
      voiceTests: readArray<VoiceSearchRecord>(voiceSearchStorageKey).length,
      plusActive: Boolean(window.localStorage.getItem(rasaPlusStorageKey)),
    });
  }, []);

  return (
    <Shell
      description="Multi-city expansion readiness across city launch ops, travel mode, voice search, and Plus."
      eyebrow="Phase 3.6"
      metrics={[
        ["Launches", counts.launches],
        ["Voice tests", counts.voiceTests],
        ["Plus", counts.plusActive ? "Active" : "Ready"],
      ]}
      route="/phase-3-qa"
      title="Phase 3 expansion QA."
    >
      <section className="future-grid">
        <article className="future-card wide-card">
          <p className="eyebrow">Expansion board</p>
          <h2>City readiness</h2>
          <div className="future-list">
            {phaseThreeCities.map((city) => (
              <div key={city.city}>
                <strong>{city.city}</strong>
                <span>
                  {city.targetCreators} creators · {city.targetRestaurants} restaurants ·{" "}
                  {city.launchMonth}
                </span>
              </div>
            ))}
          </div>
        </article>
        <article className="future-card">
          <p className="eyebrow">Ops guardrail</p>
          <h2>Do not expand thin</h2>
          <p className="place-address">
            Each city needs creator depth, restaurant density, live inventory, and attribution proof
            before spend.
          </p>
        </article>
      </section>
    </Shell>
  );
}

export function VerticalExperimentPage({
  verticalId,
  route,
  eyebrow,
}: {
  verticalId: VerticalExperimentRecord["vertical"];
  route: string;
  eyebrow: string;
}) {
  const vertical =
    phaseFourVerticals.find((item) => item.id === verticalId) ?? phaseFourVerticals[0];
  const [records, setRecords] = useState<VerticalExperimentRecord[]>([]);

  useEffect(
    () => setRecords(readArray<VerticalExperimentRecord>(verticalExperimentsStorageKey)),
    [],
  );

  function createExperiment() {
    const next: VerticalExperimentRecord = {
      id: id("vertical"),
      vertical: verticalId,
      title: `${vertical.title} MVP`,
      status: "prototype",
      createdAt: new Date().toISOString(),
    };
    const nextRecords = [next, ...records];
    window.localStorage.setItem(verticalExperimentsStorageKey, JSON.stringify(nextRecords));
    setRecords(nextRecords);
    trackRasaEvent("vertical_experiment_created", {
      route,
      metadata: { vertical: verticalId, title: next.title },
    });
  }

  return (
    <Shell
      description={`${vertical.title} vertical MVP with Rasa's creator-led trust and attribution layer carried beyond restaurants.`}
      eyebrow={eyebrow}
      metrics={[
        ["Vertical", vertical.title],
        ["Model", vertical.revenueModel],
        ["Tests", records.filter((record) => record.vertical === verticalId).length],
      ]}
      route={route}
      title={`${vertical.title} vertical.`}
    >
      <section className="future-grid">
        <article className="future-card">
          <p className="eyebrow">Prototype</p>
          <h2>{vertical.title}</h2>
          <p className="place-address">
            Creator-led discovery, booking intent, and attribution adapted for this category.
          </p>
          <Button onClick={createExperiment} type="button">
            Create prototype
          </Button>
        </article>
        <article className="future-card wide-card">
          <p className="eyebrow">Revenue model</p>
          <h2>{vertical.revenueModel}</h2>
          <div className="future-list">
            <div>
              <strong>Trust layer</strong>
              <span>verified experiences and creator authenticity carry forward</span>
            </div>
            <div>
              <strong>Attribution</strong>
              <span>prove which creator drove which booking or lead</span>
            </div>
          </div>
        </article>
      </section>
    </Shell>
  );
}

export function ServerTippingPage() {
  const [tips, setTips] = useState<ServerTipRecord[]>([]);

  useEffect(() => setTips(readArray<ServerTipRecord>(serverTipsStorageKey)), []);

  function recordTip() {
    const next: ServerTipRecord = {
      id: id("tip"),
      placeName: "Tatva",
      serverName: "Aman",
      amount: 100,
      status: "recorded",
      createdAt: new Date().toISOString(),
    };
    const nextTips = [next, ...tips];
    window.localStorage.setItem(serverTipsStorageKey, JSON.stringify(nextTips));
    setTips(nextTips);
    trackRasaEvent("server_tip_recorded", {
      route: "/tips",
      metadata: { placeName: next.placeName, amount: next.amount },
    });
  }

  return (
    <Shell
      description="Direct UPI tipping for servers to build goodwill across the restaurant network."
      eyebrow="Phase 4.4"
      metrics={[
        ["Tips", tips.length],
        ["Sample", "₹100"],
        ["Status", "Prototype"],
      ]}
      route="/tips"
      title="Server tipping via UPI."
    >
      <section className="future-grid">
        <article className="future-card">
          <p className="eyebrow">Tip flow</p>
          <h2>Thank the server</h2>
          <p className="place-address">Record a direct server-tip intent after a verified visit.</p>
          <Button onClick={recordTip} type="button">
            Record ₹100 tip
          </Button>
        </article>
        <article className="future-card wide-card">
          <p className="eyebrow">Tip history</p>
          <h2>Network goodwill</h2>
          <div className="future-list">
            {tips.map((tip) => (
              <div key={tip.id}>
                <strong>{tip.serverName}</strong>
                <span>
                  {tip.placeName} · ₹{tip.amount}
                </span>
              </div>
            ))}
            {tips.length === 0 && <p className="place-address">No tips recorded yet.</p>}
          </div>
        </article>
      </section>
    </Shell>
  );
}

export function PhaseFourQaPage() {
  const [counts, setCounts] = useState({ verticals: 0, tips: 0 });

  useEffect(() => {
    setCounts({
      verticals: readArray<VerticalExperimentRecord>(verticalExperimentsStorageKey).length,
      tips: readArray<ServerTipRecord>(serverTipsStorageKey).length,
    });
  }, []);

  return (
    <Shell
      description="Year 3 vertical expansion QA for weddings, events, API/data products, and server goodwill."
      eyebrow="Phase 4.5"
      metrics={[
        ["Vertical tests", counts.verticals],
        ["Tips", counts.tips],
        ["ARR", "₹220cr+"],
      ]}
      route="/phase-4-qa"
      title="Phase 4 scale QA."
    >
      <section className="future-grid">
        <article className="future-card wide-card">
          <p className="eyebrow">Scale board</p>
          <h2>Trust beyond dining</h2>
          <div className="future-list">
            {phaseFourVerticals.map((vertical) => (
              <div key={vertical.id}>
                <strong>{vertical.title}</strong>
                <span>{vertical.revenueModel}</span>
              </div>
            ))}
          </div>
        </article>
        <article className="future-card">
          <p className="eyebrow">Gate</p>
          <h2>ARR readiness</h2>
          <p className="place-address">
            Only scale verticals after the dining trust layer, attribution engine, and city
            playbooks are repeatable.
          </p>
        </article>
      </section>
    </Shell>
  );
}
