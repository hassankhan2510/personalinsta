export const FPS = 30;
export const W = 1080;
export const H = 1920;

export const C = {
  bg: "#08080A",
  surface: "#141418",
  line: "#2A2A33",
  white: "#FFFFFF",
  muted: "#9AA1AB",
  red: "#E11D48", // Cohort Zero red: ties the personal brand to the community
  redHot: "#FF2E5B",
  hi: "#FFD60A", // caption emphasis
};

// Open-licence fonts (OFL) so the repo can be public: Inter Black ≈ Segoe UI Black, Barlow ≈ Bahnschrift.
export const F = {
  head: "'HK Black', 'Segoe UI', sans-serif",
  label: "'HK Bahn', 'Segoe UI', sans-serif",
  text: "'HK Text', 'Segoe UI', sans-serif", // chat bubbles
};

/** Who's speaking. Shown on the hook name tag and the end card. */
export const BRAND = {
  name: "Hassan Khan",
  tag: "Founder & Chairman, Cohort Zero",
  roles: [
    "Founder & Chairman · Cohort Zero",
    "Projects Lead · Nexaura (deep-tech research)",
  ],
  portrait: "photos/hassan_portrait.jpg",
};

export type Word = { w: string; t: number; e: number };
export type Layout = "face" | "title" | "number" | "photo" | "stat" | "chat" | "versus" | "cta";
export type Side = { label: string; value: string };
export type Beat = {
  id: string;
  layout: Layout;
  text: string;
  em?: string[];
  start: number; // first spoken sound (s)
  end: number; // last spoken sound (s)
  from: number; // visual window (s)
  to: number;
  words: Word[];
  photo?: string;
  kicker?: string;
  num?: string;
  label?: string;
  chip?: string;
  sub?: string;
  big?: boolean; // photo: the line as a big statement instead of captions
  twist?: boolean; // the turn of the story: music drops out, then hits
  value?: string; // stat: "$3.1B", "-Rs 20M"
  msgs?: ["me" | "them", string][]; // chat bubbles, spread across the line
  contact?: string; // chat header name
  left?: Side; // versus: the bad option (shown first)
  right?: Side; // versus: the good option
  split?: number; // versus: word index where the second card lands
  action?: string; // cta: "FOLLOW", "SAVE THIS", "SEND THIS"
};
export type Timeline = { slug: string; title: string; total: number; beats: Beat[] };

/** Strip punctuation for matching emphasis words. */
export const bare = (w: string) => w.toLowerCase().replace(/[^a-z0-9']/g, "");
export const isEm = (b: Beat, w: string) => (b.em ?? []).some((e) => bare(e) === bare(w));
