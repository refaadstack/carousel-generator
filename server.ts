import express from "express";
import path from "path";
import fs from "fs";
import os from "os";
import crypto from "crypto";
import { DatabaseSync } from "node:sqlite";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const AI_BASE_URL = (process.env.AI_BASE_URL || "http://host.docker.internal:8794/v1").replace(/\/+$/, "");
const AI_API_KEY = process.env.AI_API_KEY;
const AI_MODEL = process.env.AI_MODEL || "coding";

app.use(express.json({ limit: "15mb" }));

async function chatJSON(system: string, user: string) {
  if (!AI_API_KEY) {
    throw new Error("AI_API_KEY belum diset. Isi di docker/.env");
  }
  const res = await fetch(`${AI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
      stream: false,
      temperature: 0.8,
    }),
  });
  if (!res.ok) {
    throw new Error(`AI ${res.status}: ${(await res.text()).slice(0, 500)}`);
  }
  const raw = (await res.text()).replace(/data:\s*\[DONE\]\s*$/i, "").trim();
  const data: any = JSON.parse(raw);
  const text: string = data?.choices?.[0]?.message?.content ?? "";
  if (!text) throw new Error("Empty response from AI router");
  return extractJson(text);
}

function extractJson(text: string) {
  const s = text.replace(/```(?:json)?/gi, "");
  const start = s.indexOf("{");
  if (start === -1) throw new Error("No JSON object in AI response");
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < s.length; i++) {
    const c = s[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
    } else if (c === '"') inStr = true;
    else if (c === "{") depth++;
    else if (c === "}" && --depth === 0) return JSON.parse(s.slice(start, i + 1));
  }
  throw new Error("Unbalanced JSON in AI response");
}

app.post("/api/generate", async (req, res) => {
  try {
    const { topic, style, brandName, brandHandle, slideCount } = req.body;

    if (!topic) {
      return res.status(400).json({ error: "Topik harus diisi!" });
    }

    const count = Math.min(Math.max(slideCount || 5, 3), 10);
    const brandContext = brandName ? `untuk brand '${brandName}' ${brandHandle ? `(${brandHandle})` : ""}` : "";

    let styleContext = "";
    if (style === "educational") {
      styleContext = "Fokus pada edukasi mendalam, menyederhanakan konsep rumit menjadi poin-poin yang mudah dimengerti, edukatif, informatif, terstruktur.";
    } else if (style === "marketing") {
      styleContext = "Fokus pada konversi, promosi, menonjolkan keunggulan produk/layanan, bahasa persuasif, bersemangat, menggunakan hook yang kuat untuk menarik perhatian audiens.";
    } else {
      styleContext = "Fokus pada tips praktis, actionable steps, langkah-langkah konkret yang bisa langsung diterapkan audiens sekarang juga, pragmatis, solutif.";
    }

    const system = `Anda adalah pakar Content Creation & Social Media Strategist professional Indonesia. Tugas Anda membuat konten carousel Instagram berkualitas tinggi, viral, shareable, dan mendatangkan interaksi tinggi. Selalu balas HANYA JSON valid tanpa penjelasan, dengan bentuk:
{"title": string, "slides": [{"title": string, "subtitle": string, "body": string[], "slideType": "intro"|"content"|"quote"|"call_to_action"|"list"|"conclusion", "icon": string, "ctaText": string}]}
title = judul utama slide (maks 8 kata). body = 1-3 poin singkat. icon = nama Lucide icon (mis. Lightbulb, TrendingUp, Target, Layers, Award, CheckCircle, Cpu, BookOpen, Shield, Users). ctaText opsional. Slide 1 bertipe 'intro', slide terakhir 'call_to_action' atau 'conclusion'.`;

    const user = `Buatkan konten carousel sosial media berbahasa Indonesia tentang topik: "${topic}".
Buat TEPAT ${count} slide di dalam array "slides".
Gaya konten: ${styleContext}
Konteks Brand: ${brandContext}`;

    const data = await chatJSON(system, user);
    res.json(data);
  } catch (error: any) {
    console.error("Error generating carousel content:", error);
    res.status(500).json({ error: error?.message || "Terjadi kesalahan saat membuat konten" });
  }
});

