import React from "react";
import { AbsoluteFill, Easing, Img, staticFile } from "remotion";
import { Backdrop, Captions, Chip, KenBurns, Karaoke, pop, ramp, useT } from "./components";
import { Beat, BRAND, C, F, Side, Timeline } from "./theme";

/*
 * Instagram covers roughly the top 220px and the bottom 420px of a reel with UI, plus a ~130px
 * strip on the right for the like/comment/share buttons. Everything important stays inside that.
 *
 * `first` = this beat is the hook: its line must be readable on frame 1 (mode "light"),
 * because nobody waits for the first word.
 */
type P = { b: Beat; first: boolean };

/** Shrink a one-line label so long words ("DISTRIBUTION") still fit the safe width. */
const fit = (text: string, max: number, width = 860, perChar = 0.68) => Math.min(max, width / (text.length * perChar));

/** Hook: sharp portrait up top, the line fully on screen from frame 1, lighting up as it's spoken. */
export const Face: React.FC<P> = ({ b }) => {
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
      <Karaoke b={b} size={112} mode="light" style={{ position: "absolute", top: 1230, left: 70, right: 130 }} />
    </AbsoluteFill>
  );
};

/** Big statement on the dark backdrop. Hook: whole line on frame 1; later: words rise in as spoken. */
export const Title: React.FC<P> = ({ b, first }) => {
  const t = useT();
  const size = b.words.length > 9 ? 104 : 124;
  return (
    <AbsoluteFill>
      <Backdrop glow={0.55 + 0.25 * pop(t, b.start, 0.6)} />
      <AbsoluteFill style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 130px 260px 90px", gap: 46 }}>
        {b.kicker && (
          <Chip style={{ opacity: first ? 1 : ramp(t, b.from, b.from + 0.3), transform: `translateY(${first ? 0 : (1 - ramp(t, b.from, b.from + 0.4)) * 20}px)` }}>{b.kicker}</Chip>
        )}
        <Karaoke b={b} size={size} mode={first ? "light" : "rise"} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** List item: huge outlined number + one-word label, captions underneath, progress pips. */
export const NumberCard: React.FC<P & { tl: Timeline }> = ({ b, tl }) => {
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
        {b.kicker && <div style={{ fontFamily: F.label, fontWeight: 700, fontSize: 30, letterSpacing: 8, color: C.muted }}>{b.kicker}</div>}
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
          left: 60,
          right: 60,
          textAlign: "center",
          fontFamily: F.head,
          fontSize: fit(b.label ?? "", 200, 960, 0.72),
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

/** Full-bleed photo with a slow push. `big`: the line as a statement (hooks, twists); else captions. */
export const Photo: React.FC<P> = ({ b, first }) => {
  const t = useT();
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <KenBurns src={b.photo!} a={b.from} b={b.to + 0.4} zoom={[1.06, 1.2]} pos="58% 45%" drift={[-10, -15]} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 25%, transparent ${b.big ? 35 : 45}%, rgba(8,8,10,0.94) ${b.big ? 70 : 78}%)` }} />
      {b.chip && (
        <div style={{ position: "absolute", top: b.big ? 900 : 1010, left: 70, opacity: first ? 1 : ramp(t, b.from + 0.15, b.from + 0.5) }}>
          <Chip>{b.chip}</Chip>
        </div>
      )}
      {b.big ? (
        <Karaoke b={b} size={b.words.length > 9 ? 86 : 100} mode={first ? "light" : "rise"} align="left" style={{ position: "absolute", top: 1000, left: 70, right: 130 }} />
      ) : (
        <Captions b={b} y={1120} size={84} />
      )}
    </AbsoluteFill>
  );
};

/** "$3.1B" counting up from zero. Keeps the target's decimals, separators, prefix and suffix. */
const countUp = (value: string, k: number) => {
  const m = value.match(/^(.*?)(\d[\d,]*(?:\.\d+)?)(.*)$/);
  if (!m) return value;
  const [, pre, num, post] = m;
  const target = parseFloat(num.replace(/,/g, ""));
  const decimals = num.includes(".") ? num.split(".")[1].length : 0;
  const cur = target * k;
  const s = num.includes(",") ? cur.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : cur.toFixed(decimals);
  return pre + s + post;
};

/** Giant number that counts up, label under it. Numbers with money in them stop the scroll. */
export const Stat: React.FC<P> = ({ b, first }) => {
  const t = useT();
  // Hook: the full number slams in on frame 1 (it's the thumbnail). Later beats count up.
  const a = first ? -1.0 : b.from + 0.05;
  const k = ramp(t, a, a + 1.1, Easing.bezier(0.16, 1, 0.3, 1));
  const landed = first ? 1 : pop(t, a + 1.0, 0.5);
  const neg = (b.value ?? "").trim().startsWith("-");
  const color = neg ? C.redHot : C.white;
  return (
    <AbsoluteFill>
      <Backdrop glow={0.5 + 0.4 * landed} y={36} />
      {b.kicker && (
        <div style={{ position: "absolute", top: 330, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: first ? 1 : ramp(t, b.from, b.from + 0.3) }}>
          <Chip>{b.kicker}</Chip>
        </div>
      )}
      <div
        style={{
          position: "absolute",
          top: 470,
          left: 40,
          right: 40,
          textAlign: "center",
          fontFamily: F.head,
          fontSize: fit(b.value ?? "", 250, 1000, 0.62),
          lineHeight: 1,
          letterSpacing: -6,
          color,
          fontVariantNumeric: "tabular-nums",
          transform: `scale(${first ? 1 + 0.25 * (1 - ramp(t, 0, 0.35)) : 1 + 0.06 * (1 - landed) * (landed > 0 ? 1 : 0)})`,
          textShadow: `0 0 60px ${neg ? "rgba(255,46,91,0.55)" : "rgba(225,29,72,0.45)"}, 0 10px 30px rgba(0,0,0,0.6)`,
        }}
      >
        {countUp(b.value ?? "", k)}
      </div>
      {b.label && (
        <div style={{ position: "absolute", top: 760, left: 0, right: 0, textAlign: "center", fontFamily: F.label, fontWeight: 700, fontSize: 36, letterSpacing: 8, color: C.muted, opacity: ramp(t, a + 0.5, a + 0.9) }}>
          {b.label}
        </div>
      )}
      {first ? (
        <Karaoke b={b} size={92} mode="light" style={{ position: "absolute", top: 1010, left: 90, right: 130 }} />
      ) : (
        <Captions b={b} y={1060} size={84} />
      )}
    </AbsoluteFill>
  );
};

/** Bubble k of a chat beat appears at start + k/n of the spoken line (score.py uses the same timing). */
export const bubbleTime = (b: Beat, k: number) => b.start + ((b.end - b.start) * k) / (b.msgs?.length ?? 1);

/** Text-message thread. Consecutive chat beats share one thread, so the story builds up. */
export const Chat: React.FC<P & { tl: Timeline }> = ({ b, tl }) => {
  const t = useT();
  const i = tl.beats.indexOf(b);
  let s = i;
  while (s > 0 && tl.beats[s - 1].layout === "chat") s--;
  const thread = tl.beats.slice(s, i + 1);
  const contact = thread.find((x) => x.contact)?.contact ?? "Co-founder";
  const bubbles = thread.flatMap((x) => (x.msgs ?? []).map(([who, text], k) => ({ who, text, at: bubbleTime(x, k) }))).filter((m) => t >= m.at - 0.05);
  const shown = bubbles.slice(-6);
  const typing = (b.msgs ?? []).some(([who], k) => who === "them" && t < bubbleTime(b, k) - 0.05 && t > bubbleTime(b, k) - 0.6);
  return (
    <AbsoluteFill>
      <Backdrop glow={0.35} y={40} />
      <div
        style={{
          position: "absolute",
          top: 200,
          left: 70,
          right: 120,
          height: 860,
          borderRadius: 48,
          background: "rgba(16,16,20,0.92)",
          border: `2px solid ${C.line}`,
          boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "26px 34px", borderBottom: `2px solid ${C.line}` }}>
          <div style={{ width: 64, height: 64, borderRadius: 32, background: "linear-gradient(135deg,#3A3A44,#1C1C22)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.head, fontSize: 30, color: C.white }}>
            {contact[0]}
          </div>
          <div>
            <div style={{ fontFamily: F.text, fontWeight: 700, fontSize: 32, color: C.white }}>{contact}</div>
            <div style={{ fontFamily: F.text, fontWeight: 500, fontSize: 22, color: typing ? C.red : C.muted }}>{typing ? "typing…" : "online"}</div>
          </div>
        </div>
        <div style={{ position: "absolute", left: 30, right: 30, bottom: 34, display: "flex", flexDirection: "column", gap: 16 }}>
          {shown.map((m, k) => {
            const p = pop(t, m.at - 0.05, 0.4);
            const me = m.who === "me";
            return (
              <div key={`${m.at}-${k}`} style={{ display: "flex", justifyContent: me ? "flex-end" : "flex-start" }}>
                <div
                  style={{
                    maxWidth: "78%",
                    padding: "20px 30px",
                    borderRadius: 34,
                    borderBottomRightRadius: me ? 10 : 34,
                    borderBottomLeftRadius: me ? 34 : 10,
                    background: me ? C.red : "#2A2A31",
                    fontFamily: F.text,
                    fontWeight: 600,
                    fontSize: 40,
                    lineHeight: 1.2,
                    color: C.white,
                    transform: `scale(${0.6 + 0.4 * p})`,
                    transformOrigin: me ? "100% 100%" : "0% 100%",
                    opacity: Math.min(1, p * 2),
                  }}
                >
                  {m.text}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Captions b={b} y={1150} size={80} />
    </AbsoluteFill>
  );
};

const SideCard: React.FC<{ side: Side; good: boolean; at: number }> = ({ side, good, at }) => {
  const t = useT();
  const p = pop(t, at, 0.5);
  return (
    <div
      style={{
        padding: "44px 48px 52px",
        borderRadius: 40,
        background: good ? "rgba(225,29,72,0.16)" : "rgba(255,255,255,0.05)",
        border: `3px solid ${good ? C.red : C.line}`,
        boxShadow: good ? "0 0 60px rgba(225,29,72,0.35)" : "none",
        opacity: Math.min(1, p * 1.6),
        transform: `translateY(${(1 - p) * 50}px) scale(${0.92 + 0.08 * p})`,
      }}
    >
      <div style={{ fontFamily: F.label, fontWeight: 700, fontSize: 34, letterSpacing: 6, color: good ? C.redHot : C.muted }}>{side.label}</div>
      <div style={{ fontFamily: F.head, fontSize: side.value.length > 18 ? 84 : 112, lineHeight: 1.05, color: good ? C.white : "rgba(255,255,255,0.72)", marginTop: 16 }}>
        {side.value}
      </div>
    </div>
  );
};

/** This vs that: the weak option first, the strong one lands mid-line. */
export const Versus: React.FC<P> = ({ b }) => {
  const t = useT();
  const splitAt = b.words[b.split ?? Math.floor(b.words.length / 2)]?.t ?? b.start + 1;
  const pv = pop(t, splitAt - 0.25, 0.4);
  return (
    <AbsoluteFill>
      <Backdrop glow={0.5} y={45} />
      <div style={{ position: "absolute", top: 290, left: 80, right: 130, display: "flex", flexDirection: "column", gap: 0 }}>
        {b.left && <SideCard side={b.left} good={false} at={b.from + 0.05} />}
        <div style={{ display: "flex", justifyContent: "center", margin: "-6px 0", zIndex: 2, opacity: Math.min(1, pv * 1.5) }}>
          <div style={{ width: 96, height: 96, borderRadius: 48, background: C.bg, border: `3px solid ${C.red}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.head, fontSize: 36, color: C.white, transform: `scale(${pv})` }}>
            VS
          </div>
        </div>
        {b.right && <SideCard side={b.right} good at={splitAt - 0.1} />}
      </div>
      <Captions b={b} y={1150} size={80} />
    </AbsoluteFill>
  );
};

