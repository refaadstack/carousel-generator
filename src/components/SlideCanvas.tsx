import React from "react";
import { Carousel, Slide, Brand } from "../types";
import { TEMPLATE_PRESETS } from "../utils";
import {
  Sparkles,
  Lightbulb,
  TrendingUp,
  Target,
  Palette,
  MessageCircle,
  Award,
  CheckCircle,
  Flame,
  Heart,
  Users,
  Shield,
  BookOpen,
  Layers,
  Cpu,
  ArrowRight,
  HelpCircle,
  Megaphone,
  Smile,
  Zap,
  Globe,
  Share2,
  Bookmark,
  ExternalLink,
} from "lucide-react";

export const getSlideIcon = (
  iconName?: string,
  defaultIcon: React.ComponentType<any> = Sparkles,
) => {
  const iconsMap: Record<string, React.ComponentType<any>> = {
    Sparkles,
    Lightbulb,
    TrendingUp,
    Target,
    Palette,
    MessageCircle,
    Award,
    CheckCircle,
    Flame,
    Heart,
    Users,
    Shield,
    BookOpen,
    Layers,
    Cpu,
    ArrowRight,
    HelpCircle,
    Megaphone,
    Smile,
    Zap,
    Globe,
  };
  const IconComponent = iconName ? iconsMap[iconName] : null;
  return IconComponent || defaultIcon;
};

export const isThemeDark = (colors: { bg: string; text: string }) => {
  const textHex = colors.text.toLowerCase();
  if (
    textHex === "#ffffff" ||
    textHex === "#f8fafc" ||
    textHex === "#e4e4e7" ||
    textHex === "#f5f3ff" ||
    textHex === "#f9f5ff"
  ) {
    return true;
  }
  const bgHex = colors.bg.toLowerCase();
  if (
    bgHex.startsWith("linear-gradient") ||
    bgHex === "#090d16" ||
    bgHex === "#121214" ||
    bgHex === "#120d24"
  ) {
    return true;
  }
  return false;
};

export const renderFormattedText = (
  text: string,
  colors: { primary: string; secondary: string; accent: string; text: string },
  theme?: string,
) => {
  if (!text || text.trim() === "") return null;
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|\{[^}]+\})/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const clean = part.slice(2, -2);
      return (
        <span
          key={index}
          className="font-extrabold"
          style={{ color: colors.primary }}
        >
          {clean}
        </span>
      );
    } else if (part.startsWith("*") && part.endsWith("*")) {
      const clean = part.slice(1, -1);
      return (
        <span
          key={index}
          className="font-bold italic"
          style={{ color: colors.accent || colors.secondary }}
        >
          {clean}
        </span>
      );
    } else if (part.startsWith("{") && part.endsWith("}")) {
      const clean = part.slice(1, -1);
      const isBrutal = theme === "neobrutalism" || theme === "neo-grid";
      return (
        <span
          key={index}
          className={`mx-1 px-2 py-0.5 font-black inline-block align-middle rounded-md text-[0.95em] ${
            isBrutal
              ? "border-2 border-black bg-yellow-300 text-black shadow-[1.5px_1.5px_0px_#000]"
              : "text-white"
          }`}
          style={
            isBrutal
              ? undefined
              : {
                  backgroundColor: colors.primary,
                  textShadow: "none",
                }
          }
        >
          {clean}
        </span>
      );
    }
    return part;
  });
};

const getImageStyleClasses = (style?: string) => {
  switch (style) {
    case "rounded":
      return "rounded-2xl border border-black/10";
    case "circle":
      return "rounded-full border-2 border-black/20 aspect-square object-cover";
    case "square":
      return "rounded-none border border-black/10";
    case "neobrutalist":
    default:
      return "rounded-none border-2 border-black shadow-[3px_3px_0px_#000]";
  }
};

export const renderSlideImage = (
  slide: Slide,
  maxHeightClass = "max-h-[110px]",
  additionalClasses = "",
) => {
  if (!slide.showImage || !slide.imageUrl) return null;
  return (
    <img
      src={slide.imageUrl}
      className={`${maxHeightClass} w-auto object-cover ${getImageStyleClasses(slide.imageStyle)} ${additionalClasses}`}
      alt=""
      referrerPolicy="no-referrer"
    />
  );
};

