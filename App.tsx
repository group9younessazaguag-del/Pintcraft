
import React, { useCallback, useRef, useEffect, useState } from 'react';
import type { TemplateData, CsvRow, AdminSettings, BackupData, PinterestAccount } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import AboutPage from './components/pages/AboutPage';
import PrivacyPolicyPage from './components/pages/PrivacyPolicyPage';
import TermsOfServicePage from './components/pages/TermsOfServicePage';
import AdminPage from './components/pages/AdminPage';
import AdBanner from './components/AdBanner';
import { generateImage, generatePlaceholderImage, generateDescription, generatePlaceholderDescription, generateKeywords, generatePlaceholderKeywords, generateShortTitle, DEFAULT_CONTENT_PROMPT, generateImageWithMidjourney, generateSafeImagePrompt, generateImageWithMidApiAi, generateImageWithImagineApi, generateImageWithUseApi } from './services/ai';
import useLocalStorage from './hooks/useLocalStorage';
import { useAnalytics } from './hooks/useAnalytics';
import GeneratorInterface from './components/GeneratorInterface';
import HowToUsePage from './components/pages/HowToUsePage';
import ContactPage from './components/pages/ContactPage';
import ContentGeneratorPage from './components/pages/ContentGeneratorPage';
import AssistantPage from './components/pages/AssistantPage';
import HomePage from './components/pages/HomePage';
import DNRaterPage from './components/pages/DNRaterPage';
import AuthorPage from './components/pages/AuthorPage';
import { FacebookPostGeneratorPage } from './components/pages/FacebookPostGeneratorPage';
import { QuoteGeneratorPage } from './components/pages/QuoteGeneratorPage';
import DescriptionRewritePage from './components/pages/DescriptionRewritePage';
import { FacebookPageBuilderPage } from './components/pages/FacebookPageBuilderPage';

declare global {
  interface Window {
    htmlToImage: {
      toPng: (element: HTMLElement, options?: object) => Promise<string>;
      toBlob: (element: HTMLElement, options?: object) => Promise<Blob | null>;
    };
    JSZip: any;
  }
}

const getCurrentPage = () => {
  const hash = window.location.hash.substring(1).replace(/^\/|\/$/g, '');
  return hash || 'pin-generator';
};

type PersistedData = Omit<TemplateData, 'backgroundImage' | 'backgroundImage2' | 'backgroundImage3'>;

const initialPersistedData: PersistedData = {
    title: 'GARLIC HERB MOZZARELLA BITES',
    website: 'YOURWEBSITE.COM',
    board: 'RECIPE IDEAS',
    templateId: '15',
    pinSize: 'long',
    imageAspectRatio: '9:16',
    description: 'These garlic herb mozzarella bites are the perfect easy appetizer! They\'re cheesy, flavorful, and so simple to make. Get the recipe now!',
    keywords: '',
    mediaUrlPrefix: 'http://yourwebsite.com/images/',
    pinsPerDay: 3,
    useRandomPinsPerDay: false,
    pinsPerDayMin: 3,
    pinsPerDayMax: 5,
    startDate: new Date().toISOString().split('T')[0],
    imageModel: 'fal-ai/recraft/v3/text-to-image',
    textModel: 'google/gemini-2.5-flash',
};

const initialImageData = {
    backgroundImage: null,
    backgroundImage2: null,
    backgroundImage3: null,
};

const initialAdminSettings: AdminSettings = {
    analyticsId: '',
    adScript: '',
    aboutPageContent: '',
    contactPageContent: '',
    howToUsePageContent: '',
    privacyPageContent: '',
    termsPageContent: '',
    websiteProfiles: [],
    contentPrompt: DEFAULT_CONTENT_PROMPT,
};

