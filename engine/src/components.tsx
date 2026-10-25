import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { Beat, C, F, FPS, isEm, Word } from "./theme";

/** Absolute time in seconds (no Sequences, so frame == absolute frame). */
export const useT = () => useCurrentFrame() / FPS;

export const ease = Easing.bezier(0.22, 1, 0.36, 1);

/** 0 → 1 between seconds a and b (clamped, eased). */
export const ramp = (t: number, a: number, b: number, e = ease) =>
  interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });

/** Damped overshoot 0 → 1 starting at a. */
export const pop = (t: number, a: number, dur = 0.45) => {
  const x = Math.max(0, Math.min(1, (t - a) / dur));
  if (x <= 0) return 0;
  return 1 - Math.exp(-6 * x) * Math.cos(9 * x);
};

export const FontFaces: React.FC = () => (
  <style>{`
    @font-face { font-family: 'HK Black'; src: url('${staticFile("fonts/Inter-Var.ttf")}'); font-weight: 900; }
    @font-face { font-family: 'HK Bahn'; src: url('${staticFile("fonts/Barlow-Medium.ttf")}'); font-weight: 400; }
    @font-face { font-family: 'HK Bahn'; src: url('${staticFile("fonts/Barlow-Bold.ttf")}'); font-weight: 700; }
  `}</style>
);

/** Living film grain, regenerated every 2 frames. */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.08 }) => {
  const seed = Math.floor(useCurrentFrame() / 2) % 40;
  return (
    <AbsoluteFill style={{ mixBlendMode: "overlay", opacity, pointerEvents: "none" }}>
      <svg width="100%" height="100%">
        <filter id={`g${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#g${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.8 }) => (
  <AbsoluteFill
    style={{ background: `radial-gradient(ellipse 80% 62% at 50% 48%, transparent 45%, rgba(0,0,0,${strength}) 100%)`, pointerEvents: "none" }}
  />
);

/** Dark studio backdrop: drifting red glow + faint grid. */
export const Backdrop: React.FC<{ glow?: number; y?: number }> = ({ glow = 0.5, y = 42 }) => {
  const t = useT();
  const dx = Math.sin(t * 0.4) * 6;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 42% at ${50 + dx}% ${y}%, rgba(225,29,72,${0.42 * glow}) 0%, rgba(122,10,35,${0.25 * glow}) 38%, transparent 72%)`,
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.35,
          backgroundImage: `linear-gradient(${C.line} 1px, transparent 1px), linear-gradient(90deg, ${C.line} 1px, transparent 1px)`,
          backgroundSize: "90px 90px",
          backgroundPosition: `${-t * 6}px ${-t * 10}px`,
          maskImage: "radial-gradient(ellipse 70% 55% at 50% 45%, black 20%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 55% at 50% 45%, black 20%, transparent 80%)",
        }}
      />
    </AbsoluteFill>
  );
};

/** Slow push-in on a still photo, from a → b seconds. */
export const KenBurns: React.FC<{
  src: string;
  a: number;
  b: number;
  zoom?: [number, number];
  pos?: string;
  drift?: [number, number];
  style?: React.CSSProperties;
}> = ({ src, a, b, zoom = [1.04, 1.14], pos = "50% 50%", drift = [0, -20], style }) => {
  const t = useT();
  const k = ramp(t, a, b, Easing.linear);
  const s = zoom[0] + (zoom[1] - zoom[0]) * k;
  return (
    <Img
      src={staticFile(src)}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: pos,
        transform: `scale(${s}) translate(${drift[0] * k}px, ${drift[1] * k}px)`,
        ...style,
      }}
    />
  );
};

const textShadow = "0 4px 0 rgba(0,0,0,0.55), 0 0 28px rgba(0,0,0,0.85), 0 0 6px rgba(0,0,0,0.9)";

/**
 * The whole line, word-synced. mode "light": every word is on screen from the start and lights up as
 * it is spoken (good for hooks: text is readable on frame 1). mode "rise": words appear as spoken.
 */
export const Karaoke: React.FC<{ b: Beat; size: number; mode?: "light" | "rise"; align?: "center" | "left"; style?: React.CSSProperties }> = ({
  b,
  size,
  mode = "rise",
  align = "center",
  style,
}) => {
  const t = useT();
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: align === "center" ? "center" : "flex-start",
        columnGap: size * 0.26,
        rowGap: size * 0.02,
        fontFamily: F.head,
        fontSize: size,
        lineHeight: 1.08,
        letterSpacing: -size * 0.015,
        ...style,
      }}
    >
      {b.words.map((w, i) => {
        const on = t >= w.t - 0.04;
        const p = pop(t, w.t - 0.04, 0.4);
        const em = isEm(b, w.w);
        const color = em ? C.hi : C.white;
        if (mode === "light") {
          return (
            <span key={i} style={{ color: on ? color : "rgba(255,255,255,0.38)", textShadow, transform: `scale(${on ? 1 + 0.08 * (1 - p) : 1})`, display: "inline-block" }}>
              {w.w}
            </span>
          );
        }
        return (
          <span key={i} style={{ color, textShadow, opacity: on ? Math.min(1, p * 1.6) : 0, transform: `translateY(${(1 - p) * 40}px) scale(${0.9 + 0.1 * p})`, display: "inline-block" }}>
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

/** Short chunks (≤3 words, break on punctuation): classic reel captions. */
const chunk = (words: Word[]) => {
  const out: Word[][] = [];
  let cur: Word[] = [];
  for (const w of words) {
    cur.push(w);
    if (cur.length === 3 || /[.,?!]$/.test(w.w)) {
      out.push(cur);
      cur = [];
    }
  }
  if (cur.length) out.push(cur);
  return out;
};

export const Captions: React.FC<{ b: Beat; y?: number; size?: number }> = ({ b, y = 1240, size = 86 }) => {
  const t = useT();
  const chunks = chunk(b.words);
  let idx = -1;
  chunks.forEach((c, i) => {
    if (t >= c[0].t - 0.06) idx = i;
  });
  if (idx < 0) return null;
  const c = chunks[idx];
  const enter = pop(t, c[0].t - 0.06, 0.35);
  return (
    <div style={{ position: "absolute", left: 70, right: 130, top: y, display: "flex", justifyContent: "center" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: 22, transform: `scale(${0.85 + 0.15 * enter})` }}>
        {c.map((w, i) => {
          const spoken = t >= w.t - 0.04;
          const now = spoken && t < w.e + 0.05;
          return (
            <span
              key={i}
              style={{
                fontFamily: F.head,
                fontSize: size,
                lineHeight: 1.1,
                color: isEm(b, w.w) ? C.hi : C.white,
                opacity: spoken ? 1 : 0.0,
                textShadow,
                transform: `scale(${now ? 1.06 : 1})`,
                display: "inline-block",
              }}
            >
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** Small pill label. */
export const Chip: React.FC<{ children: React.ReactNode; color?: string; style?: React.CSSProperties }> = ({ children, color = C.red, style }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 14,
      padding: "12px 24px",
      borderRadius: 999,
      background: "rgba(10,10,12,0.72)",
      border: `2px solid ${color}`,
      fontFamily: F.label,
      fontWeight: 700,
      fontSize: 30,
      letterSpacing: 6,
      color: C.white,
      ...style,
    }}
  >
    <span style={{ width: 14, height: 14, borderRadius: 7, background: color, boxShadow: `0 0 12px ${color}` }} />
    {children}
  </div>
);
