import { Brand, TemplatePreset, Carousel, MotionVideo, MotionStyleConfig } from './types';

export const FONT_PAIRINGS = [
  {
    name: 'Modern Sans (Inter & Inter)',
    heading: 'Inter',
    body: 'Inter',
    importUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'
  },
  {
    name: 'Tech Display (Space Grotesk & Inter)',
    heading: 'Space Grotesk',
    body: 'Inter',
    importUrl: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap'
  },
  {
    name: 'Elegant Editorial (Playfair & Inter)',
    heading: 'Playfair Display',
    body: 'Inter',
    importUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Inter:wght@400;500;600&display=swap'
  },
  {
    name: 'Bold Display (Outfit & Fira Code)',
    heading: 'Outfit',
    body: 'Fira Code',
    importUrl: 'https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&family=Fira+Code:wght@400;500&display=swap'
  },
  {
    name: 'Creative Serif (Lora & Space Grotesk)',
    heading: 'Lora',
    body: 'Space Grotesk',
    importUrl: 'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,600;0,700;1,400&family=Space+Grotesk:wght@400;500&display=swap'
  }
];

export const TEMPLATE_PRESETS: TemplatePreset[] = [
  {
    id: 'neobrutalism-punk',
    name: 'Neobrutalism Punk',
    description: 'Desain neobrutalisme ultra kontras tinggi dengan garis tebal & bayangan padat.',
    theme: 'neobrutalism',
    fontHeading: 'Space Grotesk',
    fontBody: 'Fira Code',
    colors: {
      background: '#fef08a', // vibrant yellow-200
      text: '#000000',
      primary: '#ff6b6b', // punchy pink/red
      secondary: '#4d96ff', // neon blue
      accent: '#6bcb77' // neon green
    }
  },
  {
    id: 'clean-minimalist',
    name: 'Clean Minimalist',
    description: 'Bersih, elegan, dan profesional. Sempurna untuk edukasi & infografis.',
    theme: 'clean',
    fontHeading: 'Space Grotesk',
    fontBody: 'Inter',
    colors: {
      background: '#f8fafc', // slate 50
      text: '#0f172a', // slate 900
      primary: '#3b82f6', // blue 500
      secondary: '#64748b', // slate 500
      accent: '#3b82f6'
    }
  },
  {
    id: 'bold-neon',
    name: 'Cyber Neon',
    description: 'Futuristik, kontras tinggi, ideal untuk tech-tips dan konten modern.',
    theme: 'neon',
    fontHeading: 'Outfit',
    fontBody: 'Fira Code',
    colors: {
      background: '#090d16',
      text: '#f8fafc',
      primary: '#10b981', // green 500
      secondary: '#06b6d4', // cyan 500
      accent: '#f59e0b' // amber 500
    }
  },
  {
    id: 'editorial-warm',
    name: 'Editorial Warm',
    description: 'Sentuhan klasik editorial, memberikan kesan kredibel dan mendalam.',
    theme: 'editorial',
    fontHeading: 'Playfair Display',
    fontBody: 'Inter',
    colors: {
      background: '#faf6f0', // warm cream
      text: '#1c1917', // stone 900
      primary: '#991b1b', // red 800 (wine)
      secondary: '#78716c', // stone 500
      accent: '#d97706' // amber 600
    }
  },
  {
    id: 'gradient-dusk',
    name: 'Cosmic Gradient',
    description: 'Gradasi senja yang memikat untuk visual marketing yang mencolok.',
    theme: 'gradient',
    fontHeading: 'Outfit',
    fontBody: 'Inter',
    colors: {
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%)',
      text: '#ffffff',
      primary: '#ec4899', // pink 500
      secondary: '#8b5cf6', // purple 500
      accent: '#f59e0b'
    }
  },
  {
    id: 'minimal-dark',
    name: 'Premium Charcoal',
    description: 'Estetika premium, maskulin, dan profesional dengan latar gelap.',
    theme: 'dark',
    fontHeading: 'Space Grotesk',
    fontBody: 'Inter',
    colors: {
      background: '#121214',
      text: '#e4e4e7', // zinc 200
      primary: '#f4f4f5', // zinc 100
      secondary: '#71717a', // zinc 500
      accent: '#f59e0b'
    }
  },
  {
    id: 'retro-playful',
    name: 'Playful Retro',
    description: 'Warna-warni pop retro yang ramah untuk menggaet audiens muda.',
    theme: 'playful',
    fontHeading: 'Outfit',
    fontBody: 'Space Grotesk',
    colors: {
      background: '#fef3c7', // amber 100
      text: '#1e293b', // slate 800
      primary: '#ea580c', // orange 600
      secondary: '#0d9488', // teal 600
      accent: '#ec4899' // pink 500
    }
  },
  {
    id: 'forest-calm',
    name: 'Forest Calm',
    description: 'Desain natural, estetik, dan organik dengan sentuhan warna sage green & cream lembut.',
    theme: 'sage-forest',
    fontHeading: 'Lora',
    fontBody: 'Space Grotesk',
    colors: {
      background: '#e8ede7', // warm sage background
      text: '#2d3b32', // dark forest green
      primary: '#556b2f', // olive green
      secondary: '#8fbc8f', // light sea green
      accent: '#d2b48c' // tan accent
    }
  },
  {
    id: 'purple-haze',
    name: 'Midnight Vapor',
    description: 'Aura misterius & retro-futuristik dengan paduan warna ungu neon dan biru laut.',
    theme: 'purple-haze',
    fontHeading: 'Outfit',
    fontBody: 'Inter',
    colors: {
      background: '#120d24', // deep purple dark
      text: '#f5f3ff', // electric purple-white
      primary: '#c084fc', // purple 400
      secondary: '#38bdf8', // sky blue 400
      accent: '#f43f5e' // rose 500
    }
  },
  {
    id: 'swiss-modern',
    name: 'Swiss Modernist',
    description: 'Desain minimalis berakar dari gaya internasional (Swiss) yang fungsional & bersih.',
    theme: 'swiss',
    fontHeading: 'Space Grotesk',
    fontBody: 'Inter',
    colors: {
      background: '#ffffff',
      text: '#111111',
      primary: '#e11d48', // rose 600
      secondary: '#4b5563', // gray 600
      accent: '#f59e0b'
    }
  }
];

