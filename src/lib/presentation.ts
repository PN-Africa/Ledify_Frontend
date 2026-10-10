// Every slide is designed at this size, then scaled to fit the screen
export const SLIDE_WIDTH = 960;
export const SLIDE_HEIGHT = 540;

export type Theme = {
  background: string;
  surface: string; // cards and shapes
  accent: string;
  text: string;
  muted: string;
};

type SlideBase = { id: string };

// Each layout needs different content, so each one has its own shape
export type Slide = SlideBase &
  (
    | { layout: "title"; title: string; subtitle?: string }
    | { layout: "bullets"; title: string; bullets: string[] }
    | { layout: "cards"; title: string; cards: { heading: string; body: string }[] }
    | { layout: "statement"; statement: string; caption?: string }
    | { layout: "closing"; title: string; subtitle?: string }
  );

export type Presentation = {
  id: string;
  title: string;
  theme: Theme;
  slides: Slide[];
};

// Sample content until the AI backend sends real presentations
export const SAMPLE_PRESENTATION: Presentation = {
  id: "sample",
  title: "The Future of Agriculture",
  theme: {
    background: "#0E3B29",
    surface: "#16503A",
    accent: "#B8E36B",
    text: "#F2F6EE",
    muted: "rgba(242, 246, 238, 0.72)",
  },
  slides: [
    {
      id: "s1",
      layout: "title",
      title: "The Future of Agriculture",
      subtitle: "How technology is changing the way we grow food",
    },
    {
      id: "s2",
      layout: "bullets",
      title: "Why farming needs to change",
      bullets: [
        "More people to feed every year",
        "Less predictable weather and seasons",
        "Young people moving from farms to cities",
        "Water and fertile land getting scarcer",
      ],
    },
    {
      id: "s3",
      layout: "cards",
      title: "Technology on the farm",
      cards: [
        { heading: "Precision farming", body: "Using data to give each part of a field exactly what it needs." },
        { heading: "Smart irrigation", body: "Sensors that water crops only when the soil is dry." },
        { heading: "Drones", body: "Checking crop health from above, across large farms, in minutes." },
      ],
    },
    {
      id: "s4",
      layout: "bullets",
      title: "Opportunities in Africa",
      bullets: [
        "Mobile platforms connecting farmers to buyers",
        "Solar-powered irrigation for off-grid farms",
        "Weather and soil advice delivered by SMS",
        "Agri-tech startups creating new jobs",
      ],
    },
    {
      id: "s5",
      layout: "statement",
      statement: "Technology won't replace farmers. It will give them better tools.",
      caption: "Key takeaway",
    },
    {
      id: "s6",
      layout: "closing",
      title: "Thank you",
      subtitle: "Questions and discussion",
    },
  ],
};