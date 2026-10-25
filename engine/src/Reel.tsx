import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { FontFaces, Grain, ramp, useT, Vignette } from "./components";
import { Chat, Cta, Face, NumberCard, Photo, Stat, Title, Versus } from "./layouts";
import { Beat, C, Timeline } from "./theme";

const Layout: React.FC<{ b: Beat; tl: Timeline }> = ({ b, tl }) => {
  const first = tl.beats[0] === b;
  switch (b.layout) {
    case "face":
      return <Face b={b} first={first} />;
    case "title":
      return <Title b={b} first={first} />;
    case "number":
      return <NumberCard b={b} first={first} tl={tl} />;
    case "photo":
      return <Photo b={b} first={first} />;
    case "stat":
      return <Stat b={b} first={first} />;
    case "chat":
      return <Chat b={b} first={first} tl={tl} />;
    case "versus":
      return <Versus b={b} first={first} />;
    case "cta":
      return <Cta b={b} first={first} />;
  }
};

export const Reel: React.FC<{ slug: string; tl?: Timeline }> = ({ slug, tl }) => {
  const t = useT();
  if (!tl) return <AbsoluteFill style={{ background: C.bg }} />;
  const i = Math.max(0, tl.beats.findIndex((b) => t >= b.from && t < b.to));
  const b = tl.beats[i];
  // Hard cut with a punch-in + quick flash on every beat change (except the very first frame).
  const k = ramp(t, b.from, b.from + 0.3);
  const flash = i === 0 ? 0 : 0.22 * (1 - ramp(t, b.from, b.from + 0.14));
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <FontFaces />
      <AbsoluteFill style={{ transform: `scale(${1 + (i === 0 ? 0 : 0.07) * (1 - k)})` }}>
        <Layout b={b} tl={tl} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#fff", opacity: flash, pointerEvents: "none" }} />
      <Vignette strength={0.55} />
      <Grain />
      <Audio src={staticFile(`reels/${slug}/mix.wav`)} />
    </AbsoluteFill>
  );
};
