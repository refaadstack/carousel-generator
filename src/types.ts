export interface Brand {
  id: string;
  name: string;
  handle: string;
  website?: string; // e.g. www.brandkamu.com
  logoUrl?: string; // base64 or standard url
  primaryColor: string; // e.g. #3b82f6
  secondaryColor: string; // e.g. #10b981
  backgroundColor: string; // e.g. #ffffff
  textColor: string; // e.g. #1f2937
  accentColor: string; // e.g. #f59e0b
  fontFamily: string; // e.g. Inter, Space Grotesk, Playfair Display
  preferredTemplateId?: string; // Auto template preset selection on select
}

export type SlideType = 'intro' | 'content' | 'quote' | 'call_to_action' | 'list' | 'conclusion' | 'comparison' | 'thumbnail' | 'qna';

export interface Slide {
  id: string;
  title: string;
  subtitle?: string;
  body: string[]; // paragraph or bullet points
  icon?: string; // lucide icon name
  slideType: SlideType;
  backgroundColorOverride?: string;
  textColorOverride?: string;
  ctaText?: string;
  badgeText?: string; // Additional highlighted sticker badge
  badgeColor?: string; // Custom background color for badge
  textAlignment?: 'left' | 'center' | 'right';
  headingSizeOverride?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  hideProfileWatermark?: boolean; // toggle to hide profile header/footer on a per-slide basis
  watermarkPosition?: 'top' | 'bottom' | 'both' | 'none'; // where to place the watermark/profile brand logo
  watermarkType?: 'social' | 'website' | 'both'; // whether to show brand handle (social), brand website (website), or both inside watermark
  ctaType?: 'social' | 'website'; // 'social' for like/comment/share/save grids, 'website' for button links
  ctaButtonText?: string; // Text for the website call-to-action button
  ctaUrl?: string; // URL link or CTA target action
  showTitleIcon?: boolean; // whether to show icon above the main title
  titleIcon?: string; // customizable icon above title (defaults to Sparkles or Globe for website CTA)
  // Custom layout specific fields
  comparisonLeftTitle?: string;
  comparisonLeftItems?: string[];
  comparisonRightTitle?: string;
  comparisonRightItems?: string[];
  qnaQuestion?: string;
  qnaAnswer?: string;
  qnaUserHandle?: string;
  // Image properties
  imageUrl?: string;
  imagePosition?: 'top' | 'bottom' | 'background' | 'left' | 'right';
  imageStyle?: 'square' | 'rounded' | 'circle' | 'neobrutalist';
  showImage?: boolean;
  imagePrompt?: string;
  // Overrides for Subtitle/Badge, Title, and Body/Content
  subtitleFontOverride?: string;
  subtitleBgColorOverride?: string;
  subtitleTextColorOverride?: string;
  subtitleRotationOverride?: number; // e.g. 0, 1, -1, 2, -2, 6, -6, 12, -12
  subtitleStyleOverride?: 'badge' | 'clean-badge' | 'border' | 'plain';
  subtitleSizeOverride?: string; // e.g. 'text-[9px]', 'text-xs', etc.
  titleFontOverride?: string;
  titleColorOverride?: string;
  titleStyleOverride?: 'uppercase' | 'capitalize' | 'lowercase' | 'none';
  bodyFontOverride?: string;
  bodyColorOverride?: string;
  bodySizeOverride?: string; // e.g. 'text-[10px]', 'text-xs', 'text-sm'
}

export type CarouselSize = 'story' | 'portrait' | 'square' | 'thumbnail' | 'custom';

export interface Carousel {
  id: string;
  title: string;
  brandId: string;
  size: CarouselSize;
  customWidth?: number; // for custom dimensions
  customHeight?: number; // for custom dimensions
  fontHeading: string;
  fontBody: string;
  slides: Slide[];
  theme: string; // 'clean' | 'bold' | 'editorial' | 'minimal' | 'dark' | 'gradient' | 'neon' | 'playful'
  colorMode?: 'brand' | 'preset';
}

export interface SavedCarousel {
  id: string;
  carousel: Carousel;
  savedAt: string; // ISO string
  title?: string; // kolom DB (server-sorted)
  pinned?: number; // 0/1 dari DB
  scheduledDate?: string | null; // YYYY-MM-DD
}

export interface ContentSchedule {
  id: string;
  savedCarouselId: string; // references SavedCarousel
  carouselTitle: string;
  brandName: string;
  scheduledDate: string; // YYYY-MM-DD
  time?: string; // e.g. "09:00"
  notes?: string;
}

export interface TemplatePreset {  id: string;
  name: string;
  description: string;
  theme: string;
  fontHeading: string;
  fontBody: string;
  colors: {
    background: string;
    text: string;
    primary: string;
    secondary: string;
    accent: string;
  };
}

export interface GenerationRequest {
  topic: string;
  style: 'educational' | 'marketing' | 'tips';
  brandName?: string;
  brandHandle?: string;
  slideCount: number;
}

// ---------- Motion video (kinetic typography / reels) ----------

export type MotionKind = 'mask' | 'typewriter' | 'pop' | 'zoom' | 'slide' | 'blur';
export type MotionLayout = 'center' | 'big' | 'left' | 'list';
export type MotionBackground = 'solid' | 'gradient' | 'mesh' | 'grid' | 'image';

export interface MotionStyleConfig {
  background: string; // solid color OR CSS gradient
  textColor: string;
  primaryColor: string;
  accentColor: string;
  fontHeading: string;
  fontBody: string;
  motion: MotionKind;
  layout: MotionLayout;
  backgroundStyle: MotionBackground;
  backgroundImage?: string;
  customCss?: string; // advanced escape hatch (CSS only, no JS)
}

export interface MotionScene {
  id: string;
  text: string; // headline, max ~7 words, supports **bold** / {pill}; "\n" = new line
  subtext?: string; // supporting line, max ~12 words
  icon?: string; // lucide icon name
  layout?: MotionLayout; // per-scene override
  motion?: MotionKind; // per-scene override
}

export interface MotionVideo {
  id: string;
  title: string;
  brandId: string;
  size: CarouselSize;
  theme: string;
  fontHeading: string;
  fontBody: string;
  scenes: MotionScene[];
  style?: MotionStyleConfig;
}

export interface MotionVideoRequest {
  topic: string;
  style: 'educational' | 'marketing' | 'tips';
  sceneCount: number;
  brandName?: string;
  brandHandle?: string;
}

