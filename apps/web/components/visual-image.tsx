import Image from "next/image";
import type { ReactNode } from "react";

type VisualImageProps = {
  alt: string;
  className?: string;
  priority?: boolean;
  src: string;
};

type HeroMediaProps = {
  alt: string;
  children: ReactNode;
  dark?: boolean;
  imageKey: string;
};

const diningImages = [
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1543352634-a1c51d9f1fa7?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1559329007-40df8a9345d8?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=900&q=80",
];

const routeImages: Record<string, string> = {
  analytics:
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
  billing:
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
  booking:
    "https://images.unsplash.com/photo-1559329007-40df8a9345d8?auto=format&fit=crop&w=1200&q=80",
  creator:
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
  discovery:
    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80",
  family:
    "https://images.unsplash.com/photo-1529517986296-8475800b8e0f?auto=format&fit=crop&w=1200&q=80",
  field:
    "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
  live: "https://images.unsplash.com/photo-1525268323446-0505b6fe7778?auto=format&fit=crop&w=1200&q=80",
  map: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80",
  rewards:
    "https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?auto=format&fit=crop&w=1200&q=80",
  restaurants:
    "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=1200&q=80",
  reviews:
    "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80",
  save: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80",
  trust:
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
  travel:
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  weddings:
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
};

const placeImageOverrides: Record<string, string> = {
  "hyd-concu-jubilee-hills":
    "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80",
  "hyd-roastery-coffee-house-banjara-hills":
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
};

function stableIndex(value: string, length: number) {
  return Array.from(value).reduce((sum, character) => sum + character.charCodeAt(0), 0) % length;
}

export function getPlaceImage(placeId: string) {
  return placeImageOverrides[placeId] ?? diningImages[stableIndex(placeId, diningImages.length)];
}

export function getRouteImage(key: keyof typeof routeImages | string) {
  return routeImages[key] ?? routeImages.discovery;
}

export function getCreatorImage(handle: string) {
  return diningImages[stableIndex(handle, diningImages.length)];
}

export function VisualImage({ alt, className = "", priority = false, src }: VisualImageProps) {
  return (
    <Image
      alt={alt}
      className={className}
      height={720}
      priority={priority}
      src={src}
      unoptimized
      width={1080}
    />
  );
}

export function HeroMedia({ alt, children, dark = false, imageKey }: HeroMediaProps) {
  return (
    <div className="hero-media-stack">
      <div className={dark ? "visual-card dark" : "visual-card"}>
        <VisualImage
          alt={alt}
          className="responsive-visual"
          priority
          src={getRouteImage(imageKey)}
        />
      </div>
      {children}
    </div>
  );
}
