
export type PinSize = 'standard' | 'long';
export type TemplateId = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12' | '13' | '14' | '15' | '16' | '17' | '18' | '19' | '20' | '21' | '22' | '23' | '24' | '25' | '26' | '27' | '28' | '29' | '30' | '31';

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

export interface AdminSettings {
  analyticsId: string;
  adScript: string;
  aboutPageContent: string;
  contactPageContent: string;
  howToUsePageContent: string;
  privacyPageContent: string;
  termsPageContent: string;
  boardList: string;
  categoryList: string;
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
