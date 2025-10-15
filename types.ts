// types.ts

export type PinSize = 'standard' | 'tall';
export type TemplateId = string; // e.g., '1', '2', ... '31'

export interface TemplateData {
  // Unique ID for each pin row, not part of the template itself
  id: string; 

  // Core content
  title: string;
  subtitle: string;
  website: string;

  // Image URLs
  backgroundImage: string | null;
  backgroundImage2: string | null;
  backgroundImage3: string | null;

  // Design settings
  templateId: TemplateId;
  pinSize: PinSize;

  // Bulk generation fields
  boardName?: string;
  publishDate?: string;
  keywords?: string;
}

export interface AdminSettings {
  analyticsId: string;
  adScript: string;
}

// User state, for potential premium features
export interface UserState {
  isPro: boolean;
  generationsLeft: number;
  lastGenerationDate: string | null; // ISO date string
}

export const MAX_FREE_GENERATIONS = 10;
