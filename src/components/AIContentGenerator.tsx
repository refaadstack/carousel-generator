import React, { useState, useEffect } from 'react';
import { Brand, Carousel } from '../types';
import { Sparkles, Wand2, Lightbulb, CheckCircle2, ChevronRight, HelpCircle, Flame } from 'lucide-react';

interface AIContentGeneratorProps {
  brands: Brand[];
  activeBrandId: string;
  onCarouselGenerated: (carousel: Carousel) => void;
}

const MARKETING_TIPS = [
  "Slide 1 (Intro) adalah kail! Gunakan judul dengan angka ganjil (misal: '3 Trik Jitu...') untuk menaikkan rasio klik 40%.",
  "Rata-rata audiens sosial media hanya membaca slide selama 2.5 detik. Buat poin penjelas Anda maksimal 2 baris kalimat saja.",
  "Selalu gunakan warna primer brand Anda pada elemen penting seperti tombol CTA, nomor slide, atau kata kunci tebal.",
  "Slide terakhir wajib mencantumkan Call to Action tunggal (seperti 'Follow', 'Comment', atau 'Save'). Terlalu banyak pilihan bikin audiens bingung.",
  "Struktur edukasi terbaik: Hook menarik -> Identifikasi masalah -> Solusi langkah demi langkah -> Kesimpulan / Ajakan bertindak."
];