const App: React.FC = () => {
  const [persistedData, setPersistedData] = useLocalStorage<PersistedData>('templateData', initialPersistedData);
  const [imageData, setImageData] = useState(initialImageData);
  const templateData: TemplateData = { ...persistedData, ...imageData };

  const [falAiApiKey, setFalAiApiKey] = useLocalStorage('falAiApiKey', '');
  const [apiframeApiKey, setApiframeApiKey] = useLocalStorage('apiframeApiKey', '');
  const [midapiApiKey, setMidapiApiKey] = useLocalStorage('midapiApiKey', '');
  const [openRouterApiKey, setOpenRouterApiKey] = useLocalStorage('openRouterApiKey', '');
  const [imagineApiKey, setImagineApiKey] = useLocalStorage('imagineApiKey', '');
  const [useapiApiKey, setUseapiApiKey] = useLocalStorage('useapiApiKey', '');

  const [adminSettings, setAdminSettings] = useLocalStorage<AdminSettings>('adminSettings', initialAdminSettings);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useLocalStorage<boolean>('isAdminLoggedIn', false);
  useAnalytics(adminSettings.analyticsId);

  const [pinterestAccounts, setPinterestAccounts] = useLocalStorage<PinterestAccount[]>('pinterestAccounts', []);

  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState<{ [key: number]: boolean }>({});
  const [isGeneratingMidjourneyImage, setIsGeneratingMidjourneyImage] = useState<{ [key: number]: boolean }>({});
  const [isGeneratingMidjourney2Image, setIsGeneratingMidjourney2Image] = useState<{ [key: number]: boolean }>({});
  const [isGeneratingImagineImage, setIsGeneratingImagineImage] = useState<{ [key: number]: boolean }>({});
  const [isGeneratingUseApiImage, setIsGeneratingUseApiImage] = useState<{ [key: number]: boolean }>({});
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isGeneratingKeywords, setIsGeneratingKeywords] = useState(false);
  const [isGeneratingShortTitle, setIsGeneratingShortTitle] = useState(false);
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [currentRowIndex, setCurrentRowIndex] = useState<number | null>(null);
  const [apiError, setApiError] = useState<{ type: string; message: string; helpLink?: string } | null>(null);
  
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [bulkMessage, setBulkMessage] = useState('');
  const [originalCsvHeaders, setOriginalCsvHeaders] = useState<string[]>([]);
  const [fullCsvData, setFullCsvData] = useState<{ [key: string]: string }[]>([]);
  const [generatedAssets, setGeneratedAssets] = useState<{ zip: Blob; csv: Blob } | null>(null);
  const [page, setPage] = useState(getCurrentPage());
  const [lastCompletedRowIndex, setLastCompletedRowIndex] = useState<number | null>(null);
  const [inProgressCsvData, setInProgressCsvData] = useState<{[key: string]: string}[]>([]);
  const [bulkJobType, setBulkJobType] = useState<'fal' | 'midjourney' | 'midjourney2' | 'imagine' | 'useapi' | null>(null);
  
  const zipRef = useRef<any>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleResetBulkGeneration = useCallback(() => {
    setLastCompletedRowIndex(null);
    setInProgressCsvData([]);
    zipRef.current = null;
    setBulkMessage('');
    setGeneratedAssets(null);
    setBulkJobType(null);
    if (apiError?.type === 'quota') {
        setApiError(null);
    }
  }, [apiError?.type]);

  useEffect(() => {
    if (lastCompletedRowIndex !== null) {
      handleResetBulkGeneration();
      setBulkMessage("Settings changed. Please start a new bulk generation.");
    }
  }, [templateData.templateId, templateData.pinSize, templateData.website, templateData.mediaUrlPrefix, csvData, handleResetBulkGeneration]);

  useEffect(() => {
    const handleHashChange = () => {
        setPage(getCurrentPage());
        window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (currentRowIndex !== null && csvData[currentRowIndex]) {
      const { title, description, keywords, board } = csvData[currentRowIndex];
      setPersistedData(prev => ({
        ...prev,
        title: title,
        description: description,
        keywords: keywords,
        board: board,
      }));
      setImageData({
        backgroundImage: null,
        backgroundImage2: null,
        backgroundImage3: null,
      });
    }
  }, [currentRowIndex, csvData, setPersistedData]);

  const handleFieldChange = (field: keyof TemplateData, value: any) => {
    if (apiError) setApiError(null);
    if (generatedAssets) setGeneratedAssets(null);
    
    const imageFields: (keyof TemplateData)[] = ['backgroundImage', 'backgroundImage2', 'backgroundImage3'];
    if (imageFields.includes(field)) {
      setImageData(prev => ({ ...prev, [field]: value }));
    } else {
      setPersistedData(prev => ({ ...prev, [field as keyof PersistedData]: value }));
    }
  };

  const handleImageUpload = (file: File, imageNumber: 1 | 2 | 3) => {
    if (apiError) setApiError(null);
    if (generatedAssets) setGeneratedAssets(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      const field = `backgroundImage${imageNumber === 1 ? '' : imageNumber}` as 'backgroundImage' | 'backgroundImage2' | 'backgroundImage3';
      setImageData(prev => ({ ...prev, [field]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };
  
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const waitForImageLoad = async (imgUrl: string | null): Promise<void> => {
        if (!imgUrl) return;
        return new Promise((resolve) => {
            const img = new Image();
            img.src = imgUrl;
            if (img.complete) {
                resolve();
            } else {
                img.onload = () => resolve();
                img.onerror = () => resolve();
            }
        });
  };

  const handleGenerateImage = async (imageNumber: 1 | 2 | 3, throwOnError = false, overridePrompt?: string): Promise<void> => {
    let userPrompt = overridePrompt;
    if (!userPrompt && currentRowIndex !== null && csvData[currentRowIndex]) {
         userPrompt = csvData[currentRowIndex].title;
    }
    if (!userPrompt) userPrompt = templateData.title;
    if (!userPrompt) {
        const msg = 'Please enter a Title to generate an image.';
        if (throwOnError) throw new Error(msg);
        setApiError({ type: 'generic', message: msg });
        return;
    }

    setIsGeneratingImage(prev => ({ ...prev, [imageNumber]: true }));
    setApiError(null);
    const apiKey = falAiApiKey;
    const aspectRatio = templateData.imageAspectRatio;

    try {
        let imageUrl: string;
        if (apiKey && apiKey.length > 5) {
            imageUrl = await generateImage(apiKey, templateData.imageModel, userPrompt, aspectRatio);
        } else {
            imageUrl = await generatePlaceholderImage(userPrompt, aspectRatio);
        }
        const field = `backgroundImage${imageNumber === 1 ? '' : imageNumber}` as 'backgroundImage' | 'backgroundImage2' | 'backgroundImage3';
        setImageData(prev => ({ ...prev, [field]: imageUrl }));
    } catch (error: any) {
        if (throwOnError) throw error;
        setApiError({ type: error.type || 'generic', message: error.message || 'Failed to generate image.', helpLink: error.helpLink });
    } finally {
        setIsGeneratingImage(prev => ({ ...prev, [imageNumber]: false }));
    }
  };

  const handleGenerateImageWithMidjourney = async (imageNumber: 1 | 2 | 3, throwOnError = false, overridePrompt?: string): Promise<void> => {
    let userPrompt = overridePrompt;
    if (!userPrompt && currentRowIndex !== null && csvData[currentRowIndex]) {
         userPrompt = csvData[currentRowIndex].title;
    }
    if (!userPrompt) userPrompt = templateData.title;
    if (!userPrompt) {
        const msg = 'Please enter a Title to generate an image.';
        if (throwOnError) throw new Error(msg);
        setApiError({ type: 'generic', message: msg });
        return;
    }

    if (!apiframeApiKey || apiframeApiKey.length < 5) {
        const msg = 'Please enter an APIFrame.ai API key in the AI Configuration settings to use Midjourney.';
        if (throwOnError) throw new Error(msg);
        setApiError({ type: 'generic', message: msg });
        return;
    }

    setIsGeneratingMidjourneyImage({ 1: true, 2: true, 3: true });
    setApiError(null);

    try {
        const imageUrls = await generateImageWithMidjourney(apiframeApiKey, userPrompt, templateData.imageAspectRatio);
        setImageData(prev => ({
            ...prev,
            backgroundImage: imageUrls[0] || prev.backgroundImage,
            backgroundImage2: imageUrls[1] || prev.backgroundImage2,
            backgroundImage3: imageUrls[2] || prev.backgroundImage3,
        }));
    } catch (error: any) {
        if (throwOnError) throw error;
        setApiError({ type: error.type || 'generic', message: error.message || 'Failed to generate image with Midjourney.', helpLink: error.helpLink });
    } finally {
        setIsGeneratingMidjourneyImage({ 1: false, 2: false, 3: false });
    }
  };

  const handleGenerateImageWithMidApiAi = async (imageNumber: 1 | 2 | 3, throwOnError = false, overridePrompt?: string, onProgressUpdate?: (message: string) => void): Promise<void> => {
    let userPrompt = overridePrompt;
    if (!userPrompt && currentRowIndex !== null && csvData[currentRowIndex]) {
         userPrompt = csvData[currentRowIndex].title;
    }
    if (!userPrompt) userPrompt = templateData.title;
    if (!userPrompt) {
        const msg = 'Please enter a Title to generate an image.';
        if (throwOnError) throw new Error(msg);
        setApiError({ type: 'generic', message: msg });
        return;
    }
    if (!midapiApiKey || midapiApiKey.length < 5) {
        const msg = 'Please enter a midapi.ai API key in the AI Configuration settings to use this generator.';
        if (throwOnError) throw new Error(msg);
        setApiError({ type: 'generic', message: msg });
        return;
    }
    setIsGeneratingMidjourney2Image({ 1: true, 2: true, 3: true });
    setApiError(null);
    try {
        const imageUrls = await generateImageWithMidApiAi(midapiApiKey, userPrompt, templateData.imageAspectRatio, onProgressUpdate);
        setImageData(prev => ({
            ...prev,
            backgroundImage: imageUrls[0] || prev.backgroundImage,
            backgroundImage2: imageUrls[1] || prev.backgroundImage2,
            backgroundImage3: imageUrls[2] || prev.backgroundImage3,
        }));
    } catch (error: any) {
        if (throwOnError) throw error;
        setApiError({ type: error.type || 'generic', message: error.message || 'Failed to generate image with midapi.ai.', helpLink: error.helpLink });
    } finally {
        setIsGeneratingMidjourney2Image({ 1: false, 2: false, 3: false });
    }
  };

  const handleGenerateImageWithImagineApi = async (imageNumber: 1 | 2 | 3, throwOnError = false, overridePrompt?: string, onProgressUpdate?: (message: string) => void): Promise<void> => {
    let userPrompt = overridePrompt;
    if (!userPrompt && currentRowIndex !== null && csvData[currentRowIndex]) {
         userPrompt = csvData[currentRowIndex].title;
    }
    if (!userPrompt) userPrompt = templateData.title;
    if (!userPrompt) {
        const msg = 'Please enter a Title to generate an image.';
        if (throwOnError) throw new Error(msg);
        setApiError({ type: 'generic', message: msg });
        return;
    }
    if (!imagineApiKey || imagineApiKey.length < 5) {
        const msg = 'Please enter an ImagineAPI key in the AI Configuration settings to use this generator.';
        if (throwOnError) throw new Error(msg);
        setApiError({ type: 'generic', message: msg });
        return;
    }
    setIsGeneratingImagineImage({ 1: true, 2: true, 3: true });
    setApiError(null);
    try {
        const imageUrls = await generateImageWithImagineApi(imagineApiKey, userPrompt, templateData.imageAspectRatio, onProgressUpdate);
        setImageData(prev => ({
            ...prev,
            backgroundImage: imageUrls[0] || prev.backgroundImage,
            backgroundImage2: imageUrls[1] || prev.backgroundImage2,
            backgroundImage3: imageUrls[2] || prev.backgroundImage3,
        }));
    } catch (error: any) {
        if (throwOnError) throw error;
        setApiError({ type: error.type || 'generic', message: error.message || 'Failed to generate image with ImagineAPI.', helpLink: error.helpLink });
    } finally {
        setIsGeneratingImagineImage({ 1: false, 2: false, 3: false });
    }
  };

  const handleGenerateImageWithUseApi = async (imageNumber: 1 | 2 | 3, throwOnError = false, overridePrompt?: string, onProgressUpdate?: (message: string) => void): Promise<void> => {
    let userPrompt = overridePrompt;
    if (!userPrompt && currentRowIndex !== null && csvData[currentRowIndex]) {
         userPrompt = csvData[currentRowIndex].title;
    }
    if (!userPrompt) userPrompt = templateData.title;
    if (!userPrompt) {
        const msg = 'Please enter a Title to generate an image.';
        if (throwOnError) throw new Error(msg);
        setApiError({ type: 'generic', message: msg });
        return;
    }
    if (!useapiApiKey || useapiApiKey.length < 5) {
        const msg = 'Please enter a useapi.net API key in the AI Configuration settings to use this generator.';
        if (throwOnError) throw new Error(msg);
        setApiError({ type: 'generic', message: msg });
        return;
    }
    setIsGeneratingUseApiImage({ 1: true, 2: true, 3: true });
    setApiError(null);
    try {
        const imageUrls = await generateImageWithUseApi(useapiApiKey, userPrompt, templateData.imageAspectRatio, onProgressUpdate);
        setImageData(prev => ({
            ...prev,
            backgroundImage: imageUrls[0] || prev.backgroundImage,
            backgroundImage2: imageUrls[1] || prev.backgroundImage2,
            backgroundImage3: imageUrls[2] || prev.backgroundImage3,
        }));
    } catch (error: any) {
        if (throwOnError) throw error;
        setApiError({ type: error.type || 'generic', message: error.message || 'Failed to generate image with useapi.net.', helpLink: error.helpLink });
    } finally {
        setIsGeneratingUseApiImage({ 1: false, 2: false, 3: false });
    }
  };

  const handleGenerateDescription = async (throwOnError = false): Promise<void> => {
    const title = templateData.title;
    if (!title) {
        const msg = 'Please enter a Title to generate a description.';
        if (throwOnError) throw new Error(msg);
        setApiError({ type: 'generic', message: msg });
        return;
    }
    setIsGeneratingDescription(true);
    setApiError(null);
    try {
        let newDescription: string;
        if (openRouterApiKey) {
            newDescription = await generateDescription(openRouterApiKey, templateData.textModel, title);
        } else {
            newDescription = generatePlaceholderDescription(title);
        }
        handleFieldChange('description', newDescription);
    } catch (error: any) {
        if (throwOnError) throw error;
        setApiError({ type: error.type || 'generic', message: error.message || 'Failed to generate description.', helpLink: error.helpLink });
    } finally {
        setIsGeneratingDescription(false);
    }
  };

  const handleGenerateKeywords = async (throwOnError = false): Promise<void> => {
    const { title, textModel } = templateData;
    if (!title) {
        const msg = 'Please enter a Title to generate keywords.';
        if (throwOnError) throw new Error(msg);
        setApiError({ type: 'generic', message: msg });
        return;
    }
    setIsGeneratingKeywords(true);
    setApiError(null);
    try {
        let newKeywords: string;
        if (openRouterApiKey) {
            newKeywords = await generateKeywords(openRouterApiKey, textModel, title);
        } else {
            newKeywords = generatePlaceholderKeywords(title);
        }
        handleFieldChange('keywords', newKeywords);
    } catch (error: any) {
        if (throwOnError) throw error;
        setApiError({ type: error.type || 'generic', message: error.message || 'Failed to generate keywords.', helpLink: error.helpLink });
    } finally {
        setIsGeneratingKeywords(false);
    }
  };

  const handleGenerateShortTitle = async (): Promise<void> => {
    const title = templateData.title;
    if (!title) {
        setApiError({ type: 'generic', message: 'Please enter a Title first.' });
        return;
    }
    setIsGeneratingShortTitle(true);
    setApiError(null);
    try {
        let newTitle: string;
        if (openRouterApiKey) {
            newTitle = await generateShortTitle(openRouterApiKey, templateData.textModel, title);
        } else {
            newTitle = title.length > 35 ? title.substring(0, 32) + '...' : title;
        }
        handleFieldChange('title', newTitle);
    } catch (error: any) {
        setApiError({ type: error.type || 'generic', message: error.message || 'Failed to shorten title.', helpLink: error.helpLink });
    } finally {
        setIsGeneratingShortTitle(false);
    }
  };

  const handleDownload = useCallback(() => {
    if (previewRef.current === null) return;
    setIsLoading(true);
    window.htmlToImage.toPng(previewRef.current, { cacheBust: true, pixelRatio: 2, fetchRequestInit: { mode: 'cors' }})
      .then((dataUrl) => {
        const link = document.createElement('a');
        const safeTitle = templateData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const fileName = safeTitle ? `${safeTitle}.png` : 'pinterest-pin.png';
        link.download = fileName;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('Oops, something went wrong!', err);
        setApiError({ type: 'generic', message: 'Could not generate image. Please try again.'});
      })
      .finally(() => setIsLoading(false));
  }, [previewRef, templateData.title]);

  const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            if (inQuotes && line[i+1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
  };

  const handleCsvUpload = (file: File) => {
    handleResetBulkGeneration();
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
      if (lines.length < 2) {
        setApiError({ type: 'generic', message: "CSV must have a header row and at least one data row."});
        return;
      }
      const headers = parseCsvLine(lines[0]).map(h => h.trim());
      setOriginalCsvHeaders(headers);
      const headerMap: { [key: string]: { original: string; index: number } } = {};
      headers.forEach((h, i) => {
        const lowerH = h.toLowerCase().trim();
        if (lowerH.includes('title')) headerMap['title'] = { original: h, index: i };
        if (lowerH.includes('description')) headerMap['description'] = { original: h, index: i };
        if (lowerH.includes('keywords') || lowerH.includes('interest')) headerMap['keywords'] = { original: h, index: i };
        if (lowerH.includes('prompt')) headerMap['imagePrompt'] = { original: h, index: i };
        if (lowerH.includes('board')) headerMap['board'] = { original: h, index: i };
      });
      if (!headerMap['title']) {
        setApiError({ type: 'generic', message: "CSV must contain a column with 'Title' in its header."});
        return;
      }
      const fullData = lines.slice(1).map(line => {
        const values = parseCsvLine(line);
        const rowObject: { [key: string]: string } = {};
        headers.forEach((header, index) => {
            rowObject[header] = values[index] || '';
        });
        return rowObject;
      });
      const simpleData: CsvRow[] = fullData.map(row => {
          const title = row[headerMap['title'].original] || '';
          return {
              title: title,
              website: '',
              board: headerMap['board'] ? row[headerMap['board'].original] || '' : '',
              description: headerMap['description'] ? row[headerMap['description'].original] || '' : '',
              keywords: headerMap['keywords'] ? row[headerMap['keywords'].original] || '' : '',
              imagePrompt: headerMap['imagePrompt'] ? row[headerMap['imagePrompt'].original] || '' : '',
          };
      });
      setFullCsvData(fullData);
      setCsvData(simpleData);
      setCurrentRowIndex(simpleData.length > 0 ? 0 : null);
    };
    reader.readAsText(file);
  };
  
  const handleNextRow = () => {
    if (currentRowIndex !== null && currentRowIndex < csvData.length - 1) {
      setCurrentRowIndex(currentRowIndex + 1);
    }
  };

  const handlePrevRow = () => {
    if (currentRowIndex !== null && currentRowIndex > 0) {
      setCurrentRowIndex(currentRowIndex - 1);
    }
  };

  const handleBulkGeneration = async (imageGenerator: 'fal' | 'midjourney' | 'midjourney2' | 'imagine' | 'useapi', resume = false) => {
    setApiError(null);
    setGeneratedAssets(null);
    if (csvData.length === 0) {
      setApiError({ type: 'generic', message: 'Please upload a CSV file first.'});
      return;
    }
    const orApiKey = openRouterApiKey;
    if (!orApiKey && !window.confirm("You are missing an OpenRouter API key. Only basic placeholder text will be created. Continue?")) return;
    if (imageGenerator === 'fal' && !falAiApiKey && !window.confirm("You are missing a Fal.ai key. Only placeholders will be created. Continue?")) return;
    if (imageGenerator === 'midjourney' && !apiframeApiKey && !window.confirm("You are missing an APIFrame.ai key. No images will be generated. Continue?")) return;
    if (imageGenerator === 'midjourney2' && !midapiApiKey && !window.confirm("You are missing a midapi.ai key. No images will be generated. Continue?")) return;
    if (imageGenerator === 'imagine' && !imagineApiKey && !window.confirm("You are missing an ImagineAPI key. No images will be generated. Continue?")) return;
    if (imageGenerator === 'useapi' && !useapiApiKey && !window.confirm("You are missing a useapi.net key. No images will be generated. Continue?")) return;

    const dataForGeneration = [...csvData];
    const fullDataForGeneration = JSON.parse(JSON.stringify(fullCsvData));
    const generationErrors: string[] = [];
    setIsBulkGenerating(true);
    const startIndex = resume && lastCompletedRowIndex !== null ? lastCompletedRowIndex + 1 : 0;
    
    let currentRunCsvData;
    if (startIndex === 0) {
        setBulkMessage('Starting bulk generation...');
        zipRef.current = new window.JSZip();
        setInProgressCsvData(fullDataForGeneration);
        setLastCompletedRowIndex(null);
        if (!resume) setBulkJobType(imageGenerator);
        currentRunCsvData = fullDataForGeneration;
    } else {
        setBulkMessage(`Resuming from row ${startIndex + 1}...`);
        currentRunCsvData = [...inProgressCsvData];
    }
    const zip = zipRef.current;
    
    const { pinsPerDay, startDate, useRandomPinsPerDay, pinsPerDayMin, pinsPerDayMax } = templateData;
    const pinsPerDayNum = Math.max(1, parseInt(pinsPerDay.toString(), 10) || 1);
    const minPins = Math.max(1, parseInt(pinsPerDayMin.toString(), 10) || 1);
    const maxPins = Math.max(minPins, parseInt(pinsPerDayMax.toString(), 10) || 1);
    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
        setApiError({ type: 'generic', message: 'Invalid start date.'});
        setIsBulkGenerating(false);
        return;
    }
    start.setMinutes(start.getMinutes() + start.getTimezoneOffset());
    const mediaUrlHeaderKey = 'Media URL';
    const publishDateHeaderKey = 'Publish date';
    const descriptionHeaderKey = Object.keys(currentRunCsvData[0] || {}).find(k => k.toLowerCase().trim() === 'description') || 'Description';
    const keywordsHeaderKey = Object.keys(currentRunCsvData[0] || {}).find(k => k.toLowerCase().trim() === 'keywords' || k.toLowerCase().trim() === 'interest used') || 'Keywords';

    const schedule: { date: string }[] = [];
    let currentDate = new Date(start);
    let currentDayPinCount = 0;
    let targetPinsForDay = useRandomPinsPerDay ? Math.floor(Math.random() * (maxPins - minPins + 1)) + minPins : pinsPerDayNum;

    for (let k = 0; k < dataForGeneration.length; k++) {
        const startHour = 9;
        const totalHoursInWindow = 8;
        const hourIncrement = targetPinsForDay > 1 ? totalHoursInWindow / (targetPinsForDay - 1) : 0;
        const publishHourFloat = startHour + (currentDayPinCount * hourIncrement);
        const publishDate = new Date(currentDate);
        const publishHour = Math.floor(publishHourFloat);
        const publishMinute = Math.round((publishHourFloat - publishHour) * 60);
        publishDate.setHours(publishHour, publishMinute, 0, 0);
        const year = publishDate.getFullYear();
        const month = (publishDate.getMonth() + 1).toString().padStart(2, '0');
        const day = publishDate.getDate().toString().padStart(2, '0');
        const hourStr = publishDate.getHours().toString().padStart(2, '0');
        const minuteStr = publishDate.getMinutes().toString().padStart(2, '0');
        schedule.push({ date: `${year}-${month}-${day} ${hourStr}:${minuteStr}:00` });
        currentDayPinCount++;
        if (currentDayPinCount >= targetPinsForDay) {
            currentDate.setDate(currentDate.getDate() + 1);
            currentDayPinCount = 0;
            targetPinsForDay = useRandomPinsPerDay ? Math.floor(Math.random() * (maxPins - minPins + 1)) + minPins : pinsPerDayNum;
        }
    }

    let i = startIndex;
    try {
        for (i = startIndex; i < dataForGeneration.length; i++) {
            const currentData = dataForGeneration[i];
            setBulkMessage(`Processing row ${i + 1} of ${dataForGeneration.length}: ${currentData.title}`);
            setCurrentRowIndex(i);
            await sleep(100);
            if (!currentRunCsvData[i]) throw new Error(`Data mismatch at row ${i + 1}.`);
            
            if (!currentRunCsvData[i][descriptionHeaderKey]) {
                try {
                    let description = orApiKey ? await generateDescription(orApiKey, templateData.textModel, currentData.title) : generatePlaceholderDescription(currentData.title);
                    currentRunCsvData[i][descriptionHeaderKey] = description;
                } catch (error: any) {
                    if (error.type === 'quota') throw error;
                    generationErrors.push(`Row ${i + 1}: Failed description - ${error.message}`);
                }
            }
            if (!currentRunCsvData[i][keywordsHeaderKey]) {
                try {
                    let keywords = orApiKey ? await generateKeywords(orApiKey, templateData.textModel, currentData.title) : generatePlaceholderKeywords(currentData.title);
                    currentRunCsvData[i][keywordsHeaderKey] = keywords;
                } catch (error: any) {
                    if (error.type === 'quota') throw error;
                    generationErrors.push(`Row ${i + 1}: Failed keywords - ${error.message}`);
                }
            }

            const prompt = currentData.title;
            let imageGenerated = false;
            if (prompt) {
                try {
                    const multiImageTemplates = ['2', '4', '7', '11', '13', '15', '16', '19', '22', '23', '48', '49', '50', '51', '53', '54', '55', '56', '57', '58', '59', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '90'];
                    const tripleImageTemplates = ['7', '15', '19', '22'];
                    const imagesNeeded = 1 + (multiImageTemplates.includes(templateData.templateId) ? 1 : 0) + (tripleImageTemplates.includes(templateData.templateId) ? 1 : 0);
                    const isMultiImageGenerator = ['midjourney', 'midjourney2', 'imagine', 'useapi'].includes(imageGenerator);

                    if (isMultiImageGenerator) {
                        if (imageGenerator === 'midjourney' && apiframeApiKey) await handleGenerateImageWithMidjourney(1, true, prompt);
                        else if (imageGenerator === 'midjourney2' && midapiApiKey) await handleGenerateImageWithMidApiAi(1, true, prompt);
                        else if (imageGenerator === 'imagine' && imagineApiKey) await handleGenerateImageWithImagineApi(1, true, prompt);
                        else if (imageGenerator === 'useapi' && useapiApiKey) await handleGenerateImageWithUseApi(1, true, prompt);
                    } else {
                        for (let imgIdx = 1; imgIdx <= imagesNeeded; imgIdx++) {
                            await handleGenerateImage(imgIdx as 1 | 2 | 3, true, prompt);
                        }
                    }
                    imageGenerated = true;
                } catch (error: any) {
                    if (error.type === 'quota') throw error;
                    generationErrors.push(`Row ${i + 1}: Image error - ${error.message}`);
                    imageGenerated = false;
                }
            }

            await sleep(2000);
            await waitForImageLoad(imageData.backgroundImage);
            if (['2', '4', '7', '11', '13', '15', '16', '19', '22', '23', '59', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '90'].includes(templateData.templateId)) await waitForImageLoad(imageData.backgroundImage2);
            if (['7', '15', '19', '22'].includes(templateData.templateId)) await waitForImageLoad(imageData.backgroundImage3);

            if (imageGenerated && previewRef.current) {
                const dataUrl = await window.htmlToImage.toPng(previewRef.current, { cacheBust: true, pixelRatio: 2, fetchRequestInit: { mode: 'cors' }});
                const safeTitle = currentData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'unnamed';
                
                let filename = `${safeTitle}.png`;
                let counter = 1;
                while (zip.file(filename)) {
                    filename = `${safeTitle}_${counter}.png`;
                    counter++;
                }

                const base64Data = dataUrl.substring(dataUrl.indexOf(',') + 1);
                zip.file(filename, base64Data, { base64: true });
                const prefix = templateData.mediaUrlPrefix.endsWith('/') ? templateData.mediaUrlPrefix : `${templateData.mediaUrlPrefix}/`;
                currentRunCsvData[i][mediaUrlHeaderKey] = `${prefix}${filename}`;
            }
            currentRunCsvData[i][publishDateHeaderKey] = schedule[i] ? schedule[i].date : '';
            setInProgressCsvData([...currentRunCsvData]);
            setLastCompletedRowIndex(i);
            await sleep(100);
        }
        setBulkMessage('Generation complete! Files ready to download.');
        const outputHeaders = ['Title', 'Media URL', 'Pinterest board', 'Description', 'Link', 'Publish date', 'Keywords'];
        const csvHeaderString = outputHeaders.join(',');
        const csvRowStrings = currentRunCsvData.map(row => {
            return outputHeaders.map(header => {
                let value = '';
                if (header === 'Media URL') value = row[mediaUrlHeaderKey] || '';
                else if (header === 'Publish date') value = row[publishDateHeaderKey] || '';
                else if (header === 'Link') value = templateData.website;
                else if (header === 'Keywords') value = row[keywordsHeaderKey] || '';
                else {
                    const origH = originalCsvHeaders.find(h => h.toLowerCase().trim().includes(header.toLowerCase()));
                    if (origH) value = row[origH] || '';
                }
                const cell = String(value);
                return (cell.includes(',') || cell.includes('"') || cell.includes('\n')) ? `"${cell.replace(/"/g, '""')}"` : cell;
            }).join(',');
        });
        const csvBlob = new Blob(['\uFEFF' + [csvHeaderString, ...csvRowStrings].join('\r\n')], { type: 'text/csv;charset=utf-8;' });
        const zipContent = await zip.generateAsync({ type: 'blob' });
        setGeneratedAssets({ zip: zipContent, csv: csvBlob });
    } catch (e: any) {
        console.error('Bulk generation failed:', e);
        setApiError({ type: e.type || 'generic', message: `Error on row ${i + 1}: ${e.message}`, helpLink: e.helpLink });
        setBulkMessage(`Error on row ${i + 1}: ${e.message}`);
    } finally {
        setIsBulkGenerating(false);
    }
  };

  const handleDownloadGeneratedAssets = () => {
    if (!generatedAssets) return;
    const zipLink = document.createElement('a');
    zipLink.href = URL.createObjectURL(generatedAssets.zip);
    zipLink.download = 'pinterest_pins.zip';
    zipLink.click();
    const csvLink = document.createElement('a');
    csvLink.href = URL.createObjectURL(generatedAssets.csv);
    csvLink.download = 'pinterest_bulk_upload.csv';
    csvLink.click();
    handleResetBulkGeneration();
  };
  
  const handleImportSettings = (data: BackupData) => {
    if (data.adminSettings) setAdminSettings(data.adminSettings);
    if (data.openRouterApiKey) setOpenRouterApiKey(data.openRouterApiKey);
    if (data.falAiApiKey) setFalAiApiKey(data.falAiApiKey);
    if (data.apiframeApiKey) setApiframeApiKey(data.apiframeApiKey);
    if (data.midapiApiKey) setMidapiApiKey(data.midapiApiKey);
    if (data.imagineApiKey) setImagineApiKey(data.imagineApiKey);
    if (data.useapiApiKey) setUseapiApiKey(data.useapiApiKey);
    if (Array.isArray(data.pinterestAccounts)) setPinterestAccounts(data.pinterestAccounts);
    alert('Settings imported!');
  };

  const allData: BackupData = { adminSettings, openRouterApiKey, falAiApiKey, apiframeApiKey, midapiApiKey, imagineApiKey, useapiApiKey, pinterestAccounts };

  const controlProps = {
    data: templateData, onFieldChange: handleFieldChange, onImageUpload: handleImageUpload, onGenerateImage: handleGenerateImage,
    onGenerateImageWithMidjourney: handleGenerateImageWithMidjourney, onGenerateImageWithMidApiAi: handleGenerateImageWithMidApiAi,
    onGenerateImageWithImagineApi: handleGenerateImageWithImagineApi, onGenerateImageWithUseApi: handleGenerateImageWithUseApi,
    onGenerateDescription: handleGenerateDescription, onGenerateKeywords: handleGenerateKeywords, onGenerateShortTitle: handleGenerateShortTitle,
    onDownload: handleDownload, isLoading, isGeneratingImage, isGeneratingMidjourneyImage, isGeneratingMidjourney2Image,
    isGeneratingImagineImage, isGeneratingUseApiImage, isGeneratingDescription, isGeneratingKeywords, isGeneratingShortTitle,
    onCsvUpload: handleCsvUpload, onNextRow: handleNextRow, onPrevRow: handlePrevRow, csvData, currentRowIndex,
    onBulkGeneration: handleBulkGeneration, isBulkGenerating, bulkMessage, apiError, generatedAssets, onDownloadGeneratedAssets: handleDownloadGeneratedAssets,
    lastCompletedRowIndex, onResetBulkGeneration: handleResetBulkGeneration, onSetFalAiApiKey: setFalAiApiKey, falAiApiKey,
    apiframeApiKey, onSetApiframeApiKey: setApiframeApiKey, midapiApiKey, onSetMidapiApiKey: setMidapiApiKey,
    imagineApiKey, onSetImagineApiKey: setImagineApiKey, useapiApiKey, onSetUseapiApiKey: setUseapiApiKey,
    bulkJobType, openRouterApiKey, onSetOpenRouterApiKey: setOpenRouterApiKey
  };
  
  const renderPage = () => {
    switch(page) {
        case 'about': return <AboutPage content={adminSettings.aboutPageContent} />;
        case 'privacy': return <PrivacyPolicyPage content={adminSettings.privacyPageContent} />;
        case 'terms': return <TermsOfServicePage content={adminSettings.termsPageContent} />;
        case 'how-to-use': return <HowToUsePage content={adminSettings.howToUsePageContent} />;
        case 'contact': return <ContactPage content={adminSettings.contactPageContent} />;
        case 'content-generator': return <ContentGeneratorPage openRouterApiKey={openRouterApiKey} onSetOpenRouterApiKey={setOpenRouterApiKey} textModel={templateData.textModel} adminSettings={adminSettings} />;
        case 'assistant': return <AssistantPage accounts={pinterestAccounts} setAccounts={setPinterestAccounts} openRouterApiKey={openRouterApiKey} textModel={templateData.textModel} />;
        case 'domain-suggestor': return <DNRaterPage />;
        case 'author': return <AuthorPage />;
        case 'facebook-page-builder': return <FacebookPageBuilderPage openRouterApiKey={openRouterApiKey} onSetOpenRouterApiKey={setOpenRouterApiKey} textModel={templateData.textModel} />;
        case 'quote-generator': return <QuoteGeneratorPage openRouterApiKey={openRouterApiKey} onSetOpenRouterApiKey={setOpenRouterApiKey} useapiApiKey={useapiApiKey} onSetUseapiApiKey={setUseapiApiKey} textModel={templateData.textModel} />;
        case 'admin': return <AdminPage isAdminLoggedIn={isAdminLoggedIn} setIsAdminLoggedIn={setIsAdminLoggedIn} settings={adminSettings} setSettings={setAdminSettings} allData={allData} onImportSettings={handleImportSettings} />;
        case 'welcome': return <HomePage />;
        case 'facebook-post-generator': return <FacebookPostGeneratorPage falAiApiKey={falAiApiKey} onSetFalAiApiKey={setFalAiApiKey} useapiApiKey={useapiApiKey} onSetUseapiApiKey={setUseapiApiKey} openRouterApiKey={openRouterApiKey} onSetOpenRouterApiKey={setOpenRouterApiKey} textModel={templateData.textModel} />;
        case 'rewrite-title-description': return <DescriptionRewritePage openRouterApiKey={openRouterApiKey} onSetOpenRouterApiKey={setOpenRouterApiKey} adminSettings={adminSettings} />;
        default: return <GeneratorInterface controlProps={controlProps} previewRef={previewRef} templateData={templateData} apiError={apiError} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow p-4 md:p-8">
        {(page === 'content-generator' || page === 'pin-generator' || page === 'assistant') && <AdBanner adScript={adminSettings.adScript} />}
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
};

export default App;
