import React, { useEffect, useState } from "react";
import { Player } from "@remotion/player";
import { MotionVideo } from "../../remotion/MotionVideo";
import { motionDuration } from "./MotionScene";
import {
  Brand,
  MotionBackground,
  MotionKind,
  MotionLayout,
  MotionStyleConfig,
  MotionVideo as MotionVideoType,
  CarouselSize,
} from "../types";
import {
  getVideoDimensions,
  googleFontCss,
  motionStyleFromPreset,
  FONT_PAIRINGS,
  TEMPLATE_PRESETS,
} from "../utils";
import {
  Sparkles,
  Loader2,
  Film,
  Download,
  Wand2,
  Plus,
  Trash2,
  Play,
  Palette,
  ChevronDown,
  Code2,
} from "lucide-react";

const SIZE_OPTIONS: { value: CarouselSize; label: string }[] = [
  { value: "story", label: "9:16 Reels / TikTok" },
  { value: "portrait", label: "4:5 Feed" },
  { value: "square", label: "1:1 Square" },
  { value: "thumbnail", label: "16:9 Landscape" },
];

const ICON_OPTIONS = [
  "Sparkles", "Lightbulb", "TrendingUp", "Target", "Flame", "Zap", "Rocket",
  "CheckCircle", "Brain", "DollarSign", "BarChart3", "Clock", "Users", "Star",
  "Heart", "Shield", "BookOpen", "MessageCircle", "Globe",
];

const FONT_OPTIONS = Array.from(
  new Set(FONT_PAIRINGS.flatMap((f) => [f.heading, f.body])),
);

const MOTION_OPTIONS: { value: MotionKind; label: string }[] = [
  { value: "mask", label: "Mask Reveal (naik dari bawah)" },
  { value: "typewriter", label: "Typewriter (kata per kata)" },
  { value: "pop", label: "Pop (membal)" },
  { value: "slide", label: "Slide (dari kiri)" },
  { value: "blur", label: "Blur In" },
  { value: "zoom", label: "Zoom In (seluruh blok)" },
];

const LAYOUT_OPTIONS: { value: MotionLayout; label: string }[] = [
  { value: "center", label: "Center (ikon + teks tengah)" },
  { value: "big", label: "Big Headline (teks raksasa)" },
  { value: "left", label: "Rata Kiri" },
  { value: "list", label: "List Bernomor (pisah per baris)" },
];

const BG_OPTIONS: { value: MotionBackground; label: string }[] = [
  { value: "solid", label: "Warna Solid" },
  { value: "gradient", label: "Gradien (dari aksen)" },
  { value: "mesh", label: "Mesh Blob" },
  { value: "grid", label: "Grid Teknis" },
  { value: "image", label: "Foto (URL)" },
];

const inputCls =
  "w-full px-3 py-2 bg-white border-2 border-black rounded-lg text-xs font-bold outline-none focus:shadow-[2px_2px_0px_#000] transition";
const labelCls =
  "block text-[10px] font-black uppercase tracking-wider mb-1 text-stone-700";

const FontField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
}> = ({ label, value, onChange }) => {
  const known = FONT_OPTIONS.includes(value);
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <select
        value={known ? value : "__custom"}
        onChange={(e) => onChange(e.target.value === "__custom" ? "" : e.target.value)}
        className={inputCls}
      >
        {FONT_OPTIONS.map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
        <option value="__custom">Custom…</option>
      </select>
      {!known && (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="mis. Poppins, Montserrat"
          className={`${inputCls} mt-1.5`}
        />
      )}
    </div>
  );
};

interface VideoStudioProps {
  brands: Brand[];
  activeBrandId: string;
  onBack?: () => void;
}

