export type TemplateId = `${number}`;

export type PinSize = 'standard' | 'long' | 'extraLong';

export type ImageAspectRatio = '1:1' | '3:4' | '9:16' | '4:5';

export interface TemplateData {
  title: string;
  website: string;
  board?: string;
  subtitle?: string;
  backgroundImage: string | null;
  backgroundImage2: string | null;
  backgroundImage3: string | null;
  templateId: TemplateId;
  pinSize: PinSize;
  imageAspectRatio: ImageAspectRatio;
  description: string;
  keywords: string;
  mediaUrlPrefix: string;
  pinsPerDay: number;
  useRandomPinsPerDay: boolean;
  pinsPerDayMin: number;
  pinsPerDayMax: number;
  startDate: string;
  imageModel: string;
  textModel: string;
}

export interface CsvRow {
  title: string;
  website: string;
  board?: string;
  description: string;
  keywords: string;
  imagePrompt?: string;
}

export type WebsiteProfile = {
  id: string;
  name: string;
  boardList: string;
  categoryList: string;
  isDefault: boolean;
};

export interface AdminSettings {
  analyticsId: string;
  adScript: string;
  aboutPageContent: string;
  contactPageContent: string;
  howToUsePageContent: string;
  privacyPageContent: string;
  termsPageContent: string;
  websiteProfiles: WebsiteProfile[];
  contentPrompt: string;
}

export interface GeneratedContentRow {
    keyword: string;
    title: string;
    description: string;
    board: string;
    image_prompt: string;
    alt_text: string;
    interests: string[];
    category: string;
}

export type PinterestAccount = {
  id: string;
  name: string;
  lastPostDate: string;
  nextPostDate: string;
  notes: string;
  performance: number;
};


export interface BackupData {
  adminSettings: AdminSettings;
  falAiApiKey: string;
  apiframeApiKey: string;
  midapiApiKey: string;
  openRouterApiKey: string; // OpenRouter is now the primary text AI key
  imagineApiKey: string;
  useapiApiKey: string;
  pinterestAccounts: PinterestAccount[];
}

export interface FacebookPost {
  postText: string;
  imagePrompt: string;
  hashtags: string[];
  imageText: string;
}

// New types for Page Builder
export interface FacebookLogoBrief {
  style: string;
  motifs: string[];
  notes: string;
}

export interface FacebookCoverBrief {
  concept: string;
  layout_notes: string;
}

export interface FacebookPublicGroup {
  name: string;
  description: string;
  first_pinned_post: string;
}

export interface FacebookPageLikesAd {
  image_prompt: string;
  primary_text: string;
  headline: string;
  placements: string[];
}

export interface FacebookPageStrategy {
  page_name_ideas: string[];
  page_bio_90chars: string;
  categories: string[];
  logo_brief: FacebookLogoBrief;
  cover_brief: FacebookCoverBrief;
  public_group: FacebookPublicGroup;
  page_likes_ad: FacebookPageLikesAd;
  first_20_post_themes: string[];
}