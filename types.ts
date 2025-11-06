export type TemplateId = `${number}`;

export type PinSize = 'standard' | 'long';

export type ImageAspectRatio = '1:1' | '3:4' | '9:16';

export interface TemplateData {
  title: string;
  subtitle: string;
  website: string;
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
    board: string;
    imagePrompt: string;
    description: string;
    altText: string;
    interests: string;
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
  googleAiApiKey: string;
  falAiApiKey: string;
  apiframeApiKey: string;
  midapiApiKey: string;
  pinterestAccounts: PinterestAccount[];
}