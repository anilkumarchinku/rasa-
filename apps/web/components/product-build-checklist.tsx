"use client";

import { CheckCircle2, CircleDashed, Clock3, ExternalLink, LockKeyhole, Wrench } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "./ui/badge";
import { ButtonLink } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { activeBuildGate, buildPhases, type BuildStatus } from "../lib/build-checklist";

const statusConfig: Record<BuildStatus, { label: string; icon: typeof CheckCircle2; className: string }> = {
  complete: {
    label: "Foundation complete",
    icon: CheckCircle2,
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  in_progress: {
    label: "In progress",
    icon: Wrench,
    className: "border-amber-200 bg-amber-50 text-amber-900",
  },
  blocked: {
    label: "Blocked",
    icon: LockKeyhole,
    className: "border-rose-200 bg-rose-50 text-rose-900",
  },
  planned: {
    label: "Not started",
    icon: Clock3,
    className: "border-slate-200 bg-slate-50 text-slate-700",
  },
};

function StatusBadge({ status }: { status: BuildStatus }) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge className={`gap-1.5 border ${config.className}`} variant="outline">
      <Icon className="size-3.5" />
      {config.label}
    </Badge>
  );
}

export function ProductBuildChecklist() {
  const [expandedPhase, setExpandedPhase] = useState("phase-0");
  const items = useMemo(() => buildPhases.flatMap((phase) => phase.items), []);
  const completeCount = items.filter((item) => item.status === "complete").length;
  const inProgressCount = items.filter((item) => item.status === "in_progress").length;
  const blockedCount = items.filter((item) => item.status === "blocked").length;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <section className="grid gap-8 border-b pb-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end">
        <div>
          <p className="mb-3 text-sm font-medium text-muted-foreground">Founder build board</p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
            What is truly built, what is not, and what Rasa needs next.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
            This is the source of truth for the product build. A prototype screen is not marked as a
            completed product capability. Phase 1 stays locked until the Phase 0 wedge works with
            real people and real restaurant data.
          </p>
        </div>

        <Card className="gap-0 rounded-lg py-0 shadow-sm">
          <CardHeader className="px-5 py-5">
            <CardDescription>PRD workstreams</CardDescription>
            <CardTitle className="text-4xl">{completeCount} / {items.length}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 divide-x border-t px-0">
            <div className="px-5 py-4">
              <p className="text-xs text-muted-foreground">Building</p>
              <p className="mt-1 text-lg font-semibold">{inProgressCount}</p>
            </div>
            <div className="px-5 py-4">
              <p className="text-xs text-muted-foreground">Blocked</p>
              <p className="mt-1 text-lg font-semibold">{blockedCount}</p>
            </div>
            <div className="px-5 py-4">
              <p className="text-xs text-muted-foreground">Later</p>
              <p className="mt-1 text-lg font-semibold">{items.length - completeCount - inProgressCount - blockedCount}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <Card className="rounded-lg border-amber-200 bg-amber-50/70 py-0 shadow-none">
          <CardHeader className="px-5 py-5">
            <div className="flex items-center gap-2 text-amber-800">
              <CircleDashed className="size-4" />
              <CardDescription className="text-amber-800">Current build gate</CardDescription>
            </div>
            <CardTitle className="text-xl">{activeBuildGate.title}</CardTitle>
            <CardDescription className="leading-6 text-amber-950/75">{activeBuildGate.description}</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <ButtonLink
              className="bg-[#191612] text-white hover:bg-[#2c271f]"
              href={activeBuildGate.route}
              size="sm"
              style={{ color: "#ffffff" }}
            >
              Test Universal Save
              <ExternalLink className="size-4" />
            </ButtonLink>
          </CardContent>
        </Card>

        <Card className="rounded-lg py-0 shadow-none">
          <CardHeader className="px-5 py-5">
            <CardDescription>Founder rule</CardDescription>
            <CardTitle className="text-xl">No premature ticks.</CardTitle>
            <CardDescription className="leading-6">
              I will change a workstream to complete only after you test it and say “tested perfect.”
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      <section className="mt-10 space-y-4" aria-label="Rasa phased development checklist">
        {buildPhases.map((phase) => {
          const isExpanded = expandedPhase === phase.id;
          const phaseComplete = phase.items.filter((item) => item.status === "complete").length;
          const phaseInProgress = phase.items.filter((item) => item.status === "in_progress").length;

          return (
            <Card className="gap-0 rounded-lg py-0 shadow-none" key={phase.id}>
              <button
                aria-expanded={isExpanded}
                className="flex w-full items-start justify-between gap-4 px-5 py-5 text-left transition-colors hover:bg-muted/40 sm:items-center"
                onClick={() => setExpandedPhase(isExpanded ? "" : phase.id)}
                type="button"
              >
                <span>
                  <span className="block text-sm font-medium text-muted-foreground">{phase.timing}</span>
                  <span className="mt-1 block text-xl font-semibold text-foreground">{phase.title}</span>
                  <span className="mt-1 block max-w-3xl text-sm leading-6 text-muted-foreground">{phase.goal}</span>
                </span>
                <span className="shrink-0 text-right text-sm text-muted-foreground">
                  <span className="block font-semibold text-foreground">{phaseComplete} complete</span>
                  <span>{phaseInProgress ? `${phaseInProgress} building` : `${phase.items.length - phaseComplete} remaining`}</span>
                </span>
              </button>

              {isExpanded && (
                <CardContent className="border-t px-5 py-0">
                  <ol className="divide-y">
                    {phase.items.map((item) => (
                      <li className="grid gap-3 py-5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-start" key={item.id}>
                        <span className="mt-0.5 font-mono text-sm text-muted-foreground">{item.id}</span>
                        <span>
                          <span className="block font-medium text-foreground">{item.title}</span>
                          <span className="mt-1 block max-w-3xl text-sm leading-6 text-muted-foreground">{item.detail}</span>
                        </span>
                        <span className="flex items-center gap-3 sm:justify-end">
                          {item.route && (
                            <Link className="text-sm font-medium text-primary hover:underline" href={item.route}>
                              Open
                            </Link>
                          )}
                          <StatusBadge status={item.status} />
                        </span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              )}
            </Card>
          );
        })}
      </section>
    </main>
  );
}
