import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Backdrop, Captions, Chip, KenBurns, Karaoke, pop, ramp, useT } from "./components";
import { Beat, BRAND, C, F, Timeline } from "./theme";

/*
 * Instagram covers roughly the top 220px and the bottom 420px of a reel with UI, plus a ~130px
 * strip on the right for the like/comment/share buttons. Everything important stays inside that.
 */

/** Hook: sharp portrait up top, the line fully on screen from frame 1, lighting up as it's spoken. */
export const Face: React.FC<{ b: Beat }> = ({ b }) => {
  const t = useT();
  const src = b.photo ?? BRAND.portrait;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill style={{ filter: "blur(46px) brightness(0.35) saturate(1.2)", transform: "scale(1.3)" }}>
        <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <div style={{ position: "absolute", top: 110, left: 0, width: 1080, height: 1080, overflow: "hidden" }}>
        <KenBurns src={src} a={b.from} b={b.to + 0.5} zoom={[1.0, 1.1]} pos="45% 40%" drift={[8, 10]} />
        <AbsoluteFill style={{ background: "linear-gradient(180deg, transparent 55%, rgba(8,8,10,0.95) 100%)" }} />
      </div>
      <div style={{ position: "absolute", top: 1050, left: 70, opacity: ramp(t, b.from + 0.2, b.from + 0.6) }}>
        <Chip>{BRAND.name.toUpperCase()}</Chip>
        <div style={{ fontFamily: F.label, fontSize: 28, color: C.muted, marginTop: 10, marginLeft: 6, letterSpacing: 1 }}>{BRAND.tag}</div>
      </div>
      <Karaoke b={b} size={118} mode="light" style={{ position: "absolute", top: 1230, left: 70, right: 130 }} />
    </AbsoluteFill>
  );
};

/** Big statement on the dark backdrop, words rising in as spoken. */
export const Title: React.FC<{ b: Beat }> = ({ b }) => {
  const t = useT();
  return (
    <AbsoluteFill>
      <Backdrop glow={0.55 + 0.25 * pop(t, b.start, 0.6)} />
      <AbsoluteFill style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 130px 260px 90px", gap: 46 }}>
        {b.kicker && (
          <Chip style={{ opacity: ramp(t, b.from, b.from + 0.3), transform: `translateY(${(1 - ramp(t, b.from, b.from + 0.4)) * 20}px)` }}>{b.kicker}</Chip>
        )}
        <Karaoke b={b} size={124} mode="rise" />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** List item: huge outlined number + one-word label, captions underneath, progress pips. */
export const NumberCard: React.FC<{ b: Beat; tl: Timeline }> = ({ b, tl }) => {
  const t = useT();
  const nums = tl.beats.filter((x) => x.layout === "number");
  const idx = nums.findIndex((x) => x.id === b.id);
  const labelAt = b.words[1]?.t ?? b.start; // "One. SPEED." -> label lands on the 2nd word
  const pn = pop(t, b.from, 0.5);
  const pl = pop(t, labelAt - 0.05, 0.5);
  return (
    <AbsoluteFill>
      <Backdrop glow={0.6} y={34} />
      <div style={{ position: "absolute", top: 250, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
        <div style={{ fontFamily: F.label, fontWeight: 700, fontSize: 30, letterSpacing: 8, color: C.muted }}>WHAT INVESTORS ACTUALLY FUND</div>
        <div style={{ display: "flex", gap: 14 }}>
          {nums.map((_, i) => (
            <div key={i} style={{ width: 90, height: 8, borderRadius: 4, background: i <= idx ? C.red : "rgba(255,255,255,0.15)", boxShadow: i === idx ? `0 0 14px ${C.red}` : "none" }} />
          ))}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 400,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: F.head,
          fontSize: 300,
          lineHeight: 1,
          color: "transparent",
          WebkitTextStroke: `5px ${C.red}`,
          opacity: pn,
          transform: `scale(${0.7 + 0.3 * pn})`,
          filter: `drop-shadow(0 0 30px rgba(225,29,72,0.45))`,
        }}
      >
        {b.num}
      </div>
      <div
        style={{
          position: "absolute",
          top: 730,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: F.head,
          fontSize: 200,
          lineHeight: 1,
          color: C.white,
          letterSpacing: -4,
          opacity: Math.min(1, pl * 1.5),
          transform: `translateY(${(1 - pl) * 60}px)`,
          textShadow: "0 10px 40px rgba(0,0,0,0.6)",
        }}
      >
        {b.label}
      </div>
      <Captions b={b} y={1120} size={84} />
    </AbsoluteFill>
  );
};

/** Proof shot: full-bleed photo with a slow push, chip + captions. */
export const Photo: React.FC<{ b: Beat }> = ({ b }) => {
  const t = useT();
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <KenBurns src={b.photo!} a={b.from} b={b.to + 0.4} zoom={[1.06, 1.2]} pos="58% 45%" drift={[-10, -15]} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 25%, transparent 45%, rgba(8,8,10,0.92) 78%)" }} />
      {b.chip && (
        <div style={{ position: "absolute", top: 1010, left: 70, opacity: ramp(t, b.from + 0.15, b.from + 0.5) }}>
          <Chip>{b.chip}</Chip>
        </div>
      )}
      <Captions b={b} y={1120} size={84} />
    </AbsoluteFill>
  );
};

