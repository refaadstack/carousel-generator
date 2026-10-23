import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Brand, MotionVideo as MotionVideoType } from "../src/types";
import {
  MotionScene,
  MOTION_SCENE_FRAMES,
  MOTION_TRANSITION_FRAMES,
} from "../src/components/MotionScene";
import { FontLoader } from "./FontLoader";

export interface MotionVideoProps {
  video: MotionVideoType;
  brand: Brand;
  // Font sudah dimuat oleh app saat preview di browser; server render perlu FontLoader.
  skipFontLoader?: boolean;
}

export const MotionVideo: React.FC<MotionVideoProps> = ({
  video,
  brand,
  skipFontLoader,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {!skipFontLoader && (
        <FontLoader
          fonts={[
            video.style?.fontHeading || video.fontHeading,
            video.style?.fontBody || video.fontBody,
          ]}
        />
      )}
      <TransitionSeries>
        {video.scenes.map((scene, i) => (
          <React.Fragment key={scene.id}>
            {i > 0 && (
              <TransitionSeries.Transition
                presentation={fade()}
                timing={linearTiming({
                  durationInFrames: MOTION_TRANSITION_FRAMES,
                })}
              />
            )}
            <TransitionSeries.Sequence durationInFrames={MOTION_SCENE_FRAMES}>
              <MotionScene
                video={video}
                brand={brand}
                scene={scene}
                sceneIndex={i}
                totalScenes={video.scenes.length}
              />
            </TransitionSeries.Sequence>
          </React.Fragment>
        ))}
      </TransitionSeries>
    </AbsoluteFill>
  );
};

export default MotionVideo;
