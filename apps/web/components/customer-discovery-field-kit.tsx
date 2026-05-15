"use client";

import { useState } from "react";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { getRouteImage, VisualImage } from "./visual-image";

const creatorQuestions = [
  "Walk me through your last 5 sponsored posts. Who paid, what did they pay, what did they want?",
  "How many of your last 10 posts were organic - places you genuinely loved?",
  "When you organically recommend a place and 200 people save it, what do you earn from that?",
  "Have you ever turned down a sponsorship because the place was bad? What happened?",
  "If I came back in 6 weeks with a working version, would you sign a 6-month platform-priority agreement?",
];

const restaurantQuestions = [
  "What does your monthly marketing spend look like, roughly?",
  "How is it split - Zomato ads, Instagram, creator partnerships, OOH, anything else?",
  "If I asked you to show me which creators drove the most bookings last quarter, could you?",
  "On a slow Tuesday afternoon at 3 PM, how many tables are empty?",
  "After 6 months, if it was clearly working, would you pay ₹2,499/month for the full version?",
];

const userQuestions = [
  "Open Instagram. Show me your saved collections.",
  "Tell me about the last 3 places you saved. Why did you save them?",
  "Of the places you saved this year, how many have you actually visited?",
  "Show me how you decided where to eat last Saturday.",
  "Want me to add you to the founding 200 users list?",
];

const rubric = [
  ["Creator Pillar", "5+ firm yeses with willingness to sign"],
  ["Restaurant Pillar", "3+ SaaS yeses and 5+ live fest yeses"],
  ["User Pillar", "50%+ real-yes conversion"],
  ["Authenticity Thesis", "7+ creators describe trust collapse unprompted"],
  ["Live Fest Thesis", "5+ restaurants confirm slow-slot pain"],
];

export function CustomerDiscoveryFieldKit() {
  const [completed, setCompleted] = useState<string[]>([]);

  function toggle(item: string) {
    setCompleted((current) =>
      current.includes(item) ? current.filter((entry) => entry !== item) : [...current, item],
    );
  }

  return (
    <main className="field-kit-shell">
      <section className="field-kit-hero">
        <div>
          <Badge>10-day validation sprint</Badge>
          <h1>Customer Discovery Field Kit</h1>
          <p>
            Validate Rasa with creator commitments, restaurant willingness to pay, and real user
            pre-registration before writing more product code.
          </p>
        </div>
        <div className="hero-media-stack">
          <div className="visual-card">
            <VisualImage
              alt="Customer interview research preview"
              className="responsive-visual"
              priority
              src={getRouteImage("field")}
            />
          </div>
          <Card className="field-kit-score">
            <CardHeader>
              <CardTitle>Sprint progress</CardTitle>
              <CardDescription>First 72 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <strong>{completed.length}/5</strong>
              <span>execution items checked</span>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="field-kit-grid">
        <ScriptCard
          audience="Creators"
          commitment="5 firm yeses for a 6-month platform-priority agreement"
          questions={creatorQuestions}
          target="12-15 Hyderabad food creators"
        />
        <ScriptCard
          audience="Restaurants"
          commitment="3 yeses to ₹2,499/month and 5 yeses to live fests"
          questions={restaurantQuestions}
          target="8-10 mid-to-premium restaurants"
        />
        <ScriptCard
          audience="Users"
          commitment="8+ immediate founding-user yeses"
          questions={userQuestions}
          target="15-20 urban Hyderabad professionals"
        />
      </section>

      <section className="field-kit-grid two-col">
        <Card>
          <CardHeader>
            <Badge>Mom Test</Badge>
            <CardTitle>Interview rules</CardTitle>
            <CardDescription>Keep every conversation anchored in real behavior.</CardDescription>
          </CardHeader>
          <CardContent className="field-kit-list">
            <div>
              <strong>Talk about their life</strong>
              <span>Ask how they decided dinner last weekend, not whether they like Rasa.</span>
            </div>
            <div>
              <strong>Ask past behavior</strong>
              <span>Money already spent and workarounds built are the highest signal.</span>
            </div>
            <div>
              <strong>Demand commitment</strong>
              <span>
                Compliments are noise. LOIs, data access, and pre-registration are signal.
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Badge>72 hours</Badge>
            <CardTitle>Execution checklist</CardTitle>
            <CardDescription>Start with conversations, not strategy edits.</CardDescription>
          </CardHeader>
          <CardContent className="field-kit-checks">
            {[
              "Send 10 creator DMs today",
              "Walk into 3 restaurants today",
              "Start trademark search",
              "Schedule 5 user interviews",
              "Run Day 11 rubric",
            ].map((item) => (
              <button
                className={completed.includes(item) ? "checked" : undefined}
                key={item}
                onClick={() => toggle(item)}
                type="button"
              >
                <span>{completed.includes(item) ? "✓" : ""}</span>
                {item}
              </button>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="field-kit-rubric">
        <Card>
          <CardHeader>
            <Badge>End of Day 10</Badge>
            <CardTitle>Decision rubric</CardTitle>
            <CardDescription>Do not grade generously. Reality gets the vote.</CardDescription>
          </CardHeader>
          <CardContent className="field-kit-table">
            {rubric.map(([pillar, criterion]) => (
              <div key={pillar}>
                <strong>{pillar}</strong>
                <span>{criterion}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function ScriptCard({
  audience,
  commitment,
  questions,
  target,
}: {
  audience: string;
  commitment: string;
  questions: string[];
  target: string;
}) {
  return (
    <Card>
      <CardHeader>
        <Badge>{target}</Badge>
        <CardTitle>{audience}</CardTitle>
        <CardDescription>{commitment}</CardDescription>
      </CardHeader>
      <CardContent className="field-kit-list">
        {questions.map((question) => (
          <div key={question}>
            <strong>{question}</strong>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
