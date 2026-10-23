import { useState, useEffect } from 'react';
import { Brand, Carousel, SavedCarousel, ContentSchedule } from './types';
import { INITIAL_BRANDS, INITIAL_CAROUSEL, FONT_PAIRINGS, TEMPLATE_PRESETS, loadGoogleFont } from './utils';
import { BrandManager } from './components/BrandManager';
import { AIContentGenerator } from './components/AIContentGenerator';
import { CarouselEditor } from './components/CarouselEditor';
import { SlideViewer } from './components/SlideViewer';
import { PlannerDashboard } from './components/PlannerDashboard';
import { 
  Sparkles, Palette, Radio, RotateCcw, PenTool, CheckCircle, 
  Calendar as CalendarIcon, History, Laptop, Info, Film 
} from 'lucide-react';
import { VideoStudio } from './components/VideoStudio';

const LOCAL_STORAGE_KEY_BRANDS = 'carousel_gen_brands_v3';
const LOCAL_STORAGE_KEY_CAROUSEL = 'carousel_gen_active_v3';
const LOCAL_STORAGE_KEY_ACTIVE_BRAND = 'carousel_gen_active_brand_v3';
const LOCAL_STORAGE_KEY_SCHEDULES = 'carousel_gen_schedules_v3';
// Riwayat = DB (/api/history). Key lama carousel_gen_history_v3 sudah dibuang.

