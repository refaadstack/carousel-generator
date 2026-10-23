import React from "react";
import { Composition } from "remotion";
import {
  CarouselVideo,
  CarouselVideoProps,
  calcDuration,
  FPS,
} from "./CarouselVideo";
import { MotionVideo, MotionVideoProps } from "./MotionVideo";
import { motionDuration } from "../src/components/MotionScene";
import {
  getVideoDimensions,
  INITIAL_BRANDS,
  INITIAL_CAROUSEL,
  INITIAL_MOTION_VIDEO,
} from "../src/utils";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CarouselVideo"
        component={CarouselVideo}
        durationInFrames={calcDuration(INITIAL_CAROUSEL.slides.length)}
        fps={FPS}
        width={1080}
        height={1350}
        defaultProps={
          {
            carousel: INITIAL_CAROUSEL,
            brand: INITIAL_BRANDS[0],
          } satisfies CarouselVideoProps
        }
        calculateMetadata={({ props }) => {
          const { width, height } = getVideoDimensions(props.carousel);
          return {
            width,
            height,
            fps: FPS,
            durationInFrames: calcDuration(props.carousel.slides.length),
          };
        }}
      />

      <Composition
        id="MotionVideo"
        component={MotionVideo}
        durationInFrames={motionDuration(INITIAL_MOTION_VIDEO.scenes.length)}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={
          {
            video: INITIAL_MOTION_VIDEO,
            brand: INITIAL_BRANDS[0],
          } satisfies MotionVideoProps
        }
        calculateMetadata={({ props }) => {
          const { width, height } = getVideoDimensions(props.video);
          return {
            width,
            height,
            fps: 30,
            durationInFrames: motionDuration(props.video.scenes.length),
          };
        }}
      />
    </>
  );
};
