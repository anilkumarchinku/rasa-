"use client";

import {
  RASA_CITY,
  demoOtpCode,
  minimumCuisineSelections,
  phaseZeroCuisines,
  type OnboardingProfile,
  type PhaseZeroCuisine,
} from "@rasa/shared";
import { CalendarCheck, MapPinned, Radio, Sparkles } from "lucide-react";
import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Badge } from "./ui/badge";
import { Button, ButtonLink } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const storageKey = "rasa.phase0.profile";

type Step = "phone" | "otp" | "taste" | "home";

const productSurfaces = [
  {
    href: "/save",
    icon: Sparkles,
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80",
    label: "Universal Save",
    text: "Parse messy creator links into attributed restaurant saves.",
  },
  {
    href: "/map",
    icon: MapPinned,
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80",
    label: "Personal Map",
    text: "See saved places by neighborhood, mood, and visit status.",
  },
  {
    href: "/live",
    icon: Radio,
    image:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80",
    label: "Live Fests",
    text: "Book creator-led live dining drops with real-time slot counters.",
  },
  {
    href: "/book",
    icon: CalendarCheck,
    image:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80",
    label: "Booking",
    text: "Turn creator trust into one-tap reservations and rewards.",
  },
];

const simpleFlowSteps = [
  {
    copy: "One tap from creator links.",
    image:
      "https://images.unsplash.com/photo-1543352634-a1c51d9f1fa7?auto=format&fit=crop&w=700&q=80",
    stepNo: "1",
    title: "Save",
  },
  {
    copy: "Remember it when you are nearby.",
    image:
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=700&q=80",
    stepNo: "2",
    title: "Map",
  },
  {
    copy: "Reserve with creator attribution.",
    image:
      "https://images.unsplash.com/photo-1559329007-40df8a9345d8?auto=format&fit=crop&w=700&q=80",
    stepNo: "3",
    title: "Book",
  },
];

const heroImage =
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=80";

function normalizePhone(value: string) {
  return value.replace(/[^\d+]/g, "").slice(0, 14);
}

