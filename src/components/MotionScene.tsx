import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  Sparkles,
  Lightbulb,
  TrendingUp,
  Target,
  CheckCircle,
  Flame,
  Heart,
  Users,
  Shield,
  BookOpen,
  Layers,
  Cpu,
  Zap,
  Award,
  Rocket,
  Star,
  MessageCircle,
  Globe,
  ArrowRight,
  Play,
  Clock,
  DollarSign,
  BarChart3,
  Brain,
  Eye,
  ThumbsUp,
  Calendar,
  type LucideIcon,
} from "lucide-react";
import {
  Brand,
  MotionKind,
  MotionLayout,
  MotionScene as MotionSceneType,
  MotionStyleConfig,
  MotionVideo,
} from "../types";
import { motionStyleFromPreset } from "../utils";

export const MOTION_FPS = 30;
export const MOTION_SCENE_FRAMES = 105; // 3.5s per scene
export const MOTION_TRANSITION_FRAMES = 15; // 0.5s cross-fade

export const motionDuration = (sceneCount: number) =>
  Math.max(
    1,
    sceneCount * MOTION_SCENE_FRAMES - (sceneCount - 1) * MOTION_TRANSITION_FRAMES,
  );

const ICONS: Record<string, LucideIcon> = {
  Sparkles, Lightbulb, TrendingUp, Target, CheckCircle, Flame, Heart, Users,
  Shield, BookOpen, Layers, Cpu, Zap, Award, Rocket, Star, MessageCircle, Globe,
  ArrowRight, Play, Clock, DollarSign, BarChart3, Brain, Eye, ThumbsUp, Calendar,
};

export function resolveMotionStyle(
  video: MotionVideo,
  brand: Brand | undefined,
): MotionStyleConfig {
  const base = motionStyleFromPreset(video.theme, brand);
  const withFonts: MotionStyleConfig = {
    ...base,
    fontHeading: video.fontHeading || base.fontHeading,
    fontBody: video.fontBody || base.fontBody,
  };
  return { ...withFonts, ...(video.style || {}) };
}

type Colors = Pick<
  MotionStyleConfig,
  "textColor" | "primaryColor" | "accentColor" | "background"
>;

function tokenContent(token: string, colors: Colors) {
  const bold = token.startsWith("**") && token.endsWith("**");
  const pill = token.startsWith("{") && token.endsWith("}");
  const clean = bold ? token.slice(2, -2) : pill ? token.slice(1, -1) : token;
  if (pill) {
    return (
      <span
        style={{
          display: "inline-block",
          padding: "0.06em 0.28em",
          borderRadius: "0.18em",
          background: colors.primaryColor,
          color: "#fff",
        }}
      >
        {clean}
      </span>
    );
  }
  return <span style={{ color: bold ? colors.primaryColor : colors.textColor }}>{clean}</span>;
}

const Token: React.FC<{
  token: string;
  index: number;
  frame: number;
  fps: number;
  delay: number;
  motion: MotionKind;
  colors: Colors;
}> = ({ token, index, frame, fps, delay, motion, colors }) => {
  const start = delay + index * 3;
  const p = spring({
    frame: frame - start,
    fps,
    config: { damping: 200, stiffness: 120, mass: 0.6 },
  });
  const opacity = interpolate(p, [0, 0.5], [0, 1], { extrapolateRight: "clamp" });

  if (motion === "mask") {
    const y = interpolate(p, [0, 1], [110, 0]);
    return (
      <span
        style={{
          display: "inline-block",
          overflow: "hidden",
          verticalAlign: "bottom",
          paddingBottom: "0.1em",
          marginRight: "0.26em",
        }}
      >
        <span style={{ display: "inline-block", transform: `translateY(${y}%)`, opacity }}>
          {tokenContent(token, colors)}
        </span>
      </span>
    );
  }

  let transform = "none";
  let filter: string | undefined;
  if (motion === "pop") {
    transform = `scale(${interpolate(p, [0, 1], [0, 1])})`;
  } else if (motion === "slide") {
    transform = `translateX(${interpolate(p, [0, 1], [-70, 0])}px)`;
  } else if (motion === "blur") {
    transform = `translateY(${interpolate(p, [0, 1], [22, 0])}px)`;
    filter = `blur(${interpolate(p, [0, 1], [14, 0])}px)`;
  }
  return (
    <span
      style={{
        display: "inline-block",
        marginRight: "0.26em",
        transform,
        opacity,
        filter,
      }}
    >
      {tokenContent(token, colors)}
    </span>
  );
};

