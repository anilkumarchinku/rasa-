import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rasa",
  description: "The trust layer for how India eats out.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en-IN">
      <body>
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:h-14 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-0 lg:px-8">
            <Link className="flex items-center gap-3" href="/">
              <span className="flex size-8 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
                R
              </span>
              <span className="font-semibold">Rasa</span>
            </Link>
            <nav
              className="grid w-full grid-cols-3 gap-1 text-sm sm:flex sm:w-auto sm:items-center sm:gap-1"
              aria-label="Rasa primary navigation"
            >
              <Link
                className="rounded-md px-2 py-2 text-center text-muted-foreground hover:bg-accent hover:text-foreground sm:px-3"
                href="/"
              >
                Home
              </Link>
              <Link
                className="rounded-md px-2 py-2 text-center text-muted-foreground hover:bg-accent hover:text-foreground sm:px-3"
                href="/save"
              >
                Save
              </Link>
              <Link
                className="rounded-md px-2 py-2 text-center text-muted-foreground hover:bg-accent hover:text-foreground sm:px-3"
                href="/map"
              >
                Map
              </Link>
              <Link
                className="rounded-md px-2 py-2 text-center text-muted-foreground hover:bg-accent hover:text-foreground sm:px-3"
                href="/live"
              >
                Live
              </Link>
              <Link
                className="rounded-md px-2 py-2 text-center text-muted-foreground hover:bg-accent hover:text-foreground sm:px-3"
                href="/book"
              >
                Book
              </Link>
              <Link
                className="rounded-md px-2 py-2 text-center text-muted-foreground hover:bg-accent hover:text-foreground sm:px-3"
                href="/rewards"
              >
                Rewards
              </Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
