import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Carousel, Brand } from "../src/types";
import { SlideCanvas } from "../src/components/SlideCanvas";
import { getCanvasDimensions } from "../src/utils";
import { FontLoader } from "./FontLoader";
import "../src/index.css";

export interface CarouselVideoProps {
  carousel: Carousel;
  brand: Brand;
}

export const FPS = 30;
export const SLIDE_FRAMES = 90; // 3s per slide
export const TRANSITION_FRAMES = 15; // 0.5s cross-fade

export const calcDuration = (slideCount: number) =>
  Math.max(1, slideCount * SLIDE_FRAMES - (slideCount - 1) * TRANSITION_FRAMES);

export const CarouselVideo: React.FC<CarouselVideoProps> = ({
  carousel,
  brand,
}) => {
  const { width } = useVideoConfig();
  const base = getCanvasDimensions(carousel);
  const scale = width / base.width;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <FontLoader fonts={[carousel.fontHeading, carousel.fontBody]} />
      <div
        style={{
          width: base.width,
          height: base.height,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <TransitionSeries>
          {carousel.slides.map((slide, i) => (
            <React.Fragment key={slide.id}>
              {i > 0 && (
                <TransitionSeries.Transition
                  presentation={fade()}
                  timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
                />
              )}
              <TransitionSeries.Sequence durationInFrames={SLIDE_FRAMES}>
                <SlideCanvas
                  carousel={carousel}
                  brand={brand}
                  slide={slide}
                  index={i}
                  width={base.width}
                  height={base.height}
                />
              </TransitionSeries.Sequence>
            </React.Fragment>
          ))}
        </TransitionSeries>
      </div>
    </AbsoluteFill>
  );
};