export const renderSubtitle = (
  slide: Slide,
  colors: { primary: string; secondary: string; accent: string; text: string },
  theme: string,
  isExport: boolean = false,
  brandFont?: string,
  bodyFont?: string,
) => {
  if (!slide.subtitle || slide.subtitle.trim() === "") return null;

  const isThumbnail = slide.slideType === "thumbnail";
  const isQuote = slide.slideType === "quote";

  const defaultBg = isThumbnail ? "#facc15" : "transparent";
  const defaultTextColor = isThumbnail ? "#000000" : colors.primary;

  const styleOverride =
    slide.subtitleStyleOverride || (isThumbnail ? "badge" : "plain");

  let sizeStyle = slide.subtitleSizeOverride || undefined;
  if (!sizeStyle) {
    if (isThumbnail) {
      sizeStyle = isExport ? "text-xl" : "text-[11px]";
    } else {
      sizeStyle = isExport ? "text-lg" : "text-[10px]";
    }
  }

  let paddingClass = "";
  if (styleOverride !== "plain") {
    paddingClass = isExport ? "px-6 py-2" : "px-3 py-1";
  } else if (isQuote) {
    paddingClass = "mt-1 opacity-60 not-italic block";
  }

  let rotationStyle = undefined;
  if (slide.subtitleRotationOverride !== undefined) {
    rotationStyle = `rotate(${slide.subtitleRotationOverride}deg)`;
  } else if (isThumbnail) {
    rotationStyle = "rotate(1deg)";
  }

  let borderClass = "";
  let shadowStyle = "none";

  if (styleOverride === "badge") {
    borderClass = isExport
      ? "border-[3px] border-black shadow-[3px_3px_0px_#000]"
      : "border-2 border-black";
    const shadowSize = isExport ? "3px 3px 0px" : "1.5px 1.5px 0px";
    shadowStyle = `${shadowSize} ${slide.subtitleTextColorOverride || "#000000"}`;
  } else if (styleOverride === "clean-badge") {
    borderClass = "rounded-md border border-stone-200";
  } else if (styleOverride === "border") {
    borderClass = isExport
      ? "border-[3px] border-current rounded-lg"
      : "border-2 border-current rounded";
  }

  const mergedStyles: React.CSSProperties = {
    fontFamily:
      slide.subtitleFontOverride ||
      (slide.slideType === "intro" || isThumbnail ? brandFont : bodyFont),
    backgroundColor:
      styleOverride === "plain" || styleOverride === "border"
        ? "transparent"
        : slide.subtitleBgColorOverride || defaultBg,
    color: slide.subtitleTextColorOverride || defaultTextColor,
    borderColor: slide.subtitleTextColorOverride || undefined,
    transform: rotationStyle,
    boxShadow: shadowStyle,
    display: isQuote || styleOverride === "plain" ? "block" : "inline-block",
  };

  return (
    <span
      className={`font-black uppercase tracking-widest ${sizeStyle} ${paddingClass} ${borderClass}`}
      style={mergedStyles}
    >
      {isQuote ? "— " : ""}
      {renderFormattedText(slide.subtitle, colors, theme)}
    </span>
  );
};

export function getSlideColors(
  carousel: Carousel,
  brand: Brand | undefined,
  slide: Slide,
) {
  const activeTemplate =
    TEMPLATE_PRESETS.find((t) => t.theme === carousel.theme) ||
    TEMPLATE_PRESETS[0];
  const colorMode = carousel.colorMode || "brand";

  if (slide.backgroundColorOverride || slide.textColorOverride) {
    return {
      bg:
        slide.backgroundColorOverride ||
        (colorMode === "brand"
          ? brand?.backgroundColor || "#ffffff"
          : activeTemplate.colors.background),
      text:
        slide.textColorOverride ||
        (colorMode === "brand"
          ? brand?.textColor || "#000000"
          : activeTemplate.colors.text),
      primary: brand?.primaryColor || activeTemplate.colors.primary,
      secondary: brand?.secondaryColor || activeTemplate.colors.secondary,
      accent: brand?.accentColor || activeTemplate.colors.accent,
    };
  }

  if (colorMode === "brand" && brand) {
    return {
      bg: brand.backgroundColor || "#ffffff",
      text: brand.textColor || "#000000",
      primary: brand.primaryColor || "#3b82f6",
      secondary: brand.secondaryColor || "#10b981",
      accent: brand.accentColor || "#f59e0b",
    };
  }

  return {
    bg: activeTemplate.colors.background,
    text: activeTemplate.colors.text,
    primary: activeTemplate.colors.primary,
    secondary: activeTemplate.colors.secondary,
    accent: activeTemplate.colors.accent,
  };
}

export function getWatermarkText(brand: Brand, slide: Slide) {
  const type = slide.watermarkType || "social";
  if (type === "website") return brand.website || brand.handle;
  if (type === "both")
    return `${brand.handle}${brand.website ? ` • ${brand.website}` : ""}`;
  return brand.handle;
}

