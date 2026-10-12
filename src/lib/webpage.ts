export type Device = "desktop" | "tablet" | "mobile";

// The width each device preview is drawn at
export const DEVICE_WIDTHS: Record<Device, number> = {
  desktop: 1280,
  tablet: 768,
  mobile: 390,
};

export type WebTheme = {
  background: string;
  surface: string;
  text: string;
  muted: string;
  accent: string; // buttons and the call-to-action block
  accentText: string; // text on top of accent
};

type SectionBase = { id: string };

export type WebSection = SectionBase &
  (
    | { type: "hero"; heading: string; subheading: string; buttonLabel: string; image: string }
    | {
        type: "products";
        heading: string;
        items: { id: string; name: string; price: string; image: string }[];
      }
    | { type: "features"; heading: string; items: { id: string; title: string; body: string }[] }
    | { type: "cta"; heading: string; body: string; buttonLabel: string }
  );

export type WebPage = {
  id: string;
  title: string;
  brand: string;
  navLinks: string[];
  navButton: string;
  theme: WebTheme;
  sections: WebSection[];
  footerText: string;
};

// Sample content until the AI backend sends real pages.
// The images are random placeholders from picsum.photos.
export const SAMPLE_WEBPAGE: WebPage = {
  id: "sample-web",
  title: "Fresh Bites",
  brand: "Fresh Bites",
  navLinks: ["Home", "About", "Products"],
  navButton: "Order now",
  theme: {
    background: "#FFFFFF",
    surface: "#F5F2EC",
    text: "#1A1A1A",
    muted: "#5C5C5C",
    accent: "#1F1F1F",
    accentText: "#FFFFFF",
  },
  sections: [
    {
      id: "hero",
      type: "hero",
      heading: "Homemade snacks and fresh drinks, made daily",
      subheading: "Small-batch treats prepared fresh every morning and delivered to your door.",
      buttonLabel: "See our menu",
      image: "https://picsum.photos/seed/ledify-hero/1600/900",
    },
    {
      id: "products",
      type: "products",
      heading: "Our favourites",
      items: [
        { id: "p1", name: "Fruit & Custard Cup", price: "[Price]", image: "https://picsum.photos/seed/ledify-p1/600/750" },
        { id: "p2", name: "Club Sandwich Tray", price: "[Price]", image: "https://picsum.photos/seed/ledify-p2/600/750" },
        { id: "p3", name: "Zobo Drink", price: "[Price]", image: "https://picsum.photos/seed/ledify-p3/600/750" },
        { id: "p4", name: "Tiger Nut Milk", price: "[Price]", image: "https://picsum.photos/seed/ledify-p4/600/750" },
      ],
    },
    {
      id: "features",
      type: "features",
      heading: "Why people choose us",
      items: [
        { id: "f1", title: "Made fresh daily", body: "Everything is prepared the same morning it's delivered." },
        { id: "f2", title: "Natural ingredients", body: "No artificial preservatives, just real food." },
        { id: "f3", title: "Fast delivery", body: "Order before noon and get it the same day." },
      ],
    },
    {
      id: "cta",
      type: "cta",
      heading: "Hungry already?",
      body: "Place your order today and taste the difference.",
      buttonLabel: "Order now",
    },
  ],
  footerText: "All rights reserved.",
};