export type DocBlock = { id: string } & (
  | { type: "heading"; text: string }
  | { type: "subheading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "bullets"; items: string[] }
  | { type: "callout"; text: string }
);

export type DocumentData = {
  id: string;
  title: string;
  subtitle?: string;
  blocks: DocBlock[];
};

export const SAMPLE_DOCUMENT: DocumentData = {
  id: "sample-doc",
  title: "How to Study Effectively for Exams",
  subtitle: "A practical guide for students preparing for tests and exams",
  blocks: [
    {
      id: "b1",
      type: "paragraph",
      text: "Studying well is less about how many hours you spend and more about how you use them. This guide covers simple habits that help you remember more and feel calmer on exam day.",
    },
    { id: "b2", type: "heading", text: "Plan your study time" },
    {
      id: "b3",
      type: "paragraph",
      text: "Start by listing every subject and topic you need to cover. Then spread them across the days you have left, giving more time to the topics you find hardest.",
    },
    {
      id: "b4",
      type: "bullets",
      items: [
        "Write a weekly timetable and stick it where you can see it",
        "Study in short sessions with breaks in between",
        "Mix subjects in a day so you don't get bored",
        "Leave the last few days for revision only",
      ],
    },
    { id: "b5", type: "heading", text: "Use active study methods" },
    {
      id: "b6",
      type: "paragraph",
      text: "Reading your notes again and again feels productive, but testing yourself is far more effective. Active methods force your brain to recall information, which makes it stick.",
    },
    { id: "b7", type: "subheading", text: "Methods to try" },
    {
      id: "b8",
      type: "bullets",
      items: [
        "Answer past questions without looking at your notes",
        "Explain a topic out loud as if you were teaching it",
        "Make flashcards for definitions and formulas",
        "Draw diagrams and mind maps from memory",
      ],
    },
    {
      id: "b9",
      type: "callout",
      text: "Testing yourself is one of the best ways to learn. If you can explain it without your notes, you truly know it.",
    },
    { id: "b10", type: "heading", text: "Take care of yourself" },
    {
      id: "b11",
      type: "paragraph",
      text: "Your brain works best when your body is rested. Sleep, food and short breaks are part of studying, not a distraction from it.",
    },
    {
      id: "b12",
      type: "bullets",
      items: [
        "Get enough sleep, especially the night before an exam",
        "Drink water and eat regular meals",
        "Take a short walk or stretch between study sessions",
      ],
    },
    { id: "b13", type: "heading", text: "On exam day" },
    {
      id: "b14",
      type: "paragraph",
      text: "Arrive early with everything you need. Read every question carefully, answer the ones you know first, then return to the harder ones.",
    },
    { id: "b15", type: "heading", text: "Conclusion" },
    {
      id: "b16",
      type: "paragraph",
      text: "Good results come from steady habits: plan your time, test yourself often and look after your health. Start small today, and build from there.",
    },
  ],
};