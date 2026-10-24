import React, { useState, useRef } from "react";
import { Carousel, Slide, Brand } from "../types";
import { TEMPLATE_PRESETS } from "../utils";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { motion, AnimatePresence } from "motion/react";
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
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Film,
  Image as ImageIcon,
  Check,
  Eye,
  Loader2,
  Sparkle,
  ThumbsUp,
  Share2,
  Bookmark,
  X,
  Globe,
  QrCode,
  ExternalLink,
} from "lucide-react";
import {
  getSlideIcon,
  PointMarker,
  isThemeDark,
  renderFormattedText,
  renderSlideImage,
  renderSubtitle,
  renderBackgroundGraphics,
  getSlideColors,
  getWatermarkText,
  SlideCanvas,
} from "./SlideCanvas";

interface SlideViewerProps {
  carousel: Carousel;
  activeSlideId: string;
  brands: Brand[];
  activeBrandId: string;
  onSetActiveSlide: (id: string) => void;
  previewBrand?: Brand | null;
}


export const SlideViewer: React.FC<SlideViewerProps> = ({
  carousel,
  activeSlideId,
  brands,
  activeBrandId,
  onSetActiveSlide,
  previewBrand,
}) => {
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState("");
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportMode, setExportMode] = useState<"all" | "current">("all");
  const [renderingVideo, setRenderingVideo] = useState(false);

  const activeBrand =
    previewBrand || brands.find((b) => b.id === activeBrandId) || brands[0];
  const activeSlideIndex = carousel.slides.findIndex(
    (s) => s.id === activeSlideId,
  );
  const currentSlideIdx = activeSlideIndex >= 0 ? activeSlideIndex : 0;
  const currentSlide = carousel.slides[currentSlideIdx];

  const showTopWatermark =
    !currentSlide.hideProfileWatermark &&
    (currentSlide.watermarkPosition === undefined ||
      currentSlide.watermarkPosition === "top" ||
      currentSlide.watermarkPosition === "both");

  const showBottomWatermark =
    !currentSlide.hideProfileWatermark &&
    (currentSlide.watermarkPosition === undefined ||
      currentSlide.watermarkPosition === "bottom" ||
      currentSlide.watermarkPosition === "both");


  // Ref to hold a hidden high-res renderer container
  const exportContainerRef = useRef<HTMLDivElement>(null);

  // Determine aspect ratio class & pixel dimensions for mockup
  let mockupWidth = 380;
  let mockupHeight = 475; // 4:5
  let ratioLabel = "4:5";

  if (carousel.size === "square") {
    mockupWidth = 380;
    mockupHeight = 380; // 1:1
    ratioLabel = "1:1";
  } else if (carousel.size === "story") {
    mockupWidth = 400;
    mockupHeight = 711; // 9:16
    ratioLabel = "9:16";
  } else if (carousel.size === "thumbnail") {
    mockupWidth = 480;
    mockupHeight = 270; // 16:9
    ratioLabel = "16:9 (YouTube Thumbnail)";
  } else if (carousel.size === "custom") {
    const customW = carousel.customWidth || 1200;
    const customH = carousel.customHeight || 1200;
    const aspect = customW / customH;
    if (aspect >= 1.5) {
      mockupWidth = 480;
      mockupHeight = Math.round(480 / aspect);
    } else if (aspect >= 1) {
      mockupWidth = 380;
      mockupHeight = Math.round(380 / aspect);
    } else {
      mockupHeight = 480;
      mockupWidth = Math.round(480 * aspect);
    }
    ratioLabel = `Kustom (${customW}x${customH})`;
  }

  // Go to next/prev slide
  const handlePrev = () => {
    if (currentSlideIdx > 0) {
      onSetActiveSlide(carousel.slides[currentSlideIdx - 1].id);
    }
  };

  const handleNext = () => {
    if (currentSlideIdx < carousel.slides.length - 1) {
      onSetActiveSlide(carousel.slides[currentSlideIdx + 1].id);
    }
  };

  // Get slide style colors: respects overrides if defined, otherwise uses active brand colors
  // or preset template colors based on the carousel colorMode settings.

  // Render Background Graphic elements based on Theme Style

  // High Resolution rendering and export (PNG & PDF)
  const triggerExport = async (
    format: "png" | "pdf",
    mode: "all" | "current" = "all",
  ) => {
    if (!exportContainerRef.current) return;
    setExporting(true);
    setExportSuccess(false);

    try {
      const slidesElements = exportContainerRef.current.children;
      const imagesData: string[] = [];
      const totalSlides = carousel.slides.length;

      const startIndex = mode === "current" ? currentSlideIdx : 0;
      const endIndex = mode === "current" ? currentSlideIdx + 1 : totalSlides;

      // Ensure google fonts are loaded and applied
      await document.fonts.ready;

      let targetWidth = 1080;
      if (carousel.size === "thumbnail") targetWidth = 1280;
      else if (carousel.size === "custom")
        targetWidth = carousel.customWidth || 1200;

      const scaleRatio = (targetWidth / mockupWidth) * 2;

      // 1. Render each slide to canvas sequentially to ensure perfect scaling and layout
      for (let idx = startIndex; idx < endIndex; idx++) {
        setExportProgress(`Memproses Slide ${idx + 1} dari ${totalSlides}...`);
        const slideEl = slidesElements[idx] as HTMLElement;

        // Render with html-to-image with calculated pixel ratio for extremely crisp, high-definition outputs
        const imgData = await toPng(slideEl, {
          pixelRatio: scaleRatio, // Scales from mockup dimensions up to the target resolution (e.g. 1080px width) * 2
          cacheBust: true,
          style: {
            margin: "0",
            transform: "none",
          },
        });

        imagesData.push(imgData);
      }

      const cleanTitle = carousel.title
        ? carousel.title.toLowerCase().replace(/[^a-z0-9]/g, "_")
        : "carousel";

      if (format === "png") {
        if (mode === "current") {
          const link = document.createElement("a");
          link.download = `${cleanTitle}_slide_${currentSlideIdx + 1}.png`;
          link.href = imagesData[0];
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          setExportProgress("Menyiapkan file ZIP...");
          // Dynamically import JSZip
          const JSZip = (await import("jszip")).default;
          const zip = new JSZip();

          imagesData.forEach((imgData, idx) => {
            // Remove the "data:image/png;base64," prefix
            const base64Data = imgData.split(",")[1];
            zip.file(`${cleanTitle}_slide_${idx + 1}.png`, base64Data, {
              base64: true,
            });
          });
          const content = await zip.generateAsync({ type: "blob" });
          const url = URL.createObjectURL(content);

          const link = document.createElement("a");
          link.download = `${cleanTitle}_slides.zip`;
          link.href = url;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }

      // 2. If PDF, merge all images into a single multi-page PDF document
      if (format === "pdf") {
        setExportProgress("Menyusun Dokumen PDF...");

        // Determine PDF page size based on slide ratio
        let pdfWidth = 1080;
        let pdfHeight = 1350; // Portrait default

        if (carousel.size === "square") {
          pdfWidth = 1080;
          pdfHeight = 1080;
        } else if (carousel.size === "story") {
          pdfWidth = 1080;
          pdfHeight = 1920;
        } else if (carousel.size === "thumbnail") {
          pdfWidth = 1280;
          pdfHeight = 720;
        } else if (carousel.size === "custom") {
          pdfWidth = carousel.customWidth || 1200;
          pdfHeight = carousel.customHeight || 1200;
        }

        const orientation = pdfWidth > pdfHeight ? "l" : "p";
        const pdf = new jsPDF({
          orientation: orientation as any,
          unit: "px",
          format: [pdfWidth, pdfHeight],
        });

        for (let i = 0; i < imagesData.length; i++) {
          if (i > 0) {
            pdf.addPage([pdfWidth, pdfHeight] as any, orientation as any);
          }
          pdf.addImage(imagesData[i], "PNG", 0, 0, pdfWidth, pdfHeight);
        }

        const fileName =
          mode === "current"
            ? `${cleanTitle}_slide_${currentSlideIdx + 1}.pdf`
            : `${cleanTitle}_carousel.pdf`;
        pdf.save(fileName);
      }

      setExportSuccess(true);
      setExportProgress("Selesai!");
      setTimeout(() => {
        setExportSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error("Export Error:", err);
      const errorMsg =
        err instanceof Error
          ? err.message
          : typeof err === "object"
            ? JSON.stringify(err)
            : String(err);
      alert(`Terjadi kesalahan saat mengekspor visual: ${errorMsg}`);
    } finally {
      setExporting(false);
    }
  };

  // Server-side Remotion MP4 render
  const triggerVideoExport = async () => {
    if (renderingVideo) return;
    setRenderingVideo(true);
    try {
      const res = await fetch("/api/render-video", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ carousel, brand: activeBrand }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `Render gagal (${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const cleanTitle = carousel.title
        ? carousel.title.toLowerCase().replace(/[^a-z0-9]/g, "_")
        : "carousel";
      const link = document.createElement("a");
      link.download = `${cleanTitle}_video.mp4`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err: any) {
      console.error("Video Export Error:", err);
      alert(`Gagal render video: ${err?.message || err}`);
    } finally {
      setRenderingVideo(false);
    }
  };

  return (
    <div
      className="flex flex-col h-full space-y-6"
      id="slide-viewer-main-wrapper"
    >
      {/* HEADER CONTROLS WITH DIRECT ACTION BUTTONS */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border-3 border-black shadow-[3px_3px_0px_#000]">
        <div>
          <h2 className="text-xs font-black text-[#1A1A1A] uppercase tracking-[0.1em] flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-black" />
            LIVE PREVIEW REAL-TIME
          </h2>
          <p className="text-[11px] text-[#8C8881] mt-0.5 font-bold uppercase tracking-wide">
            Format:{" "}
            <span className="text-[#1A1A1A] font-black">
              {ratioLabel}{" "}
              {carousel.size.charAt(0).toUpperCase() + carousel.size.slice(1)}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={exportMode}
            onChange={(e) => setExportMode(e.target.value as "all" | "current")}
            className="px-2 py-2 bg-white border-2 border-black rounded-lg text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] outline-none cursor-pointer"
          >
            <option value="all">Semua Slide</option>
            <option value="current">Slide Ini Saja</option>
          </select>

          {/* Download PNG */}
          <button
            onClick={() => triggerExport("png", exportMode)}
            disabled={exporting || renderingVideo}
            className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-black border-2 border-black rounded-lg text-[10px] font-black uppercase tracking-wider transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000]"
            id="btn-export-png"
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#E26D5C]" />
            PNG
          </button>

          {/* Download PDF */}
          <button
            onClick={() => triggerExport("pdf", exportMode)}
            disabled={exporting || renderingVideo}
            className="px-3.5 py-2 bg-[#1A1A1A] hover:bg-black text-white border-2 border-black rounded-lg text-[10px] font-black uppercase tracking-wider transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000]"
            id="btn-export-pdf"
          >
            <FileText className="w-3.5 h-3.5 text-[#F5D547]" />
            PDF
          </button>

          {/* Download MP4 (Remotion) */}
          <button
            onClick={triggerVideoExport}
            disabled={exporting || renderingVideo}
            className="px-3.5 py-2 bg-[#ff6b6b] hover:bg-[#e85b5b] text-black border-2 border-black rounded-lg text-[10px] font-black uppercase tracking-wider transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000]"
            id="btn-export-mp4"
          >
            <Film className="w-3.5 h-3.5 text-black" />
            MP4
          </button>
        </div>
      </div>

      {/* EXPORT OVERLAY LOADER */}
      {(exporting || renderingVideo) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center z-50 text-center animate-fade-in">
          <div className="p-6 bg-white border border-[#E5E2DD] rounded-2xl max-w-sm w-full space-y-4 shadow-2xl">
            <Loader2 className="w-10 h-10 text-[#1A1A1A] animate-spin mx-auto" />
            <div className="space-y-1">
              <h3 className="text-[#1A1A1A] font-bold text-sm">
                {renderingVideo ? "Merender Video MP4..." : "Memproses Ekspor..."}
              </h3>
              <p className="text-xs text-[#8C8881]">
                {renderingVideo
                  ? "Merender tiap frame dengan Remotion. Ini bisa memakan 1-3 menit."
                  : exportProgress}
              </p>
            </div>
            <p className="text-[10px] text-[#8C8881] italic">
              Harap tunggu sebentar, jangan tutup halaman ini.
            </p>
          </div>
        </div>
      )}

      {/* EXPORT SUCCESS BANNER */}
      {exportSuccess && (
        <div className="bg-green-50 border border-green-200 p-3 rounded-xl text-center text-xs text-green-700 font-bold flex items-center justify-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-green-600" />
          Ekspor Berhasil! File Anda telah berhasil diunduh.
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0 overflow-hidden">
        {/* MOCKUP CONTAINER */}
        <div className="flex-1 flex items-center justify-center min-h-[460px] bg-[#F3F1EE] rounded-2xl border border-[#E5E2DD] p-5 relative overflow-hidden shadow-inner">
          {/* Subtle decorative background lights */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

          {/* Carousel slide transition container with frame */}
          <div
            className={`relative overflow-hidden transition-all duration-300 flex flex-col justify-between ${
              carousel.theme === "neobrutalism" || carousel.theme === "neo-grid"
                ? "border-[4px] border-black rounded-none shadow-[6px_6px_0px_#000]"
                : "rounded-2xl border border-[#E5E2DD] shadow-2xl"
            }`}
            style={{
              width: `${mockupWidth}px`,
              height: `${mockupHeight}px`,
              background: getSlideColors(carousel, activeBrand, currentSlide).bg,
              color: getSlideColors(carousel, activeBrand, currentSlide).text,
              fontFamily:
                currentSlide.slideType === "intro"
                  ? carousel.fontHeading
                  : carousel.fontBody,
            }}
            id="active-visible-slide-frame"
          >
            {/* Background Image if position is background */}
            {currentSlide.showImage &&
              currentSlide.imageUrl &&
              currentSlide.imagePosition === "background" && (
                <div className="absolute inset-0 z-0">
                  <img
                    src={currentSlide.imageUrl}
                    className="w-full h-full object-cover animate-fade-in"
                    alt=""
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/45 backdrop-blur-[0.5px]" />
                </div>
              )}

            {/* Background graphics matching the active preset style */}
            {renderBackgroundGraphics(
              carousel.theme,
              getSlideColors(carousel, activeBrand, currentSlide),
              false,
            )}

            {/* FLOATING BADGE/STICKER FEATURE (Perfect for YouTube Thumbnails & High Engagement Posts) */}
            {currentSlide.badgeText && (
              <div
                className={`absolute top-16 right-5 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${
                  carousel.theme === "neo-grid"
                    ? "border border-black bg-orange-500 text-white shadow-[2px_2px_0px_#000] rounded-none"
                    : "border-2 border-black rotate-6 bg-yellow-300 text-black shadow-[2px_2px_0px_#000]"
                } z-20`}
                style={
                  currentSlide.badgeColor
                    ? { backgroundColor: currentSlide.badgeColor }
                    : undefined
                }
              >
                {currentSlide.badgeText}
              </div>
            )}

            {/* SLIDE TOP HEADER: Brand profile */}
            {showTopWatermark && (
              <div className="px-5 pt-5 pb-3 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  {/* Brand Logo */}
                  <div
                    className={`w-7 h-7 flex items-center justify-center font-extrabold text-[10px] overflow-hidden shrink-0 ${
                      carousel.theme === "neobrutalism"
                        ? "border-2 border-black rounded-none shadow-[1.5px_1.5px_0px_#000] bg-yellow-300 text-black"
                        : "rounded-full border shadow-sm"
                    }`}
                    style={
                      carousel.theme !== "neobrutalism"
                        ? activeBrand.logoUrl
                          ? {
                              backgroundColor: "#ffffff",
                              borderColor:
                                getSlideColors(carousel, activeBrand, currentSlide).primary,
                            }
                          : {
                              backgroundColor:
                                getSlideColors(carousel, activeBrand, currentSlide).text,
                              color: getSlideColors(carousel, activeBrand, currentSlide).bg.startsWith(
                                "linear-gradient",
                              )
                                ? "#1A1A1A"
                                : getSlideColors(carousel, activeBrand, currentSlide).bg,
                              borderColor:
                                getSlideColors(carousel, activeBrand, currentSlide).primary,
                            }
                        : undefined
                    }
                  >
                    {activeBrand.logoUrl ? (
                      <img
                        src={activeBrand.logoUrl}
                        className="w-full h-full object-contain p-0.5 animate-fade-in"
                        alt={activeBrand.name}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      activeBrand.name.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span
                      className="text-[10px] font-bold tracking-tight uppercase"
                      style={{ color: getSlideColors(carousel, activeBrand, currentSlide).text }}
                    >
                      {activeBrand.name}
                    </span>
                    <span
                      className="text-[8px] font-mono tracking-wider opacity-60"
                      style={{ color: getSlideColors(carousel, activeBrand, currentSlide).text }}
                    >
                      {getWatermarkText(activeBrand, currentSlide)}
                    </span>
                  </div>
                </div>

                {/* Accent Watermark */}
                <div className="opacity-40">
                  <Sparkle
                    className="w-4 h-4"
                    style={{ color: getSlideColors(carousel, activeBrand, currentSlide).primary }}
                  />
                </div>
              </div>
            )}

            {/* SLIDE CONTENT AREA: Responsive and centered */}
            <div className="px-6 flex-1 flex flex-col justify-center z-10 space-y-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className={`flex-1 flex w-full h-full ${
                    currentSlide.showImage &&
                    currentSlide.imageUrl &&
                    (currentSlide.imagePosition === "left" ||
                      currentSlide.imagePosition === "right")
                      ? "flex-row items-center justify-between gap-4"
                      : "flex-col justify-center"
                  }`}
                >
                  {/* Left image column if position is left */}
                  {currentSlide.showImage &&
                    currentSlide.imageUrl &&
                    currentSlide.imagePosition === "left" && (
                      <div className="w-[40%] shrink-0 flex justify-center items-center select-none">
                        {renderSlideImage(currentSlide, "max-h-[160px]")}
                      </div>
                    )}

                  {/* Main Content Column */}
                  <div
                    className={`flex flex-col justify-center ${
                      currentSlide.showImage &&
                      currentSlide.imageUrl &&
                      (currentSlide.imagePosition === "left" ||
                        currentSlide.imagePosition === "right")
                        ? "w-[56%] shrink-0"
                        : "w-full"
                    } ${
                      currentSlide.slideType === "comparison" ||
                      currentSlide.slideType === "qna"
                        ? ""
                        : currentSlide.textAlignment === "center"
                          ? "items-center text-center"
                          : currentSlide.textAlignment === "right"
                            ? "items-end text-right"
                            : "items-start text-left"
                    }`}
                  >
                    {/* Top Image if position is top */}
                    {currentSlide.showImage &&
                      currentSlide.imageUrl &&
                      currentSlide.imagePosition === "top" && (
                        <div className="w-full flex justify-center mb-2.5 select-none">
                          {renderSlideImage(currentSlide, "max-h-[90px]")}
                        </div>
                      )}

                    {/* 1. Comparison Layout (Perbandingan) */}
                    {currentSlide.slideType === "comparison" ? (
                      (() => {
                        const isDark = isThemeDark(
                          getSlideColors(carousel, activeBrand, currentSlide),
                        );
                        const emBg =
                          carousel.theme === "neobrutalism"
                            ? "border-black bg-emerald-50 shadow-[2px_2px_0px_#000]"
                            : isDark
                              ? "bg-emerald-500/10 border-emerald-500/30"
                              : "bg-emerald-50 border-emerald-500/30";
                        const emHeader = isDark
                          ? "text-emerald-300 font-bold"
                          : "text-emerald-800";
                        const emText = isDark
                          ? "text-emerald-100"
                          : "text-emerald-950";

                        const roseBg =
                          carousel.theme === "neobrutalism"
                            ? "border-black bg-rose-50 shadow-[2px_2px_0px_#000]"
                            : isDark
                              ? "bg-rose-500/10 border-rose-500/30"
                              : "bg-rose-50 border-rose-500/30";
                        const roseHeader = isDark
                          ? "text-rose-300 font-bold"
                          : "text-rose-800";
                        const roseText = isDark
                          ? "text-rose-100"
                          : "text-rose-950";

                        return (
                          <div className="space-y-3 w-full my-auto">
                            {currentSlide.title &&
                              currentSlide.title.trim() !== "" && (
                                <h3
                                  className="text-base font-black tracking-tight leading-snug text-center mb-1"
                                  style={{
                                    fontFamily:
                                      currentSlide.titleFontOverride ||
                                      carousel.fontHeading,
                                    color:
                                      currentSlide.titleColorOverride ||
                                      getSlideColors(carousel, activeBrand, currentSlide).text,
                                    textTransform:
                                      currentSlide.titleStyleOverride === "none"
                                        ? "none"
                                        : currentSlide.titleStyleOverride ||
                                          undefined,
                                  }}
                                >
                                  {renderFormattedText(
                                    currentSlide.title,
                                    getSlideColors(carousel, activeBrand, currentSlide),
                                    carousel.theme,
                                  )}
                                </h3>
                              )}
                            <div className="grid grid-cols-2 gap-3 w-full">
                              {/* Left Column (Do / Sebelum / Positif) */}
                              <div
                                className={`p-3 rounded-xl border-2 flex flex-col justify-between ${emBg}`}
                              >
                                <div>
                                  <div className="flex items-center gap-1.5 mb-2">
                                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                      ✓
                                    </div>
                                    <span
                                      className={`text-[10px] font-black uppercase tracking-wider ${emHeader}`}
                                    >
                                      {currentSlide.comparisonLeftTitle ||
                                        "SEBELUM / DO"}
                                    </span>
                                  </div>
                                  <ul className="space-y-1.5">
                                    {(
                                      currentSlide.comparisonLeftItems || []
                                    ).filter((i) => i && i.trim() !== "")
                                      .length > 0 ? (
                                      (currentSlide.comparisonLeftItems || [])
                                        .filter((i) => i && i.trim() !== "")
                                        .map((item, idx) => (
                                          <li
                                            key={idx}
                                            className={`text-[10px] font-medium leading-relaxed list-none flex items-start gap-1 ${emText}`}
                                            style={{
                                              fontFamily:
                                                currentSlide.bodyFontOverride ||
                                                carousel.fontBody,
                                              color:
                                                currentSlide.bodyColorOverride ||
                                                undefined,
                                            }}
                                          >
                                            <span className="text-emerald-500 font-bold shrink-0">
                                              •
                                            </span>
                                            <span>
                                              {renderFormattedText(
                                                item,
                                                getSlideColors(carousel, activeBrand, currentSlide),
                                                carousel.theme,
                                              )}
                                            </span>
                                          </li>
                                        ))
                                    ) : (
                                      <li
                                        className={`text-[10px] italic font-medium opacity-60 ${emText}`}
                                      >
                                        Belum ada poin sebelum
                                      </li>
                                    )}
                                  </ul>
                                </div>
                              </div>

                              {/* Right Column (Don't / Sesudah / Negatif) */}
                              <div
                                className={`p-3 rounded-xl border-2 flex flex-col justify-between ${roseBg}`}
                              >
                                <div>
                                  <div className="flex items-center gap-1.5 mb-2">
                                    <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                      ✕
                                    </div>
                                    <span
                                      className={`text-[10px] font-black uppercase tracking-wider ${roseHeader}`}
                                    >
                                      {currentSlide.comparisonRightTitle ||
                                        "SESUDAH / DON'T"}
                                    </span>
                                  </div>
                                  <ul className="space-y-1.5">
                                    {(
                                      currentSlide.comparisonRightItems || []
                                    ).filter((i) => i && i.trim() !== "")
                                      .length > 0 ? (
                                      (currentSlide.comparisonRightItems || [])
                                        .filter((i) => i && i.trim() !== "")
                                        .map((item, idx) => (
                                          <li
                                            key={idx}
                                            className={`text-[10px] font-medium leading-relaxed list-none flex items-start gap-1 ${roseText}`}
                                            style={{
                                              fontFamily:
                                                currentSlide.bodyFontOverride ||
                                                carousel.fontBody,
                                              color:
                                                currentSlide.bodyColorOverride ||
                                                undefined,
                                            }}
                                          >
                                            <span className="text-rose-500 font-bold shrink-0">
                                              •
                                            </span>
                                            <span>
                                              {renderFormattedText(
                                                item,
                                                getSlideColors(carousel, activeBrand, currentSlide),
                                                carousel.theme,
                                              )}
                                            </span>
                                          </li>
                                        ))
                                    ) : (
                                      <li
                                        className={`text-[10px] italic font-medium opacity-60 ${roseText}`}
                                      >
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
                    ) : currentSlide.slideType === "qna" ? (
                      /* 2. QnA Layout (Tanya Jawab) */
                      (() => {
                        const isDark = isThemeDark(
                          getSlideColors(carousel, activeBrand, currentSlide),
                        );
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
                            {currentSlide.title &&
                              currentSlide.title.trim() !== "" && (
                                <h3
                                  className="text-sm font-black uppercase tracking-wider text-center"
                                  style={{
                                    fontFamily:
                                      currentSlide.titleFontOverride ||
                                      carousel.fontHeading,
                                    color:
                                      currentSlide.titleColorOverride ||
                                      getSlideColors(carousel, activeBrand, currentSlide).primary,
                                    textTransform:
                                      currentSlide.titleStyleOverride === "none"
                                        ? "none"
                                        : currentSlide.titleStyleOverride ||
                                          "uppercase",
                                  }}
                                >
                                  {renderFormattedText(
                                    currentSlide.title,
                                    getSlideColors(carousel, activeBrand, currentSlide),
                                    carousel.theme,
                                  )}
                                </h3>
                              )}

                            <div className="space-y-3.5">
                              {/* Question bubble */}
                              <div
                                className={`p-3 rounded-2xl relative ${qnaQuestBg}`}
                              >
                                <div className="flex items-center gap-1.5 mb-1.5 justify-between">
                                  <span className="text-[9px] font-black tracking-widest uppercase bg-amber-500 text-black px-1.5 py-0.5 rounded">
                                    Tanya (?)
                                  </span>
                                  <span
                                    className="text-[9px] font-mono opacity-60"
                                    style={{
                                      color: getSlideColors(carousel, activeBrand, currentSlide).text,
                                    }}
                                  >
                                    {currentSlide.qnaUserHandle ||
                                      activeBrand.handle}
                                  </span>
                                </div>
                                <p
                                  className="text-xs font-bold leading-snug"
                                  style={{
                                    fontFamily: carousel.fontHeading,
                                    color: getSlideColors(carousel, activeBrand, currentSlide).text,
                                  }}
                                >
                                  "
                                  {renderFormattedText(
                                    currentSlide.qnaQuestion ||
                                      "Masukkan pertanyaan Anda di sini?",
                                    getSlideColors(carousel, activeBrand, currentSlide),
                                    carousel.theme,
                                  )}
                                  "
                                </p>
                              </div>

                              {/* Answer bubble */}
                              <div
                                className={`p-3 rounded-2xl relative ${qnaAnsBg}`}
                              >
                                <div className="flex items-center gap-1.5 mb-1.5">
                                  <span className="text-[9px] font-black tracking-widest uppercase bg-indigo-600 text-white px-1.5 py-0.5 rounded">
                                    Jawab (A)
                                  </span>
                                </div>
                                <p
                                  className="text-xs font-medium leading-relaxed"
                                  style={{
                                    fontFamily:
                                      currentSlide.bodyFontOverride ||
                                      carousel.fontBody,
                                    color:
                                      currentSlide.bodyColorOverride ||
                                      getSlideColors(carousel, activeBrand, currentSlide).text,
                                    fontSize:
                                      currentSlide.bodySizeOverride ||
                                      undefined,
                                  }}
                                >
                                  {renderFormattedText(
                                    currentSlide.qnaAnswer ||
                                      "Berikan penjelasan jawaban yang lengkap dan komprehensif di bagian ini.",
                                    getSlideColors(carousel, activeBrand, currentSlide),
                                    carousel.theme,
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })()
                    ) : currentSlide.slideType === "thumbnail" ? (
                      /* 3. Thumbnail Layout (High Impact Click-worthy) */
                      <div className="space-y-3 w-full my-auto flex flex-col items-center text-center py-4">
                        {renderSubtitle(
                          currentSlide,
                          getSlideColors(carousel, activeBrand, currentSlide),
                          carousel.theme,
                          false,
                          carousel.fontHeading,
                          carousel.fontBody,
                        )}
                        <h1
                          className={`font-black tracking-tight leading-none text-balance select-none ${
                            currentSlide.headingSizeOverride === "sm"
                              ? "text-lg"
                              : currentSlide.headingSizeOverride === "md"
                                ? "text-2xl"
                                : currentSlide.headingSizeOverride === "lg"
                                  ? "text-4xl sm:text-5xl"
                                  : currentSlide.headingSizeOverride === "xl"
                                    ? "text-5xl sm:text-6xl"
                                    : currentSlide.headingSizeOverride === "2xl"
                                      ? "text-6xl sm:text-7xl font-extrabold uppercase"
                                      : "text-4xl sm:text-5xl"
                          }`}
                          style={{
                            fontFamily:
                              currentSlide.titleFontOverride ||
                              carousel.fontHeading,
                            color:
                              currentSlide.titleColorOverride ||
                              getSlideColors(carousel, activeBrand, currentSlide).text,
                            textTransform:
                              currentSlide.titleStyleOverride === "none"
                                ? "none"
                                : currentSlide.titleStyleOverride || undefined,
                            textShadow:
                              carousel.theme === "neobrutalism"
                                ? "3px 3px 0px #000"
                                : "none",
                          }}
                        >
                          {renderFormattedText(
                            currentSlide.title || "KONTEN MENARIK",
                            getSlideColors(carousel, activeBrand, currentSlide),
                            carousel.theme,
                          )}
                        </h1>

                        {currentSlide.body &&
                          currentSlide.body.filter((i) => i && i.trim() !== "")
                            .length > 0 && (
                            <div className="mt-2 max-w-xs bg-black/5 dark:bg-white/5 py-1 px-3 rounded-full border border-black/10">
                              <p
                                className="text-[10px] font-bold tracking-tight uppercase"
                                style={{
                                  fontFamily:
                                    currentSlide.bodyFontOverride ||
                                    carousel.fontBody,
                                  color:
                                    currentSlide.bodyColorOverride ||
                                    getSlideColors(carousel, activeBrand, currentSlide).primary,
                                  fontSize:
                                    currentSlide.bodySizeOverride || undefined,
                                }}
                              >
                                {renderFormattedText(
                                  currentSlide.body[0],
                                  getSlideColors(carousel, activeBrand, currentSlide),
                                  carousel.theme,
                                )}
                              </p>
                            </div>
                          )}
                      </div>
                    ) : currentSlide.slideType === "call_to_action" ? (
                      /* 4. Elegant High-Engagement CTA Layout */
                      <div className="space-y-4 w-full my-auto flex flex-col items-center text-center py-4">
                        {currentSlide.showTitleIcon === true && (
                          <div className="p-2 rounded-full bg-amber-500/10 border border-amber-500/25 mb-1 shrink-0">
                            {(() => {
                              const DefaultIcon =
                                currentSlide.ctaType === "website"
                                  ? Globe
                                  : Sparkles;
                              const IconComp = getSlideIcon(
                                currentSlide.titleIcon,
                                DefaultIcon,
                              );
                              return (
                                <IconComp
                                  className="w-5 h-5 text-amber-500 animate-pulse"
                                  style={{
                                    color: getSlideColors(carousel, activeBrand, currentSlide).primary,
                                  }}
                                />
                              );
                            })()}
                          </div>
                        )}

                        <div className="space-y-1.5 max-w-sm">
                          <h2
                            className="text-lg font-black tracking-tight leading-tight uppercase"
                            style={{
                              fontFamily:
                                currentSlide.titleFontOverride ||
                                carousel.fontHeading,
                              color:
                                currentSlide.titleColorOverride ||
                                getSlideColors(carousel, activeBrand, currentSlide).text,
                              textTransform:
                                currentSlide.titleStyleOverride === "none"
                                  ? "none"
                                  : currentSlide.titleStyleOverride ||
                                    "uppercase",
                            }}
                          >
                            {renderFormattedText(
                              currentSlide.title ||
                                (currentSlide.ctaType === "website"
                                  ? "Kunjungi Website Kami"
                                  : "Bermanfaat? Yuk Dukung!"),
                              getSlideColors(carousel, activeBrand, currentSlide),
                              carousel.theme,
                            )}
                          </h2>
                          {renderSubtitle(
                            {
                              ...currentSlide,
                              subtitleStyleOverride:
                                currentSlide.subtitleStyleOverride || "plain",
                            },
                            getSlideColors(carousel, activeBrand, currentSlide),
                            carousel.theme,
                            false,
                            carousel.fontHeading,
                            carousel.fontBody,
                          )}
                        </div>

                        {currentSlide.ctaType === "website" ? (
                          /* Website URL & Custom Button Conversion Layout */
                          <div className="w-full max-w-[280px] space-y-2.5 pt-1 flex flex-col items-center justify-center">
                            {currentSlide.ctaUrl &&
                              carousel.theme !== "neo-grid" && (
                                <div
                                  className={`py-1 px-3 rounded-full border text-[9px] font-mono tracking-wide bg-black/5 text-stone-700 inline-flex items-center gap-1 border-black/10 mx-auto ${
                                    carousel.theme === "neobrutalism"
                                      ? "border-2 border-black rounded-none shadow-[1px_1px_0px_#000] bg-white"
                                      : ""
                                  }`}
                                >
                                  <Globe className="w-3 h-3 text-stone-500 shrink-0" />
                                  <span className="truncate max-w-[180px]">
                                    {currentSlide.ctaUrl}
                                  </span>
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
                                carousel.theme !== "neobrutalism" &&
                                carousel.theme !== "neo-grid"
                                  ? {
                                      backgroundColor:
                                        getSlideColors(carousel, activeBrand, currentSlide).primary,
                                      color: "#ffffff",
                                      borderColor: `${getSlideColors(carousel, activeBrand, currentSlide).text}15`,
                                    }
                                  : undefined
                              }
                            >
                              {carousel.theme === "neo-grid" ? (
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex flex-col items-start text-left">
                                    <span className="text-[10px] font-black uppercase tracking-wider">
                                      {currentSlide.ctaButtonText ||
                                        "Kunjungi Sekarang"}
                                    </span>
                                    <span className="text-[8px] font-mono opacity-80 mt-0.5 normal-case">
                                      {currentSlide.ctaUrl ||
                                        activeBrand.website ||
                                        "link di bio"}
                                    </span>
                                  </div>
                                  <ArrowRight className="w-4 h-4 text-white shrink-0" />
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-1.5">
                                  <span className="truncate">
                                    {currentSlide.ctaButtonText ||
                                      "Kunjungi Sekarang"}
                                  </span>
                                  <ExternalLink className="w-3.5 h-3.5 text-current shrink-0" />
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          /* Social Interaction Buttons Grid */
                          <div className="grid grid-cols-4 gap-2.5 w-full max-w-[280px] pt-2">
                            <div
                              className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 border ${
                                carousel.theme === "neobrutalism" ||
                                carousel.theme === "neo-grid"
                                  ? "bg-white border-2 border-black shadow-[1.5px_1.5px_0px_#000]"
                                  : "bg-white/5 border-white/10"
                              }`}
                            >
                              <Heart className="w-4 h-4 text-rose-500 animate-bounce" />
                              <span
                                className="text-[8px] font-bold uppercase tracking-wider"
                                style={{
                                  color: getSlideColors(carousel, activeBrand, currentSlide).text,
                                }}
                              >
                                Suka
                              </span>
                            </div>
                            <div
                              className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 border ${
                                carousel.theme === "neobrutalism" ||
                                carousel.theme === "neo-grid"
                                  ? "bg-white border-2 border-black shadow-[1.5px_1.5px_0px_#000]"
                                  : "bg-white/5 border-white/10"
                              }`}
                            >
                              <MessageCircle className="w-4 h-4 text-sky-500" />
                              <span
                                className="text-[8px] font-bold uppercase tracking-wider"
                                style={{
                                  color: getSlideColors(carousel, activeBrand, currentSlide).text,
                                }}
                              >
                                Komen
                              </span>
                            </div>
                            <div
                              className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 border ${
                                carousel.theme === "neobrutalism" ||
                                carousel.theme === "neo-grid"
                                  ? "bg-white border-2 border-black shadow-[1.5px_1.5px_0px_#000]"
                                  : "bg-white/5 border-white/10"
                              }`}
                            >
                              <Share2 className="w-4 h-4 text-emerald-500" />
                              <span
                                className="text-[8px] font-bold uppercase tracking-wider"
                                style={{
                                  color: getSlideColors(carousel, activeBrand, currentSlide).text,
                                }}
                              >
                                Bagikan
                              </span>
                            </div>
                            <div
                              className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 border ${
                                carousel.theme === "neobrutalism" ||
                                carousel.theme === "neo-grid"
                                  ? "bg-white border-2 border-black shadow-[1.5px_1.5px_0px_#000]"
                                  : "bg-white/5 border-white/10"
                              }`}
                            >
                              <Bookmark className="w-4 h-4 text-amber-500" />
                              <span
                                className="text-[8px] font-bold uppercase tracking-wider"
                                style={{
                                  color: getSlideColors(carousel, activeBrand, currentSlide).text,
                                }}
                              >
                                Simpan
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Brand Profile Row ala KelasClaude */}
                        {carousel.theme === "neo-grid" && (
                          <div className="w-full max-w-[280px] pt-3 border-t border-dashed border-stone-400/20 flex items-center gap-2.5 justify-start mt-3 select-none">
                            <div className="w-8 h-8 rounded-full border border-black overflow-hidden shrink-0 shadow-[1px_1px_0px_#000] bg-white">
                              {activeBrand.logoUrl ? (
                                <img
                                  src={activeBrand.logoUrl}
                                  className="w-full h-full object-cover"
                                  alt=""
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-full h-full bg-[#ea580c] text-white flex items-center justify-center font-black text-[10px]">
                                  {activeBrand.name
                                    .substring(0, 2)
                                    .toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col items-start text-left leading-tight">
                              <span
                                className="text-[10px] font-black tracking-tight"
                                style={{
                                  color: getSlideColors(carousel, activeBrand, currentSlide).text,
                                }}
                              >
                                {activeBrand.name}
                              </span>
                              <span
                                className="text-[8px] font-medium opacity-70"
                                style={{
                                  color: getSlideColors(carousel, activeBrand, currentSlide).text,
                                }}
                              >
                                Kreator & Edukator
                              </span>
                            </div>
                          </div>
                        )}

                        {currentSlide.body &&
                          currentSlide.body.filter((i) => i && i.trim() !== "")
                            .length > 0 &&
                          carousel.theme !== "neo-grid" && (
                            <div className="pt-2">
                              <p
                                className="text-[9px] font-mono tracking-wider opacity-60"
                                style={{
                                  color: getSlideColors(carousel, activeBrand, currentSlide).text,
                                }}
                              >
                                {renderFormattedText(
                                  currentSlide.body[0],
                                  getSlideColors(carousel, activeBrand, currentSlide),
                                  carousel.theme,
                                )}
                              </p>
                            </div>
                          )}
                      </div>
                    ) : currentSlide.slideType === "quote" ? (
                      /* 5. Quotation Layout */
                      <div className="space-y-3 italic text-center py-4 w-full my-auto">
                        <span className="text-3xl font-serif opacity-30 block leading-none">
                          “
                        </span>
                        <p
                          className={`font-medium leading-relaxed text-balance ${
                            currentSlide.headingSizeOverride === "sm"
                              ? "text-xs"
                              : currentSlide.headingSizeOverride === "md"
                                ? "text-sm"
                                : currentSlide.headingSizeOverride === "lg"
                                  ? "text-lg"
                                  : currentSlide.headingSizeOverride === "xl"
                                    ? "text-xl"
                                    : currentSlide.headingSizeOverride === "2xl"
                                      ? "text-2xl"
                                      : "text-base"
                          }`}
                          style={{
                            fontFamily:
                              currentSlide.titleFontOverride ||
                              carousel.fontHeading,
                            color:
                              currentSlide.titleColorOverride ||
                              getSlideColors(carousel, activeBrand, currentSlide).text,
                            textTransform:
                              currentSlide.titleStyleOverride === "none"
                                ? "none"
                                : currentSlide.titleStyleOverride || undefined,
                          }}
                        >
                          {renderFormattedText(
                            currentSlide.title,
                            getSlideColors(carousel, activeBrand, currentSlide),
                            carousel.theme,
                          )}
                        </p>
                        {renderSubtitle(
                          {
                            ...currentSlide,
                            subtitleStyleOverride:
                              currentSlide.subtitleStyleOverride || "plain",
                          },
                          getSlideColors(carousel, activeBrand, currentSlide),
                          carousel.theme,
                          false,
                          carousel.fontHeading,
                          carousel.fontBody,
                        )}
                      </div>
                    ) : (
                      /* 6. Standard Text & Bullet Points Content Layout */
                      <div className="space-y-4 w-full relative">
                        {carousel.theme === "neo-grid" && (
                          <div
                            className="absolute -top-14 -left-6 text-[80px] font-black tracking-tighter opacity-[0.08] select-none pointer-events-none font-sans"
                            style={{ color: getSlideColors(carousel, activeBrand, currentSlide).text }}
                          >
                            {String(currentSlideIdx + 1).padStart(2, "0")}
                          </div>
                        )}
                        <div
                          className={`space-y-1.5 flex flex-col ${
                            currentSlide.textAlignment === "center"
                              ? "items-center text-center"
                              : currentSlide.textAlignment === "right"
                                ? "items-end text-right"
                                : "items-start text-left"
                          }`}
                        >
                          {currentSlide.showTitleIcon && (
                            <div className="p-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 mb-1 shrink-0">
                              {(() => {
                                const IconComp = getSlideIcon(
                                  currentSlide.titleIcon || currentSlide.icon,
                                  Sparkles,
                                );
                                return (
                                  <IconComp
                                    className="w-4 h-4 text-amber-500 animate-pulse"
                                    style={{
                                      color:
                                        getSlideColors(carousel, activeBrand, currentSlide).primary,
                                    }}
                                  />
                                );
                              })()}
                            </div>
                          )}
                          {renderSubtitle(
                            currentSlide,
                            getSlideColors(carousel, activeBrand, currentSlide),
                            carousel.theme,
                            false,
                            carousel.fontHeading,
                            carousel.fontBody,
                          )}
                          <h3
                            className={`font-bold tracking-tight leading-snug ${
                              currentSlide.headingSizeOverride === "sm"
                                ? "text-xs"
                                : currentSlide.headingSizeOverride === "md"
                                  ? "text-sm"
                                  : currentSlide.headingSizeOverride === "lg"
                                    ? "text-lg"
                                    : currentSlide.headingSizeOverride === "xl"
                                      ? "text-xl"
                                      : currentSlide.headingSizeOverride ===
                                          "2xl"
                                        ? "text-2xl"
                                        : "text-base"
                            }`}
                            style={{
                              fontFamily:
                                currentSlide.titleFontOverride ||
                                carousel.fontHeading,
                              color:
                                currentSlide.titleColorOverride ||
                                getSlideColors(carousel, activeBrand, currentSlide).text,
                              textTransform:
                                currentSlide.titleStyleOverride === "none"
                                  ? "none"
                                  : currentSlide.titleStyleOverride ||
                                    undefined,
                            }}
                          >
                            {renderFormattedText(
                              currentSlide.title,
                              getSlideColors(carousel, activeBrand, currentSlide),
                              carousel.theme,
                            )}
                          </h3>
                        </div>

                        {/* Bullet list / paragraphs */}
                        {currentSlide.body &&
                          currentSlide.body.filter((i) => i && i.trim() !== "")
                            .length > 0 && (
                            <div
                              className={
                                carousel.theme === "neo-grid"
                                  ? `grid ${currentSlide.body.length > 2 ? "grid-cols-2" : "grid-cols-1"} gap-2.5 w-full pt-1`
                                  : `space-y-2.5 flex flex-col w-full ${
                                      currentSlide.textAlignment === "center"
                                        ? "items-center text-center"
                                        : currentSlide.textAlignment === "right"
                                          ? "items-end text-right"
                                          : "items-start text-left"
                                    }`
                              }
                            >
                              {currentSlide.body
                                .filter((i) => i && i.trim() !== "")
                                .map((item, bIdx) => {
                                  if (carousel.theme === "neo-grid") {
                                    return (
                                      <div
                                        key={bIdx}
                                        className="p-2.5 bg-white border border-black text-black font-semibold text-[10px] flex items-center gap-2 shadow-[2px_2px_0px_#000] rounded-lg text-left"
                                      >
                                        <div className="w-5 h-5 rounded border border-black bg-emerald-100 flex items-center justify-center font-bold text-emerald-800 text-[8px] shrink-0 shadow-[1px_1px_0px_#000] font-mono">
                                          {String(bIdx + 1).padStart(2, "0")}
                                        </div>
                                        <span
                                          className="text-stone-800 font-sans tracking-wide leading-snug"
                                          style={{
                                            fontFamily:
                                              currentSlide.bodyFontOverride ||
                                              carousel.fontBody,
                                            color:
                                              currentSlide.bodyColorOverride ||
                                              undefined,
                                            fontSize:
                                              currentSlide.bodySizeOverride ||
                                              undefined,
                                          }}
                                        >
                                          {renderFormattedText(
                                            item,
                                            getSlideColors(carousel, activeBrand, currentSlide),
                                            carousel.theme,
                                          )}
                                        </span>
                                      </div>
                                    );
                                  }
                                  return (
                                    <div
                                      key={bIdx}
                                      className={`flex gap-2.5 ${
                                        currentSlide.textAlignment === "center"
                                          ? "flex-col items-center text-center"
                                          : currentSlide.textAlignment ===
                                              "right"
                                            ? "flex-row-reverse text-right"
                                            : "flex-row text-left"
                                      } items-start`}
                                    >
                                      {(currentSlide.slideType === "list" ||
                                        currentSlide.slideType === "content") && (
                                        <PointMarker
                                          index={bIdx}
                                          marker={currentSlide.pointMarker}
                                          color={
                                            getSlideColors(carousel, activeBrand, currentSlide)
                                              .primary
                                          }
                                        />
                                      )}
                                      <p
                                        className="text-xs leading-relaxed font-normal opacity-90 text-balance"
                                        style={{
                                          fontFamily:
                                            currentSlide.bodyFontOverride ||
                                            carousel.fontBody,
                                          color:
                                            currentSlide.bodyColorOverride ||
                                            getSlideColors(carousel, activeBrand, currentSlide).text,
                                          fontSize:
                                            currentSlide.bodySizeOverride ||
                                            undefined,
                                        }}
                                      >
                                        {renderFormattedText(
                                          item,
                                          getSlideColors(carousel, activeBrand, currentSlide),
                                          carousel.theme,
                                        )}
                                      </p>
                                    </div>
                                  );
                                })}
                            </div>
                          )}
                      </div>
                    )}

                    {/* Bottom Image if position is bottom */}
                    {currentSlide.showImage &&
                      currentSlide.imageUrl &&
                      currentSlide.imagePosition === "bottom" && (
                        <div className="w-full flex justify-center mt-2.5 select-none">
                          {renderSlideImage(currentSlide, "max-h-[90px]")}
                        </div>
                      )}
                  </div>

                  {/* Right image column if position is right */}
                  {currentSlide.showImage &&
                    currentSlide.imageUrl &&
                    currentSlide.imagePosition === "right" && (
                      <div className="w-[40%] shrink-0 flex justify-center items-center select-none">
                        {renderSlideImage(currentSlide, "max-h-[160px]")}
                      </div>
                    )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* SLIDE FOOTER: Branding watermark, pagination, progress track */}
            <div className="px-5 pb-5 pt-3 z-10 space-y-3">
              {/* CTA bar if applicable */}
              {currentSlide.ctaText && (
                <div
                  className={`w-full py-2 px-3 text-center text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all border ${
                    carousel.theme === "neobrutalism"
                      ? "bg-[#4d96ff] border-2 border-black text-black rounded-none shadow-[3px_3px_0px_#000] font-black uppercase tracking-wider"
                      : "rounded-lg shadow-sm"
                  }`}
                  style={
                    carousel.theme !== "neobrutalism"
                      ? {
                          backgroundColor: getSlideColors(carousel, activeBrand, currentSlide).primary,
                          color: "#ffffff",
                          borderColor: `${getSlideColors(carousel, activeBrand, currentSlide).text}10`,
                        }
                      : undefined
                  }
                >
                  <span>{currentSlide.ctaText}</span>
                  <ArrowRight className="w-3 h-3 animate-pulse text-current" />
                </div>
              )}

              {showBottomWatermark ? (
                <div
                  className="flex items-center justify-between border-t border-dashed pt-2.5 opacity-80"
                  style={{
                    borderColor: `${getSlideColors(carousel, activeBrand, currentSlide).text}20`,
                  }}
                >
                  <span
                    className="text-[9px] font-mono tracking-wider opacity-60"
                    style={{ color: getSlideColors(carousel, activeBrand, currentSlide).text }}
                  >
                    {getWatermarkText(activeBrand, currentSlide)}
                  </span>

                  {/* Slider Pagination */}
                  <div className="flex items-center gap-2">
                    {/* Progress bar */}
                    <div className="w-14 h-1 bg-slate-200/20 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          backgroundColor: getSlideColors(carousel, activeBrand, currentSlide).primary,
                          width: `${((currentSlideIdx + 1) / carousel.slides.length) * 100}%`,
                        }}
                      />
                    </div>
                    <span
                      className="text-[10px] font-mono font-bold"
                      style={{ color: getSlideColors(carousel, activeBrand, currentSlide).text }}
                    >
                      {String(currentSlideIdx + 1).padStart(2, "0")} /{" "}
                      {String(carousel.slides.length).padStart(2, "0")}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-end pt-1 opacity-80">
                  {/* Slider Pagination */}
                  <div className="flex items-center gap-2">
                    <div className="w-14 h-1 bg-slate-200/20 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          backgroundColor: getSlideColors(carousel, activeBrand, currentSlide).primary,
                          width: `${((currentSlideIdx + 1) / carousel.slides.length) * 100}%`,
                        }}
                      />
                    </div>
                    <span
                      className="text-[10px] font-mono font-bold"
                      style={{ color: getSlideColors(carousel, activeBrand, currentSlide).text }}
                    >
                      {String(currentSlideIdx + 1).padStart(2, "0")} /{" "}
                      {String(carousel.slides.length).padStart(2, "0")}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SWIPING / PAGINATION BUTTONS */}
          <button
            onClick={handlePrev}
            disabled={currentSlideIdx === 0}
            className="absolute left-3 w-9 h-9 rounded-full bg-white/95 border border-[#E5E2DD] text-[#1A1A1A] flex items-center justify-center hover:bg-[#F3F1EE] disabled:opacity-30 disabled:hover:bg-white/95 shadow-md transition cursor-pointer z-25"
            title="Slide Sebelumnya"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleNext}
            disabled={currentSlideIdx === carousel.slides.length - 1}
            className="absolute right-3 w-9 h-9 rounded-full bg-white/95 border border-[#E5E2DD] text-[#1A1A1A] flex items-center justify-center hover:bg-[#F3F1EE] disabled:opacity-30 disabled:hover:bg-white/95 shadow-md transition cursor-pointer z-25"
            title="Slide Berikutnya"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* TIMELINE (MOVED TO RIGHT) */}
        <div className="w-full lg:w-[120px] shrink-0 space-y-3 flex flex-col">
          <span className="text-[10px] font-bold text-[#8C8881] uppercase tracking-[0.1em] block">
            Timeline Slide
          </span>
          <div className="flex lg:flex-col items-center lg:items-stretch gap-2 overflow-auto pb-2 lg:pb-0 pr-1 scrollbar-thin lg:flex-1">
            {carousel.slides.map((slide, idx) => {
              const isSelected = slide.id === activeSlideId;
              return (
                <button
                  key={slide.id}
                  onClick={() => onSetActiveSlide(slide.id)}
                  className={`p-2.5 rounded-xl border shrink-0 text-left transition-all w-[95px] lg:w-full h-[72px] flex flex-col justify-between ${
                    isSelected
                      ? "bg-[#F3F1EE] border-2 border-[#1A1A1A] shadow-md"
                      : "bg-white border-[#E5E2DD] hover:border-[#1A1A1A]"
                  }`}
                >
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded leading-none ${
                      isSelected
                        ? "bg-[#1A1A1A] text-white"
                        : "bg-[#F3F1EE] text-[#8C8881] border border-[#DED9D1]"
                    }`}
                  >
                    S{idx + 1}
                  </span>
                  <span className="text-[10px] font-bold text-[#1A1A1A] truncate w-full block mt-1">
                    {slide.title || `Slide ${idx + 1}`}
                  </span>
                  <span className="text-[8px] text-[#8C8881] capitalize font-mono leading-none">
                    {slide.slideType.replace("_", " ")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* HIDDEN EXPORT RENDER CONTAINER (For extremely high-res, clean exports at 1080px width) */}
      <div
        style={{
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
          zIndex: -10,
        }}
      >
        <div ref={exportContainerRef} className="flex flex-col">
          {carousel.slides.map((slide, idx) => (
            <SlideCanvas
              key={`export-${slide.id}`}
              carousel={carousel}
              brand={activeBrand}
              slide={slide}
              index={idx}
              width={mockupWidth}
              height={mockupHeight}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
export default SlideViewer;