export const INITIAL_BRANDS: Brand[] = [
  {
    id: 'refaadstack',
    name: 'Refaadstack',
    handle: '@refaadstack',
    website: 'www.refaadstack.com',
    logoUrl: '/brand-assets/refaadstack/logo.png',
    primaryColor: '#f653b8',
    secondaryColor: '#b91e78',
    backgroundColor: '#111412',
    textColor: '#f6f7f4',
    accentColor: '#ff8fd6',
    fontFamily: 'Space Grotesk',
    preferredTemplateId: 'bold-neon',
  },
  {
    id: 'akadnya',
    name: 'Akadnya',
    handle: '@akadnya',
    website: 'www.akadnya.com',
    logoUrl: '/brand-assets/akadnya/logo.svg',
    primaryColor: '#dc2626',
    secondaryColor: '#fbbf24',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    accentColor: '#991b1b',
    fontFamily: 'Playfair Display',
    preferredTemplateId: 'editorial-warm',
  },
  {
    id: 'kasirpro',
    name: 'KasirPro',
    handle: '@kasirpro',
    website: 'kasirpro.refaadstack.com',
    logoUrl: '/brand-assets/kasirpro/logo.svg',
    primaryColor: '#f5a623',
    secondaryColor: '#e89a1f',
    backgroundColor: '#fffbeb',
    textColor: '#0c0c11',
    accentColor: '#f7b845',
    fontFamily: 'Outfit',
    preferredTemplateId: 'clean-minimalist',
  }
];

export const INITIAL_CAROUSEL: Carousel = {
  id: 'carousel-default',
  title: 'Rancangan Baru',
  brandId: 'refaadstack',
  size: 'portrait',
  fontHeading: 'Space Grotesk',
  fontBody: 'Inter',
  theme: 'neobrutalism',
  slides: [
    {
      id: 'slide-1',
      slideType: 'content',
      title: 'Judul Slide Baru',
      subtitle: 'TAMBAHKAN SUBJUDUL MENARIK DI SINI',
      body: ['semudah itu'],
      icon: 'Lightbulb',
      backgroundColorOverride: '#000000',
      textColorOverride: '#ffffff'
    }
  ]
};