// 9router key tidak punya provider image-generation aktif -> langsung pakai stok Unsplash.
function getUnsplashFallbackUrl(prompt: string, aspectRatio: string): string {
  const cleanPrompt = prompt.toLowerCase().replace(/[^\w\s\u00C0-\u017F]/g, " ").trim();

  const stopWords = new Set([
    "ilustrasi", "modern", "minimalis", "tentang", "dan", "di", "yang", "dengan", "untuk",
    "sebuah", "gambar", "foto", "3d", "vector", "flat", "design", "illustration", "art",
    "minimalist", "about", "and", "the", "with", "for", "a", "an", "of", "in", "on", "konten",
    "slide", "background", "latar", "belakang", "atas", "bawah", "lucu", "warna", "pastel"
  ]);

  const words = cleanPrompt.split(/\s+/).filter(word => word.length > 2 && !stopWords.has(word));
  const queryTerms = words.length > 0 ? words.slice(0, 3).join(",") : "abstract,minimalist";

  let size = "800x800";
  if (aspectRatio === "9:16") size = "1080x1920";
  else if (aspectRatio === "3:4" || aspectRatio === "4:3") size = "900x1200";
  else if (aspectRatio === "16:9") size = "1920x1080";

  const randomId = Math.floor(Math.random() * 100000);
  return `https://images.unsplash.com/featured/${size}/?${encodeURIComponent(queryTerms)}&sig=${randomId}`;
}

app.post("/api/generate-image", async (req, res) => {
  const { prompt, aspectRatio = "1:1" } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt gambar harus diisi!" });
  }
  res.json({
    imageUrl: getUnsplashFallbackUrl(prompt, aspectRatio),
    fallback: true,
    warning: "9router tanpa provider image-generation. Stok Unsplash dipakai otomatis.",
  });
});

app.post("/api/generate-video", async (req, res) => {
  try {
    const { topic, style, brandName, brandHandle, sceneCount } = req.body;
    if (!topic) {
      return res.status(400).json({ error: "Topik harus diisi!" });
    }

    const count = Math.min(Math.max(sceneCount || 5, 3), 10);
    const brandContext = brandName
      ? `untuk brand '${brandName}' ${brandHandle ? `(${brandHandle})` : ""}`
      : "";

    let styleContext = "";
    if (style === "educational") {
      styleContext = "Edukatif, menjelaskan konsep dengan analogi singkat dan mudah dicerna.";
    } else if (style === "marketing") {
      styleContext = "Persuasif, menonjolkan keunggulan produk/layanan, mendorong konversi.";
    } else {
      styleContext = "Tips praktis dan actionable, langsung bisa diterapkan.";
    }

    const system = `Anda adalah scriptwriter video pendek (Reels/TikTok/Shorts) profesional Indonesia. Selalu balas HANYA JSON valid tanpa penjelasan, dengan bentuk:
{"title": string, "scenes": [{"text": string, "subtext": string, "icon": string}]}
text = headline singkat MAKS 7 kata, punchy, hook kuat, boleh bungkus **kata** untuk penekanan (maks 1-2 kata). subtext = 1 kalimat pendukung maks 12 kata. icon = nama Lucide icon (mis. Lightbulb, TrendingUp, Target, Flame, Zap, Rocket, CheckCircle, Brain, DollarSign, BarChart3, Clock, Users, Star, Heart, Shield, BookOpen). Scene pertama = hook, scene terakhir = CTA (ajak follow/simpan/komentar).`;

    const user = `Buat script video pendek berbahasa Indonesia tentang topik: "${topic}".
Buat TEPAT ${count} scene di dalam array "scenes".
Gaya konten: ${styleContext}
Konteks Brand: ${brandContext}`;

    const data = await chatJSON(system, user);
    res.json(data);
  } catch (error: any) {
    console.error("Error generating motion video:", error);
    res.status(500).json({ error: error?.message || "Terjadi kesalahan saat membuat script video" });
  }
});


// ---------- Video rendering (Remotion, server-side MP4) ----------
const PREBUILT_SERVE_URL = path.join(process.cwd(), "remotion-serve");
let remotionServeUrl: string | null = null;
let videoRendering = false;

async function getServeUrl() {
  if (remotionServeUrl) return remotionServeUrl;
  // Bundle dibuat saat build image (lihat Dockerfile). Fallback: bundle runtime (dev).
  if (fs.existsSync(path.join(PREBUILT_SERVE_URL, "index.html"))) {
    remotionServeUrl = PREBUILT_SERVE_URL;
    return remotionServeUrl;
  }
  const { bundle } = await import("@remotion/bundler");
  const { enableTailwind } = await import("@remotion/tailwind-v4");
  remotionServeUrl = await bundle({
    entryPoint: path.join(process.cwd(), "remotion", "index.ts"),
    webpackOverride: (config: any) => enableTailwind(config),
  });
  return remotionServeUrl;
}

