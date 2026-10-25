# Instagram Playbook: Hassan Khan

**The goal isn't followers. It's invitations.** Every reel has to make one of these people think "we should get him":
a university society president, an event organiser, an incubator manager, a conference curator.
They book speakers who are (1) clearly an expert on something, (2) visibly good on a stage, and
(3) easy to reach. So every reel shows at least one of those three things, and the account as a whole shows all three.

---

## 1. Positioning (one line, used everywhere)

> **I teach what universities don't: how startups really get funded, built, and broken.**

Two lanes, both yours already. Lead with the first; the second makes you rarer than "another startup guy":
- **Startups & founders** (Cohort Zero): fundraising, decisions, Pakistani startup stories. *Main lane, ~70%.*
- **Deep tech & AI** (Nexaura research): what AI actually changes for builders, explained simply. *~30%.*

**Tone rule: you're the one being booked, not the one asking.** Never "please invite me" or "happy to
come for free". State availability like a speaker with a calendar: *"Bookings for next semester are open."*

### Bio (≤150 chars)
```
Hassan Khan
Founder & Chairman @cohortzero
Startups · Deep tech · Speaker & researcher
🎤 Speaking bookings ↓
```
Link in bio → a one-page **speaker kit**: photo, 4 talk titles, past sessions, contact form/WhatsApp.
(I can build this page for you next.)

### Highlights (make these on day 1)
`🎤 Speaking` (every stage photo/video you have) · `Cohort Zero` · `Research` · `Book me`

---

## 2. Why reels without a camera still work

The algorithm doesn't reward a face. It rewards **watch time, rewatches, shares (sends), and saves**.
Kinetic-text reels with a strong voice and a real photo of you win on all four, provided:

1. **Text on frame 1.** The hook is readable before the voice even starts. No logo intros, ever.
2. **20–35 seconds.** Short enough that people finish it, and finishing is what pushes a reel out.
3. **A list or a twist.** Lists get saved, twists get rewatched. Reel 01 has both.
4. **Your face appears.** Hook photo + stage photo + end card. People follow people, not fonts.
5. **One action at the end.** A comment keyword ("Comment TALK"). Comments are the strongest
   signal, and each one is a lead you can DM.

---

## 3. Five reel formats (rotate them)

| # | Format | What it does for you | Engine layouts |
|---|---|---|---|
| A | **Contrarian list**: "Investors don't fund ideas" | Expertise, saves | face → title → number ×3 → title → photo → cta |
| B | **Founders' File**: 30s case study of a real company (Careem's exit, Airlift's collapse, Theranos) | Expertise, shares. Pakistani stories travel far in PK | face → title → photo/title beats → cta |
| C | **Stage proof**: 20s from a real session you gave | **Proves you can hold a room.** This is what organisers book | photo beats + captions → cta |
| D | **Opportunity radar**: "5 fellowships closing this month" | Massive saves/sends from students, so it grows fastest | title → number ×5 → cta |
| E | **Talking head** (later, once a week): phone + window light is enough | Trust, warmth | real video + engine captions |

**Format C needs one habit:** at every session you do, ask someone to record 3–4 clips of you on
their phone (30 s each, vertical). That footage is worth more than any studio.

---

## 4. Cadence: first 8 weeks

- **4 reels / week**: Mon (A), Wed (B), Fri (D), Sun (C or A).
- Post **8–10 pm PKT** (your audience is students and young founders in Pakistan).
- Every reel: **Collab with @cohortzero** (shows it to both audiences at once; the best cold-start
  trick for a new account) and use **Trial reels** for experimental hooks.
- First 60 minutes after posting: reply to every comment, DM every keyword commenter.
- Every week, send 5 society presidents / event leads your best reel with one line:
  *"This is the session I'm running at universities this semester. [Society] should host it."*
  The reel is your portfolio. Every session becomes stage footage, which brings the next invite.

### What to measure (Insights → each reel)
- **Hold at 3 s > 65%**: the hook works. If not, rewrite only the first line.
- **Average watch > 50%** of length.
- **Sends + saves per 1,000 reach**: the real virality signal.
- Ignore follower count for the first month.

---

## 5. Hook bank (ready to turn into reels)

1. Investors don't fund ideas. *(Reel 01, done)*
2. Your university will never teach you this about money.
3. Careem sold for $3.1 billion. Here's the decision that made it possible.
4. Airlift raised $85 million and shut down in 2 years. Here's the mistake.
5. 5 fellowships that pay you to build a startup (closing soon).
6. Stop asking for a co-founder. Ask this instead.
7. Your pitch deck has 10 slides. Investors read 3.
8. AI won't replace founders. It'll replace founders who do this.
10. I've watched founders pitch. The ones who win all do one thing in the first 30 seconds.
11. "Equity" explained in 30 seconds, so you don't give away your company.
12. What I tell every student before their first startup competition.

Check every number against a public source before posting (the Cohort Zero tone rule: facts, not fluff).

---

## 6. Making a reel (the engine)

Everything lives in this folder:
```
reels/<slug>.json        ← the script: one line of voice per beat + which layout to show
engine/                  ← Remotion project (renders the video)
out/<slug>.mp4           ← finished reel, upload straight to Instagram
```

**New reel = copy a script, edit the lines, run two commands:**
```bash
cd D:/hassaninsta/engine && python scripts/build_audio.py 02_my_new_reel
```
```bash
cd D:/hassaninsta/engine && node scripts/render.mjs 02_my_new_reel
```
Preview and tweak live with `npx remotion studio src/index.ts` (in `engine/`).

**Script fields per beat:** `id`, `gap` (pause before the line, in seconds; pauses are drama),
`layout` (`face` / `title` / `number` / `photo` / `cta`), `text` (spoken + shown), `em` (words to
highlight yellow), plus `photo`, `kicker`, `num`, `label`, `chip` depending on layout.
New photos go in `engine/public/photos/`.

### Easiest: let GitHub render it
Push a new `reels/<slug>.json` to https://github.com/hassankhan2510/personalinsta and the
**Render reels** workflow clones your voice, renders, and commits `out/<slug>.mp4` back (see README).

### Your cloned voice (Chatterbox, MIT, CPU, no account needed)
`build_audio.py` clones your voice from `voice/me.wav` (a 19 s sample) for every line, automatically.
Each cloned line is cached in `reels/<slug>/.clone/`, so editing one line only re-clones that line.
If the clone can't run, the script says so and falls back to the stock voice, so a build never fails silently.
For a better clone, replace `voice/me.wav` with 10–20 s of you speaking in your **reel voice**
(energetic, close to the mic, quiet room, no music).
To fix one line by hand, drop a recording at `reels/<slug>/voice/<beat id>.wav`; it overrides the clone for that beat.

Music is synthesised from scratch for every reel (no samples), so Instagram never mutes or claims it.
If you'd rather ride a trending sound, upload the reel and add the trending audio in Instagram at ~5–10% volume.
