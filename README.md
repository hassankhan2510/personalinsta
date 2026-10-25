# personalinsta

Instagram reels for Hassan Khan's personal brand, generated from short text scripts.
GitHub Actions does the heavy lifting: clones the voice, composes the music, renders the video,
and commits the finished MP4 back to `out/`.

## Make a reel

1. Copy any `reels/*.json` to `reels/08_your_topic.json` and edit the lines.
2. Commit and push. That's it.
3. The video appears in [`out/`](out/) (and as a download on the Actions run).

**It's a queue.** Every run renders ONE reel: the first script without a video in `out/`.
Runs happen on every push and **every hour** (`:17`), so a batch of scripts finishes overnight, one per hour.
- Re-render a reel: delete its `out/<slug>.mp4`, or **Actions → Render reels → Run workflow** with its slug.
- A reel that fails is added to `out/FAILED.txt` and skipped; the error is on the run page. Remove the line to retry.
- Pick `stock` voice when running by hand for a fast preview.

Layouts: `face` · `title` · `number` · `photo` (+`big`) · `stat` (counting number) · `chat` (text bubbles) · `versus` · `cta`.

## What's where

| Path | What |
|---|---|
| `reels/<slug>.json` | The script: one spoken line per beat + which layout to show |
| `reels/<slug>_POST.md` | Caption, hashtags, posting checklist |
| `voice/me.wav` | Voice sample the clone copies (10–20 s, clear, no music) |
| `engine/` | Remotion project + audio scripts |
| `out/<slug>.mp4` | Finished reels, 1080×1920, ready to upload |
| `PLAYBOOK.md` | Content strategy |

## Script format

```json
{ "id": "n1", "gap": 0.4, "layout": "number", "num": "01", "label": "SPEED",
  "text": "One. Speed. What did you ship in the last thirty days?", "em": ["ship"] }
```

- `gap`: seconds of silence before the line (pauses are drama)
- `layout`: `face` (hook over portrait) · `title` (big statement) · `number` (list item) · `photo` (full-bleed photo) · `cta` (end card)
- `em`: words highlighted in yellow
- extras by layout: `photo`, `kicker`, `num`, `label`, `chip`, `sub`

## Local (optional)

```bash
cd engine && python scripts/build_audio.py 01_investors_dont_fund_ideas && node scripts/render.mjs 01_investors_dont_fund_ideas
```

Fonts are Inter and Barlow (SIL Open Font License, see `engine/public/fonts/OFL-*.txt`).
Voice clone: [Chatterbox](https://github.com/resemble-ai/chatterbox) (MIT). Music is synthesised from scratch, so it's copyright-free.