export function OnboardingFlow() {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [selectedCuisines, setSelectedCuisines] = useState<PhaseZeroCuisine[]>([]);
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedProfile = window.localStorage.getItem(storageKey);

    if (!savedProfile) {
      return;
    }

    try {
      const parsedProfile = JSON.parse(savedProfile) as OnboardingProfile;
      setProfile(parsedProfile);
      setPhone(parsedProfile.phone);
      setSelectedCuisines(parsedProfile.cuisines);
      setStep("home");
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, []);

  const canCompleteTaste = selectedCuisines.length >= minimumCuisineSelections;

  const progressLabel = useMemo(() => {
    if (step === "phone") return "1 of 3";
    if (step === "otp") return "2 of 3";
    if (step === "taste") return "3 of 3";
    return "Ready";
  }, [step]);

  function submitPhone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextPhone = normalizePhone(phone);

    if (nextPhone.length < 10) {
      setError("Enter a valid phone number.");
      return;
    }

    setPhone(nextPhone);
    setOtp("");
    setError("");
    setStep("otp");
  }

  function submitOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (otp.trim() !== demoOtpCode) {
      setError("Use the demo OTP 123456.");
      return;
    }

    setError("");
    setStep("taste");
  }

  function toggleCuisine(cuisine: PhaseZeroCuisine) {
    setSelectedCuisines((current) =>
      current.includes(cuisine)
        ? current.filter((item) => item !== cuisine)
        : [...current, cuisine],
    );
  }

  function completeOnboarding() {
    if (!canCompleteTaste) {
      setError(`Pick at least ${minimumCuisineSelections} cuisines.`);
      return;
    }

    const nextProfile: OnboardingProfile = {
      phone,
      city: RASA_CITY,
      cuisines: selectedCuisines,
      completedAt: new Date().toISOString(),
    };

    window.localStorage.setItem(storageKey, JSON.stringify(nextProfile));
    setProfile(nextProfile);
    setError("");
    setStep("home");
  }

  function resetOnboarding() {
    window.localStorage.removeItem(storageKey);
    setProfile(null);
    setPhone("");
    setOtp("");
    setSelectedCuisines([]);
    setError("");
    setStep("phone");
  }

  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-5 sm:px-6 lg:px-8">
        <section className="grid items-center gap-8 py-8 sm:py-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.75fr)]">
          <div className="grid gap-6 text-center lg:text-left">
            <div className="flex justify-center gap-2 lg:justify-start">
              <Badge variant="outline">{RASA_CITY}</Badge>
              <Badge variant="secondary">Creator-led dining</Badge>
            </div>
            <div className="grid gap-4">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
                Save the place now. Eat there later.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                Rasa turns food creator recommendations into a simple map, trusted booking, and
                rewards flow.
              </p>
            </div>
            <Card className="w-full max-w-2xl">
              <CardContent className="grid gap-3 p-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                <Input
                  aria-label="Paste a food recommendation"
                  readOnly
                  value="Paste a Reel, YouTube link, or WhatsApp place"
                />
                <ButtonLink href="/save">
                  <Sparkles aria-hidden="true" />
                  Save place
                </ButtonLink>
              </CardContent>
            </Card>
          </div>

          <Card className="overflow-hidden p-0">
            <Image
              alt="Warm restaurant table with shared dishes"
              className="aspect-[4/3] w-full object-cover"
              height={900}
              priority
              src={heroImage}
              unoptimized
              width={1200}
            />
            <CardContent className="grid gap-1 p-4">
              <p className="text-sm font-medium">Tonight's shortlist</p>
              <p className="text-sm text-muted-foreground">
                Places saved from creators, ready when hunger hits.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-3 md:grid-cols-3" aria-label="Rasa simple flow">
          {simpleFlowSteps.map(({ copy, image, stepNo, title }) => (
            <Card className="overflow-hidden py-0" key={title}>
              <Image
                alt={`${title} dining flow`}
                className="h-32 w-full object-cover"
                height={320}
                src={image}
                unoptimized
                width={700}
              />
              <CardContent className="grid gap-3 p-5">
                <Badge className="size-7 rounded-full p-0" variant="secondary">
                  {stepNo}
                </Badge>
                <div>
                  <p className="text-lg font-semibold">{title}</p>
                  <p className="text-sm text-muted-foreground">{copy}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-4 md:grid-cols-2">
            {productSurfaces.map(({ href, icon: Icon, image, label, text }) => (
              <Card className="overflow-hidden py-0 transition hover:shadow-md" key={href}>
                <Image
                  alt={`${label} preview`}
                  className="h-36 w-full object-cover"
                  height={360}
                  src={image}
                  unoptimized
                  width={900}
                />
                <CardHeader>
                  <div className="flex size-10 items-center justify-center rounded-lg border bg-muted text-foreground">
                    <Icon aria-hidden="true" size={18} />
                  </div>
                  <CardTitle className="text-lg">{label}</CardTitle>
                  <CardDescription>{text}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ButtonLink href={href} size="sm" variant="ghost">
                    Open
                  </ButtonLink>
                </CardContent>
              </Card>
            ))}
          </div>

          <aside className="grid content-start gap-4">
            <Card>
              <CardHeader>
                <Badge variant="secondary">Try demo</Badge>
                <CardTitle>Quick setup</CardTitle>
                <CardDescription>
                  Use OTP 123456. Profile saves only on this browser.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground">Step</p>
                  <p className="font-medium">{progressLabel}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground">City</p>
                  <p className="font-medium">{RASA_CITY}</p>
                </div>
              </CardContent>
            </Card>

            <Card aria-label="Rasa onboarding">
              {step === "phone" && (
                <form onSubmit={submitPhone} className="grid gap-5">
                  <CardHeader>
                    <Badge>Phone</Badge>
                    <CardTitle>Enter your number</CardTitle>
                    <CardDescription>
                      Use the demo OTP to unlock the Phase 0 diner shell.
                    </CardDescription>
                  </CardHeader>
                  <div className="grid gap-2 px-6">
                    <Label htmlFor="phone">Mobile number</Label>
                    <Input
                      id="phone"
                      inputMode="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(event) => setPhone(normalizePhone(event.target.value))}
                    />
                  </div>
                  {error && <p className="px-6 text-sm font-medium text-destructive">{error}</p>}
                  <CardContent>
                    <Button className="w-full" type="submit">
                      Send OTP
                    </Button>
                  </CardContent>
                </form>
              )}

              {step === "otp" && (
                <form onSubmit={submitOtp} className="grid gap-5">
                  <CardHeader>
                    <Badge>Verify</Badge>
                    <CardTitle>Check your code</CardTitle>
                    <CardDescription>Demo OTP: 123456</CardDescription>
                  </CardHeader>
                  <div className="grid gap-2 px-6">
                    <Label htmlFor="otp">OTP</Label>
                    <Input
                      id="otp"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="123456"
                      value={otp}
                      onChange={(event) =>
                        setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                    />
                  </div>
                  {error && <p className="px-6 text-sm font-medium text-destructive">{error}</p>}
                  <CardContent className="grid grid-cols-2 gap-2">
                    <Button type="button" variant="secondary" onClick={() => setStep("phone")}>
                      Back
                    </Button>
                    <Button type="submit">Verify</Button>
                  </CardContent>
                </form>
              )}

              {step === "taste" && (
                <div className="grid gap-5">
                  <CardHeader>
                    <Badge variant="outline">{RASA_CITY}</Badge>
                    <CardTitle>Pick your first cravings</CardTitle>
                    <CardDescription>
                      Choose at least three taste signals for the first feed.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-2">
                    {phaseZeroCuisines.map((cuisine) => (
                      <Button
                        key={cuisine}
                        type="button"
                        variant={selectedCuisines.includes(cuisine) ? "default" : "outline"}
                        onClick={() => toggleCuisine(cuisine)}
                      >
                        {cuisine}
                      </Button>
                    ))}
                  </CardContent>
                  <p className="px-6 text-sm text-muted-foreground">
                    {selectedCuisines.length}/{minimumCuisineSelections} selected
                  </p>
                  {error && <p className="px-6 text-sm font-medium text-destructive">{error}</p>}
                  <CardContent className="grid grid-cols-2 gap-2">
                    <Button type="button" variant="secondary" onClick={() => setStep("otp")}>
                      Back
                    </Button>
                    <Button type="button" onClick={completeOnboarding}>
                      Finish
                    </Button>
                  </CardContent>
                </div>
              )}

              {step === "home" && profile && (
                <div className="grid gap-5">
                  <CardHeader>
                    <Badge>Ready</Badge>
                    <CardTitle>Welcome to Rasa</CardTitle>
                    <CardDescription>Your demo diner profile is saved locally.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-2">
                    {[
                      ["Phone", profile.phone],
                      ["City", profile.city],
                      ["Tastes", profile.cuisines.join(", ")],
                    ].map(([label, value]) => (
                      <div className="rounded-lg border p-3" key={label}>
                        <p className="text-sm text-muted-foreground">{label}</p>
                        <p className="font-medium">{value}</p>
                      </div>
                    ))}
                    <Button type="button" variant="secondary" onClick={resetOnboarding}>
                      Reset test profile
                    </Button>
                  </CardContent>
                </div>
              )}
            </Card>
          </aside>
        </section>
      </div>
    </main>
  );
}
