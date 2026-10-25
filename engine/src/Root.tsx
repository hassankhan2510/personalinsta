import { Composition, staticFile } from "remotion";
import { Reel } from "./Reel";
import { FPS, H, Timeline, W } from "./theme";

/** One composition for every reel: pick it with --props='{"slug":"..."}'. */
export const RemotionRoot: React.FC = () => (
  <Composition
    id="Reel"
    component={Reel}
    fps={FPS}
    width={W}
    height={H}
    durationInFrames={FPS * 30}
    defaultProps={{ slug: "01_investors_dont_fund_ideas" } as { slug: string; tl?: Timeline }}
    calculateMetadata={async ({ props }) => {
      const tl: Timeline = await fetch(staticFile(`reels/${props.slug}/timeline.json`)).then((r) => r.json());
      return { durationInFrames: Math.ceil(tl.total * FPS), props: { ...props, tl } };
    }}
  />
);
