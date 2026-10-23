import React, { useState, useEffect } from 'react';
import { Brand } from '../types';
import { Plus, Trash2, Edit2, Check, Palette, Sparkles, Radio, Upload, X, Image } from 'lucide-react';
import { TEMPLATE_PRESETS } from '../utils';

interface BrandManagerProps {
  brands: Brand[];
  activeBrandId: string;
  onSelectBrand: (id: string) => void;
  onSaveBrand: (brand: Brand) => void;
  onDeleteBrand: (id: string) => void;
  onEditingBrandChange?: (brand: Brand | null) => void;
}

const PRESET_BRAND_PALETTES = [
  { name: 'Ocean Blue', primary: '#2563eb', secondary: '#06b6d4', bg: '#ffffff', text: '#0f172a', accent: '#f59e0b' },
  { name: 'Emerald Tech', primary: '#10b981', secondary: '#047857', bg: '#090d16', text: '#f8fafc', accent: '#ec4899' },
  { name: 'Sunset Orange', primary: '#ea580c', secondary: '#f59e0b', bg: '#fffbeb', text: '#1e293b', accent: '#3b82f6' },
  { name: 'Royal Purple', primary: '#8b5cf6', secondary: '#ec4899', bg: '#faf5ff', text: '#1e1b4b', accent: '#eab308' },
  { name: 'Modern Charcoal', primary: '#1e293b', secondary: '#64748b', bg: '#f8fafc', text: '#0f172a', accent: '#3b82f6' },
  { name: 'Sakura Pastel', primary: '#ec4899', secondary: '#fda4af', bg: '#fff1f2', text: '#4c0519', accent: '#14b8a6' },
];