const AnimatedLine: React.FC<{
  text: string;
  baseDelay: number;
  motion: MotionKind;
  frame: number;
  fps: number;
  colors: Colors;
  className?: string;
  style?: React.CSSProperties;
}> = ({ text, baseDelay, motion, frame, fps, colors, className, style }) => {
  const tokens = text.split(/\s+/).filter(Boolean);

  if (motion === "typewriter") {
    return (
      <div className={className} style={style}>
        {tokens.map((t, i) => {
          const appearAt = baseDelay + i * 4;
          return (
            <span
              key={i}
              style={{ opacity: frame >= appearAt ? 1 : 0, marginRight: "0.26em" }}
            >
              {tokenContent(t, colors)}
            </span>
          );
        })}
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      {tokens.map((t, i) => (
        <Token
          key={i}
          token={t}
          index={i}
          frame={frame}
          fps={fps}
          delay={baseDelay}
          motion={motion}
          colors={colors}
        />
      ))}
    </div>
  );
};

function Background({
  style,
  colors,
  frame,
}: {
  style: MotionStyleConfig;
  colors: Colors;
  frame: number;
}) {
  const drift = interpolate(frame, [0, MOTION_SCENE_FRAMES], [0.85, 1.15]);
  const base = { position: "absolute" as const, inset: 0 };

  if (style.backgroundStyle === "image" && style.backgroundImage) {
    return (
      <>
        <div
          style={{
            ...base,
            backgroundImage: `url(${style.backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div style={{ ...base, background: "rgba(0,0,0,0.45)" }} />
      </>
    );
  }

  if (style.backgroundStyle === "grid") {
    return (
      <>
        <div style={{ ...base, background: style.background }} />
        <div
          style={{
            ...base,
            backgroundImage: `linear-gradient(${colors.textColor}22 1px, transparent 1px), linear-gradient(90deg, ${colors.textColor}22 1px, transparent 1px)`,
            backgroundSize: "72px 72px",
          }}
        />
      </>
    );
  }

  if (style.backgroundStyle === "mesh" || style.backgroundStyle === "gradient") {
    const bg =
      style.backgroundStyle === "gradient" && !style.background.includes("gradient")
        ? `linear-gradient(135deg, ${colors.primaryColor}, ${colors.accentColor})`
        : style.background;
    return (
      <>
        <div style={{ ...base, background: bg }} />
        {style.backgroundStyle === "mesh" && (
          <>
            <div
              style={{
                position: "absolute",
                width: "75%",
                height: "75%",
                top: "-20%",
                right: "-20%",
                borderRadius: "50%",
                background: colors.primaryColor,
                opacity: 0.3,
                filter: "blur(100px)",
                transform: `scale(${drift})`,
              }}
            />
            <div
              style={{
                position: "absolute",
                width: "65%",
                height: "65%",
                bottom: "-18%",
                left: "-18%",
                borderRadius: "50%",
                background: colors.accentColor,
                opacity: 0.3,
                filter: "blur(100px)",
                transform: `scale(${2 - drift})`,
              }}
            />
          </>
        )}
      </>
    );
  }

  return <div style={{ ...base, background: style.background }} />;
}

export interface MotionSceneProps {
  video: MotionVideo;
  brand: Brand;
  scene: MotionSceneType;
  sceneIndex: number;
  totalScenes: number;
}

export const MotionScene: React.FC<MotionSceneProps> = ({
  video,
  brand,
  scene,
  sceneIndex,
  totalScenes,
}) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const style = resolveMotionStyle(video, brand);
  const colors: Colors = {
    textColor: style.textColor,
    primaryColor: style.primaryColor,
    accentColor: style.accentColor,
    background: style.background,
  };

  const layout: MotionLayout = scene.layout || style.layout || "center";
  const rawMotion: MotionKind = scene.motion || style.motion || "mask";
  const motion: MotionKind = rawMotion === "zoom" ? "pop" : rawMotion;

  const Icon = scene.icon ? ICONS[scene.icon] : undefined;
  const align = layout === "left" ? "left" : "center";
  const itemsAlign = layout === "left" ? "flex-start" : "center";

  const pad = width * 0.08;
  const headlineSize = width * (layout === "big" ? 0.135 : 0.1);
  const subtextSize = width * 0.038;
  const iconSize = width * 0.08;
  const footerSize = width * 0.03;

  const zoomProgress =
    rawMotion === "zoom"
      ? spring({ frame, fps, config: { damping: 200, stiffness: 90 } })
      : 1;
  const iconProgress = spring({
    frame: frame - 6,
    fps,
    config: { damping: 14, stiffness: 120 },
  });
  const subtextProgress = spring({
    frame: frame - 22,
    fps,
    config: { damping: 200, stiffness: 100 },
  });

  const headlineStyle: React.CSSProperties = {
    fontSize: headlineSize,
    lineHeight: 1.05,
    fontWeight: 900,
    letterSpacing: "-0.02em",
    textTransform: layout === "big" ? "uppercase" : "none",
    textAlign: align,
    maxWidth: layout === "big" ? "100%" : "16ch",
    fontFamily: style.fontHeading,
  };

  const lines = scene.text.split("\n").filter((l) => l.trim() !== "");

  return (
    <AbsoluteFill
      className="motion-root"
      style={{
        color: colors.textColor,
        fontFamily: style.fontHeading,
        justifyContent: "center",
        padding: pad,
        overflow: "hidden",
      }}
    >
      <Background style={style} colors={colors} frame={frame} />
      {style.customCss && <style>{style.customCss}</style>}

      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: itemsAlign,
          transform: `scale(${interpolate(zoomProgress, [0, 1], [0.85, 1])})`,
          opacity: interpolate(zoomProgress, [0, 0.4], [0, 1], {
            extrapolateRight: "clamp",
          }),
        }}
      >
        {Icon && layout !== "big" && (
          <div
            className="motion-icon"
            style={{
              display: "inline-flex",
              padding: width * 0.018,
              borderRadius: width * 0.03,
              background: `${colors.primaryColor}22`,
              border: `2px solid ${colors.primaryColor}55`,
              marginBottom: width * 0.03,
              transform: `scale(${iconProgress}) rotate(${interpolate(
                iconProgress,
                [0, 1],
                [-18, 0],
              )}deg)`,
            }}
          >
            <Icon size={iconSize} color={colors.primaryColor} strokeWidth={2.4} />
          </div>
        )}

        {layout === "list" ? (
          <div style={{ width: "100%" }}>
            {lines.map((line, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: width * 0.025,
                  marginBottom: width * 0.03,
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    width: headlineSize * 0.7,
                    height: headlineSize * 0.7,
                    borderRadius: "50%",
                    background: colors.primaryColor,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: headlineSize * 0.4,
                    transform: `scale(${spring({
                      frame: frame - (4 + i * 6),
                      fps,
                      config: { damping: 12, stiffness: 140 },
                    })})`,
                  }}
                >
                  {i + 1}
                </span>
                <AnimatedLine
                  text={line}
                  baseDelay={4 + i * 6}
                  motion={motion}
                  frame={frame}
                  fps={fps}
                  colors={colors}
                  className="motion-headline"
                  style={{
                    ...headlineStyle,
                    maxWidth: "100%",
                    textAlign: "left",
                    fontSize: headlineSize * 0.72,
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          lines.map((line, i) => (
            <AnimatedLine
              key={i}
              text={line}
              baseDelay={4 + i * 8}
              motion={motion}
              frame={frame}
              fps={fps}
              colors={colors}
              className="motion-headline"
              style={{ ...headlineStyle, textAlign: align }}
            />
          ))
        )}

        {scene.subtext && (
          <div
            className="motion-subtext"
            style={{
              marginTop: width * 0.03,
              fontSize: subtextSize,
              fontWeight: 500,
              fontFamily: style.fontBody,
              maxWidth: "24ch",
              textAlign: align,
              opacity: subtextProgress,
              transform: `translateY(${interpolate(subtextProgress, [0, 1], [24, 0])}px)`,
              color: colors.textColor,
            }}
          >
            {scene.subtext}
          </div>
        )}
      </div>

      <div
        className="motion-footer"
        style={{
          position: "absolute",
          left: pad,
          right: pad,
          bottom: width * 0.05,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: style.fontBody,
          fontSize: footerSize,
          zIndex: 2,
        }}
      >
        <span style={{ fontWeight: 700, opacity: 0.7 }}>{brand.handle}</span>
        <div style={{ display: "flex", alignItems: "center", gap: width * 0.015 }}>
          <div
            style={{
              width: width * 0.11,
              height: Math.max(4, width * 0.005),
              borderRadius: 999,
              background: `${colors.textColor}22`,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${((sceneIndex + 1) / totalScenes) * 100}%`,
                background: colors.primaryColor,
                borderRadius: 999,
              }}
            />
          </div>
          <span style={{ fontWeight: 700, opacity: 0.7 }}>
            {String(sceneIndex + 1).padStart(2, "0")}/
            {String(totalScenes).padStart(2, "0")}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default MotionScene;