// Chrome di container bisa lambat start pada request pertama (cold cache) -> timeout 25s
// bawaan Remotion. Warm up sekali saat startup supaya request user pertama tidak gagal.
async function warmupBrowser() {
  try {
    const { openBrowser, ensureBrowser } = await import("@remotion/renderer");
    await ensureBrowser();
    const browser = await openBrowser("chrome", { chromiumOptions: { gl: "swangle" } });
    await browser.close({ silent: true });
    console.log("Remotion browser warmup selesai");
  } catch (e: any) {
    console.warn("Remotion browser warmup gagal:", e?.message || e);
  }
}

// Kill proses chrome-headless yatim (render yang gagal sebelum browser terhubung).
// Image Debian slim tidak punya pkill/killall, jadi scan /proc manual.
function killOrphanChrome() {
  try {
    for (const entry of fs.readdirSync("/proc")) {
      if (!/^\d+$/.test(entry)) continue;
      try {
        const comm = fs.readFileSync(`/proc/${entry}/comm`, "utf8").trim();
        if (comm === "chrome-headless" || comm === "chrome") {
          process.kill(Number(entry), "SIGKILL");
        }
      } catch {
        /* proses sudah hilang */
      }
    }
  } catch {
    /* /proc tidak tersedia (mis. non-Linux) */
  }
}

const slug = (s: string) =>
  String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") ||
  "video";

async function renderToMp4(
  res: express.Response,
  compositionId: "CarouselVideo" | "MotionVideo",
  inputProps: any,
  filenameBase: string,
) {
  if (videoRendering) {
    return res.status(429).json({ error: "Sedang ada render video lain. Coba lagi sebentar." });
  }

  videoRendering = true;
  const outPath = path.join(os.tmpdir(), `${filenameBase}-${crypto.randomUUID()}.mp4`);
  try {
    killOrphanChrome();
    const { selectComposition, renderMedia, ensureBrowser } = await import("@remotion/renderer");

    await ensureBrowser();
    const serveUrl = await getServeUrl();
    const composition = await selectComposition({ serveUrl, id: compositionId, inputProps });

    await renderMedia({
      composition,
      serveUrl,
      codec: "h264",
      outputLocation: outPath,
      inputProps,
      chromiumOptions: { gl: "swangle" },
    });

    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Disposition", `attachment; filename="${filenameBase}_video.mp4"`);
    const stream = fs.createReadStream(outPath);
    stream.pipe(res);
    stream.on("close", () => fs.unlink(outPath, () => {}));
    stream.on("error", () => {
      if (!res.headersSent) res.status(500).end();
      fs.unlink(outPath, () => {});
    });
  } catch (error: any) {
    fs.unlink(outPath, () => {});
    console.error(`Error rendering ${compositionId}:`, error);
    if (!res.headersSent) {
      res.status(500).json({ error: error?.message || "Terjadi kesalahan saat merender video" });
    }
  } finally {
    videoRendering = false;
  }
}

app.post("/api/render-video", async (req, res) => {
  const { carousel, brand } = req.body ?? {};
  if (!carousel || typeof carousel !== "object" || !Array.isArray(carousel.slides)) {
    return res.status(400).json({ error: "Field 'carousel' dengan array 'slides' wajib diisi" });
  }
  if (carousel.slides.length < 1 || carousel.slides.length > 20) {
    return res.status(400).json({ error: "Jumlah slide harus antara 1 dan 20" });
  }
  if (!brand || typeof brand !== "object") {
    return res.status(400).json({ error: "Field 'brand' wajib diisi" });
  }
  await renderToMp4(res, "CarouselVideo", { carousel, brand }, slug(carousel.title || "carousel"));
});

app.post("/api/render-motion-video", async (req, res) => {
  const { video, brand } = req.body ?? {};
  if (!video || typeof video !== "object" || !Array.isArray(video.scenes)) {
    return res.status(400).json({ error: "Field 'video' dengan array 'scenes' wajib diisi" });
  }
  if (video.scenes.length < 1 || video.scenes.length > 20) {
    return res.status(400).json({ error: "Jumlah scene harus antara 1 dan 20" });
  }
  if (!brand || typeof brand !== "object") {
    return res.status(400).json({ error: "Field 'brand' wajib diisi" });
  }
  if (
    (typeof video.style?.customCss === "string" && video.style.customCss.length > 20000) ||
    (typeof video.style?.backgroundImage === "string" &&
      video.style.backgroundImage.length > 2000)
  ) {
    return res.status(400).json({ error: "Field kustom terlalu panjang" });
  }
  await renderToMp4(res, "MotionVideo", { video, brand }, slug(video.title || "motion"));
});