// Logical canvas size used for DOM preview, PNG/PDF export and Remotion rendering.
// The layout uses fixed px Tailwind sizes, so everything renders at this base size
// and is then scaled up to the target resolution.
export function getCanvasDimensions(carousel: {
  size: Carousel['size'];
  customWidth?: number;
  customHeight?: number;
}): {
  width: number;
  height: number;
} {
  switch (carousel.size) {
    case "square":
      return { width: 380, height: 380 };
    case "story":
      return { width: 400, height: 711 };
    case "thumbnail":
      return { width: 480, height: 270 };
    case "custom": {
      const w = carousel.customWidth || 1200;
      const h = carousel.customHeight || 1200;
      const aspect = w / h;
      if (aspect >= 1.5) return { width: 480, height: Math.round(480 / aspect) };
      if (aspect >= 1) return { width: 380, height: Math.round(380 / aspect) };
      return { width: Math.round(480 * aspect), height: 480 };
    }
    case "portrait":
    default:
      return { width: 380, height: 475 };
  }
}

// Final video resolution per carousel size.
export function getVideoDimensions(carousel: {
  size: Carousel['size'];
  customWidth?: number;
  customHeight?: number;
}): {
  width: number;
  height: number;
} {
  switch (carousel.size) {
    case "square":
      return { width: 1080, height: 1080 };
    case "story":
      return { width: 1080, height: 1920 };
    case "thumbnail":
      return { width: 1280, height: 720 };
    case "custom":
      return {
        width: carousel.customWidth || 1200,
        height: carousel.customHeight || 1200,
      };
    case "portrait":
    default:
      return { width: 1080, height: 1350 };
  }
}

export const INITIAL_MOTION_VIDEO: MotionVideo = {
  id: 'motion-default',
  title: 'Video Motion Baru',
  brandId: 'brand-personal',
  size: 'story',
  theme: 'gradient',
  fontHeading: 'Space Grotesk',
  fontBody: 'Inter',
  scenes: [
    { id: 'scene-1', text: 'Mulai dari **ide** kecil', subtext: 'Konsistensi mengalahkan kesempurnaan.', icon: 'Lightbulb' },
    { id: 'scene-2', text: 'Naik **level** tiap hari', subtext: 'Satu langkah kecil, tiap hari.', icon: 'TrendingUp' },
    { id: 'scene-3', text: 'Simpan & bagikan', subtext: 'Follow @refaadstack untuk tips lain.', icon: 'Sparkles' },
  ],
  style: motionStyleFromPreset('gradient'),
};

// Build a motion style config from a template preset (used as a starting point,
// every field can then be overridden by the user).
export function motionStyleFromPreset(
  theme: string,
  brand?: Brand,
): MotionStyleConfig {
  const preset =
    TEMPLATE_PRESETS.find((t) => t.theme === theme) || TEMPLATE_PRESETS[0];
  const background = brand?.backgroundColor || preset.colors.background;
  return {
    background,
    textColor: brand?.textColor || preset.colors.text,
    primaryColor: brand?.primaryColor || preset.colors.primary,
    accentColor: brand?.accentColor || preset.colors.accent,
    fontHeading: preset.fontHeading,
    fontBody: preset.fontBody,
    motion: 'mask',
    layout: 'center',
    backgroundStyle: background.startsWith('linear-gradient') ? 'gradient' : 'mesh',
  };
}

// CSS @import rules for a set of Google Font names (known pairings + arbitrary).
export function googleFontCss(fonts: (string | undefined)[]): string {
  const urls = new Set<string>();
  for (const font of fonts) {
    if (!font) continue;
    const pairing = FONT_PAIRINGS.find(
      (p) => p.heading === font || p.body === font,
    );
    if (pairing) {
      urls.add(pairing.importUrl);
    } else {
      const family = encodeURIComponent(font).replace(/%20/g, '+');
      urls.add(
        `https://fonts.googleapis.com/css2?family=${family}:wght@400;500;600;700;800;900&display=swap`,
      );
    }
  }
  return [...urls].map((u) => `@import url('${u}');`).join('\n');
}

// Injection of Google Fonts dynamically
export async function loadGoogleFont(fontName: string) {
  const pairing = FONT_PAIRINGS.find(f => f.heading === fontName || f.body === fontName);
  if (pairing) {
    const linkId = `gfont-${fontName.replace(/\s+/g, '-').toLowerCase()}`;
    if (!document.getElementById(linkId)) {
      try {
        const response = await fetch(pairing.importUrl);
        const css = await response.text();
        const style = document.createElement('style');
        style.id = linkId;
        style.textContent = css;
        document.head.appendChild(style);
      } catch (err) {
        console.error('Failed to load Google Font:', err);
      }
    }
  }
}