export const renderBackgroundGraphics = (
  theme: string,
  colors: any,
  isExport = false,
) => {
  const sizeFactor = isExport ? 3 : 1;
  switch (theme) {
    case "neo-grid":
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `
                linear-gradient(to right, ${colors.text} 1px, transparent 1px),
                linear-gradient(to bottom, ${colors.text} 1px, transparent 1px)
              `,
              backgroundSize: `${32 * sizeFactor}px ${32 * sizeFactor}px`,
            }}
          />
          <div
            className="absolute -bottom-[12%] -right-[12%] w-[45%] h-[45%] opacity-[0.14] rotate-[15deg]"
            style={{ color: colors.accent }}
          >
            <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
              <path d="M50 50 C40 30, 30 10, 45 5 C60 0, 55 20, 50 50 C60 30, 80 10, 85 20 C90 30, 70 40, 50 50 C60 60, 80 80, 75 85 C70 90, 60 70, 50 50 C40 60, 20 80, 15 75 C10 70, 30 60, 50 50 C30 60, 10 80, 5 70 C0 60, 20 50, 50 50 C30 40, 10 20, 20 15 C30 10, 40 30, 50 50 Z" />
            </svg>
          </div>
          <div
            className="absolute inset-4 border border-dashed opacity-[0.12]"
            style={{ borderColor: colors.text }}
          />
        </div>
      );
    case "neobrutalism":
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: `radial-gradient(${colors.text} 2px, transparent 2px)`,
              backgroundSize: `${24 * sizeFactor}px ${24 * sizeFactor}px`,
            }}
          />
          <div className="absolute inset-4 border-[3px] border-black pointer-events-none" />
          <div className="absolute top-[12%] right-[10%] w-7 h-7 rotate-12 bg-white border-2 border-black flex items-center justify-center font-black text-xs shadow-[2px_2px_0px_#000] text-black">
            ★
          </div>
          <div className="absolute bottom-[18%] left-[8%] px-2 py-0.5 -rotate-6 bg-yellow-300 border-2 border-black font-mono text-[9px] font-black shadow-[2px_2px_0px_#000] text-black">
            KONTEN
          </div>
        </div>
      );
    case "neon":
      return (
        <div className="absolute inset-0 pointer-events-none opacity-10 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(${colors.primary} 1px, transparent 1px)`,
              backgroundSize: `${24 * sizeFactor}px ${24 * sizeFactor}px`,
            }}
          />
          <div
            className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 rounded-full blur-3xl opacity-50"
            style={{ backgroundColor: colors.secondary }}
          />
          <div
            className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 rounded-full blur-3xl opacity-50"
            style={{ backgroundColor: colors.primary }}
          />
        </div>
      );
    case "gradient":
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full blur-[80px] opacity-20"
            style={{ backgroundColor: colors.primary }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] rounded-full blur-[70px] opacity-25"
            style={{ backgroundColor: colors.secondary }}
          />
        </div>
      );
    case "editorial":
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute inset-4 border border-dashed opacity-10"
            style={{ borderColor: colors.text }}
          />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(${colors.text} 1px, transparent 1px)`,
              backgroundSize: `${32 * sizeFactor}px ${32 * sizeFactor}px`,
            }}
          />
        </div>
      );
    case "playful":
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-15">
          <div
            className="absolute top-[15%] right-[10%] w-12 h-12 rounded-full border-4 border-dashed"
            style={{ borderColor: colors.primary }}
          />
          <div
            className="absolute bottom-[20%] left-[8%] w-16 h-4 rotate-45"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, ${colors.secondary}, ${colors.secondary} 4px, transparent 4px, transparent 8px)`,
            }}
          />
          <div
            className="absolute top-[45%] left-[5%] w-8 h-8 rounded-lg rotate-12 border-4"
            style={{ borderColor: colors.accent }}
          />
        </div>
      );
    case "dark":
      return (
        <div className="absolute inset-0 pointer-events-none opacity-[0.06] overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(${colors.text} 1px, transparent 1px)`,
              backgroundSize: `100% ${40 * sizeFactor}px`,
            }}
          />
        </div>
      );
    case "clean":
    default:
      return (
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(${colors.text} 1px, transparent 1px)`,
              backgroundSize: `${20 * sizeFactor}px ${20 * sizeFactor}px`,
            }}
          />
        </div>
      );
  }
};

export interface SlideCanvasProps {
  carousel: Carousel;
  brand: Brand;
  slide: Slide;
  index: number;
  width: number;
  height: number;
  className?: string;
  style?: React.CSSProperties;
}

export const SlideCanvas: React.FC<SlideCanvasProps> = ({
  carousel,
  brand,
  slide,
  index,
  width,
  height,
  className = "",
  style,
}) => {
  const colors = getSlideColors(carousel, brand, slide);
  const fontHeadingStyle =
    slide.slideType === "intro" ? carousel.fontHeading : carousel.fontBody;
  const showTopWatermark =
    !slide.hideProfileWatermark &&
    (slide.watermarkPosition === undefined ||
      slide.watermarkPosition === "top" ||
      slide.watermarkPosition === "both");
  const showBottomWatermark =
    !slide.hideProfileWatermark &&
    (slide.watermarkPosition === undefined ||
      slide.watermarkPosition === "bottom" ||
      slide.watermarkPosition === "both");

  return (
    <div
      className={`relative overflow-hidden flex flex-col justify-between ${
        carousel.theme === "neobrutalism" || carousel.theme === "neo-grid"
          ? "border-[4px] border-black rounded-none"
          : ""
      } ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        background: colors.bg,
        color: colors.text,
        fontFamily: fontHeadingStyle,
        boxSizing: "border-box",
        ...style,
      }}
    >
      {/* Background Image if position is background */}
      {slide.showImage &&
        slide.imageUrl &&
        slide.imagePosition === "background" && (
          <div className="absolute inset-0 z-0">
            <img
              src={slide.imageUrl}
              className="w-full h-full object-cover"
              alt=""
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/45 backdrop-blur-[0.5px]" />
          </div>
        )}

      {renderBackgroundGraphics(carousel.theme, colors, false)}

      {/* FLOATING BADGE/STICKER FEATURE */}
      {slide.badgeText && (
        <div
          className={`absolute top-16 right-5 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${
            carousel.theme === "neo-grid"
              ? "border border-black bg-orange-500 text-white shadow-[2px_2px_0px_#000] rounded-none"
              : "border-2 border-black rotate-6 bg-yellow-300 text-black shadow-[2px_2px_0px_#000]"
          } z-20`}
          style={slide.badgeColor ? { backgroundColor: slide.badgeColor } : undefined}
        >
          {slide.badgeText}
        </div>
      )}

      {/* SLIDE TOP HEADER: Brand profile */}
      {showTopWatermark && (
        <div className="px-5 pt-5 pb-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 flex items-center justify-center font-extrabold text-[10px] overflow-hidden shrink-0 ${
                carousel.theme === "neobrutalism"
                  ? "border-2 border-black rounded-none shadow-[1.5px_1.5px_0px_#000] bg-yellow-300 text-black"
                  : "rounded-full border shadow-sm"
              }`}
              style={
                carousel.theme !== "neobrutalism"
                  ? {
                      backgroundColor: colors.text,
                      color: colors.bg.startsWith("linear-gradient")
                        ? "#1A1A1A"
                        : colors.bg,
                      borderColor: colors.primary,
                    }
                  : undefined
              }
            >
              {brand.logoUrl ? (
                <img
                  src={brand.logoUrl}
                  className="w-full h-full object-cover"
                  alt={brand.name}
                  referrerPolicy="no-referrer"
                />
              ) : (
                brand.name.substring(0, 2).toUpperCase()
              )}
            </div>
            <div className="flex flex-col">
              <span
                className="text-[10px] font-bold tracking-tight uppercase"
                style={{ color: colors.text }}
              >
                {brand.name}
              </span>
              <span
                className="text-[8px] font-mono tracking-wider opacity-60"
                style={{ color: colors.text }}
              >
                {getWatermarkText(brand, slide)}
              </span>
            </div>
          </div>

          <div className="opacity-40">
            <Sparkles className="w-4 h-4" style={{ color: colors.primary }} />
          </div>
        </div>
      )}

      {/* SLIDE CONTENT AREA */}
      <div className="px-6 flex-1 flex flex-col justify-center z-10 space-y-4">
        <div
          className={`flex-1 flex w-full h-full ${
            slide.showImage &&
            slide.imageUrl &&
            (slide.imagePosition === "left" || slide.imagePosition === "right")
              ? "flex-row items-center justify-between gap-4"
              : "flex-col justify-center"
          }`}
        >
          {slide.showImage &&
            slide.imageUrl &&
            slide.imagePosition === "left" && (
              <div className="w-[40%] shrink-0 flex justify-center items-center select-none">
                {renderSlideImage(slide, "max-h-[160px]")}
              </div>
            )}

          <div
            className={`flex flex-col justify-center ${
              slide.showImage &&
              slide.imageUrl &&
              (slide.imagePosition === "left" || slide.imagePosition === "right")
                ? "w-[56%] shrink-0"
                : "w-full"
            } ${
              slide.slideType === "comparison" || slide.slideType === "qna"
                ? ""
                : slide.textAlignment === "center"
                  ? "items-center text-center"
                  : slide.textAlignment === "right"
                    ? "items-end text-right"
                    : "items-start text-left"
            }`}
          >
            {slide.showImage &&
              slide.imageUrl &&
              slide.imagePosition === "top" && (
                <div className="w-full flex justify-center mb-2.5 select-none">
                  {renderSlideImage(slide, "max-h-[90px]")}
                </div>
              )}

            {slide.slideType === "comparison" ? (
              (() => {
                const isDark = isThemeDark(colors);
                const emBg =
                  carousel.theme === "neobrutalism"
                    ? "border-black bg-emerald-50 shadow-[2px_2px_0px_#000]"
                    : isDark
                      ? "bg-emerald-500/10 border-emerald-500/30"
                      : "bg-emerald-50 border-emerald-500/30";
                const emHeader = isDark
                  ? "text-emerald-300 font-bold"
                  : "text-emerald-800";
                const emText = isDark ? "text-emerald-100" : "text-emerald-950";
                const roseBg =
                  carousel.theme === "neobrutalism"
                    ? "border-black bg-rose-50 shadow-[2px_2px_0px_#000]"
                    : isDark
                      ? "bg-rose-500/10 border-rose-500/30"
                      : "bg-rose-50 border-rose-500/30";
                const roseHeader = isDark
                  ? "text-rose-300 font-bold"
                  : "text-rose-800";
                const roseText = isDark ? "text-rose-100" : "text-rose-950";

                return (
                  <div className="space-y-3 w-full my-auto">
                    {slide.title && slide.title.trim() !== "" && (
                      <h3
                        className="text-base font-black tracking-tight leading-snug text-center mb-1"
                        style={{
                          fontFamily: slide.titleFontOverride || carousel.fontHeading,
                          color: slide.titleColorOverride || colors.text,
                          textTransform:
                            slide.titleStyleOverride === "none"
                              ? "none"
                              : slide.titleStyleOverride || undefined,
                        }}
                      >
                        {renderFormattedText(slide.title, colors, carousel.theme)}
                      </h3>
                    )}
                    <div className="grid grid-cols-2 gap-3 w-full">
                      <div className={`p-3 rounded-xl border-2 flex flex-col justify-between ${emBg}`}>
                        <div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                              ✓
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-wider ${emHeader}`}>
                              {slide.comparisonLeftTitle || "SEBELUM / DO"}
                            </span>
                          </div>
                          <ul className="space-y-1.5">
                            {(slide.comparisonLeftItems || []).filter((i) => i && i.trim() !== "").length > 0 ? (
                              (slide.comparisonLeftItems || [])
                                .filter((i) => i && i.trim() !== "")
                                .map((item, idx) => (
                                  <li
                                    key={idx}
                                    className={`text-[10px] font-medium leading-relaxed list-none flex items-start gap-1 ${emText}`}
                                    style={{
                                      fontFamily: slide.bodyFontOverride || carousel.fontBody,
                                      color: slide.bodyColorOverride || undefined,
                                    }}
                                  >
                                    <span className="text-emerald-500 font-bold shrink-0">•</span>
                                    <span>{renderFormattedText(item, colors, carousel.theme)}</span>
                                  </li>
                                ))
                            ) : (
                              <li className={`text-[10px] italic font-medium opacity-60 ${emText}`}>
                                Belum ada poin sebelum
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>

                      <div className={`p-3 rounded-xl border-2 flex flex-col justify-between ${roseBg}`}>
                        <div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                              ✕
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-wider ${roseHeader}`}>
                              {slide.comparisonRightTitle || "SESUDAH / DON'T"}
                            </span>
                          </div>
                          <ul className="space-y-1.5">
                            {(slide.comparisonRightItems || []).filter((i) => i && i.trim() !== "").length > 0 ? (
                              (slide.comparisonRightItems || [])
                                .filter((i) => i && i.trim() !== "")
                                .map((item, idx) => (
                                  <li
                                    key={idx}
                                    className={`text-[10px] font-medium leading-relaxed list-none flex items-start gap-1 ${roseText}`}
                                    style={{
                                      fontFamily: slide.bodyFontOverride || carousel.fontBody,
                                      color: slide.bodyColorOverride || undefined,
                                    }}
                                  >
                                    <span className="text-rose-500 font-bold shrink-0">•</span>
                                    <span>{renderFormattedText(item, colors, carousel.theme)}</span>
                                  </li>
                                ))
                            ) : (
                              <li className={`text-[10px] italic font-medium opacity-60 ${roseText}`}>
                                Belum ada poin sesudah
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : slide.slideType === "qna" ? (
              (() => {
                const isDark = isThemeDark(colors);
                const qnaQuestBg =
                  carousel.theme === "neobrutalism"
                    ? "bg-amber-100 border-2 border-black shadow-[3px_3px_0px_#000]"
                    : isDark
                      ? "bg-white/10 backdrop-blur-sm border border-white/10"
                      : "bg-amber-500/10 border border-amber-500/20";
                const qnaAnsBg =
                  carousel.theme === "neobrutalism"
                    ? "bg-sky-100 border-2 border-black shadow-[3px_3px_0px_#000]"
                    : isDark
                      ? "bg-indigo-500/10 border border-indigo-500/20"
                      : "bg-indigo-500/5 border border-indigo-500/15";

                return (
                  <div className="space-y-3 w-full my-auto">
                    {slide.title && slide.title.trim() !== "" && (
                      <h3
                        className="text-sm font-black uppercase tracking-wider text-center"
                        style={{
                          fontFamily: slide.titleFontOverride || carousel.fontHeading,
                          color: slide.titleColorOverride || colors.primary,
                          textTransform:
                            slide.titleStyleOverride === "none"
                              ? "none"
                              : slide.titleStyleOverride || "uppercase",
                        }}
                      >
                        {renderFormattedText(slide.title, colors, carousel.theme)}
                      </h3>
                    )}

                    <div className="space-y-3.5">
                      <div className={`p-3 rounded-2xl relative ${qnaQuestBg}`}>
                        <div className="flex items-center gap-1.5 mb-1.5 justify-between">
                          <span className="text-[9px] font-black tracking-widest uppercase bg-amber-500 text-black px-1.5 py-0.5 rounded">
                            Tanya (?)
                          </span>
                          <span className="text-[9px] font-mono opacity-60" style={{ color: colors.text }}>
                            {slide.qnaUserHandle || brand.handle}
                          </span>
                        </div>
                        <p
                          className="text-xs font-bold leading-snug"
                          style={{ fontFamily: carousel.fontHeading, color: colors.text }}
                        >
                          "{renderFormattedText(slide.qnaQuestion || "Masukkan pertanyaan Anda di sini?", colors, carousel.theme)}"
                        </p>
                      </div>

                      <div className={`p-3 rounded-2xl relative ${qnaAnsBg}`}>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-[9px] font-black tracking-widest uppercase bg-indigo-600 text-white px-1.5 py-0.5 rounded">
                            Jawab (A)
                          </span>
                        </div>
                        <p
                          className="text-xs font-medium leading-relaxed"
                          style={{
                            fontFamily: slide.bodyFontOverride || carousel.fontBody,
                            color: slide.bodyColorOverride || colors.text,
                            fontSize: slide.bodySizeOverride || undefined,
                          }}
                        >
                          {renderFormattedText(
                            slide.qnaAnswer ||
                              "Berikan penjelasan jawaban yang lengkap dan komprehensif di bagian ini.",
                            colors,
                            carousel.theme,
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : slide.slideType === "thumbnail" ? (
              <div className="space-y-3 w-full my-auto flex flex-col items-center text-center py-4">
                {renderSubtitle(
                  slide,
                  colors,
                  carousel.theme,
                  false,
                  carousel.fontHeading,
                  carousel.fontBody,
                )}
                <h1
                  className={`font-black tracking-tight leading-none text-balance select-none ${
                    slide.headingSizeOverride === "sm"
                      ? "text-lg"
                      : slide.headingSizeOverride === "md"
                        ? "text-2xl"
                        : slide.headingSizeOverride === "lg"
                          ? "text-4xl sm:text-5xl"
                          : slide.headingSizeOverride === "xl"
                            ? "text-5xl sm:text-6xl"
                            : slide.headingSizeOverride === "2xl"
                              ? "text-6xl sm:text-7xl font-extrabold uppercase"
                              : "text-4xl sm:text-5xl"
                  }`}
                  style={{
                    fontFamily: slide.titleFontOverride || carousel.fontHeading,
                    color: slide.titleColorOverride || colors.text,
                    textTransform:
                      slide.titleStyleOverride === "none"
                        ? "none"
                        : slide.titleStyleOverride || undefined,
                    textShadow:
                      carousel.theme === "neobrutalism" ? "3px 3px 0px #000" : "none",
                  }}
                >
                  {renderFormattedText(slide.title || "KONTEN MENARIK", colors, carousel.theme)}
                </h1>

                {slide.body &&
                  slide.body.filter((i) => i && i.trim() !== "").length > 0 && (
                    <div className="mt-2 max-w-xs bg-black/5 dark:bg-white/5 py-1 px-3 rounded-full border border-black/10">
                      <p
                        className="text-[10px] font-bold tracking-tight uppercase"
                        style={{
                          fontFamily: slide.bodyFontOverride || carousel.fontBody,
                          color: slide.bodyColorOverride || colors.primary,
                          fontSize: slide.bodySizeOverride || undefined,
                        }}
                      >
                        {renderFormattedText(slide.body[0], colors, carousel.theme)}
                      </p>
                    </div>
                  )}
              </div>
            ) : slide.slideType === "call_to_action" ? (
              <div className="space-y-4 w-full my-auto flex flex-col items-center text-center py-4">
                {slide.showTitleIcon !== false && (
                  <div className="p-2 rounded-full bg-amber-500/10 border border-amber-500/25 mb-1 shrink-0">
                    {(() => {
                      const DefaultIcon =
                        slide.ctaType === "website" ? Globe : Sparkles;
                      const IconComp = getSlideIcon(slide.titleIcon, DefaultIcon);
                      return (
                        <IconComp
                          className="w-5 h-5 text-amber-500 animate-pulse"
                          style={{ color: colors.primary }}
                        />
                      );
                    })()}
                  </div>
                )}

                <div className="space-y-1.5 max-w-sm">
                  <h2
                    className="text-lg font-black tracking-tight leading-tight uppercase"
                    style={{
                      fontFamily: slide.titleFontOverride || carousel.fontHeading,
                      color: slide.titleColorOverride || colors.text,
                      textTransform:
                        slide.titleStyleOverride === "none"
                          ? "none"
                          : slide.titleStyleOverride || "uppercase",
                    }}
                  >
                    {renderFormattedText(
                      slide.title ||
                        (slide.ctaType === "website"
                          ? "Kunjungi Website Kami"
                          : "Bermanfaat? Yuk Dukung!"),
                      colors,
                      carousel.theme,
                    )}
                  </h2>
                  {renderSubtitle(
                    { ...slide, subtitleStyleOverride: slide.subtitleStyleOverride || "plain" },
                    colors,
                    carousel.theme,
                    false,
                    carousel.fontHeading,
                    carousel.fontBody,
                  )}
                </div>

                {slide.ctaType === "website" ? (
                  <div className="w-full max-w-[280px] space-y-2.5 pt-1 flex flex-col items-center justify-center">
                    {slide.ctaUrl && carousel.theme !== "neo-grid" && (
                      <div
                        className={`py-1 px-3 rounded-full border text-[9px] font-mono tracking-wide bg-black/5 text-stone-700 inline-flex items-center gap-1 border-black/10 mx-auto ${
                          carousel.theme === "neobrutalism"
                            ? "border-2 border-black rounded-none shadow-[1px_1px_0px_#000] bg-white"
                            : ""
                        }`}
                      >
                        <Globe className="w-3 h-3 text-stone-500 shrink-0" />
                        <span className="truncate max-w-[180px]">{slide.ctaUrl}</span>
                      </div>
                    )}

                    <div
                      className={`w-full transition-all border cursor-pointer ${
                        carousel.theme === "neo-grid"
                          ? "bg-[#ea580c] text-white border-2 border-black rounded-none shadow-[3px_3px_0px_#000] py-2.5 px-4 text-left"
                          : carousel.theme === "neobrutalism"
                            ? "bg-[#ffe4c4] border-2 border-black text-black rounded-none shadow-[2px_2px_0px_#000] uppercase tracking-wider font-extrabold py-2 px-4 text-center"
                            : "rounded-lg shadow-md hover:brightness-95 py-2 px-4 text-center"
                      }`}
                      style={
                        carousel.theme !== "neobrutalism" && carousel.theme !== "neo-grid"
                          ? {
                              backgroundColor: colors.primary,
                              color: "#ffffff",
                              borderColor: `${colors.text}15`,
                            }
                          : undefined
                      }
                    >
                      {carousel.theme === "neo-grid" ? (
                        <div className="flex items-center justify-between w-full">
                          <div className="flex flex-col items-start text-left">
                            <span className="text-[10px] font-black uppercase tracking-wider">
                              {slide.ctaButtonText || "Kunjungi Sekarang"}
                            </span>
                            <span className="text-[8px] font-mono opacity-80 mt-0.5 normal-case">
                              {slide.ctaUrl || brand.website || "link di bio"}
                            </span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-white shrink-0" />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="truncate">
                            {slide.ctaButtonText || "Kunjungi Sekarang"}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 text-current shrink-0" />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2.5 w-full max-w-[280px] pt-2">
                    <div
                      className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 border ${
                        carousel.theme === "neobrutalism" || carousel.theme === "neo-grid"
                          ? "bg-white border-2 border-black shadow-[1.5px_1.5px_0px_#000]"
                          : "bg-white/5 border-white/10"
                      }`}
                    >
                      <Heart className="w-4 h-4 text-rose-500 animate-bounce" />
                      <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: colors.text }}>
                        Suka
                      </span>
                    </div>
                    <div
                      className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 border ${
                        carousel.theme === "neobrutalism" || carousel.theme === "neo-grid"
                          ? "bg-white border-2 border-black shadow-[1.5px_1.5px_0px_#000]"
                          : "bg-white/5 border-white/10"
                      }`}
                    >
                      <MessageCircle className="w-4 h-4 text-sky-500" />
                      <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: colors.text }}>
                        Komen
                      </span>
                    </div>
                    <div
                      className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 border ${
                        carousel.theme === "neobrutalism" || carousel.theme === "neo-grid"
                          ? "bg-white border-2 border-black shadow-[1.5px_1.5px_0px_#000]"
                          : "bg-white/5 border-white/10"
                      }`}
                    >
                      <Share2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: colors.text }}>
                        Bagikan
                      </span>
                    </div>
                    <div
                      className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 border ${
                        carousel.theme === "neobrutalism" || carousel.theme === "neo-grid"
                          ? "bg-white border-2 border-black shadow-[1.5px_1.5px_0px_#000]"
                          : "bg-white/5 border-white/10"
                      }`}
                    >
                      <Bookmark className="w-4 h-4 text-amber-500" />
                      <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: colors.text }}>
                        Simpan
                      </span>
                    </div>
                  </div>
                )}

                {carousel.theme === "neo-grid" && (
                  <div className="w-full max-w-[280px] pt-3 border-t border-dashed border-stone-400/20 flex items-center gap-2.5 justify-start mt-3 select-none">
                    <div className="w-8 h-8 rounded-full border border-black overflow-hidden shrink-0 shadow-[1px_1px_0px_#000] bg-white">
                      {brand.logoUrl ? (
                        <img
                          src={brand.logoUrl}
                          className="w-full h-full object-cover"
                          alt=""
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#ea580c] text-white flex items-center justify-center font-black text-[10px]">
                          {brand.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-start text-left leading-tight">
                      <span className="text-[10px] font-black tracking-tight" style={{ color: colors.text }}>
                        {brand.name}
                      </span>
                      <span className="text-[8px] font-medium opacity-70" style={{ color: colors.text }}>
                        Kreator & Edukator
                      </span>
                    </div>
                  </div>
                )}

                {slide.body &&
                  slide.body.filter((i) => i && i.trim() !== "").length > 0 &&
                  carousel.theme !== "neo-grid" && (
                    <div className="pt-2">
                      <p className="text-[9px] font-mono tracking-wider opacity-60" style={{ color: colors.text }}>
                        {renderFormattedText(slide.body[0], colors, carousel.theme)}
                      </p>
                    </div>
                  )}
              </div>
            ) : slide.slideType === "quote" ? (
              <div className="space-y-3 italic text-center py-4 w-full my-auto">
                <span className="text-3xl font-serif opacity-30 block leading-none">“</span>
                <p
                  className={`font-medium leading-relaxed text-balance ${
                    slide.headingSizeOverride === "sm"
                      ? "text-xs"
                      : slide.headingSizeOverride === "md"
                        ? "text-sm"
                        : slide.headingSizeOverride === "lg"
                          ? "text-lg"
                          : slide.headingSizeOverride === "xl"
                            ? "text-xl"
                            : slide.headingSizeOverride === "2xl"
                              ? "text-2xl"
                              : "text-base"
                  }`}
                  style={{
                    fontFamily: slide.titleFontOverride || carousel.fontHeading,
                    color: slide.titleColorOverride || colors.text,
                    textTransform:
                      slide.titleStyleOverride === "none"
                        ? "none"
                        : slide.titleStyleOverride || undefined,
                  }}
                >
                  {renderFormattedText(slide.title, colors, carousel.theme)}
                </p>
                {renderSubtitle(
                  { ...slide, subtitleStyleOverride: slide.subtitleStyleOverride || "plain" },
                  colors,
                  carousel.theme,
                  false,
                  carousel.fontHeading,
                  carousel.fontBody,
                )}
              </div>
            ) : (
              <div className="space-y-4 w-full relative">
                {carousel.theme === "neo-grid" && (
                  <div
                    className="absolute -top-14 -left-6 text-[80px] font-black tracking-tighter opacity-[0.08] select-none pointer-events-none font-sans"
                    style={{ color: colors.text }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </div>
                )}
                <div
                  className={`space-y-1.5 flex flex-col ${
                    slide.textAlignment === "center"
                      ? "items-center text-center"
                      : slide.textAlignment === "right"
                        ? "items-end text-right"
                        : "items-start text-left"
                  }`}
                >
                  {slide.showTitleIcon && (
                    <div className="p-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 mb-1 shrink-0">
                      {(() => {
                        const IconComp = getSlideIcon(
                          slide.titleIcon || slide.icon,
                          Sparkles,
                        );
                        return (
                          <IconComp
                            className="w-4 h-4 text-amber-500 animate-pulse"
                            style={{ color: colors.primary }}
                          />
                        );
                      })()}
                    </div>
                  )}
                  {renderSubtitle(
                    slide,
                    colors,
                    carousel.theme,
                    false,
                    carousel.fontHeading,
                    carousel.fontBody,
                  )}
                  <h3
                    className={`font-bold tracking-tight leading-snug ${
                      slide.headingSizeOverride === "sm"
                        ? "text-xs"
                        : slide.headingSizeOverride === "md"
                          ? "text-sm"
                          : slide.headingSizeOverride === "lg"
                            ? "text-lg"
                            : slide.headingSizeOverride === "xl"
                              ? "text-xl"
                              : slide.headingSizeOverride === "2xl"
                                ? "text-2xl"
                                : "text-base"
                    }`}
                    style={{
                      fontFamily: slide.titleFontOverride || carousel.fontHeading,
                      color: slide.titleColorOverride || colors.text,
                      textTransform:
                        slide.titleStyleOverride === "none"
                          ? "none"
                          : slide.titleStyleOverride || undefined,
                    }}
                  >
                    {renderFormattedText(slide.title, colors, carousel.theme)}
                  </h3>
                </div>

                {slide.body &&
                  slide.body.filter((i) => i && i.trim() !== "").length > 0 && (
                    <div
                      className={
                        carousel.theme === "neo-grid"
                          ? `grid ${slide.body.length > 2 ? "grid-cols-2" : "grid-cols-1"} gap-2.5 w-full pt-1`
                          : `space-y-2.5 flex flex-col w-full ${
                              slide.textAlignment === "center"
                                ? "items-center text-center"
                                : slide.textAlignment === "right"
                                  ? "items-end text-right"
                                  : "items-start text-left"
                            }`
                      }
                    >
                      {slide.body
                        .filter((i) => i && i.trim() !== "")
                        .map((item, bIdx) => {
                          if (carousel.theme === "neo-grid") {
                            return (
                              <div
                                key={bIdx}
                                className="p-2.5 bg-white border border-black text-black font-semibold text-[10px] flex items-center gap-2 shadow-[2px_2px_0px_#000] rounded-lg text-left"
                              >
                                <div className="w-5 h-5 rounded border border-black bg-emerald-100 flex items-center justify-center font-bold text-emerald-800 text-[10px] shrink-0 shadow-[1px_1px_0px_#000]">
                                  ✓
                                </div>
                                <span
                                  className="text-stone-800 font-sans tracking-wide leading-snug"
                                  style={{
                                    fontFamily: slide.bodyFontOverride || carousel.fontBody,
                                    color: slide.bodyColorOverride || undefined,
                                    fontSize: slide.bodySizeOverride || undefined,
                                  }}
                                >
                                  {renderFormattedText(item, colors, carousel.theme)}
                                </span>
                              </div>
                            );
                          }
                          return (
                            <div
                              key={bIdx}
                              className={`flex gap-2.5 ${
                                slide.textAlignment === "center"
                                  ? "flex-col items-center text-center"
                                  : slide.textAlignment === "right"
                                    ? "flex-row-reverse text-right"
                                    : "flex-row text-left"
                              } items-start`}
                            >
                              <p
                                className="text-xs leading-relaxed font-normal opacity-90 text-balance"
                                style={{
                                  fontFamily: slide.bodyFontOverride || carousel.fontBody,
                                  color: slide.bodyColorOverride || colors.text,
                                  fontSize: slide.bodySizeOverride || undefined,
                                }}
                              >
                                {renderFormattedText(item, colors, carousel.theme)}
                              </p>
                            </div>
                          );
                        })}
                    </div>
                  )}
              </div>
            )}

            {slide.showImage &&
              slide.imageUrl &&
              slide.imagePosition === "bottom" && (
                <div className="w-full flex justify-center mt-2.5 select-none">
                  {renderSlideImage(slide, "max-h-[90px]")}
                </div>
              )}
          </div>

          {slide.showImage &&
            slide.imageUrl &&
            slide.imagePosition === "right" && (
              <div className="w-[40%] shrink-0 flex justify-center items-center select-none">
                {renderSlideImage(slide, "max-h-[160px]")}
              </div>
            )}
        </div>
      </div>

      {/* SLIDE FOOTER */}
      <div className="px-5 pb-5 pt-3 z-10 space-y-3">
        {slide.ctaText && (
          <div
            className={`w-full py-2 px-3 text-center text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all border ${
              carousel.theme === "neobrutalism"
                ? "bg-[#4d96ff] border-2 border-black text-black rounded-none shadow-[3px_3px_0px_#000] font-black uppercase tracking-wider"
                : "rounded-lg shadow-sm"
            }`}
            style={
              carousel.theme !== "neobrutalism"
                ? {
                    backgroundColor: colors.primary,
                    color: "#ffffff",
                    borderColor: `${colors.text}10`,
                  }
                : undefined
            }
          >
            <span>{slide.ctaText}</span>
            <ArrowRight className="w-3 h-3 animate-pulse text-current" />
          </div>
        )}

        {showBottomWatermark ? (
          <div
            className="flex items-center justify-between border-t border-dashed pt-2.5 opacity-80"
            style={{ borderColor: `${colors.text}20` }}
          >
            <span className="text-[9px] font-mono tracking-wider opacity-60" style={{ color: colors.text }}>
              {getWatermarkText(brand, slide)}
            </span>
            <div className="flex items-center gap-2">
              <div className="w-14 h-1 bg-slate-200/20 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: colors.primary,
                    width: `${((index + 1) / carousel.slides.length) * 100}%`,
                  }}
                />
              </div>
              <span className="text-[10px] font-mono font-bold" style={{ color: colors.text }}>
                {String(index + 1).padStart(2, "0")} /{" "}
                {String(carousel.slides.length).padStart(2, "0")}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-end pt-1 opacity-80">
            <div className="flex items-center gap-2">
              <div className="w-14 h-1 bg-slate-200/20 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: colors.primary,
                    width: `${((index + 1) / carousel.slides.length) * 100}%`,
                  }}
                />
              </div>
              <span className="text-[10px] font-mono font-bold" style={{ color: colors.text }}>
                {String(index + 1).padStart(2, "0")} /{" "}
                {String(carousel.slides.length).padStart(2, "0")}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SlideCanvas;