// ---------- Persistent history (node:sqlite, zero deps) ----------
const DB_DIR = path.join(process.cwd(), "db");
fs.mkdirSync(DB_DIR, { recursive: true });
const db = new DatabaseSync(path.join(DB_DIR, "history.sqlite"));
db.exec(`
CREATE TABLE IF NOT EXISTS history (
  id             TEXT PRIMARY KEY,
  title          TEXT NOT NULL,
  saved_at       TEXT NOT NULL,
  pinned         INTEGER NOT NULL DEFAULT 0,
  scheduled_date TEXT,
  carousel_json  TEXT NOT NULL
);`);

type Row = { id: string; title: string; saved_at: string; pinned: number; scheduled_date: string | null; carousel_json: string };
const toItem = (r: Row) => ({
  id: r.id,
  title: r.title,
  savedAt: r.saved_at,
  pinned: r.pinned,
  scheduledDate: r.scheduled_date,
  carousel: JSON.parse(r.carousel_json),
});
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

app.get("/api/history", (req, res) => {
  try {
    const date = String(req.query.date ?? "");
    const rows = date
      ? db.prepare("SELECT * FROM history WHERE scheduled_date = ? ORDER BY pinned DESC, saved_at DESC").all(date)
      : db.prepare("SELECT * FROM history ORDER BY pinned DESC, saved_at DESC").all();
    res.json((rows as Row[]).map(toItem));
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Gagal baca riwayat" });
  }
});

app.post("/api/history", (req, res) => {
  try {
    const { carousel, title } = req.body ?? {};
    if (!carousel || typeof carousel !== "object" || Array.isArray(carousel)) {
      return res.status(400).json({ error: "Field 'carousel' wajib berupa object" });
    }
    const t = String(title || carousel?.title || "Tanpa judul").slice(0, 200);
    const item = {
      id: crypto.randomUUID(),
      title: t,
      savedAt: new Date().toISOString(),
      pinned: 0,
      scheduledDate: null as string | null,
      carousel,
    };
    db.prepare("INSERT INTO history (id,title,saved_at,pinned,scheduled_date,carousel_json) VALUES (?,?,?,?,?,?)")
      .run(item.id, item.title, item.savedAt, 0, null, JSON.stringify(carousel));
    res.status(201).json(item);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Gagal simpan riwayat" });
  }
});

app.patch("/api/history/:id", (req, res) => {
  try {
    const { pinned, scheduledDate, title } = req.body ?? {};
    const sets: string[] = [], vals: any[] = [];
    if (pinned !== undefined) { sets.push("pinned = ?"); vals.push(pinned ? 1 : 0); }
    if (scheduledDate !== undefined) {
      if (scheduledDate !== null && !DATE_RE.test(String(scheduledDate))) {
        return res.status(400).json({ error: "scheduledDate harus YYYY-MM-DD atau null" });
      }
      sets.push("scheduled_date = ?"); vals.push(scheduledDate === null ? null : String(scheduledDate));
    }
    if (title !== undefined) { sets.push("title = ?"); vals.push(String(title).slice(0, 200)); }
    if (!sets.length) return res.status(400).json({ error: "Tidak ada field yang diubah" });
    const info = db.prepare(`UPDATE history SET ${sets.join(", ")} WHERE id = ?`).run(...vals, req.params.id);
    if (!info.changes) return res.status(404).json({ error: "Riwayat tidak ditemukan" });
    const row = db.prepare("SELECT * FROM history WHERE id = ?").get(req.params.id) as Row;
    res.json(toItem(row));
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Gagal update riwayat" });
  }
});

app.delete("/api/history/:id", (req, res) => {
  try {
    const info = db.prepare("DELETE FROM history WHERE id = ?").run(req.params.id);
    if (!info.changes) return res.status(404).json({ error: "Riwayat tidak ditemukan" });
    res.json({ ok: true, id: req.params.id });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Gagal hapus riwayat" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
    void warmupBrowser();
  });
}

startServer();
