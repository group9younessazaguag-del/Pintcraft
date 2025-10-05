export type PinSize = 'standard' | 'long';
export type TemplateId = 'classic' | 'split' | 'modern' | 'brush' | 'border' | 'editorial' | 'clean-grid' | 'minimalist-quote' | 'tasty-recipe' | 'trendy-collage' | 'retro-vibes' | 'product-spotlight' | 'infographic' | 'quote-overlay' | 'shop-the-look' | 'before-after';

export interface TemplateData {
  title: string;
  subtitle: string;
  website: string;
  backgroundImage: string | null;
  backgroundImage2: string | null;
  backgroundImage3: string | null;
  templateId: TemplateId;
  pinSize: PinSize;
  description: string;
  keywords: string;
  mediaUrlPrefix: string;
  pinsPerDay: number | string;
  startDate: string;
  imageModel: string;
  textModel: string;
}

export interface CsvRow {
  title: string;
  subtitle: string;
  website: string;
  description: string;
  keywords: string;
}
