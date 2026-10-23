import React, { useState } from 'react';
import { Carousel, SavedCarousel, ContentSchedule, Brand } from '../types';
import { 
  Calendar as CalendarIcon, History, Trash2, FolderOpen, Plus, 
  ChevronLeft, ChevronRight, BookOpen, Clock, StickyNote, Sparkles, Check, Pin, PinOff, RefreshCw, Filter 
} from 'lucide-react';

interface PlannerDashboardProps {
  currentCarousel: Carousel;
  history: SavedCarousel[];
  schedules: ContentSchedule[];
  brands: Brand[];
  historyError?: string | null;
  onRefreshHistory: () => Promise<void> | void;
  onSaveCurrentToHistory: () => void;
  onLoadFromHistory: (saved: SavedCarousel) => void;
  onDeleteHistory: (id: string) => void;
  onTogglePin: (id: string, pinned: boolean) => void;
  onSetScheduledDate: (id: string, date: string | null) => void;
  onAddSchedule: (schedule: Omit<ContentSchedule, 'id'>) => void;
  onDeleteSchedule: (id: string) => void;
}

export const PlannerDashboard: React.FC<PlannerDashboardProps> = ({
  currentCarousel,
  history,
  schedules,
  brands,
  historyError,
  onRefreshHistory,
  onSaveCurrentToHistory,
  onLoadFromHistory,
  onDeleteHistory,
  onTogglePin,
  onSetScheduledDate,
  onAddSchedule,
  onDeleteSchedule,
}) => {
  // Calendar month state (defaults to today's date)
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Dialog state for scheduling a new item
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [schedulingCarouselId, setSchedulingCarouselId] = useState<string>('');
  const [scheduleTime, setScheduleTime] = useState('10:00');
  const [scheduleNotes, setScheduleNotes] = useState('');
  const [showScheduleForm, setShowScheduleForm] = useState(false);

  // Selected schedule detail dialog
  const [activeScheduleId, setActiveScheduleId] = useState<string | null>(null);

  // Filter tanggal riwayat (YYYY-MM-DD, '' = semua)
  const [dateFilter, setDateFilter] = useState<string>('');

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month); // 0 = Sunday, 1 = Monday, etc.

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 15));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 15));
  };

  // Helper to format date string YYYY-MM-DD
  const formatDateString = (day: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    if (history.length > 0) {
      setSchedulingCarouselId(history[0].id);
    }
    setScheduleTime('10:00');
    setScheduleNotes('');
    setShowScheduleForm(true);
    setActiveScheduleId(null);
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDay || !schedulingCarouselId) return;

    const selectedHistory = history.find(h => h.id === schedulingCarouselId);
    if (!selectedHistory) return;

    const selectedBrand = brands.find(b => b.id === selectedHistory.carousel.brandId);
    const dateStr = formatDateString(selectedDay);

    onAddSchedule({
      savedCarouselId: schedulingCarouselId,
      carouselTitle: selectedHistory.carousel.title,
      brandName: selectedBrand?.name || 'Personal',
      scheduledDate: dateStr,
      time: scheduleTime,
      notes: scheduleNotes
    });
    onSetScheduledDate(schedulingCarouselId, dateStr); // simpan jadwal ke DB juga

    setShowScheduleForm(false);
    setSelectedDay(null);
  };

  // Group riwayat per tanggal (savedAt, waktu lokal). Server sudah urut pinned DESC, savedAt DESC.
  const dayKey = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const grouped = history.reduce<Record<string, SavedCarousel[]>>((acc, item) => {
    const k = dayKey(item.savedAt);
    (acc[k] ||= []).push(item);
    return acc;
  }, {});
  const allDates = Object.keys(grouped).sort().reverse();
  const visibleDates = dateFilter ? [dateFilter] : allDates;
  const shownCount = visibleDates.reduce((n, d) => n + (grouped[d]?.length ?? 0), 0);

  return (
    <div className="space-y-6 text-black" id="planner-dashboard-container">
      {/* 1. TOP DOCK ACTION PANEL */}
      <div className="p-4 bg-yellow-200 border-[3px] border-black rounded-xl shadow-[4px_4px_0px_#000] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-black uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-red-500 fill-current" />
            Simpan Desain Aktif Ke Riwayat
          </h3>
          <p className="text-xs text-stone-800 font-bold">
            Simpan salinan carousel "{currentCarousel.title}" agar bisa dijadwalkan ke kalender.
          </p>
        </div>
        <button
          onClick={onSaveCurrentToHistory}
          className="w-full sm:w-auto px-5 py-2.5 bg-black text-white hover:bg-[#ff6b6b] hover:text-black text-xs font-black uppercase tracking-wider border-2 border-black rounded-lg transition duration-200 shadow-[3px_3px_0px_#ff6b6b]"
        >
          + Amankan Ke Riwayat
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* 2. LEFT SECTION: CONTENT HISTORY */}
        <div className="xl:col-span-5 bg-white border-[3px] border-black p-4 rounded-xl shadow-[4px_4px_0px_#000] space-y-4">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <h4 className="text-sm font-black uppercase tracking-wider flex items-center gap-1.5 text-black">
              <History className="w-5 h-5 text-[#ff6b6b]" />
              Riwayat Konten ({history.length})
            </h4>
            <button
              onClick={() => onRefreshHistory()}
              aria-label="Muat ulang riwayat dari server"
              title="Muat ulang dari DB"
              data-testid="history-refresh"
              className="p-1 bg-white border-2 border-black rounded-lg hover:bg-stone-50 shadow-[1px_1px_0px_#000] cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {historyError && (
            <div className="p-2 bg-red-100 border-2 border-red-600 rounded-lg text-[10px] font-bold text-red-700" data-testid="history-error">
              {historyError}
            </div>
          )}

          {history.length > 0 && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <label className="flex items-center gap-1.5 text-[10px] font-black uppercase text-stone-600">
                <Filter className="w-3.5 h-3.5" /> Filter Tanggal
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="flex-1 px-2 py-1.5 bg-white border-2 border-black rounded-lg text-[11px] font-bold"
                data-testid="history-date-filter"
              >
                <option value="">Semua tanggal ({history.length})</option>
                {allDates.map(d => (
                  <option key={d} value={d}>{d} ({grouped[d].length})</option>
                ))}
              </select>
            </div>
          )}

          {history.length === 0 ? (
            <div className="p-8 text-center bg-stone-50 border-2 border-dashed border-stone-300 rounded-lg space-y-2">
              <p className="text-xs font-bold text-stone-500">Belum ada konten tersimpan di riwayat.</p>
              <p className="text-[10px] text-stone-400">Klik "Amankan Ke Riwayat" di atas untuk menyimpan rancangan aktif saat ini.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1" data-testid="history-list">
              {shownCount === 0 && (
                <p className="text-[11px] font-bold text-stone-500 text-center py-4">Tidak ada riwayat pada tanggal ini.</p>
              )}
              {visibleDates.map((d) => (
                <div key={d} className="space-y-2">
                  <div className="flex items-center gap-2" data-testid={`history-group-${d}`}>
                    <span className="text-[10px] font-black uppercase bg-black text-white px-2 py-0.5 rounded">
                      {new Date(`${d}T00:00:00`).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <span className="text-[10px] font-bold text-stone-500">{grouped[d].length} item</span>
                    <div className="flex-1 h-[2px] bg-black/10" />
                  </div>
              {grouped[d].map((item) => {
                const b = brands.find(brand => brand.id === item.carousel.brandId);
                const hasSchedules = schedules.filter(s => s.savedCarouselId === item.id);
                const isPinned = !!item.pinned;
                return (
                  <div 
                    key={item.id} 
                    data-testid={`history-item-${item.id}`}
                    className={`p-3 border-2 border-black rounded-lg shadow-[2.5px_2.5px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3.5px_3.5px_0px_#000] transition-all space-y-2 ${isPinned ? 'bg-amber-50' : 'bg-white'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="text-[9px] font-black uppercase bg-yellow-100 border border-black px-1.5 py-0.5 rounded leading-none">
                            {b?.name || 'Personal'}
                          </span>
                          {isPinned && (
                            <span className="text-[9px] font-black uppercase bg-[#ff6b6b] text-black border border-black px-1.5 py-0.5 rounded leading-none flex items-center gap-0.5" data-testid={`pin-badge-${item.id}`}>
                              <Pin className="w-2.5 h-2.5 fill-current" /> DISEMATKAN
                            </span>
                          )}
                          {item.scheduledDate && (
                            <span className="text-[9px] font-black uppercase bg-[#4d96ff] text-black border border-black px-1.5 py-0.5 rounded leading-none flex items-center gap-0.5">
                              <CalendarIcon className="w-2.5 h-2.5" /> {item.scheduledDate}
                            </span>
                          )}
                        </div>
                        <h5 className="font-extrabold text-xs text-black mt-1 line-clamp-1">
                          {item.carousel.title}
                        </h5>
                        <span className="text-[10px] text-stone-500 font-mono block mt-0.5">
                          Tersimpan: {new Date(item.savedAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onTogglePin(item.id, !isPinned)}
                          aria-label={isPinned ? 'Lepas sematan' : 'Sematkan ke atas'}
                          aria-pressed={isPinned}
                          title={isPinned ? 'UNPIN' : 'PIN'}
                          data-testid={`pin-toggle-${item.id}`}
                          className={`p-1.5 border-2 border-black rounded-md text-black transition cursor-pointer shadow-[1px_1px_0px_#000] ${isPinned ? 'bg-[#ff6b6b] hover:bg-red-400' : 'bg-white hover:bg-yellow-200'}`}
                        >
                          {isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => onLoadFromHistory(item)}
                          aria-label="Buka di editor"
                          className="p-1.5 bg-yellow-200 border-2 border-black hover:bg-yellow-300 rounded-md text-black transition cursor-pointer shadow-[1px_1px_0px_#000]"
                          title="Buka di Editor"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Hapus konten ini dari riwayat? Semua jadwal terkait juga akan dibatalkan.')) {
                              onDeleteHistory(item.id);
                            }
                          }}
                          aria-label="Hapus dari riwayat"
                          className="p-1.5 bg-red-400 border-2 border-black hover:bg-red-500 rounded-md text-black transition cursor-pointer shadow-[1px_1px_0px_#000]"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-stone-600 font-bold border-t border-stone-200 pt-1.5 mt-1">
                      <span>{item.carousel.slides.length} Slide • <span className="capitalize">{item.carousel.size}</span></span>
                      {hasSchedules.length > 0 && (
                        <span className="text-green-700 bg-green-50 border border-green-500 px-1 rounded flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Dijadwalkan
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. RIGHT SECTION: CONTENT CALENDAR */}
        <div className="xl:col-span-7 bg-white border-[3px] border-black p-4 rounded-xl shadow-[4px_4px_0px_#000] space-y-4">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <h4 className="text-sm font-black uppercase tracking-wider flex items-center gap-1.5 text-black">
              <CalendarIcon className="w-5 h-5 text-[#4d96ff]" />
              Kalender Konten {monthNames[month]} {year}
            </h4>
            <div className="flex items-center gap-1.5">
              <button
                onClick={prevMonth}
                className="p-1 bg-white border-2 border-black rounded-lg hover:bg-stone-50 transition shadow-[1px_1px_0px_#000]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1 bg-white border-2 border-black rounded-lg hover:bg-stone-50 transition shadow-[1px_1px_0px_#000]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* CALENDAR MONTH GRID */}
          <div className="space-y-1">
            {/* Week Headers */}
            <div className="grid grid-cols-7 text-center font-black text-[11px] text-stone-500 uppercase border-b border-stone-200 pb-1">
              {daysOfWeek.map((day, dIdx) => (
                <div key={dIdx}>{day}</div>
              ))}
            </div>

            {/* Day Cells */}
            <div className="grid grid-cols-7 gap-1.5 pt-1 text-xs">
              {/* Padding empty boxes for previous month days */}
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[55px] bg-stone-50 border border-transparent rounded-lg opacity-40" />
              ))}

              {/* Month Day Cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = formatDateString(dayNum);
                const daySchedules = schedules.filter(s => s.scheduledDate === dateStr);
                const isToday = dayNum === today.getDate() && month === today.getMonth() && year === today.getFullYear();

                return (
                  <div
                    key={`day-${dayNum}`}
                    onClick={() => handleDayClick(dayNum)}
                    className={`min-h-[60px] p-1 border-2 border-black rounded-lg flex flex-col justify-between transition cursor-pointer hover:bg-yellow-100/50 ${
                      isToday ? 'bg-amber-100 border-dashed border-red-500' : 'bg-stone-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`font-black text-[10px] leading-none px-1 rounded ${isToday ? 'bg-red-500 text-white font-black' : ''}`}>
                        {dayNum}
                      </span>
                    </div>

                    <div className="space-y-1 mt-1">
                      {daySchedules.map((sch) => (
                        <div
                          key={sch.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveScheduleId(sch.id);
                          }}
                          className="px-1 py-0.5 rounded border border-black bg-yellow-200 hover:bg-yellow-300 text-[9px] font-bold truncate leading-none text-black flex items-center justify-between shadow-[1px_1px_0px_#000]"
                          title={`${sch.carouselTitle} (${sch.time})`}
                        >
                          <span className="truncate">{sch.carouselTitle}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-[10px] text-stone-500 font-bold italic text-center">
            💡 Tips: Klik sel tanggal di atas untuk membuat jadwal postingan baru langsung dari riwayat konten Anda!
          </p>
        </div>
      </div>

      {/* 4. MODAL: CREATE SCHEDULE DIALOG */}
      {showScheduleForm && selectedDay && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form 
            onSubmit={handleSaveSchedule}
            className="w-full max-w-md bg-yellow-50 border-[4px] border-black p-5 rounded-none shadow-[6px_6px_0px_#000] space-y-4 animate-fade-in"
          >
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <h4 className="font-black uppercase text-sm tracking-wider flex items-center gap-1.5 text-black">
                <CalendarIcon className="w-5 h-5 text-red-500" />
                Jadwalkan Posting - {selectedDay} {monthNames[month]} {year}
              </h4>
              <button 
                type="button" 
                onClick={() => setShowScheduleForm(false)}
                className="text-black font-black text-xs hover:underline uppercase"
              >
                [ Tutup ]
              </button>
            </div>

            {history.length === 0 ? (
              <div className="p-4 bg-white border-2 border-black text-center text-xs font-bold text-red-500">
                Peringatan: Anda belum memiliki konten di riwayat. Silakan simpan konten aktif Anda terlebih dahulu sebelum menjadwalkannya.
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] font-black uppercase mb-1">Pilih Konten dari Riwayat</label>
                  <select
                    value={schedulingCarouselId}
                    onChange={(e) => setSchedulingCarouselId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border-2 border-black rounded-lg text-black font-bold focus:outline-none"
                    required
                  >
                    {history.map(item => (
                      <option key={item.id} value={item.id}>{item.carousel.title}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase mb-1">Jam Posting</label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border-2 border-black rounded-lg text-black font-mono font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase mb-1">Status Saluran</label>
                    <input
                      type="text"
                      className="w-full px-3 py-1.5 bg-stone-100 border-2 border-black rounded-lg text-stone-500 font-bold"
                      value="Instagram Feed"
                      disabled
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase mb-1">Catatan Tambahan (Opsional)</label>
                  <textarea
                    value={scheduleNotes}
                    onChange={(e) => setScheduleNotes(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border-2 border-black rounded-lg text-black font-medium focus:outline-none"
                    rows={2}
                    placeholder="Contoh: Gunakan hashtag #Branding #Edukatif, siapkan story countdown."
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-green-400 text-black font-black uppercase text-[10px] tracking-wider border-2 border-black hover:bg-green-500 shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px]"
                  >
                    ✓ Simpan Jadwal
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowScheduleForm(false)}
                    className="px-4 py-2 bg-white text-black font-black uppercase text-[10px] border-2 border-black hover:bg-stone-100 shadow-[2px_2px_0px_#000]"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      {/* 5. MODAL: DETAILED SCHEDULE VIEWER */}
      {activeScheduleId && (
        (() => {
          const sch = schedules.find(s => s.id === activeScheduleId);
          if (!sch) return null;
          return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="w-full max-w-sm bg-yellow-50 border-[4px] border-black p-5 rounded-none shadow-[6px_6px_0px_#000] space-y-4 animate-fade-in">
                <div className="flex items-center justify-between border-b-2 border-black pb-2">
                  <h4 className="font-black uppercase text-xs tracking-wider flex items-center gap-1 text-black">
                    <Clock className="w-4 h-4 text-[#ff6b6b]" />
                    Detail Penjadwalan
                  </h4>
                  <button 
                    onClick={() => setActiveScheduleId(null)}
                    className="text-black font-black text-xs hover:underline uppercase"
                  >
                    [ Tutup ]
                  </button>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-[10px] text-stone-500 font-bold uppercase block">Judul Konten</span>
                    <span className="font-black text-black text-sm">{sch.carouselTitle}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-stone-500 font-bold uppercase block">Tanggal</span>
                      <span className="font-extrabold text-black font-mono">{sch.scheduledDate}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-500 font-bold uppercase block">Waktu Posting</span>
                      <span className="font-extrabold text-black font-mono">{sch.time || '—'}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-stone-500 font-bold uppercase block">Brand</span>
                    <span className="font-extrabold text-black">{sch.brandName}</span>
                  </div>

                  {sch.notes && (
                    <div className="p-2 bg-white border border-black rounded-lg">
                      <span className="text-[9px] text-stone-500 font-bold uppercase block mb-0.5">
                        <StickyNote className="w-3 h-3 inline-block mr-1" /> Catatan
                      </span>
                      <p className="text-[11px] font-medium text-stone-800 leading-relaxed">{sch.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t border-black">
                    <button
                      onClick={() => {
                        onDeleteSchedule(sch.id);
                        setActiveScheduleId(null);
                      }}
                      className="w-full py-2 bg-red-400 hover:bg-red-500 text-black border-2 border-black font-black uppercase text-[10px] tracking-wider shadow-[2px_2px_0px_#000]"
                    >
                      Batalkan Jadwal Posting
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()
      )}
    </div>
  );
};
