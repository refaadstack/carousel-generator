import React, { useEffect, useState } from 'react';
import { Carousel, Slide, SlideType, CarouselSize } from '../types';
import { FONT_PAIRINGS, TEMPLATE_PRESETS, loadGoogleFont } from '../utils';
import { Plus, Trash2, ArrowUp, ArrowDown, Layout, Palette, Type, RefreshCw, FileText, Settings, Layers, ListPlus, MinusCircle, PlusCircle, Sparkles, Image, Link } from 'lucide-react';

interface CarouselEditorProps {
  carousel: Carousel;
  activeSlideId: string;
  onChangeCarousel: (carousel: Carousel) => void;
  onSetActiveSlide: (id: string) => void;
}

const AVAILABLE_ICONS = [
  'Sparkles', 'Lightbulb', 'TrendingUp', 'Target', 'Palette', 
  'MessageCircle', 'Award', 'CheckCircle', 'Flame', 'Heart', 
  'Users', 'Shield', 'BookOpen', 'Layers', 'Cpu', 'ArrowRight', 
  'HelpCircle', 'Megaphone', 'Smile', 'Zap'
];

export const CarouselEditor: React.FC<CarouselEditorProps> = ({
  carousel,
  activeSlideId,
  onChangeCarousel,
  onSetActiveSlide,
}) => {
  const activeSlide = carousel.slides.find((s) => s.id === activeSlideId) || carousel.slides[0];

  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imagePromptInput, setImagePromptInput] = useState('');
  const [imageTab, setImageTab] = useState<'ai' | 'stock' | 'url'>('ai');
  const [unsplashKeyword, setUnsplashKeyword] = useState('');
  const [customUrlInput, setCustomUrlInput] = useState('');

  useEffect(() => {
    if (activeSlide) {
      setImagePromptInput(activeSlide.imagePrompt || `Ilustrasi minimalis modern tentang "${activeSlide.title}"`);
      
      if (activeSlide.imageUrl) {
        if (activeSlide.imageUrl.startsWith('data:')) {
          setImageTab('ai');
          setCustomUrlInput('');
          setUnsplashKeyword('');
        } else if (activeSlide.imageUrl.includes('unsplash.com')) {
          setImageTab('stock');
          setCustomUrlInput('');
          setUnsplashKeyword(activeSlide.imagePrompt || activeSlide.title || '');
        } else {
          setImageTab('url');
          setCustomUrlInput(activeSlide.imageUrl);
          setUnsplashKeyword('');
        }
      } else {
        setImageTab('ai');
        setCustomUrlInput('');
        setUnsplashKeyword('');
      }
    }
  }, [activeSlide?.id]);

  // Dynamic Google Font Loader
  useEffect(() => {
    if (carousel.fontHeading) loadGoogleFont(carousel.fontHeading);
    if (carousel.fontBody) loadGoogleFont(carousel.fontBody);
  }, [carousel.fontHeading, carousel.fontBody]);

  const updateCarouselSize = (size: CarouselSize) => {
    onChangeCarousel({ ...carousel, size });
  };

  const updateFontPairing = (headingFont: string, bodyFont: string) => {
    onChangeCarousel({
      ...carousel,
      fontHeading: headingFont,
      fontBody: bodyFont,
    });
  };

  const applyPresetTemplate = (presetId: string) => {
    const preset = TEMPLATE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    onChangeCarousel({
      ...carousel,
      theme: preset.theme,
      fontHeading: preset.fontHeading,
      fontBody: preset.fontBody,
      colorMode: 'preset',
      // Clear overrides to let the template colors shine
      slides: carousel.slides.map((slide) => ({
        ...slide,
        backgroundColorOverride: undefined,
        textColorOverride: undefined,
      })),
    });
  };

  // Slide management
  const handleAddSlide = () => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      slideType: 'content',
      title: 'Judul Slide Baru',
      subtitle: 'Tambahkan subjudul menarik di sini',
      body: ['Tulis poin penjelasan singkat pertama.', 'Tulis poin penjelasan singkat kedua.'],
      pointMarker: 'dot',
    };

    const updatedSlides = [...carousel.slides, newSlide];
    onChangeCarousel({ ...carousel, slides: updatedSlides });
    onSetActiveSlide(newSlide.id);
  };

  const handleDeleteSlide = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (carousel.slides.length <= 1) {
      alert('Rancangan harus memiliki minimal 1 slide!');
      return;
    }

    const updatedSlides = carousel.slides.filter((s) => s.id !== id);
    onChangeCarousel({ ...carousel, slides: updatedSlides });

    if (activeSlideId === id) {
      const remainingSlide = updatedSlides[0];
      onSetActiveSlide(remainingSlide.id);
    }
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();
    const newSlides = [...carousel.slides];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newSlides.length) return;

    // Swap
    const temp = newSlides[index];
    newSlides[index] = newSlides[targetIndex];
    newSlides[targetIndex] = temp;

    onChangeCarousel({ ...carousel, slides: newSlides });
  };

  // Active Slide Editing
  const updateActiveSlideField = (fields: Partial<Slide>) => {
    if (!activeSlide) return;
    const updatedSlides = carousel.slides.map((slide) => {
      if (slide.id === activeSlide.id) {
        return { ...slide, ...fields };
      }
      return slide;
    });
    onChangeCarousel({ ...carousel, slides: updatedSlides });
  };

  const handleUpdateBodyPoint = (pointIndex: number, text: string) => {
    if (!activeSlide) return;
    const newBody = [...activeSlide.body];
    newBody[pointIndex] = text;
    updateActiveSlideField({ body: newBody });
  };

  const handleAddBodyPoint = () => {
    if (!activeSlide) return;
    if (activeSlide.body.length >= 4) {
      alert('Maksimal 4 poin agar slide tidak terlalu padat!');
      return;
    }
    updateActiveSlideField({ body: [...activeSlide.body, 'Poin baru...'] });
  };

  const handleRemoveBodyPoint = (pointIndex: number) => {
    if (!activeSlide) return;
    const newBody = activeSlide.body.filter((_, idx) => idx !== pointIndex);
    updateActiveSlideField({ body: newBody });
  };

  const handleUpdateComparisonItem = (side: 'left' | 'right', index: number, text: string) => {
    if (!activeSlide) return;
    const items = side === 'left' 
      ? [...(activeSlide.comparisonLeftItems || [])] 
      : [...(activeSlide.comparisonRightItems || [])];
    items[index] = text;
    if (side === 'left') {
      updateActiveSlideField({ comparisonLeftItems: items });
    } else {
      updateActiveSlideField({ comparisonRightItems: items });
    }
  };

  const handleAddComparisonItem = (side: 'left' | 'right') => {
    if (!activeSlide) return;
    const items = side === 'left' 
      ? [...(activeSlide.comparisonLeftItems || [])] 
      : [...(activeSlide.comparisonRightItems || [])];
    if (items.length >= 4) {
      alert('Maksimal 4 poin agar kolom tidak terlalu padat!');
      return;
    }
    items.push('Poin baru...');
    if (side === 'left') {
      updateActiveSlideField({ comparisonLeftItems: items });
    } else {
      updateActiveSlideField({ comparisonRightItems: items });
    }
  };

  const handleRemoveComparisonItem = (side: 'left' | 'right', index: number) => {
    if (!activeSlide) return;
    const items = side === 'left' 
      ? (activeSlide.comparisonLeftItems || []).filter((_, idx) => idx !== index)
      : (activeSlide.comparisonRightItems || []).filter((_, idx) => idx !== index);
    if (side === 'left') {
      updateActiveSlideField({ comparisonLeftItems: items });
    } else {
      updateActiveSlideField({ comparisonRightItems: items });
    }
  };

  return (
    <div className="space-y-6" id="carousel-editor-container">
      {/* 1. LAYOUT & ASPEC RATIO */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-[0.1em] flex items-center gap-1.5">
          <Layout className="w-4 h-4 text-[#8C8881]" />
          Ukuran & Format Platform
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <button
            onClick={() => updateCarouselSize('portrait')}
            className={`py-3 px-1.5 rounded-xl border-2 text-xs font-black transition cursor-pointer text-center flex flex-col items-center gap-1.5 ${
              carousel.size === 'portrait'
                ? 'bg-yellow-200 border-black text-[#1A1A1A] shadow-[3px_3px_0px_#000]'
                : 'bg-white border-[#E5E2DD] text-[#8C8881] hover:border-black hover:text-[#1A1A1A]'
            }`}
          >
            <span className="w-5 h-6 border-2 border-current rounded" />
            <div className="text-[10px] leading-tight">
              <span className="block font-bold">Potret (Instagram)</span>
              <span className="text-[9px] font-mono opacity-80">4:5 (1080x1350)</span>
            </div>
          </button>

          <button
            onClick={() => updateCarouselSize('square')}
            className={`py-3 px-1.5 rounded-xl border-2 text-xs font-black transition cursor-pointer text-center flex flex-col items-center gap-1.5 ${
              carousel.size === 'square'
                ? 'bg-yellow-200 border-black text-[#1A1A1A] shadow-[3px_3px_0px_#000]'
                : 'bg-white border-[#E5E2DD] text-[#8C8881] hover:border-black hover:text-[#1A1A1A]'
            }`}
          >
            <span className="w-5.5 h-5.5 border-2 border-current rounded" />
            <div className="text-[10px] leading-tight">
              <span className="block font-bold">Persegi (Feeds)</span>
              <span className="text-[9px] font-mono opacity-80">1:1 (1080x1080)</span>
            </div>
          </button>

          <button
            onClick={() => updateCarouselSize('story')}
            className={`py-3 px-1.5 rounded-xl border-2 text-xs font-black transition cursor-pointer text-center flex flex-col items-center gap-1.5 ${
              carousel.size === 'story'
                ? 'bg-yellow-200 border-black text-[#1A1A1A] shadow-[3px_3px_0px_#000]'
                : 'bg-white border-[#E5E2DD] text-[#8C8881] hover:border-black hover:text-[#1A1A1A]'
            }`}
          >
            <span className="w-4 h-7 border-2 border-current rounded" />
            <div className="text-[10px] leading-tight">
              <span className="block font-bold">Reel / Story</span>
              <span className="text-[9px] font-mono opacity-80">9:16 (1080x1920)</span>
            </div>
          </button>

          <button
            onClick={() => updateCarouselSize('thumbnail')}
            className={`py-3 px-1.5 rounded-xl border-2 text-xs font-black transition cursor-pointer text-center flex flex-col items-center gap-1.5 ${
              carousel.size === 'thumbnail'
                ? 'bg-yellow-200 border-black text-[#1A1A1A] shadow-[3px_3px_0px_#000]'
                : 'bg-white border-[#E5E2DD] text-[#8C8881] hover:border-black hover:text-[#1A1A1A]'
            }`}
          >
            <span className="w-7 h-4 border-2 border-current rounded" />
            <div className="text-[10px] leading-tight">
              <span className="block font-bold">YouTube Thumbnail</span>
              <span className="text-[9px] font-mono opacity-80">16:9 (1280x720)</span>
            </div>
          </button>

          <button
            onClick={() => {
              // Ensure custom values are preset on first toggle
              onChangeCarousel({
                ...carousel,
                size: 'custom',
                customWidth: carousel.customWidth || 1200,
                customHeight: carousel.customHeight || 1200,
              });
            }}
            className={`py-3 px-1.5 rounded-xl border-2 text-xs font-black transition cursor-pointer text-center flex flex-col items-center gap-1.5 ${
              carousel.size === 'custom'
                ? 'bg-yellow-200 border-black text-[#1A1A1A] shadow-[3px_3px_0px_#000]'
                : 'bg-white border-[#E5E2DD] text-[#8C8881] hover:border-black hover:text-[#1A1A1A]'
            }`}
          >
            <Settings className="w-5.5 h-5.5" />
            <div className="text-[10px] leading-tight">
              <span className="block font-bold">Kustom Sendiri</span>
              <span className="text-[9px] font-mono opacity-80">Ratio Bebas PX</span>
            </div>
          </button>
        </div>

        {/* Dynamic Custom Dimension Inputs */}
        {carousel.size === 'custom' && (
          <div className="p-3 bg-stone-50 border-2 border-black rounded-xl space-y-3 shadow-[2px_2px_0px_#000] animate-fade-in text-xs">
            <span className="text-[10px] font-black uppercase tracking-wider block text-black">Atur Resolusi Kustom Anda (PX)</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-stone-600 mb-1">Lebar (Width)</label>
                <input
                  type="number"
                  value={carousel.customWidth || 1200}
                  onChange={(e) => {
                    const val = Math.max(100, parseInt(e.target.value) || 1200);
                    onChangeCarousel({ ...carousel, customWidth: val });
                  }}
                  className="w-full px-2 py-1.5 bg-white border-2 border-black rounded-lg text-black font-mono font-black focus:outline-none"
                  min="100"
                  max="4000"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-stone-600 mb-1">Tinggi (Height)</label>
                <input
                  type="number"
                  value={carousel.customHeight || 1200}
                  onChange={(e) => {
                    const val = Math.max(100, parseInt(e.target.value) || 1200);
                    onChangeCarousel({ ...carousel, customHeight: val });
                  }}
                  className="w-full px-2 py-1.5 bg-white border-2 border-black rounded-lg text-black font-mono font-black focus:outline-none"
                  min="100"
                  max="4000"
                />
              </div>
            </div>
            <p className="text-[9px] text-stone-500 font-medium">Resolusi ini akan dipertahankan penuh saat Anda mengekspor ke file PNG maupun PDF.</p>
          </div>
        )}
      </div>

      {/* 2. STYLE PRESETS */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-[#8C8881] uppercase tracking-[0.1em] flex items-center gap-1.5">
          <Palette className="w-4 h-4 text-[#8C8881]" />
          Template Desain & Gaya
        </label>
        <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
          {TEMPLATE_PRESETS.map((preset) => {
            const isSelected = carousel.theme === preset.theme;
            return (
              <button
                key={preset.id}
                onClick={() => applyPresetTemplate(preset.id)}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between h-[68px] ${
                  isSelected
                    ? 'bg-[#F9F8F6] border-2 border-[#1A1A1A] shadow-sm'
                    : 'bg-white border-[#E5E2DD] hover:border-[#1A1A1A]'
                }`}
              >
                <span className="text-[11px] font-bold text-[#1A1A1A] block truncate">{preset.name}</span>
                <div className="flex items-center justify-between w-full mt-1">
                  <span className="text-[9px] text-[#8C8881] font-mono block truncate max-w-[80px]">{preset.fontHeading}</span>
                  <div className="flex items-center gap-0.5 bg-[#F3F1EE] px-1 py-0.5 rounded border border-[#DED9D1]">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: preset.colors.primary }} />
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: preset.colors.background }} />
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: preset.colors.text }} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Skema Pewarnaan Carousel */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-[#8C8881] uppercase tracking-[0.1em] flex items-center gap-1.5">
          <Palette className="w-4 h-4 text-[#8C8881]" />
          Sumber Warna Utama
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onChangeCarousel({ ...carousel, colorMode: 'brand' })}
            className={`p-2 px-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-center h-[54px] ${
              carousel.colorMode === 'brand' || !carousel.colorMode
                ? 'bg-[#F9F8F6] border-2 border-[#1A1A1A] shadow-sm font-bold'
                : 'bg-white border-[#E5E2DD] hover:border-[#1A1A1A]'
            }`}
          >
            <span className="text-[10px] font-black text-[#1A1A1A] block">Ikut Warna Brand</span>
            <span className="text-[8px] text-[#8C8881] block mt-0.5 leading-tight">Latar & teks otomatis sinkron dengan brand</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeCarousel({ ...carousel, colorMode: 'preset' })}
            className={`p-2 px-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-center h-[54px] ${
              carousel.colorMode === 'preset'
                ? 'bg-[#F9F8F6] border-2 border-[#1A1A1A] shadow-sm font-bold'
                : 'bg-white border-[#E5E2DD] hover:border-[#1A1A1A]'
            }`}
          >
            <span className="text-[10px] font-black text-[#1A1A1A] block">Preset Template</span>
            <span className="text-[8px] text-[#8C8881] block mt-0.5 leading-tight">Latar & teks sesuai gaya estetis tema</span>
          </button>
        </div>
      </div>

      {/* 3. FONTS SELECTION */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-[#8C8881] uppercase tracking-[0.1em] flex items-center gap-1.5">
          <Type className="w-4 h-4 text-[#8C8881]" />
          Kombinasi Tipografi (Font)
        </label>
        <select
          value={FONT_PAIRINGS.find(f => f.heading === carousel.fontHeading)?.name || ''}
          onChange={(e) => {
            const pairing = FONT_PAIRINGS.find(f => f.name === e.target.value);
            if (pairing) updateFontPairing(pairing.heading, pairing.body);
          }}
          className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E5E2DD] rounded-xl text-[#1A1A1A] text-xs focus:outline-none focus:border-[#1A1A1A] transition font-medium"
        >
          {FONT_PAIRINGS.map((p) => (
            <option key={p.name} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* 4. TIMELINE / REORDER SLIDES */}
      <div className="space-y-2 border-t border-[#E5E2DD] pt-4">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-[#8C8881] uppercase tracking-[0.1em] flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#8C8881]" />
            Urutan Slide ({carousel.slides.length})
          </label>
          <button
            onClick={handleAddSlide}
            className="px-2.5 py-1 bg-[#1A1A1A] hover:bg-black text-white text-[9px] font-bold uppercase tracking-widest rounded-lg transition cursor-pointer flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-3 h-3" /> Tambah Slide
          </button>
        </div>

        <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 font-sans">
          {carousel.slides.map((slide, idx) => {
            const isActive = slide.id === activeSlideId;
            return (
              <div
                key={slide.id}
                onClick={() => onSetActiveSlide(slide.id)}
                className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                  isActive
                    ? 'bg-[#F3F1EE] border-2 border-[#1A1A1A] text-[#1A1A1A]'
                    : 'bg-white border-[#E5E2DD] text-[#8C8881] hover:border-[#1A1A1A]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="font-mono font-bold text-[9px] text-white bg-[#1A1A1A] px-1.5 py-0.5 rounded">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-[#1A1A1A] truncate max-w-[120px]">{slide.title || '(Tanpa Judul)'}</span>
                  <span className="text-[9px] text-[#8C8881] capitalize px-1 bg-[#F9F8F6] border border-[#E5E2DD] rounded font-medium">
                    {slide.slideType.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => handleMoveSlide(idx, 'up', e)}
                    disabled={idx === 0}
                    className="p-1 hover:bg-[#F3F1EE] rounded text-[#8C8881] hover:text-[#1A1A1A] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                    title="Naikkan Slide"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => handleMoveSlide(idx, 'down', e)}
                    disabled={idx === carousel.slides.length - 1}
                    className="p-1 hover:bg-[#F3F1EE] rounded text-[#8C8881] hover:text-[#1A1A1A] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                    title="Turunkan Slide"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                  {carousel.slides.length > 1 && (
                    <button
                      onClick={(e) => handleDeleteSlide(slide.id, e)}
                      className="p-1 hover:bg-rose-50 rounded text-[#8C8881] hover:text-rose-600 cursor-pointer"
                      title="Hapus Slide"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. ACTIVE SLIDE FORM EDITOR */}
      {activeSlide && (
        <div className="border-t border-[#E5E2DD] pt-4 space-y-4 animate-fade-in" id="active-slide-editor-fields">
          <div className="flex items-center justify-between pb-1 border-b border-[#E5E2DD]">
            <h4 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-[0.1em] flex items-center gap-1">
              <FileText className="w-4 h-4 text-[#8C8881]" />
              Edit Slide Terpilih
            </h4>
            <span className="text-[10px] bg-[#F3F1EE] px-2 py-0.5 text-[#1A1A1A] rounded-md font-mono border border-[#DED9D1] font-bold">
              Slide #{carousel.slides.findIndex(s => s.id === activeSlide.id) + 1}
            </span>
          </div>

          {/* Slide Type Selector */}
          <div>
            <label className="block text-[10px] font-bold text-[#8C8881] uppercase tracking-[0.1em] mb-1">Tipe / Tata Letak Slide</label>
            <select
              value={activeSlide.slideType}
              onChange={(e) => updateActiveSlideField({ slideType: e.target.value as SlideType })}
              className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E5E2DD] rounded-xl text-[#1A1A1A] text-xs focus:outline-none focus:border-[#1A1A1A]"
            >
              <option value="intro">Intro (Judul Sampul Utama)</option>
              <option value="thumbnail">Thumbnail (Brosur / Thumbnail Utama)</option>
              <option value="content">Content (Penjelasan Standar)</option>
              <option value="comparison">Comparison (Perbandingan Berdampingan)</option>
              <option value="qna">Q&A (Tanya Jawab)</option>
              <option value="quote">Quote (Kutipan Besar)</option>
              <option value="list">List (Daftar Poin Ikonis)</option>
              <option value="call_to_action">Call to Action (Ajakan Interaksi)</option>
              <option value="conclusion">Conclusion (Kesimpulan Akhir)</option>
            </select>
          </div>

          {/* DYNAMIC FORM CONTENTS BASED ON SLIDE TYPE */}

          {activeSlide.slideType === 'comparison' ? (
            /* ==============================================
               COMPARISON LAYOUT FIELDS
               ============================================== */
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[#8C8881] uppercase tracking-[0.1em] mb-1">Judul Topik Perbandingan</label>
                <input
                  type="text"
                  value={activeSlide.title}
                  onChange={(e) => updateActiveSlideField({ title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E5E2DD] rounded-xl text-[#1A1A1A] text-xs focus:outline-none focus:border-[#1A1A1A]"
                  placeholder="Masukkan judul perbandingan (e.g. Cara Belajar Efektif)"
                />
              </div>

              {/* Column Left (Positive/Before) */}
              <div className="p-3 bg-emerald-50/50 border border-emerald-500/20 rounded-xl space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                  ✓ Kolom Kiri (Do / Sebelum / Positif)
                </span>
                <div>
                  <label className="block text-[9px] font-bold text-emerald-700/80 uppercase tracking-wider mb-1">Nama Label Kiri</label>
                  <input
                    type="text"
                    value={activeSlide.comparisonLeftTitle || ''}
                    onChange={(e) => updateActiveSlideField({ comparisonLeftTitle: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-emerald-500/20 rounded-lg text-emerald-950 text-xs focus:outline-none"
                    placeholder="Contoh: SEBELUM / DO"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-bold text-emerald-700/80 uppercase tracking-wider">Poin Kiri (Maks 4)</label>
                    <button
                      type="button"
                      onClick={() => handleAddComparisonItem('left')}
                      className="text-[9px] text-emerald-800 font-bold hover:underline flex items-center gap-0.5"
                    >
                      + Tambah Poin
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {(activeSlide.comparisonLeftItems || []).map((item, idx) => (
                      <div key={idx} className="flex gap-1.5 items-center">
                        <span className="text-[10px] font-mono text-emerald-700">L#{idx+1}</span>
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleUpdateComparisonItem('left', idx, e.target.value)}
                          className="flex-1 px-2.5 py-1 bg-white border border-emerald-500/10 rounded-lg text-emerald-950 text-xs focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveComparisonItem('left', idx)}
                          className="text-rose-500 p-0.5 hover:text-rose-700"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {(activeSlide.comparisonLeftItems || []).length === 0 && (
                      <p className="text-[10px] text-emerald-700/60 italic">Belum ada poin. Tambahkan satu di atas!</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Column Right (Negative/After) */}
              <div className="p-3 bg-rose-50/50 border border-rose-500/20 rounded-xl space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-800 flex items-center gap-1">
                  ✕ Kolom Kanan (Don't / Sesudah / Negatif)
                </span>
                <div>
                  <label className="block text-[9px] font-bold text-rose-700/80 uppercase tracking-wider mb-1">Nama Label Kanan</label>
                  <input
                    type="text"
                    value={activeSlide.comparisonRightTitle || ''}
                    onChange={(e) => updateActiveSlideField({ comparisonRightTitle: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-rose-500/20 rounded-lg text-rose-950 text-xs focus:outline-none"
                    placeholder="Contoh: SESUDAH / DON'T"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-bold text-rose-700/80 uppercase tracking-wider">Poin Kanan (Maks 4)</label>
                    <button
                      type="button"
                      onClick={() => handleAddComparisonItem('right')}
                      className="text-[9px] text-rose-800 font-bold hover:underline flex items-center gap-0.5"
                    >
                      + Tambah Poin
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {(activeSlide.comparisonRightItems || []).map((item, idx) => (
                      <div key={idx} className="flex gap-1.5 items-center">
                        <span className="text-[10px] font-mono text-rose-700">R#{idx+1}</span>
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleUpdateComparisonItem('right', idx, e.target.value)}
                          className="flex-1 px-2.5 py-1 bg-white border border-rose-500/10 rounded-lg text-rose-950 text-xs focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveComparisonItem('right', idx)}
                          className="text-rose-500 p-0.5 hover:text-rose-700"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {(activeSlide.comparisonRightItems || []).length === 0 && (
                      <p className="text-[10px] text-rose-700/60 italic">Belum ada poin. Tambahkan satu di atas!</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : activeSlide.slideType === 'qna' ? (
            /* ==============================================
               Q&A LAYOUT FIELDS
               ============================================== */
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[#8C8881] uppercase tracking-[0.1em] mb-1">Kategori / Topik Q&A</label>
                <input
                  type="text"
                  value={activeSlide.title}
                  onChange={(e) => updateActiveSlideField({ title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E5E2DD] rounded-xl text-[#1A1A1A] text-xs focus:outline-none focus:border-[#1A1A1A]"
                  placeholder="e.g. TANYA JAWAB / QnA"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#8C8881] uppercase tracking-[0.1em] mb-1">Username / Penanya</label>
                <input
                  type="text"
                  value={activeSlide.qnaUserHandle || ''}
                  onChange={(e) => updateActiveSlideField({ qnaUserHandle: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E5E2DD] rounded-xl text-[#1A1A1A] text-xs focus:outline-none"
                  placeholder="Contoh: @follower_setia"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#8C8881] uppercase tracking-[0.1em] mb-1">Pertanyaan (Question)</label>
                <input
                  type="text"
                  value={activeSlide.qnaQuestion || ''}
                  onChange={(e) => updateActiveSlideField({ qnaQuestion: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E5E2DD] rounded-xl text-[#1A1A1A] text-xs focus:outline-none"
                  placeholder="Bagaimana cara mengatasi konsistensi belajar?"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#8C8881] uppercase tracking-[0.1em] mb-1">Jawaban (Answer)</label>
                <textarea
                  value={activeSlide.qnaAnswer || ''}
                  onChange={(e) => updateActiveSlideField({ qnaAnswer: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E5E2DD] rounded-xl text-[#1A1A1A] text-xs focus:outline-none min-h-[80px]"
                  placeholder="Tulis penjelasan jawaban yang detail dan mengena di sini..."
                />
              </div>
            </div>
          ) : activeSlide.slideType === 'quote' ? (
            /* ==============================================
               QUOTE LAYOUT FIELDS
               ============================================== */
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[#8C8881] uppercase tracking-[0.1em] mb-1">Isi Kutipan (Quote Text)</label>
                <textarea
                  value={activeSlide.title}
                  onChange={(e) => updateActiveSlideField({ title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E5E2DD] rounded-xl text-[#1A1A1A] text-xs focus:outline-none min-h-[70px]"
                  placeholder="Tulis kutipan inspiratif di sini..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#8C8881] uppercase tracking-[0.1em] mb-1">Penulis / Tokoh</label>
                <input
                  type="text"
                  value={activeSlide.subtitle || ''}
                  onChange={(e) => updateActiveSlideField({ subtitle: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E5E2DD] rounded-xl text-[#1A1A1A] text-xs focus:outline-none"
                  placeholder="Contoh: Albert Einstein"
                />
              </div>
            </div>
          ) : activeSlide.slideType === 'thumbnail' ? (
            /* ==============================================
               THUMBNAIL LAYOUT FIELDS
               ============================================== */
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[#8C8881] uppercase tracking-[0.1em] mb-1">Judul Utama Thumbnail</label>
                <input
                  type="text"
                  value={activeSlide.title}
                  onChange={(e) => updateActiveSlideField({ title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E5E2DD] rounded-xl text-[#1A1A1A] text-xs focus:outline-none"
                  placeholder="Contoh: TIPS CODING CEPAT!"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#8C8881] uppercase tracking-[0.1em] mb-1">Lencana Atas / Kategori</label>
                <input
                  type="text"
                  value={activeSlide.subtitle || ''}
                  onChange={(e) => updateActiveSlideField({ subtitle: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E5E2DD] rounded-xl text-[#1A1A1A] text-xs focus:outline-none"
                  placeholder="Contoh: PANDUAN VIRAL"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#8C8881] uppercase tracking-[0.1em] mb-1">Teks Tambahan Bawah (Kecil)</label>
                <input
                  type="text"
                  value={activeSlide.body[0] || ''}
                  onChange={(e) => {
                    const newBody = [...activeSlide.body];
                    newBody[0] = e.target.value;
                    updateActiveSlideField({ body: newBody });
                  }}
                  className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E5E2DD] rounded-xl text-[#1A1A1A] text-xs focus:outline-none"
                  placeholder="Contoh: Hanya Butuh 5 Menit"
                />
              </div>
            </div>
          ) : activeSlide.slideType === 'call_to_action' ? (
            /* ==============================================
               CALL TO ACTION LAYOUT FIELDS
               ============================================== */
            <div className="space-y-4">
              {/* CTA Type Selector */}
              <div className="p-2.5 bg-blue-50/50 border border-blue-500/10 rounded-xl space-y-1.5">
                <label className="block text-[10px] font-bold text-blue-900 uppercase tracking-wide">Tipe Call to Action (CTA)</label>
                <div className="flex bg-[#F9F8F6] p-0.5 rounded-lg border border-[#E5E2DD] gap-1">
                  <button
                    type="button"
                    onClick={() => updateActiveSlideField({ ctaType: 'social' })}
                    className={`flex-1 py-1 text-[9px] font-black uppercase rounded transition cursor-pointer ${
                      (activeSlide.ctaType || 'social') === 'social'
                        ? 'bg-blue-600 text-white'
                        : 'text-stone-500 hover:text-black'
                    }`}
                  >
                    Sosmed (Like/Save)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateActiveSlideField({ ctaType: 'website' })}
                    className={`flex-1 py-1 text-[9px] font-black uppercase rounded transition cursor-pointer ${
                      activeSlide.ctaType === 'website'
                        ? 'bg-blue-600 text-white'
                        : 'text-stone-500 hover:text-black'
                    }`}
                  >
                    Website / Tautan
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#8C8881] uppercase tracking-[0.1em] mb-1">Judul Ajakan Utama</label>
                <input
                  type="text"
                  value={activeSlide.title}
                  onChange={(e) => updateActiveSlideField({ title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E5E2DD] rounded-xl text-[#1A1A1A] text-xs focus:outline-none"
                  placeholder={activeSlide.ctaType === 'website' ? "Contoh: Hubungi Kami Sekarang!" : "Contoh: Bermanfaat? Simpan Postingan Ini!"}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#8C8881] uppercase tracking-[0.1em] mb-1">Pesan Sub-judul</label>
                <input
                  type="text"
                  value={activeSlide.subtitle || ''}
                  onChange={(e) => updateActiveSlideField({ subtitle: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E5E2DD] rounded-xl text-[#1A1A1A] text-xs focus:outline-none"
                  placeholder={activeSlide.ctaType === 'website' ? "Contoh: Dapatkan konsultasi gratis melalui formulir di website kami." : "Contoh: Jangan lupa follow akun ini untuk update konten seru harian!"}
                />
              </div>

              {/* Specific fields for Website CTA */}
              {activeSlide.ctaType === 'website' && (
                <div className="p-3 bg-white border border-[#E5E2DD] rounded-xl space-y-3 shadow-sm">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-700 uppercase mb-1">Teks Tombol CTA</label>
                    <input
                      type="text"
                      value={activeSlide.ctaButtonText || ''}
                      onChange={(e) => updateActiveSlideField({ ctaButtonText: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#F9F8F6] border border-[#E5E2DD] rounded-lg text-xs font-semibold focus:outline-none"
                      placeholder="Contoh: Kunjungi Website Kami atau Daftar Sekarang"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-700 uppercase mb-1">Link URL / Alamat Website</label>
                    <input
                      type="text"
                      value={activeSlide.ctaUrl || ''}
                      onChange={(e) => updateActiveSlideField({ ctaUrl: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#F9F8F6] border border-[#E5E2DD] rounded-lg text-xs font-semibold focus:outline-none"
                      placeholder="Contoh: www.brandkamu.com"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-[#8C8881] uppercase tracking-[0.1em] mb-1">Pesan Tambahan Paling Bawah</label>
                <input
                  type="text"
                  value={activeSlide.body[0] || ''}
                  onChange={(e) => {
                    const newBody = [...activeSlide.body];
                    newBody[0] = e.target.value;
                    updateActiveSlideField({ body: newBody });
                  }}
                  className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E5E2DD] rounded-xl text-[#1A1A1A] text-xs focus:outline-none"
                  placeholder="Contoh: Link aktif ada di bio profil"
                />
              </div>
            </div>
          ) : (
            /* ==============================================
               STANDARD LAYOUTS (Intro, Content, List, Conclusion)
               ============================================== */
            <div className="space-y-4">
              {/* Heading */}
              <div>
                <label className="block text-[10px] font-bold text-[#8C8881] uppercase tracking-[0.1em] mb-1">Judul Utama Slide</label>
                <input
                  type="text"
                  value={activeSlide.title}
                  onChange={(e) => updateActiveSlideField({ title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E5E2DD] rounded-xl text-[#1A1A1A] text-xs focus:outline-none focus:border-[#1A1A1A]"
                  placeholder="Masukkan judul utama slide"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-[10px] font-bold text-[#8C8881] uppercase tracking-[0.1em] mb-1">Sub-Judul (Opsional)</label>
                <input
                  type="text"
                  value={activeSlide.subtitle || ''}
                  onChange={(e) => updateActiveSlideField({ subtitle: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E5E2DD] rounded-xl text-[#1A1A1A] text-xs focus:outline-none focus:border-[#1A1A1A]"
                  placeholder="Masukkan subjudul atau konteks"
                />
              </div>

              {/* Body points builder */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-bold text-[#8C8881] uppercase tracking-[0.1em]">Poin-Poin Deskripsi ({activeSlide.body.length})</label>
                  <button
                    type="button"
                    onClick={handleAddBodyPoint}
                    className="text-[10px] text-[#1A1A1A] font-bold uppercase tracking-wider hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Tambah Poin
                  </button>
                </div>
                
                <div className="space-y-2">
                  {activeSlide.body.map((point, pIdx) => (
                    <div key={pIdx} className="flex gap-2 items-center">
                      <span className="text-[10px] font-mono text-[#8C8881] font-bold">#{pIdx+1}</span>
                      <input
                        type="text"
                        value={point}
                        onChange={(e) => handleUpdateBodyPoint(pIdx, e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-[#F9F8F6] border border-[#E5E2DD] rounded-lg text-[#1A1A1A] text-xs focus:outline-none focus:border-[#1A1A1A]"
                        placeholder="Tulis detail poin..."
                      />
                      {activeSlide.body.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveBodyPoint(pIdx)}
                          className="p-1 text-[#8C8881] hover:text-rose-600 transition cursor-pointer"
                        >
                          <MinusCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Penanda poin: bullet, strip, angka, atau tanpa penanda */}
              {(activeSlide.slideType === 'list' || activeSlide.slideType === 'content') && (
                <div>
                  <label className="block text-[10px] font-bold text-[#8C8881] uppercase tracking-[0.1em] mb-1">Penanda Poin</label>
                  <p className="text-[9px] text-stone-500 font-medium mb-1.5">Tanpa ikon. Pilih penanda teks yang paling cocok.</p>
                  <div className="grid grid-cols-4 gap-1 bg-[#F9F8F6] p-1.5 border border-[#E5E2DD] rounded-lg">
                    {[
                      { id: 'dot', label: 'Bullet' },
                      { id: 'dash', label: 'Strip' },
                      { id: 'number', label: 'Angka' },
                      { id: 'none', label: 'Tanpa' },
                    ].map((opt) => {
                      const selected = (activeSlide.pointMarker || 'dot') === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => updateActiveSlideField({ pointMarker: opt.id as Slide['pointMarker'] })}
                          className={`py-1.5 px-1 text-[10px] rounded text-center transition font-medium cursor-pointer ${
                            selected ? 'bg-[#1A1A1A] text-white shadow-sm' : 'text-[#8C8881] hover:bg-[#F3F1EE] hover:text-[#1A1A1A]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Custom CTA Text (Shown for non-CTA/non-conclusion/non-thumbnail slides as general swipe cues) */}
          {activeSlide.slideType !== 'call_to_action' && activeSlide.slideType !== 'conclusion' && activeSlide.slideType !== 'thumbnail' && (
            <div>
              <label className="block text-[10px] font-bold text-[#8C8881] uppercase tracking-[0.1em] mb-1">Teks Call to Action / Footer</label>
              <input
                type="text"
                value={activeSlide.ctaText || ''}
                onChange={(e) => updateActiveSlideField({ ctaText: e.target.value })}
                className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E5E2DD] rounded-xl text-[#1A1A1A] text-xs focus:outline-none focus:border-[#1A1A1A]"
                placeholder="Contoh: Swipe Kiri >> atau Hubungi Kami!"
              />
            </div>
          )}

          {/* Ikon Atas Judul (Top Title Icon Customization) */}
          <div className="p-3 bg-amber-50/50 border-2 border-dashed border-black/25 rounded-xl space-y-2.5 shadow-[1px_1px_0px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider block text-black flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#E26D5C]" />
                Ikon di Atas Judul
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeSlide.showTitleIcon === true}
                  onChange={(e) => updateActiveSlideField({ showTitleIcon: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-stone-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>

            <p className="text-[9px] text-stone-500 leading-normal font-medium">
              Opsional. Tampilkan ikon di atas judul hanya jika memang perlu.
            </p>

            {activeSlide.showTitleIcon === true && (
              <div className="space-y-1.5 animate-fade-in">
                <label className="block text-[9px] font-bold text-stone-700">Pilih Desain Ikon</label>
                <div className="grid grid-cols-5 gap-1 max-h-[85px] overflow-y-auto bg-white p-1.5 border border-[#E5E2DD] rounded-lg">
                  {AVAILABLE_ICONS.concat(['Globe']).map((iconName) => {
                    const isSelected = activeSlide.titleIcon === iconName || (!activeSlide.titleIcon && iconName === (activeSlide.ctaType === 'website' ? 'Globe' : 'Sparkles'));
                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => updateActiveSlideField({ titleIcon: iconName })}
                        className={`p-1 text-[10px] rounded text-center transition truncate hover:bg-stone-100 hover:text-black font-medium cursor-pointer ${
                          isSelected ? 'bg-black text-white shadow-sm font-bold' : 'text-stone-500'
                        }`}
                        title={iconName}
                      >
                        {iconName}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sticker Badge / Lencana */}
          <div className="p-3 bg-amber-50 border-2 border-black rounded-xl space-y-2.5 shadow-[2px_2px_0px_#000]">
            <span className="text-[10px] font-black uppercase tracking-wider block text-black flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              Stiker Lencana (Engagement Badge)
            </span>
            <p className="text-[9px] text-stone-600 leading-normal font-medium">
              Sangat direkomendasikan untuk <b>YouTube Thumbnails</b> atau slide sampul depan untuk meningkatkan rasio klik (CTR)!
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] font-bold text-stone-700 mb-1">Teks Lencana (e.g. HOT, FREE)</label>
                <input
                  type="text"
                  value={activeSlide.badgeText || ''}
                  onChange={(e) => updateActiveSlideField({ badgeText: e.target.value })}
                  className="w-full px-2 py-1.5 bg-white border-2 border-black rounded-lg text-[#1A1A1A] text-xs focus:outline-none"
                  placeholder="Kosongkan jika tidak ada"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-stone-700 mb-1 font-sans">Warna Stiker</label>
                <div className="flex gap-1.5 items-center">
                  <input
                    type="color"
                    value={activeSlide.badgeColor || '#facc15'}
                    onChange={(e) => updateActiveSlideField({ badgeColor: e.target.value })}
                    className="w-8 h-8 rounded border-2 border-black cursor-pointer bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => updateActiveSlideField({ badgeColor: undefined })}
                    className="text-[9px] px-2 py-1 bg-white hover:bg-stone-100 text-black rounded border-2 border-black font-black uppercase tracking-wider cursor-pointer shadow-[1px_1px_0px_#000]"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Pendukung AI Image */}
          <div className="p-3 bg-blue-50 border-2 border-black rounded-xl space-y-2.5 shadow-[2px_2px_0px_#000]">
            <span className="text-[10px] font-black uppercase tracking-wider block text-black flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
              Visual Pendukung (AI Image)
            </span>
            <p className="text-[9px] text-stone-600 leading-normal font-medium">
              Tambahkan gambar ilustrasi atau foto pendukung konten slide yang dibuat langsung oleh AI Gemini!
            </p>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-black select-none">
                <input
                  type="checkbox"
                  checked={!!activeSlide.showImage}
                  onChange={(e) => updateActiveSlideField({ showImage: e.target.checked })}
                  className="w-4 h-4 accent-black border-2 border-black rounded"
                />
                <span>Tampilkan Gambar di Slide</span>
              </label>
            </div>

            {activeSlide.showImage && (
              <div className="space-y-3 pt-1 border-t border-blue-200/50 animate-fade-in text-xs">
                {activeSlide.imageUrl && (
                  <div className="relative border-2 border-black rounded-lg overflow-hidden bg-white shadow-[1.5px_1.5px_0px_#000] w-full max-h-[140px] flex items-center justify-center">
                    <img
                      src={activeSlide.imageUrl}
                      alt="Visual Preview"
                      className="object-contain max-h-[140px] w-full"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        updateActiveSlideField({ imageUrl: undefined });
                        setCustomUrlInput('');
                      }}
                      className="absolute top-1.5 right-1.5 px-2 py-0.5 bg-red-100 hover:bg-red-200 border border-black rounded-md text-red-700 font-extrabold text-[9px] cursor-pointer shadow-[1px_1px_0px_#000]"
                      title="Hapus Gambar"
                    >
                      Hapus
                    </button>
                  </div>
                )}

                {/* Sub-tabs */}
                <div className="grid grid-cols-3 bg-stone-100 border border-black rounded-lg p-0.5 text-[9px] font-bold">
                  <button
                    type="button"
                    onClick={() => setImageTab('ai')}
                    className={`py-1 flex items-center justify-center gap-1 rounded transition ${imageTab === 'ai' ? 'bg-[#1A1A1A] text-white' : 'text-stone-600 hover:text-black'}`}
                  >
                    <Sparkles className="w-3 h-3" />
                    AI Gemini
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageTab('stock')}
                    className={`py-1 flex items-center justify-center gap-1 rounded transition ${imageTab === 'stock' ? 'bg-[#1A1A1A] text-white' : 'text-stone-600 hover:text-black'}`}
                  >
                    <Image className="w-3 h-3" />
                    Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageTab('url')}
                    className={`py-1 flex items-center justify-center gap-1 rounded transition ${imageTab === 'url' ? 'bg-[#1A1A1A] text-white' : 'text-stone-600 hover:text-black'}`}
                  >
                    <Link className="w-3 h-3" />
                    Link URL
                  </button>
                </div>

                {imageTab === 'ai' && (
                  <div className="space-y-3 animate-fade-in">
                    <div>
                      <label className="block text-[9px] font-bold text-stone-700 mb-1">Prompt Gambar (Bahasa Indonesia/Inggris)</label>
                      <textarea
                        value={imagePromptInput}
                        onChange={(e) => {
                          setImagePromptInput(e.target.value);
                          updateActiveSlideField({ imagePrompt: e.target.value });
                        }}
                        rows={2}
                        className="w-full px-2 py-1.5 bg-white border-2 border-black rounded-lg text-black text-xs focus:outline-none"
                        placeholder="Contoh: Ilustrasi 3D minimalis robot lucu warna orange, pastel background"
                      />
                    </div>

                    <button
                      type="button"
                      disabled={isGeneratingImage || !imagePromptInput.trim()}
                      onClick={async () => {
                        try {
                          setIsGeneratingImage(true);
                          // Determine aspect ratio for the image model based on selected layout
                          let calculatedAspectRatio = '1:1';
                          if (activeSlide.imagePosition === 'left' || activeSlide.imagePosition === 'right') {
                            calculatedAspectRatio = '3:4';
                          } else if (activeSlide.imagePosition === 'background') {
                            calculatedAspectRatio = carousel.size === 'square' ? '1:1' : carousel.size === 'portrait' ? '3:4' : carousel.size === 'story' ? '9:16' : '16:9';
                          }
                          
                          const response = await fetch('/api/generate-image', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              prompt: imagePromptInput,
                              aspectRatio: calculatedAspectRatio
                            })
                          });
                          
                          const data = await response.json();
                          if (data.error && !data.imageUrl) {
                            throw new Error(data.error);
                          }
                          
                          updateActiveSlideField({
                            imageUrl: data.imageUrl,
                            imagePrompt: imagePromptInput
                          });
                        } catch (error: any) {
                          console.error("Failed to generate image:", error);
                          alert(`Gagal membuat gambar: ${error.message || error}`);
                        } finally {
                          setIsGeneratingImage(false);
                        }
                      }}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white border-2 border-black rounded-lg text-[10px] font-black uppercase tracking-wider transition flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000]"
                    >
                      {isGeneratingImage ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Mempersiapkan Gambar...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Buat Gambar dengan AI</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {imageTab === 'stock' && (
                  <div className="space-y-3 animate-fade-in">
                    <div>
                      <label className="block text-[9px] font-bold text-stone-700 mb-1">Cari Foto Stock Unsplash (Inggris/Indonesia)</label>
                      <input
                        type="text"
                        value={unsplashKeyword}
                        onChange={(e) => setUnsplashKeyword(e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border-2 border-black rounded-lg text-black text-xs focus:outline-none"
                        placeholder="Contoh: technology, minimalist, workspace, startup"
                      />
                    </div>

                    <button
                      type="button"
                      disabled={!unsplashKeyword.trim()}
                      onClick={() => {
                        let calculatedAspectRatio = '1:1';
                        if (activeSlide.imagePosition === 'left' || activeSlide.imagePosition === 'right') {
                          calculatedAspectRatio = '3:4';
                        } else if (activeSlide.imagePosition === 'background') {
                          calculatedAspectRatio = carousel.size === 'square' ? '1:1' : carousel.size === 'portrait' ? '3:4' : carousel.size === 'story' ? '9:16' : '16:9';
                        }

                        let size = "800x800";
                        if (calculatedAspectRatio === "9:16") size = "1080x1920";
                        else if (calculatedAspectRatio === "3:4") size = "900x1200";
                        else if (calculatedAspectRatio === "16:9") size = "1920x1080";

                        const randomId = Math.floor(Math.random() * 100000);
                        const unsplashUrl = `https://images.unsplash.com/featured/${size}/?${encodeURIComponent(unsplashKeyword.trim())}&sig=${randomId}`;
                        
                        updateActiveSlideField({
                          imageUrl: unsplashUrl,
                          imagePrompt: unsplashKeyword.trim()
                        });
                      }}
                      className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white border-2 border-black rounded-lg text-[10px] font-black uppercase tracking-wider transition flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-[2px_2px_0px_#000]"
                    >
                      <Image className="w-3.5 h-3.5" />
                      <span>Ambil Foto Unsplash</span>
                    </button>
                  </div>
                )}

                {imageTab === 'url' && (
                  <div className="space-y-3 animate-fade-in">
                    <div>
                      <label className="block text-[9px] font-bold text-stone-700 mb-1">Tempel Link URL Gambar Kustom</label>
                      <input
                        type="url"
                        value={customUrlInput}
                        onChange={(e) => setCustomUrlInput(e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border-2 border-black rounded-lg text-black text-xs focus:outline-none"
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>

                    <button
                      type="button"
                      disabled={!customUrlInput.trim().startsWith('http')}
                      onClick={() => {
                        updateActiveSlideField({
                          imageUrl: customUrlInput.trim()
                        });
                      }}
                      className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white border-2 border-black rounded-lg text-[10px] font-black uppercase tracking-wider transition flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-[2px_2px_0px_#000]"
                    >
                      <Link className="w-3.5 h-3.5" />
                      <span>Gunakan Link Gambar</span>
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-bold text-stone-700 mb-1">Posisi Gambar</label>
                    <select
                      value={activeSlide.imagePosition || 'bottom'}
                      onChange={(e) => updateActiveSlideField({ imagePosition: e.target.value as any })}
                      className="w-full px-2 py-1.5 bg-white border-2 border-black rounded-lg text-black text-[10px] font-bold focus:outline-none"
                    >
                      <option value="background">Latar Belakang (BG)</option>
                      <option value="top">Atas Judul</option>
                      <option value="bottom">Bawah Konten</option>
                      <option value="left">Kiri (2 Kolom)</option>
                      <option value="right">Kanan (2 Kolom)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-stone-700 mb-1">Gaya Bingkai</label>
                    <select
                      value={activeSlide.imageStyle || 'neobrutalism'}
                      onChange={(e) => updateActiveSlideField({ imageStyle: e.target.value as any })}
                      className="w-full px-2 py-1.5 bg-white border-2 border-black rounded-lg text-black text-[10px] font-bold focus:outline-none"
                    >
                      <option value="neobrutalism">Neobrutalis (Borders)</option>
                      <option value="rounded">Sudut Membulat</option>
                      <option value="square">Siku (Kotak)</option>
                      <option value="circle">Lingkaran</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Advanced layout customization */}
          <div className="space-y-3 border-t border-[#E5E2DD] pt-3">
            <span className="text-[10px] font-bold text-[#8C8881] uppercase tracking-[0.1em] block">Kustomisasi Tata Letak Lanjut</span>
            
            <div className="grid grid-cols-2 gap-2">
              {/* Text Alignment */}
              <div>
                <label className="block text-[9px] font-bold text-stone-600 mb-1">Penyelarasan Teks</label>
                <div className="flex bg-[#F9F8F6] p-0.5 rounded-lg border border-[#E5E2DD] gap-1">
                  {(['left', 'center', 'right'] as const).map((align) => (
                    <button
                      key={align}
                      type="button"
                      onClick={() => updateActiveSlideField({ textAlignment: align })}
                      className={`flex-1 py-1 text-[9px] font-bold uppercase rounded capitalize transition cursor-pointer ${
                        (activeSlide.textAlignment || 'left') === align
                          ? 'bg-[#1A1A1A] text-white'
                          : 'text-stone-500 hover:text-black'
                      }`}
                    >
                      {align === 'left' ? 'Kiri' : align === 'center' ? 'Tengah' : 'Kanan'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Heading Size */}
              <div>
                <label className="block text-[9px] font-bold text-stone-600 mb-1">Ukuran Judul</label>
                <select
                  value={activeSlide.headingSizeOverride || 'lg'}
                  onChange={(e) => updateActiveSlideField({ headingSizeOverride: e.target.value as any })}
                  className="w-full px-2 py-1 bg-[#F9F8F6] border border-[#E5E2DD] rounded-lg text-stone-700 text-[10px] font-bold focus:outline-none"
                >
                  <option value="sm">Kecil</option>
                  <option value="md">Sedang</option>
                  <option value="lg">Besar (Normal)</option>
                  <option value="xl">Ekstra Besar</option>
                  <option value="2xl">Super Besar (Thumbnail)</option>
                </select>
              </div>
            </div>

            {/* Watermark position selector */}
            <div className="space-y-1.5 bg-stone-50 border border-stone-200 p-2.5 rounded-lg">
              <label className="block text-[9px] font-bold text-stone-600 uppercase tracking-wide">Posisi Watermark / Profil</label>
              <div className="grid grid-cols-4 gap-1 bg-[#F9F8F6] p-0.5 rounded-lg border border-[#E5E2DD]">
                {([
                  { value: 'both', label: 'Kedua' },
                  { value: 'top', label: 'Atas' },
                  { value: 'bottom', label: 'Bawah' },
                  { value: 'none', label: 'Sembunyi' }
                ] as const).map((opt) => {
                  const currentPos = activeSlide.watermarkPosition || (activeSlide.hideProfileWatermark ? 'none' : 'both');
                  const isSelected = currentPos === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updateActiveSlideField({ 
                        watermarkPosition: opt.value,
                        hideProfileWatermark: opt.value === 'none'
                      })}
                      className={`py-1 text-[8px] sm:text-[9px] font-black uppercase rounded transition cursor-pointer text-center ${
                        isSelected
                          ? 'bg-[#1A1A1A] text-white shadow-sm'
                          : 'text-stone-500 hover:text-black hover:bg-stone-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Watermark type selector */}
            {(activeSlide.watermarkPosition !== 'none' && !activeSlide.hideProfileWatermark) && (
              <div className="space-y-1.5 bg-stone-50 border border-stone-200 p-2.5 rounded-lg">
                <label className="block text-[9px] font-bold text-stone-600 uppercase tracking-wide">Isi Watermark / Profil</label>
                <div className="grid grid-cols-3 gap-1 bg-[#F9F8F6] p-0.5 rounded-lg border border-[#E5E2DD]">
                  {([
                    { value: 'social', label: 'Medsos' },
                    { value: 'website', label: 'Website' },
                    { value: 'both', label: 'Kedua' }
                  ] as const).map((opt) => {
                    const currentType = activeSlide.watermarkType || 'social';
                    const isSelected = currentType === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateActiveSlideField({ watermarkType: opt.value })}
                        className={`py-1 text-[8px] sm:text-[9px] font-black uppercase rounded transition cursor-pointer text-center ${
                          isSelected
                            ? 'bg-[#1A1A1A] text-white shadow-sm'
                            : 'text-stone-500 hover:text-black hover:bg-stone-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Individual slide override colors */}
          <div className="grid grid-cols-2 gap-2 border-t border-[#E5E2DD] pt-3">
            <div>
              <label className="block text-[10px] font-bold text-[#8C8881] uppercase tracking-[0.1em] mb-1">Override BG Slide</label>
              <div className="flex gap-1.5 items-center">
                <input
                  type="color"
                  value={activeSlide.backgroundColorOverride || '#ffffff'}
                  onChange={(e) => updateActiveSlideField({ backgroundColorOverride: e.target.value })}
                  className="w-8 h-8 rounded border border-[#E5E2DD] cursor-pointer bg-transparent"
                />
                <button
                  onClick={() => updateActiveSlideField({ backgroundColorOverride: undefined })}
                  className="text-[9px] px-2 py-1 bg-white hover:bg-[#F3F1EE] text-[#1A1A1A] rounded border border-[#E5E2DD] font-bold uppercase tracking-wider cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#8C8881] uppercase tracking-[0.1em] mb-1">Override Teks Slide</label>
              <div className="flex gap-1.5 items-center">
                <input
                  type="color"
                  value={activeSlide.textColorOverride || '#000000'}
                  onChange={(e) => updateActiveSlideField({ textColorOverride: e.target.value })}
                  className="w-8 h-8 rounded border border-[#E5E2DD] cursor-pointer bg-transparent"
                />
                <button
                  onClick={() => updateActiveSlideField({ textColorOverride: undefined })}
                  className="text-[9px] px-2 py-1 bg-white hover:bg-[#F3F1EE] text-[#1A1A1A] rounded border border-[#E5E2DD] font-bold uppercase tracking-wider cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Individual element customization options */}
          <div className="border-t border-[#E5E2DD] pt-3 space-y-3">
            <span className="text-[10px] font-bold text-[#8C8881] uppercase tracking-[0.1em] block">Kustomisasi Tipografi & Gaya Elemen</span>
            
            {/* Subtitle Customizer */}
            {activeSlide.subtitle && (
              <div className="p-2.5 bg-yellow-50/50 border border-yellow-500/10 rounded-xl space-y-2">
                <span className="text-[9px] font-black uppercase text-yellow-800 tracking-wider block">✍ Kustomisasi Subtitle</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[8px] font-bold text-stone-600 mb-0.5">Font Subtitle</label>
                    <select
                      value={activeSlide.subtitleFontOverride || ''}
                      onChange={(e) => updateActiveSlideField({ subtitleFontOverride: e.target.value || undefined })}
                      className="w-full px-1.5 py-1 bg-white border border-[#E5E2DD] rounded-lg text-[9px] font-semibold"
                    >
                      <option value="">(Default Tema)</option>
                      <option value="Inter">Inter</option>
                      <option value="Space Grotesk">Space Grotesk</option>
                      <option value="Playfair Display">Playfair Display</option>
                      <option value="Outfit">Outfit</option>
                      <option value="Lora">Lora</option>
                      <option value="Fira Code">Fira Code</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-stone-600 mb-0.5">Gaya Subtitle</label>
                    <select
                      value={activeSlide.subtitleStyleOverride || ''}
                      onChange={(e) => updateActiveSlideField({ subtitleStyleOverride: (e.target.value as any) || undefined })}
                      className="w-full px-1.5 py-1 bg-white border border-[#E5E2DD] rounded-lg text-[9px] font-semibold"
                    >
                      <option value="">(Default Tipe)</option>
                      <option value="plain">Polos (Plain)</option>
                      <option value="badge">Badge Bold (Brutal)</option>
                      <option value="clean-badge">Clean Badge</option>
                      <option value="border">Garis Tepi (Border)</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <div>
                    <label className="block text-[8px] font-bold text-stone-600 mb-0.5">Warna Teks</label>
                    <input
                      type="color"
                      value={activeSlide.subtitleTextColorOverride || '#000000'}
                      onChange={(e) => updateActiveSlideField({ subtitleTextColorOverride: e.target.value })}
                      className="w-full h-6 rounded border border-[#E5E2DD] cursor-pointer bg-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-stone-600 mb-0.5">Warna BG</label>
                    <input
                      type="color"
                      value={activeSlide.subtitleBgColorOverride || '#facc15'}
                      onChange={(e) => updateActiveSlideField({ subtitleBgColorOverride: e.target.value })}
                      disabled={activeSlide.subtitleStyleOverride === 'plain'}
                      className="w-full h-6 rounded border border-[#E5E2DD] cursor-pointer bg-transparent disabled:opacity-30"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-stone-600 mb-0.5">Rotasi (Derajat)</label>
                    <input
                      type="number"
                      value={activeSlide.subtitleRotationOverride !== undefined ? activeSlide.subtitleRotationOverride : 0}
                      onChange={(e) => updateActiveSlideField({ subtitleRotationOverride: parseInt(e.target.value) || 0 })}
                      className="w-full px-1.5 py-0.5 bg-white border border-[#E5E2DD] rounded-lg text-[9px] font-semibold"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Title Customizer */}
            {activeSlide.title && (
              <div className="p-2.5 bg-blue-50/50 border border-blue-500/10 rounded-xl space-y-2">
                <span className="text-[9px] font-black uppercase text-blue-800 tracking-wider block">✍ Kustomisasi Judul (Title)</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[8px] font-bold text-stone-600 mb-0.5">Font Judul</label>
                    <select
                      value={activeSlide.titleFontOverride || ''}
                      onChange={(e) => updateActiveSlideField({ titleFontOverride: e.target.value || undefined })}
                      className="w-full px-1.5 py-1 bg-white border border-[#E5E2DD] rounded-lg text-[9px] font-semibold"
                    >
                      <option value="">(Default Tema)</option>
                      <option value="Inter">Inter</option>
                      <option value="Space Grotesk">Space Grotesk</option>
                      <option value="Playfair Display">Playfair Display</option>
                      <option value="Outfit">Outfit</option>
                      <option value="Lora">Lora</option>
                      <option value="Fira Code">Fira Code</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-stone-600 mb-0.5">Warna Judul</label>
                    <div className="flex gap-1.5 items-center">
                      <input
                        type="color"
                        value={activeSlide.titleColorOverride || '#000000'}
                        onChange={(e) => updateActiveSlideField({ titleColorOverride: e.target.value })}
                        className="w-6 h-6 rounded border border-[#E5E2DD] cursor-pointer bg-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => updateActiveSlideField({ titleColorOverride: undefined })}
                        className="text-[8px] font-bold text-stone-500 underline"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-stone-600 mb-0.5">Kapitalisasi Teks</label>
                  <div className="flex bg-white p-0.5 rounded-lg border border-[#E5E2DD] gap-1">
                    {(['none', 'uppercase', 'lowercase', 'capitalize'] as const).map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => updateActiveSlideField({ titleStyleOverride: style })}
                        className={`flex-1 py-0.5 text-[8px] font-bold uppercase rounded transition cursor-pointer ${
                          (activeSlide.titleStyleOverride || 'none') === style
                            ? 'bg-stone-800 text-white'
                            : 'text-stone-500 hover:text-black'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Body Customizer */}
            {activeSlide.body && activeSlide.body.length > 0 && (
              <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                <span className="text-[9px] font-black uppercase text-stone-800 tracking-wider block">✍ Kustomisasi Body / Deskripsi</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[8px] font-bold text-stone-600 mb-0.5">Font Body</label>
                    <select
                      value={activeSlide.bodyFontOverride || ''}
                      onChange={(e) => updateActiveSlideField({ bodyFontOverride: e.target.value || undefined })}
                      className="w-full px-1.5 py-1 bg-white border border-[#E5E2DD] rounded-lg text-[9px] font-semibold"
                    >
                      <option value="">(Default Tema)</option>
                      <option value="Inter">Inter</option>
                      <option value="Space Grotesk">Space Grotesk</option>
                      <option value="Playfair Display">Playfair Display</option>
                      <option value="Outfit">Outfit</option>
                      <option value="Lora">Lora</option>
                      <option value="Fira Code">Fira Code</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-stone-600 mb-0.5">Warna Deskripsi</label>
                    <div className="flex gap-1.5 items-center">
                      <input
                        type="color"
                        value={activeSlide.bodyColorOverride || '#000000'}
                        onChange={(e) => updateActiveSlideField({ bodyColorOverride: e.target.value })}
                        className="w-6 h-6 rounded border border-[#E5E2DD] cursor-pointer bg-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => updateActiveSlideField({ bodyColorOverride: undefined })}
                        className="text-[8px] font-bold text-stone-500 underline"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