/** End card: the line, who's talking, then one plain action (follow / save / send). No pitching. */
export const Cta: React.FC<P> = ({ b }) => {
  const t = useT();
  const pa = pop(t, b.from + 0.1, 0.6);
  const pk = pop(t, b.start + 0.35, 0.55);
  const pulse = 1 + 0.03 * Math.sin(Math.max(0, t - b.end) * 6) * ramp(t, b.end, b.end + 0.5);
  return (
    <AbsoluteFill>
      <Backdrop glow={0.75} y={48} />
      <Karaoke b={b} size={80} mode="rise" style={{ position: "absolute", top: 230, left: 90, right: 130 }} />
      <div style={{ position: "absolute", top: 520, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", opacity: Math.min(1, pa * 1.4), transform: `translateY(${(1 - pa) * 30}px)` }}>
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
      <div style={{ position: "absolute", top: 1080, left: 0, right: 50, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        <div
          style={{
            padding: "26px 90px",
            borderRadius: 999,
            background: C.red,
            boxShadow: "0 0 60px rgba(225,29,72,0.55)",
            fontFamily: F.head,
            fontSize: 64,
            letterSpacing: 2,
            color: C.white,
            opacity: Math.min(1, pk * 1.5),
            transform: `scale(${(0.8 + 0.2 * pk) * pulse})`,
          }}
        >
          {b.action ?? "FOLLOW"}
        </div>
        {b.sub && <div style={{ fontFamily: F.label, fontWeight: 700, fontSize: 32, letterSpacing: 3, color: C.white, opacity: ramp(t, b.start + 0.6, b.start + 1.0) }}>{b.sub}</div>}
      </div>
    </AbsoluteFill>
  );
};