export const BrandManager: React.FC<BrandManagerProps> = ({
  brands,
  activeBrandId,
  onSelectBrand,
  onSaveBrand,
  onDeleteBrand,
  onEditingBrandChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  useEffect(() => {
    if (onEditingBrandChange) {
      onEditingBrandChange(editingBrand);
    }
  }, [editingBrand, onEditingBrandChange]);

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran file maksimal adalah 2MB!');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && editingBrand) {
          setEditingBrand({
            ...editingBrand,
            logoUrl: event.target.result as string
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearLogo = () => {
    if (editingBrand) {
      setEditingBrand({
        ...editingBrand,
        logoUrl: undefined
      });
    }
  };

  const startCreateNew = () => {
    const newBrand: Brand = {
      id: `brand-${Date.now()}`,
      name: 'Brand Baru',
      handle: '@brand_baru',
      website: 'www.brandbaru.com',
      primaryColor: '#3b82f6',
      secondaryColor: '#10b981',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      accentColor: '#f59e0b',
      fontFamily: 'Inter',
      preferredTemplateId: 'neobrutalism-punk', // default to our neobrutalism preset!
    };
    setEditingBrand(newBrand);
    setIsEditing(true);
  };

  const startEdit = (brand: Brand, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectBrand(brand.id);
    setEditingBrand({ ...brand });
    setIsEditing(true);
  };

  const handleApplyPalette = (palette: typeof PRESET_BRAND_PALETTES[0]) => {
    if (!editingBrand) return;
    setEditingBrand({
      ...editingBrand,
      primaryColor: palette.primary,
      secondaryColor: palette.secondary,
      backgroundColor: palette.bg,
      textColor: palette.text,
      accentColor: palette.accent,
    });
  };

  const handleSave = () => {
    if (editingBrand) {
      if (!editingBrand.name.trim()) return alert('Nama brand tidak boleh kosong!');
      if (!editingBrand.handle.trim()) {
        editingBrand.handle = '@' + editingBrand.name.toLowerCase().replace(/\s+/g, '');
      } else if (!editingBrand.handle.startsWith('@')) {
        editingBrand.handle = '@' + editingBrand.handle;
      }
      onSaveBrand(editingBrand);
      setIsEditing(false);
      setEditingBrand(null);
    }
  };

  return (
    <div className="space-y-6" id="brand-manager-container">
      {!isEditing ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-black uppercase tracking-wider flex items-center gap-2">
                <Radio className="w-5 h-5 text-[#ff6b6b]" />
                Pilih Profil Brand
              </h3>
              <p className="text-xs text-stone-700 font-medium">Ganti identitas & simpan template per brand</p>
            </div>
            <button
              onClick={startCreateNew}
              className="px-4 py-2 bg-[#ff6b6b] text-black text-xs font-black uppercase tracking-wider border-[3px] border-black rounded-lg transition duration-200 flex items-center gap-1.5 cursor-pointer shadow-[3px_3px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000]"
              title="Tambah Brand Baru"
              id="btn-add-brand"
            >
              <Plus className="w-4 h-4" />
              Brand Baru
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 max-h-[350px] overflow-y-auto pr-1">
            {brands.map((brand) => {
              const isActive = brand.id === activeBrandId;
              const preferredTemplate = TEMPLATE_PRESETS.find(p => p.id === brand.preferredTemplateId);

              return (
                <div
                  key={brand.id}
                  onClick={() => onSelectBrand(brand.id)}
                  className={`p-4 rounded-xl border-[3px] border-black transition-all duration-200 cursor-pointer flex items-center justify-between ${
                    isActive
                      ? 'bg-yellow-200 shadow-[4px_4px_0px_#000]'
                      : 'bg-white hover:bg-stone-50 shadow-[2px_2px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#000]'
                  }`}
                  id={`brand-card-${brand.id}`}
                >
                  <div className="flex items-center gap-3">
                    {/* Circle Avatar with brand colors or logo */}
                    <div
                      className="w-11 h-11 rounded-full border-[3px] border-black flex items-center justify-center font-black text-sm relative overflow-hidden shrink-0 shadow-[2px_2px_0px_#000]"
                      style={{ backgroundColor: brand.backgroundColor, color: brand.textColor }}
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
                      {/* Accent Dot */}
                      <div
                        className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-black"
                        style={{ backgroundColor: brand.primaryColor }}
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-black text-sm leading-none">{brand.name}</span>
                        {isActive && (
                          <span className="px-2 py-0.5 bg-black text-white text-[9px] font-black uppercase tracking-wider rounded border border-black shadow-[1px_1px_0px_rgba(255,255,255,0.4)]">
                            AKTIF
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono font-bold text-stone-600 block mt-1">{brand.handle}</span>
                      
                      {/* Default template indicator */}
                      {brand.preferredTemplateId && (
                        <span className="inline-flex items-center gap-1.5 mt-2 text-[9px] font-black text-black bg-white border-2 border-black px-2.5 py-0.5 rounded-full shadow-[1.5px_1.5px_0px_#000] uppercase tracking-wider">
                          <Palette className="w-3 h-3 text-black shrink-0" />
                          <span>Template: <span className="underline font-black">{preferredTemplate?.name || brand.preferredTemplateId}</span></span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Tiny Color Swatches */}
                    <div className="hidden sm:flex items-center gap-1 mr-2 bg-black border-2 border-black px-2 py-1.5 rounded-full shadow-[1.5px_1.5px_0px_#000]">
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-white"
                        style={{ backgroundColor: brand.primaryColor }}
                        title="Primary"
                      />
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-white"
                        style={{ backgroundColor: brand.secondaryColor }}
                        title="Secondary"
                      />
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-white"
                        style={{ backgroundColor: brand.backgroundColor }}
                        title="Background"
                      />
                    </div>

                    <button
                      onClick={(e) => startEdit(brand, e)}
                      className="p-1.5 bg-white border-2 border-black rounded-lg text-black hover:bg-yellow-100 transition shadow-[1px_1px_0px_#000] cursor-pointer"
                      title="Edit Brand"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {brands.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Hapus brand "${brand.name}"?`)) {
                            onDeleteBrand(brand.id);
                          }
                        }}
                        className="p-1.5 bg-red-400 border-2 border-black rounded-lg text-black hover:bg-red-500 transition shadow-[1px_1px_0px_#000] cursor-pointer"
                        title="Hapus Brand"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-5 bg-yellow-50 rounded-xl border-[3px] border-black space-y-4 shadow-[4px_4px_0px_#000] animate-fade-in">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <h4 className="font-black text-black text-sm uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-[#ff6b6b]" />
              {editingBrand?.name === 'Brand Baru' ? 'Buat Profil Brand Baru' : 'Edit Profil Brand'}
            </h4>
            <span className="text-[10px] text-black font-mono font-bold bg-white border border-black px-1.5 py-0.5 rounded">ID: {editingBrand?.id.substring(0, 8)}</span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] font-black text-black uppercase tracking-wider mb-1">Nama Brand</label>
              <input
                type="text"
                value={editingBrand?.name || ''}
                onChange={(e) => setEditingBrand({ ...editingBrand!, name: e.target.value })}
                className="w-full px-3 py-2 bg-white border-[3px] border-black rounded-lg text-black font-extrabold focus:outline-none focus:bg-yellow-100/50 transition shadow-[2px_2px_0px_#000]"
                placeholder="Contoh: Belajar Coding ID"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-black uppercase tracking-wider mb-1">Username / Handle Sosial Media</label>
              <input
                type="text"
                value={editingBrand?.handle || ''}
                onChange={(e) => setEditingBrand({ ...editingBrand!, handle: e.target.value })}
                className="w-full px-3 py-2 bg-white border-[3px] border-black rounded-lg text-black font-mono font-bold focus:outline-none focus:bg-yellow-100/50 transition shadow-[2px_2px_0px_#000]"
                placeholder="Contoh: @belajarcoding.id"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-black uppercase tracking-wider mb-1">Website URL Brand</label>
              <input
                type="text"
                value={editingBrand?.website || ''}
                onChange={(e) => setEditingBrand({ ...editingBrand!, website: e.target.value })}
                className="w-full px-3 py-2 bg-white border-[3px] border-black rounded-lg text-black font-mono font-bold focus:outline-none focus:bg-yellow-100/50 transition shadow-[2px_2px_0px_#000]"
                placeholder="Contoh: www.belajarcoding.com"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-black uppercase tracking-wider mb-1 flex items-center gap-1">
                <Image className="w-3.5 h-3.5 text-blue-600" />
                Logo / Foto Profil Brand
              </label>
              <div className="flex gap-4 items-center bg-white border-[3px] border-black rounded-lg p-3 shadow-[2px_2px_0px_#000]">
                {/* Logo Preview */}
                <div 
                  className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center font-black text-xs relative overflow-hidden shrink-0 bg-stone-100"
                  style={{ 
                    backgroundColor: editingBrand?.backgroundColor || '#ffffff', 
                    color: editingBrand?.textColor || '#000000' 
                  }}
                >
                  {editingBrand?.logoUrl ? (
                    <img 
                      src={editingBrand.logoUrl} 
                      className="w-full h-full object-cover" 
                      alt="Logo Preview" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    editingBrand?.name ? editingBrand.name.substring(0, 2).toUpperCase() : 'BG'
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  {/* File Upload Button */}
                  <div>
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#ff6b6b]/20 hover:bg-[#ff6b6b]/35 border-2 border-black text-black text-[10px] font-black uppercase tracking-wider rounded-md cursor-pointer transition">
                      <Upload className="w-3.5 h-3.5" />
                      Unggah Foto (PNG/JPG)
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleLogoFileChange}
                        className="hidden" 
                      />
                    </label>
                  </div>

                  {/* Text URL Input */}
                  <div>
                    <span className="block text-[8px] font-bold text-stone-500 uppercase mb-0.5">Atau masukkan URL gambar:</span>
                    <input
                      type="text"
                      value={editingBrand?.logoUrl || ''}
                      onChange={(e) => setEditingBrand({ ...editingBrand!, logoUrl: e.target.value || undefined })}
                      className="w-full px-2.5 py-1 bg-white border border-black rounded text-[10px] font-medium text-black focus:outline-none"
                      placeholder="https://example.com/logo.png"
                    />
                  </div>

                  {/* Reset/Remove Logo button */}
                  {editingBrand?.logoUrl && (
                    <button
                      type="button"
                      onClick={handleClearLogo}
                      className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-800 text-[9px] font-bold uppercase tracking-wider"
                    >
                      <X className="w-3 h-3" /> Hapus Logo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Default template preset configuration */}
            <div>
              <label className="block text-[10px] font-black text-black uppercase tracking-wider mb-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                Template Preset Default (Auto-Apply)
              </label>
              <p className="text-[10px] text-stone-600 mb-2 font-medium leading-normal">
                Saat brand ini dipilih, template ini akan langsung terpasang otomatis untuk generator konten baru.
              </p>
              <select
                value={editingBrand?.preferredTemplateId || ''}
                onChange={(e) => setEditingBrand({ ...editingBrand!, preferredTemplateId: e.target.value || undefined })}
                className="w-full px-3 py-2 bg-white border-[3px] border-black rounded-lg text-black font-bold focus:outline-none focus:bg-yellow-100/50 transition shadow-[2px_2px_0px_#000]"
              >
                <option value="">Tidak ada (Tetap gunakan template aktif saat ini)</option>
                {TEMPLATE_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name} ({preset.theme})
                  </option>
                ))}
              </select>
            </div>

            {/* Predefined Palette Presets */}
            <div>
              <label className="block text-[10px] font-black text-black uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-yellow-600" />
                Gunakan Preset Palet Warna Cepat
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_BRAND_PALETTES.map((palette) => (
                  <button
                    key={palette.name}
                    type="button"
                    onClick={() => handleApplyPalette(palette)}
                    className="flex items-center justify-between px-2.5 py-1.5 bg-white border-2 border-black hover:bg-stone-50 rounded-lg text-[10px] text-black transition text-left cursor-pointer shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000]"
                  >
                    <span className="font-black">{palette.name}</span>
                    <div className="flex items-center gap-0.5">
                      <span className="w-2.5 h-2.5 rounded-full border border-black" style={{ backgroundColor: palette.primary }} />
                      <span className="w-2.5 h-2.5 rounded-full border border-black" style={{ backgroundColor: palette.secondary }} />
                      <span className="w-2.5 h-2.5 rounded-full border border-black" style={{ backgroundColor: palette.bg }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Color Pickers */}
            <div className="border-t-2 border-black pt-4 mt-4">
              <span className="block text-[10px] font-black text-black uppercase tracking-wider mb-2">Sesuaikan Warna Manual</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-stone-700 mb-1">Warna Utama (Primary)</label>
                  <div className="flex gap-1.5 items-center">
                    <input
                      type="color"
                      value={editingBrand?.primaryColor || '#000000'}
                      onChange={(e) => setEditingBrand({ ...editingBrand!, primaryColor: e.target.value })}
                      className="w-8 h-8 border-2 border-black rounded cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={editingBrand?.primaryColor || ''}
                      onChange={(e) => setEditingBrand({ ...editingBrand!, primaryColor: e.target.value })}
                      className="w-full px-2 py-1 bg-white border-2 border-black rounded text-center text-[11px] font-mono font-bold text-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-700 mb-1">Warna Sekunder</label>
                  <div className="flex gap-1.5 items-center">
                    <input
                      type="color"
                      value={editingBrand?.secondaryColor || '#000000'}
                      onChange={(e) => setEditingBrand({ ...editingBrand!, secondaryColor: e.target.value })}
                      className="w-8 h-8 border-2 border-black rounded cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={editingBrand?.secondaryColor || ''}
                      onChange={(e) => setEditingBrand({ ...editingBrand!, secondaryColor: e.target.value })}
                      className="w-full px-2 py-1 bg-white border-2 border-black rounded text-center text-[11px] font-mono font-bold text-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-700 mb-1">Latar Belakang (BG)</label>
                  <div className="flex gap-1.5 items-center">
                    <input
                      type="color"
                      value={editingBrand?.backgroundColor || '#000000'}
                      onChange={(e) => setEditingBrand({ ...editingBrand!, backgroundColor: e.target.value })}
                      className="w-8 h-8 border-2 border-black rounded cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={editingBrand?.backgroundColor || ''}
                      onChange={(e) => setEditingBrand({ ...editingBrand!, backgroundColor: e.target.value })}
                      className="w-full px-2 py-1 bg-white border-2 border-black rounded text-center text-[11px] font-mono font-bold text-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-700 mb-1">Warna Teks Utama</label>
                  <div className="flex gap-1.5 items-center">
                    <input
                      type="color"
                      value={editingBrand?.textColor || '#000000'}
                      onChange={(e) => setEditingBrand({ ...editingBrand!, textColor: e.target.value })}
                      className="w-8 h-8 border-2 border-black rounded cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={editingBrand?.textColor || ''}
                      onChange={(e) => setEditingBrand({ ...editingBrand!, textColor: e.target.value })}
                      className="w-full px-2 py-1 bg-white border-2 border-black rounded text-center text-[11px] font-mono font-bold text-black"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Typography default */}
            <div>
              <label className="block text-[10px] font-black text-black uppercase tracking-wider mb-1">Gaya Font Default</label>
              <select
                value={editingBrand?.fontFamily || 'Inter'}
                onChange={(e) => setEditingBrand({ ...editingBrand!, fontFamily: e.target.value })}
                className="w-full px-3 py-2 bg-white border-[3px] border-black rounded-lg text-black font-bold focus:outline-none focus:bg-yellow-100/50 transition shadow-[2px_2px_0px_#000]"
              >
                <option value="Inter">Inter (Clean Modern)</option>
                <option value="Space Grotesk">Space Grotesk (Tech Modern)</option>
                <option value="Playfair Display">Playfair Display (Elegant Serif)</option>
                <option value="Outfit">Outfit (Bold Geometric)</option>
                <option value="Lora">Lora (Editorial Warm)</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t-2 border-black text-xs">
            <button
              onClick={handleSave}
              className="flex-1 py-2.5 bg-[#6bcb77] hover:bg-green-500 text-black font-black uppercase tracking-wider text-[11px] border-[3px] border-black rounded-lg transition duration-150 flex items-center justify-center gap-1 cursor-pointer shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000]"
              id="btn-save-brand-edit"
            >
              <Check className="w-4 h-4" />
              Simpan Profil
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditingBrand(null);
              }}
              className="px-5 py-2.5 bg-white hover:bg-stone-100 text-black border-[3px] border-black font-black uppercase tracking-wider text-[11px] rounded-lg transition duration-150 cursor-pointer shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000]"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