export const AIContentGenerator: React.FC<AIContentGeneratorProps> = ({
  brands,
  activeBrandId,
  onCarouselGenerated,
}) => {
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState<'educational' | 'marketing' | 'tips'>('tips');
  const [slideCount, setSlideCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tipIndex, setTipIndex] = useState(0);

  // Rotate marketing tips during generation loading
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setTipIndex((prev) => (prev + 1) % MARKETING_TIPS.length);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Harap masukkan topik atau tema konten Anda!');
      return;
    }

    setLoading(true);
    setError(null);

    const activeBrand = brands.find((b) => b.id === activeBrandId);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          style,
          brandName: activeBrand?.name,
          brandHandle: activeBrand?.handle,
          slideCount,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Gagal menghubungi Gemini AI.');
      }

      const data = await response.json();
      
      // Map generated response to a Carousel shape
      const generatedCarousel: Carousel = {
        id: `carousel-${Date.now()}`,
        title: data.title || topic,
        brandId: activeBrandId,
        size: 'portrait', // Default size
        fontHeading: activeBrand?.fontFamily || 'Space Grotesk',
        fontBody: 'Inter',
        theme: 'clean',
        slides: data.slides.map((s: any, idx: number) => ({
          id: `slide-${idx + 1}-${Date.now()}`,
          title: s.title,
          subtitle: s.subtitle || '',
          body: Array.isArray(s.body) ? s.body : [s.body],
          icon: s.icon,
          slideType: s.slideType || 'content',
          ctaText: s.ctaText || (s.slideType === 'intro' ? 'Swipe Kiri >>' : s.slideType === 'call_to_action' ? 'Simpan postingan ini!' : '')
        })),
      };

      onCarouselGenerated(generatedCarousel);
      setTopic(''); // Clear input
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Terjadi kesalahan teknis saat membuat konten.');
    } finally {
      setLoading(false);
    }
  };

  const loadExample = (exTopic: string, exStyle: 'educational' | 'marketing' | 'tips', exCount: number) => {
    setTopic(exTopic);
    setStyle(exStyle);
    setSlideCount(exCount);
    setError(null);
  };

  return (
    <div className="space-y-6" id="ai-generator-container">
      {!loading ? (
        <form onSubmit={handleGenerate} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-[0.1em] mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#8C8881]" />
              Apa topik atau judul kasarmu?
            </label>
            <textarea
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                if (error) setError(null);
              }}
              rows={3}
              className="w-full px-3 py-2.5 bg-[#F9F8F6] border border-[#E5E2DD] rounded-xl text-[#1A1A1A] placeholder-[#8C8881]/70 focus:outline-none focus:border-[#1A1A1A] transition text-sm resize-none shadow-sm"
              placeholder="Contoh: '3 Kebiasaan Pagi yang Merusak Produktivitas' atau 'Cara Mulai Belajar Coding Tanpa Background IT'..."
            />
          </div>

          {/* Style Selector */}
          <div>
            <label className="block text-[10px] font-bold text-[#8C8881] uppercase tracking-[0.1em] mb-2">Gaya & Angle Konten</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStyle('tips')}
                className={`py-2 px-1 rounded-xl border text-xs font-bold transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  style === 'tips'
                    ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white shadow-sm'
                    : 'bg-white border-[#E5E2DD] text-[#8C8881] hover:border-[#1A1A1A] hover:text-[#1A1A1A]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Tips Praktis
              </button>

              <button
                type="button"
                onClick={() => setStyle('educational')}
                className={`py-2 px-1 rounded-xl border text-xs font-bold transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  style === 'educational'
                    ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white shadow-sm'
                    : 'bg-white border-[#E5E2DD] text-[#8C8881] hover:border-[#1A1A1A] hover:text-[#1A1A1A]'
                }`}
              >
                <Lightbulb className="w-4 h-4" />
                Edukasi
              </button>

              <button
                type="button"
                onClick={() => setStyle('marketing')}
                className={`py-2 px-1 rounded-xl border text-xs font-bold transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  style === 'marketing'
                    ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white shadow-sm'
                    : 'bg-white border-[#E5E2DD] text-[#8C8881] hover:border-[#1A1A1A] hover:text-[#1A1A1A]'
                }`}
              >
                <Flame className="w-4 h-4" />
                Marketing
              </button>
            </div>
          </div>

          {/* Slide Count Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[10px] font-bold text-[#8C8881] uppercase tracking-[0.1em]">Jumlah Slide</label>
              <span className="text-xs font-mono font-bold text-[#1A1A1A] bg-[#F3F1EE] px-2 py-0.5 rounded-full border border-[#DED9D1]">
                {slideCount} Slide
              </span>
            </div>
            <input
              type="range"
              min="3"
              max="10"
              value={slideCount}
              onChange={(e) => setSlideCount(parseInt(e.target.value))}
              className="w-full accent-[#1A1A1A] h-1.5 bg-[#F3F1EE] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#8C8881] font-mono mt-1">
              <span>3 Slide (Ringkas)</span>
              <span>10 Slide (Detail)</span>
            </div>
          </div>

          {error && <p className="text-xs text-rose-700 font-medium bg-rose-50 p-2.5 rounded-lg border border-rose-200">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 bg-[#1A1A1A] hover:bg-black text-white font-bold uppercase tracking-widest text-xs rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            id="btn-generate-carousel-ai"
          >
            <Wand2 className="w-4 h-4" />
            Hasilkan Carousel dengan AI
          </button>

          {/* Examples Quick Load */}
          <div className="border-t border-[#E5E2DD] pt-4 mt-2">
            <span className="text-[10px] font-bold text-[#8C8881] uppercase tracking-[0.1em] block mb-2">Belum ada ide? Coba topik populer ini:</span>
            <div className="space-y-1.5 text-xs text-[#1A1A1A]">
              <button
                type="button"
                onClick={() => loadExample('3 Mitos Diet yang Bikin Gagal Total', 'educational', 5)}
                className="w-full text-left p-2 hover:bg-[#F3F1EE] rounded-lg border border-transparent hover:border-[#E5E2DD] transition flex items-center justify-between group"
              >
                <span>🥗 3 Mitos Diet yang Salah Kaprah</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#8C8881] group-hover:text-[#1A1A1A] group-hover:translate-x-0.5 transition" />
              </button>
              <button
                type="button"
                onClick={() => loadExample('Rahasia Menulis Copywriting Persuasif Bagi Pemula', 'marketing', 6)}
                className="w-full text-left p-2 hover:bg-[#F3F1EE] rounded-lg border border-transparent hover:border-[#E5E2DD] transition flex items-center justify-between group"
              >
                <span>✍️ Copywriting Persuasif Untuk Pemula</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#8C8881] group-hover:text-[#1A1A1A] group-hover:translate-x-0.5 transition" />
              </button>
              <button
                type="button"
                onClick={() => loadExample('5 Shortcut VS Code Wajib yang Hemat Waktu Coding', 'tips', 7)}
                className="w-full text-left p-2 hover:bg-[#F3F1EE] rounded-lg border border-transparent hover:border-[#E5E2DD] transition flex items-center justify-between group"
              >
                <span>💻 5 Shortcut VS Code Super Cepat</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#8C8881] group-hover:text-[#1A1A1A] group-hover:translate-x-0.5 transition" />
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-6" id="ai-generating-loader">
          <div className="relative">
            {/* Spinning/pulsing aura */}
            <div className="w-16 h-16 rounded-full border-4 border-[#E5E2DD] border-t-[#1A1A1A] animate-spin" />
            <Sparkles className="w-6 h-6 text-[#1A1A1A] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-[#1A1A1A] text-sm">AI Gemini Sedang Meramu Kontenmu...</h4>
            <p className="text-xs text-[#8C8881]">Membuat {slideCount} slide berkualitas tinggi dengan angle {style === 'marketing' ? 'marketing persuasif' : style === 'educational' ? 'edukasi mendalam' : 'tips praktis'}.</p>
          </div>

          {/* Interactive Marketing Card Carousel Tip while waiting */}
          <div className="p-4 bg-white border border-[#E5E2DD] rounded-xl max-w-xs text-left animate-fade-in relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-100/5 rounded-full blur-xl" />
            <div className="flex gap-2 items-start">
              <HelpCircle className="w-4 h-4 text-[#8C8881] shrink-0 mt-0.5" />
              <div>
                <span className="text-[9px] font-bold text-[#8C8881] uppercase tracking-wider block mb-1">Tips Konten Sosial Media</span>
                <p className="text-xs text-[#1A1A1A] leading-relaxed font-normal">{MARKETING_TIPS[tipIndex]}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