export default function App() {
  // Load initial state from LocalStorage or Fallback defaults
  const [brands, setBrands] = useState<Brand[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_BRANDS);
    return saved ? JSON.parse(saved) : INITIAL_BRANDS;
  });

  const [activeBrandId, setActiveBrandId] = useState<string>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_ACTIVE_BRAND);
    return saved ? saved : INITIAL_BRANDS[0].id;
  });

  const [carousel, setCarousel] = useState<Carousel>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CAROUSEL);
    return saved ? JSON.parse(saved) : INITIAL_CAROUSEL;
  });

  const [activeSlideId, setActiveSlideId] = useState<string>(() => {
    return carousel.slides[0]?.id || '';
  });

  const [activeTab, setActiveTab] = useState<'generate' | 'design' | 'brands' | 'planner' | 'video'>('brands');
  const [previewBrand, setPreviewBrand] = useState<Brand | null>(null);

  // Content History (Riwayat) — sumber kebenaran: DB via /api/history
  const [history, setHistory] = useState<SavedCarousel[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const refreshHistory = async () => {
    try {
      const res = await fetch('/api/history');
      if (!res.ok) throw new Error(`GET /api/history -> ${res.status}`);
      setHistory(await res.json());
      setHistoryError(null);
    } catch (e: any) {
      setHistoryError(e?.message || 'Gagal memuat riwayat');
    }
  };

  useEffect(() => { refreshHistory(); }, []);

  // Content Calendar Schedules state
  const [schedules, setSchedules] = useState<ContentSchedule[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_SCHEDULES);
    return saved ? JSON.parse(saved) : [];
  });

  // Load fonts on init
  useEffect(() => {
    FONT_PAIRINGS.forEach(font => {
      loadGoogleFont(font.heading);
      loadGoogleFont(font.body);
    });
  }, []);

  // Save states to local storage on changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_BRANDS, JSON.stringify(brands));
  }, [brands]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_ACTIVE_BRAND, activeBrandId);
  }, [activeBrandId]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_CAROUSEL, JSON.stringify(carousel));
  }, [carousel]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_SCHEDULES, JSON.stringify(schedules));
  }, [schedules]);

  // Adjust fonts, themes, and colors automatically if the user selects a brand with a preferred preset!
  const handleSelectBrand = (id: string) => {
    setActiveBrandId(id);
    const selectedBrand = brands.find((b) => b.id === id);
    if (selectedBrand) {
      // Look up default brand template preset if configured
      let themeToApply = carousel.theme;
      let fontHeadingToApply = selectedBrand.fontFamily || carousel.fontHeading;
      let fontBodyToApply = carousel.fontBody;

      if (selectedBrand.preferredTemplateId) {
        const preset = TEMPLATE_PRESETS.find(p => p.id === selectedBrand.preferredTemplateId);
        if (preset) {
          themeToApply = preset.theme;
          fontHeadingToApply = preset.fontHeading;
          fontBodyToApply = preset.fontBody;
        }
      }

      setCarousel((prev) => ({
        ...prev,
        brandId: id,
        theme: themeToApply,
        fontHeading: fontHeadingToApply,
        fontBody: fontBodyToApply,
      }));
    }
  };

  const handleSaveBrand = (updatedBrand: Brand) => {
    setBrands((prev) => {
      const exists = prev.some((b) => b.id === updatedBrand.id);
      if (exists) {
        return prev.map((b) => (b.id === updatedBrand.id ? updatedBrand : b));
      } else {
        return [...prev, updatedBrand];
      }
    });

    // Automatically apply changes if this is the active brand
    if (updatedBrand.id === activeBrandId) {
      let themeToApply = carousel.theme;
      let fontHeadingToApply = updatedBrand.fontFamily || carousel.fontHeading;
      let fontBodyToApply = carousel.fontBody;

      if (updatedBrand.preferredTemplateId) {
        const preset = TEMPLATE_PRESETS.find(p => p.id === updatedBrand.preferredTemplateId);
        if (preset) {
          themeToApply = preset.theme;
          fontHeadingToApply = preset.fontHeading;
          fontBodyToApply = preset.fontBody;
        }
      }

      setCarousel((prev) => ({
        ...prev,
        theme: themeToApply,
        fontHeading: fontHeadingToApply,
        fontBody: fontBodyToApply,
      }));
    }
  };

  const handleDeleteBrand = (id: string) => {
    if (id === activeBrandId) {
      const remaining = brands.filter((b) => b.id !== id);
      if (remaining.length > 0) {
        setBrands(remaining);
        handleSelectBrand(remaining[0].id);
      }
    } else {
      setBrands((prev) => prev.filter((b) => b.id !== id));
    }
  };

  const handleCarouselGenerated = (newCarousel: Carousel) => {
    setCarousel(newCarousel);
    setActiveSlideId(newCarousel.slides[0].id);
    saveCarouselToHistory(newCarousel);
    setActiveTab('design'); // Direct user to editor tab
  };

  const handleResetToExample = () => {
    if (confirm('Apakah Anda yakin ingin menyetel ulang konten ke contoh default?')) {
      setCarousel(INITIAL_CAROUSEL);
      setActiveSlideId(INITIAL_CAROUSEL.slides[0].id);
    }
  };

  // Content History Actions (semua lewat API, refetch sesudah mutasi)
  const saveCarouselToHistory = async (carouselToSave: Carousel) => {
    try {
      const res = await fetch('/api/history', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ carousel: carouselToSave }),
      });
      if (!res.ok) throw new Error(`POST /api/history -> ${res.status}`);
      await refreshHistory();
    } catch (e: any) {
      alert(`Gagal menyimpan ke riwayat: ${e?.message || e}`);
    }
  };

  const loadCarouselFromHistory = (savedItem: SavedCarousel) => {
    setCarousel(JSON.parse(JSON.stringify(savedItem.carousel)));
    setActiveSlideId(savedItem.carousel.slides[0]?.id || '');
    setActiveTab('design');
    alert(`Rancangan "${savedItem.carousel.title}" berhasil dimuat ke editor studio!`);
  };

  const deleteHistoryItem = async (id: string) => {
    try {
      const res = await fetch(`/api/history/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`DELETE /api/history/:id -> ${res.status}`);
      setSchedules(prev => prev.filter(s => s.savedCarouselId !== id));
      await refreshHistory();
    } catch (e: any) {
      alert(`Gagal menghapus riwayat: ${e?.message || e}`);
    }
  };

  const togglePinHistory = async (id: string, pinned: boolean) => {
    setHistory(prev => prev.map(i => (i.id === id ? { ...i, pinned: pinned ? 1 : 0 } : i))); // optimistic
    try {
      const res = await fetch(`/api/history/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ pinned }),
      });
      if (!res.ok) throw new Error(`PATCH pinned -> ${res.status}`);
    } catch (e: any) {
      alert(`Gagal mengubah pin: ${e?.message || e}`);
    }
    await refreshHistory(); // state konsisten dari server (urut pinned DESC, savedAt DESC)
  };

  const setHistoryScheduledDate = async (id: string, date: string | null) => {
    try {
      await fetch(`/api/history/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ scheduledDate: date }),
      });
    } catch { /* ripple ke DB di-skip; jadwal lokal tetap jalan */ }
    await refreshHistory();
  };

  // Content Calendar Schedules Actions
  const addSchedule = (sch: Omit<ContentSchedule, 'id'>) => {
    const newSchedule: ContentSchedule = {
      ...sch,
      id: `schedule-${Date.now()}`
    };
    setSchedules(prev => [...prev, newSchedule]);
  };

  const deleteSchedule = (id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
  };

  const currentBrand = previewBrand || (brands.find(b => b.id === activeBrandId) || brands[0]);

  return (
    <div className="min-h-screen bg-[#fefce8] text-black flex flex-col font-sans relative antialiased" id="carousel-generator-root">
      {/* Dynamic Grid Background for Neobrutalism Vibe */}
      <div className="absolute inset-0 bg-[radial-gradient(#000000_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-[0.04] pointer-events-none" />

      {/* NEOBRUTALISM TOP HEADER */}
      <header className="border-b-[4px] border-black bg-white sticky top-0 z-40 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_4px_0px_#000]">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tight uppercase bg-yellow-300 px-3 py-1 border-[3px] border-black shadow-[3px_3px_0px_#000]">
              CAROUSEL.AI
            </span>
            <span className="px-2 py-0.5 bg-black text-white rounded text-[10px] font-mono font-bold uppercase tracking-widest">
              v2.0
            </span>
          </div>
          <div className="hidden md:block h-6 w-1 bg-black"></div>
          
          {/* Active Brand Dynamic Indicator */}
          <div className="flex items-center gap-2.5 bg-white px-4 py-1.5 rounded-full border-[3px] border-black shadow-[2px_2px_0px_#000]">
            <div className="w-3.5 h-3.5 rounded-full border border-black" style={{ backgroundColor: currentBrand.primaryColor }}></div>
            <span className="text-[11px] font-black uppercase tracking-wider text-black">
              BRAND: {currentBrand.name.toUpperCase()} ({currentBrand.handle.toUpperCase()})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs font-black uppercase tracking-wider mr-2 text-stone-700">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 border border-black animate-pulse" />
            <span>Koneksi Aman</span>
          </div>

          <button
            onClick={handleResetToExample}
            className="px-4 py-2 bg-white hover:bg-stone-50 text-black text-xs font-black uppercase tracking-wider rounded-lg border-2 border-black transition shadow-[2.5px_2.5px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000] flex items-center gap-1.5 cursor-pointer"
            title="Reset ke Contoh"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Default
          </button>
        </div>
      </header>

      {/* MAIN LAYOUT DASHBOARD */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6" id="main-dashboard-grid">
        {activeTab === 'planner' ? (
          <div className="animate-fade-in space-y-4">
            {/* Neobrutalist tab switcher for planner page context */}
            <div className="flex justify-between items-center bg-white border-[3px] border-black p-3.5 rounded-xl shadow-[4px_4px_0px_#000]">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-red-500" />
                <span className="font-black uppercase text-xs sm:text-sm tracking-wider">Perencana Kalender & Riwayat Konten</span>
              </div>
              <button 
                onClick={() => setActiveTab('generate')}
                className="px-4 py-2 bg-yellow-300 text-black hover:bg-yellow-400 font-black uppercase text-xs border-2 border-black rounded-lg transition shadow-[2.5px_2.5px_0px_#000] active:translate-x-[1px] active:translate-y-[1px]"
              >
                ← Kembali Ke Studio
              </button>
            </div>
            
            <PlannerDashboard
              currentCarousel={carousel}
              history={history}
              schedules={schedules}
              brands={brands}
              historyError={historyError}
              onRefreshHistory={refreshHistory}
              onSaveCurrentToHistory={() => saveCarouselToHistory(carousel)}
              onLoadFromHistory={loadCarouselFromHistory}
              onDeleteHistory={deleteHistoryItem}
              onTogglePin={togglePinHistory}
              onSetScheduledDate={setHistoryScheduledDate}
              onAddSchedule={addSchedule}
              onDeleteSchedule={deleteSchedule}
            />
          </div>
        ) : activeTab === 'video' ? (
          <VideoStudio brands={brands} activeBrandId={activeBrandId} onBack={() => setActiveTab('generate')} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT PANEL SIDEBAR (CONTROLS & TABS) - occupies 5 cols */}
            <section className="lg:col-span-5 bg-white rounded-xl border-[3px] border-black p-5 space-y-6 flex flex-col justify-between shadow-[4px_4px_0px_#000]" id="left-controls-sidebar">
              {/* TAB HEADER SWITCHERS */}
              <div className="grid grid-cols-5 gap-1 bg-stone-100 p-1 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                <button
                  onClick={() => setActiveTab('brands')}
                  className={`py-2 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition duration-150 cursor-pointer flex flex-col items-center justify-center gap-1 border-2 ${
                    activeTab === 'brands'
                      ? 'bg-[#6bcb77] text-black border-black shadow-[2px_2px_0px_#000]'
                      : 'text-stone-600 hover:text-black hover:bg-stone-50 border-transparent'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5 shrink-0" />
                  <span>BRAND</span>
                </button>

                <button
                  onClick={() => setActiveTab('generate')}
                  className={`py-2 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition duration-150 cursor-pointer flex flex-col items-center justify-center gap-1 border-2 ${
                    activeTab === 'generate'
                      ? 'bg-yellow-300 text-black border-black shadow-[2px_2px_0px_#000]'
                      : 'text-stone-600 hover:text-black hover:bg-stone-50 border-transparent'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>AI GEN</span>
                </button>

                <button
                  onClick={() => setActiveTab('design')}
                  className={`py-2 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition duration-150 cursor-pointer flex flex-col items-center justify-center gap-1 border-2 ${
                    activeTab === 'design'
                      ? 'bg-[#4d96ff] text-black border-black shadow-[2px_2px_0px_#000]'
                      : 'text-stone-600 hover:text-black hover:bg-stone-50 border-transparent'
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5 shrink-0" />
                  <span>DESAIN</span>
                </button>

                <button
                  onClick={() => setActiveTab('planner')}
                  className={`py-2 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition duration-150 cursor-pointer flex flex-col items-center justify-center gap-1 border-2 ${
                    activeTab === 'planner'
                      ? 'bg-[#ff6b6b] text-black border-black shadow-[2px_2px_0px_#000]'
                      : 'text-stone-600 hover:text-black hover:bg-stone-50 border-transparent'
                  }`}
                >
                  <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
                  <span>JADWAL</span>
                </button>

                <button
                  onClick={() => setActiveTab('video')}
                  className={`py-2 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition duration-150 cursor-pointer flex flex-col items-center justify-center gap-1 border-2 ${
                    activeTab === 'video'
                      ? 'bg-[#ffd166] text-black border-black shadow-[2px_2px_0px_#000]'
                      : 'text-stone-600 hover:text-black hover:bg-stone-50 border-transparent'
                  }`}
                >
                  <Film className="w-3.5 h-3.5 shrink-0" />
                  <span>VIDEO</span>
                </button>
              </div>

              {/* ACTIVE TAB VIEWS */}
              <div className="flex-1 min-h-[350px]">
                {activeTab === 'generate' && (
                  <div className="animate-fade-in space-y-4">
                    <div className="p-3 bg-amber-50 border-2 border-black rounded-xl flex items-start gap-2.5 shadow-[2px_2px_0px_#000]">
                      <Info className="w-4 h-4 text-black shrink-0 mt-0.5" />
                      <div className="text-[10px] text-stone-800 leading-normal font-bold">
                        AI Gemini akan menyusun headline hook & slide penutup CTA disesuaikan dengan template default brand yang Anda pilih.
                      </div>
                    </div>
                    <AIContentGenerator
                      brands={brands}
                      activeBrandId={activeBrandId}
                      onCarouselGenerated={handleCarouselGenerated}
                    />
                  </div>
                )}

                {activeTab === 'design' && (
                  <div className="animate-fade-in">
                    <CarouselEditor
                      carousel={carousel}
                      activeSlideId={activeSlideId}
                      onChangeCarousel={setCarousel}
                      onSetActiveSlide={setActiveSlideId}
                    />
                  </div>
                )}

                {activeTab === 'brands' && (
                  <div className="animate-fade-in">
                    <BrandManager
                      brands={brands}
                      activeBrandId={activeBrandId}
                      onSelectBrand={handleSelectBrand}
                      onSaveBrand={handleSaveBrand}
                      onDeleteBrand={handleDeleteBrand}
                      onEditingBrandChange={setPreviewBrand}
                    />
                  </div>
                )}
              </div>
            </section>

            {/* RIGHT PANEL (REAL-TIME PREVIEW WORKSPACE) - occupies 7 cols */}
            <section className="lg:col-span-7 lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] overflow-y-auto no-scrollbar" id="right-preview-workspace">
              <SlideViewer
                carousel={carousel}
                activeSlideId={activeSlideId}
                brands={brands}
                activeBrandId={activeBrandId}
                onSetActiveSlide={setActiveSlideId}
                previewBrand={previewBrand}
              />
            </section>
          </div>
        )}
      </main>

      {/* FOOTER METADATA BAR */}
      <footer className="border-t-[3px] border-black bg-white py-4 px-6 text-center text-xs text-black mt-auto flex flex-col md:flex-row items-center justify-between gap-3 shadow-[0_-3px_0px_#000]">
        <span className="font-bold">&copy; 2026 CAROUSEL.AI. Desain Neobrutalisme & Kecerdasan Buatan Gemini.</span>
        <div className="flex items-center gap-4 text-black">
          <span className="flex items-center gap-1 font-black uppercase">
            <CheckCircle className="w-4 h-4 text-[#6bcb77]" />
            PDF & PNG HD Export Ready
          </span>
          <span>|</span>
          <span className="font-mono font-bold bg-yellow-200 border-2 border-black px-1.5 py-0.5">Ver 2.0</span>
        </div>
      </footer>
    </div>
  );
}