/** End card: opening statement, who you are, then the comment keyword as the one big action. */
export const Cta: React.FC<{ b: Beat }> = ({ b }) => {
  const t = useT();
  const q = b.words.findIndex((w) => /[.?!]$/.test(w.w));
  const ask = { ...b, words: b.words.slice(0, q + 1) };
  const key = b.words.find((w) => w.w.replace(/[^A-Z]/g, "").length > 2 && w.w === w.w.toUpperCase());
  const keyword = key ? key.w.replace(/[^A-Za-z]/g, "") : "TALK";
  const rest = b.sub ?? b.words.slice(b.words.indexOf(key!) + 1).map((w) => w.w).join(" ");
  const commentAt = b.words[q + 1]?.t ?? b.end;
  const pa = pop(t, b.from + 0.1, 0.6);
  const pk = pop(t, commentAt - 0.05, 0.55);
  const pulse = 1 + 0.03 * Math.sin(Math.max(0, t - commentAt) * 6) * ramp(t, commentAt + 0.5, commentAt + 1);
  return (
    <AbsoluteFill>
      <Backdrop glow={0.75} y={48} />
      <Karaoke b={ask} size={78} mode="rise" style={{ position: "absolute", top: 230, left: 90, right: 130 }} />
      <div style={{ position: "absolute", top: 470, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", opacity: Math.min(1, pa * 1.4), transform: `translateY(${(1 - pa) * 30}px)` }}>
        <div style={{ width: 230, height: 230, borderRadius: 115, overflow: "hidden", border: `6px solid ${C.red}`, boxShadow: `0 0 50px rgba(225,29,72,0.55)` }}>
          <Img src={staticFile(BRAND.portrait)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "45% 35%", transform: "scale(1.5)" }} />
        </div>
        <div style={{ fontFamily: F.head, fontSize: 70, color: C.white, marginTop: 26 }}>{BRAND.name}</div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, marginTop: 10 }}>
          {BRAND.roles.map((r, i) => (
            <div key={i} style={{ fontFamily: F.label, fontSize: 30, color: C.muted, opacity: ramp(t, b.from + 0.3 + i * 0.15, b.from + 0.6 + i * 0.15) }}>
              {r}
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 1040,
          left: 90,
          right: 130,
          padding: "34px 30px 38px",
          borderRadius: 36,
          background: "rgba(20,20,24,0.88)",
          border: `3px solid ${C.hi}`,
          boxShadow: "0 0 60px rgba(255,214,10,0.25)",
          textAlign: "center",
          opacity: Math.min(1, pk * 1.5),
          transform: `scale(${(0.8 + 0.2 * pk) * pulse})`,
        }}
      >
        <div style={{ fontFamily: F.label, fontWeight: 700, fontSize: 40, letterSpacing: 10, color: C.muted }}>COMMENT</div>
        <div style={{ fontFamily: F.head, fontSize: 170, lineHeight: 1.05, color: C.hi }}>“{keyword}”</div>
        {rest && <div style={{ fontFamily: F.label, fontWeight: 700, fontSize: 34, letterSpacing: 3, color: C.white, marginTop: 6 }}>{rest.replace(/^and /, "& ")}</div>}
      </div>
    </AbsoluteFill>
  );
};