export const VideoStudio: React.FC<VideoStudioProps> = ({
  brands,
  activeBrandId,
  onBack,
}) => {
  const brand = brands.find((b) => b.id === activeBrandId) || brands[0];

  const [topic, setTopic] = useState("");
  const [styleKind, setStyleKind] = useState<"educational" | "marketing" | "tips">("tips");
  const [size, setSize] = useState<CarouselSize>("story");
  const [theme, setTheme] = useState("gradient");
  const [sceneCount, setSceneCount] = useState(5);
  const [style, setStyle] = useState<MotionStyleConfig>(() =>
    motionStyleFromPreset("gradient", brand),
  );
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [loading, setLoading] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [video, setVideo] = useState<MotionVideoType | null>(null);

  // Load custom fonts for the browser preview
  useEffect(() => {
    const el = document.createElement("style");
    el.id = "motion-font-preview";
    el.textContent = googleFontCss([style.fontHeading, style.fontBody]);
    document.head.appendChild(el);
    return () => el.remove();
  }, [style.fontHeading, style.fontBody]);

  const buildVideo = (): MotionVideoType | null =>
    video
      ? {
          ...video,
          size,
          theme,
          fontHeading: style.fontHeading,
          fontBody: style.fontBody,
          style,
        }
      : null;

  const preview = buildVideo();
  const dims = getVideoDimensions({ size });
  const playerHeight = 500;
  const playerWidth = Math.round((playerHeight * dims.width) / dims.height);

  const patchStyle = (patch: Partial<MotionStyleConfig>) =>
    setStyle((s) => ({ ...s, ...patch }));

  const applyPreset = (t: string) => {
    setTheme(t);
    const preset = motionStyleFromPreset(t, brand);
    setStyle((prev) => ({
      ...preset,
      motion: prev.motion,
      layout: prev.layout,
      backgroundStyle: prev.backgroundStyle,
      backgroundImage: prev.backgroundImage,
    }));
  };

  const generate = async () => {
    if (!topic.trim()) {
      setError("Isi topik dulu.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          topic,
          style: styleKind,
          sceneCount,
          brandName: brand?.name,
          brandHandle: brand?.handle,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Gagal generate (${res.status})`);
      const scenes = (Array.isArray(data.scenes) ? data.scenes : []).map(
        (s: any, i: number) => ({
          id: `scene-${Date.now()}-${i}`,
          text: String(s?.text || ""),
          subtext: String(s?.subtext || ""),
          icon: String(s?.icon || "Sparkles"),
        }),
      );
      if (!scenes.length) throw new Error("AI tidak mengembalikan scene.");
      setVideo({
        id: `motion-${Date.now()}`,
        title: String(data.title || topic),
        brandId: brand?.id || "",
        size,
        theme,
        fontHeading: style.fontHeading,
        fontBody: style.fontBody,
        scenes,
      });
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const renderVideo = async () => {
    const payloadVideo = buildVideo();
    if (!payloadVideo) return;
    setRendering(true);
    setError(null);
    try {
      const res = await fetch("/api/render-motion-video", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ video: payloadVideo, brand }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.error || `Render gagal (${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const clean = (payloadVideo.title || "motion")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
      const a = document.createElement("a");
      a.href = url;
      a.download = `${clean || "motion"}_video.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setRendering(false);
    }
  };

  const updateScene = (i: number, patch: Partial<MotionVideoType["scenes"][number]>) =>
    setVideo((v) =>
      v ? { ...v, scenes: v.scenes.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) } : v,
    );
  const removeScene = (i: number) =>
    setVideo((v) => (v ? { ...v, scenes: v.scenes.filter((_, idx) => idx !== i) } : v));
  const addScene = () =>
    setVideo((v) =>
      v
        ? {
            ...v,
            scenes: [
              ...v.scenes,
              { id: `scene-${Date.now()}`, text: "Scene baru", subtext: "", icon: "Sparkles" },
            ],
          }
        : v,
    );

  return (
    <div className="animate-fade-in space-y-4">
      {/* HEADER */}
      <div className="flex justify-between items-center bg-white border-[3px] border-black p-3.5 rounded-xl shadow-[4px_4px_0px_#000]">
        <div className="flex items-center gap-2">
          <Film className="w-5 h-5 text-[#ff6b6b]" />
          <span className="font-black uppercase text-xs sm:text-sm tracking-wider">
            Video Motion Studio — Kinetic Typography
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:block px-2 py-0.5 bg-black text-white rounded text-[10px] font-mono font-bold uppercase tracking-widest">
            Remotion
          </span>
          {onBack && (
            <button
              onClick={onBack}
              className="px-3 py-2 bg-yellow-300 hover:bg-yellow-400 text-black font-black uppercase text-[10px] border-2 border-black rounded-lg transition shadow-[2.5px_2.5px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
            >
              ← Studio
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border-2 border-red-500 rounded-xl text-xs font-bold text-red-700 shadow-[2px_2px_0px_#000]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT: FORM + STYLE + SCENES */}
        <section className="lg:col-span-5 bg-white rounded-xl border-[3px] border-black p-5 space-y-4 shadow-[4px_4px_0px_#000]">
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-[#4d96ff]" />
            <h3 className="text-xs font-black uppercase tracking-wider">
              1. Generate Script dari AI
            </h3>
          </div>

          <div>
            <label className={labelCls}>Topik Video</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={3}
              placeholder="mis. 3 kebiasaan pagi yang bikin produktif"
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Gaya Konten</label>
              <select
                value={styleKind}
                onChange={(e) => setStyleKind(e.target.value as any)}
                className={inputCls}
              >
                <option value="tips">Tips Praktis</option>
                <option value="educational">Edukasi</option>
                <option value="marketing">Marketing</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Jumlah Scene: {sceneCount}</label>
              <input
                type="range"
                min={3}
                max={10}
                value={sceneCount}
                onChange={(e) => setSceneCount(Number(e.target.value))}
                className="w-full accent-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Ukuran Video</label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value as CarouselSize)}
                className={inputCls}
              >
                {SIZE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Preset Awal</label>
              <select
                value={theme}
                onChange={(e) => applyPreset(e.target.value)}
                className={inputCls}
              >
                {TEMPLATE_PRESETS.map((p) => (
                  <option key={p.id} value={p.theme}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={generate}
            disabled={loading}
            className="w-full py-3 bg-yellow-300 hover:bg-yellow-400 text-black border-2 border-black rounded-lg text-xs font-black uppercase tracking-wider transition shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Menyusun script...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Generate Script Video
              </>
            )}
          </button>

          {/* STYLE PANEL */}
          <div className="pt-3 border-t-2 border-dashed border-stone-200 space-y-3">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#6bcb77]" />
              <h3 className="text-xs font-black uppercase tracking-wider">
                Gaya Video (bebas)
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Gaya Motion</label>
                <select
                  value={style.motion}
                  onChange={(e) => patchStyle({ motion: e.target.value as MotionKind })}
                  className={inputCls}
                >
                  {MOTION_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Layout Scene</label>
                <select
                  value={style.layout}
                  onChange={(e) => patchStyle({ layout: e.target.value as MotionLayout })}
                  className={inputCls}
                >
                  {LAYOUT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Background</label>
                <select
                  value={style.backgroundStyle}
                  onChange={(e) =>
                    patchStyle({ backgroundStyle: e.target.value as MotionBackground })
                  }
                  className={inputCls}
                >
                  {BG_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              {style.backgroundStyle === "image" && (
                <div>
                  <label className={labelCls}>URL Foto</label>
                  <input
                    value={style.backgroundImage || ""}
                    onChange={(e) => patchStyle({ backgroundImage: e.target.value })}
                    placeholder="https://..."
                    className={inputCls}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FontField
                label="Font Judul"
                value={style.fontHeading}
                onChange={(v) => patchStyle({ fontHeading: v })}
              />
              <FontField
                label="Font Body"
                value={style.fontBody}
                onChange={(v) => patchStyle({ fontBody: v })}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {(
                [
                  ["background", "Latar"],
                  ["textColor", "Teks"],
                  ["primaryColor", "Aksen"],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <label className={labelCls}>{label}</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={
                        style[key].startsWith("#") ? style[key] : "#ffffff"
                      }
                      onChange={(e) => patchStyle({ [key]: e.target.value } as any)}
                      className="w-8 h-8 rounded border-2 border-black cursor-pointer shrink-0 bg-white"
                    />
                    <input
                      value={style[key]}
                      onChange={(e) => patchStyle({ [key]: e.target.value } as any)}
                      className="w-full px-1.5 py-1 bg-white border border-stone-300 rounded text-[10px] font-mono outline-none focus:border-black"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowAdvanced((s) => !s)}
              className="w-full flex items-center justify-between px-3 py-2 bg-stone-100 border-2 border-black rounded-lg text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px]"
            >
              <span className="flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5" /> Format Kustom (CSS)
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition ${showAdvanced ? "rotate-180" : ""}`}
              />
            </button>

            {showAdvanced && (
              <div className="space-y-1.5">
                <textarea
                  value={style.customCss || ""}
                  onChange={(e) => patchStyle({ customCss: e.target.value })}
                  rows={5}
                  placeholder={".motion-headline { text-shadow: 4px 4px 0 #000; }\n@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@900&display=swap');"}
                  className="w-full px-3 py-2 bg-stone-900 text-green-300 border-2 border-black rounded-lg text-[11px] font-mono outline-none"
                />
                <p className="text-[9px] text-stone-500 leading-snug">
                  CSS saja (tanpa JS). Kelas tersedia:{" "}
                  <code>.motion-root .motion-headline .motion-subtext .motion-icon .motion-footer</code>
                </p>
              </div>
            )}
          </div>

          {video && (
            <div className="space-y-3 pt-3 border-t-2 border-dashed border-stone-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider">
                  2. Edit Scene ({video.scenes.length})
                </h3>
                <button
                  onClick={addScene}
                  className="px-2 py-1 bg-stone-100 border-2 border-black rounded-lg text-[10px] font-black uppercase flex items-center gap-1 shadow-[1.5px_1.5px_0px_#000] active:translate-x-[1px] active:translate-y-[1px]"
                >
                  <Plus className="w-3 h-3" /> Scene
                </button>
              </div>

              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 no-scrollbar">
                {video.scenes.map((s, i) => (
                  <div
                    key={s.id}
                    className="p-2.5 bg-stone-50 border-2 border-black rounded-lg space-y-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono font-black bg-black text-white px-1.5 py-0.5 rounded">
                        S{i + 1}
                      </span>
                      <select
                        value={s.icon}
                        onChange={(e) => updateScene(i, { icon: e.target.value })}
                        className="text-[10px] font-bold border border-stone-300 rounded px-1 py-0.5 bg-white"
                      >
                        {ICON_OPTIONS.map((ic) => (
                          <option key={ic} value={ic}>
                            {ic}
                          </option>
                        ))}
                      </select>
                      <select
                        value={s.motion || ""}
                        onChange={(e) =>
                          updateScene(i, {
                            motion: (e.target.value || undefined) as MotionKind | undefined,
                          })
                        }
                        className="text-[10px] font-bold border border-stone-300 rounded px-1 py-0.5 bg-white"
                        title="Override motion scene ini"
                      >
                        <option value="">Motion: global</option>
                        {MOTION_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.value}
                          </option>
                        ))}
                      </select>
                      <select
                        value={s.layout || ""}
                        onChange={(e) =>
                          updateScene(i, {
                            layout: (e.target.value || undefined) as MotionLayout | undefined,
                          })
                        }
                        className="text-[10px] font-bold border border-stone-300 rounded px-1 py-0.5 bg-white"
                        title="Override layout scene ini"
                      >
                        <option value="">Layout: global</option>
                        {LAYOUT_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.value}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => removeScene(i)}
                        disabled={video.scenes.length <= 1}
                        className="ml-auto text-red-500 disabled:opacity-30"
                        title="Hapus scene"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input
                      value={s.text}
                      onChange={(e) => updateScene(i, { text: e.target.value })}
                      placeholder="Headline (**tebal**, enter = baris baru)"
                      className="w-full px-2 py-1.5 bg-white border border-stone-300 rounded text-xs font-bold outline-none focus:border-black"
                    />
                    <input
                      value={s.subtext || ""}
                      onChange={(e) => updateScene(i, { subtext: e.target.value })}
                      placeholder="Subtext pendukung (opsional)"
                      className="w-full px-2 py-1.5 bg-white border border-stone-300 rounded text-[11px] outline-none focus:border-black"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* RIGHT: PREVIEW */}
        <section className="lg:col-span-7 lg:sticky lg:top-4 space-y-4">
          <div className="bg-white rounded-xl border-[3px] border-black p-4 shadow-[4px_4px_0px_#000]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-[#6bcb77]" />
                <h3 className="text-xs font-black uppercase tracking-wider">
                  Preview Motion
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-stone-500">
                {dims.width}x{dims.height} • {video ? video.scenes.length : 0} scene
              </span>
            </div>

            <div className="flex justify-center bg-[#F3F1EE] rounded-xl border border-[#E5E2DD] p-4">
              {preview ? (
                <div
                  style={{ width: playerWidth, height: playerHeight }}
                  className="rounded-xl overflow-hidden border-2 border-black shadow-[4px_4px_0px_#000]"
                >
                  <Player
                    key={`${size}-${theme}`}
                    component={MotionVideo}
                    inputProps={{ video: preview, brand, skipFontLoader: true }}
                    durationInFrames={motionDuration(preview.scenes.length)}
                    fps={30}
                    compositionWidth={dims.width}
                    compositionHeight={dims.height}
                    controls
                    loop
                    autoPlay
                    style={{ width: "100%", height: "100%" }}
                  />
                </div>
              ) : (
                <div className="w-full h-[320px] flex flex-col items-center justify-center text-center gap-2 text-stone-400">
                  <Film className="w-10 h-10" />
                  <p className="text-xs font-bold uppercase tracking-wider">
                    Isi topik lalu generate untuk lihat preview motion
                  </p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={renderVideo}
            disabled={!video || rendering}
            className="w-full py-4 bg-[#ff6b6b] hover:bg-[#e85b5b] text-black border-[3px] border-black rounded-xl text-sm font-black uppercase tracking-wider transition shadow-[4px_4px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_#000] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {rendering ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Merender MP4... (~30-60s)
              </>
            ) : (
              <>
                <Download className="w-5 h-5" /> Render & Unduh MP4
              </>
            )}
          </button>

          {rendering && (
            <p className="text-center text-[10px] text-stone-500 italic">
              Jangan tutup halaman ini. Video dirender frame-by-frame di server.
            </p>
          )}
        </section>
      </div>
    </div>
  );
};

export default VideoStudio;
