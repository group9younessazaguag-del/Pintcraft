
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
// FIX: Change to named import for FacebookPostGeneratorPage
import { FacebookPostGeneratorPage } from './components/pages/FacebookPostGeneratorPage';
// FIX: Change to named import for QuoteGeneratorPage
import { QuoteGeneratorPage } from './components/pages/QuoteGeneratorPage';
import DescriptionRewritePage from './components/pages/DescriptionRewritePage';
// FIX: Add named import for FacebookPageBuilderPage
import { FacebookPageBuilderPage } from './components/pages/FacebookPageBuilderPage';

// TypeScript declaration for the CDN-loaded libraries
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
  // Get hash, remove leading '#', remove leading/trailing slashes
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
    textModel: 'google/gemini-2.5-flash', // Default for OpenRouter
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

  const [falAiApiKey, setFalAiApiKey] = useLocalStorage('falAiApiKey', ''); // For Fal.ai (images)
  const [apiframeApiKey, setApiframeApiKey] = useLocalStorage('apiframeApiKey', ''); // For APIFrame.ai (Midjourney)
  const [midapiApiKey, setMidapiApiKey] = useLocalStorage('midapiApiKey', ''); // For midapi.ai (Midjourney 2)
  const [openRouterApiKey, setOpenRouterApiKey] = useLocalStorage('openRouterApiKey', ''); // For OpenRouter.ai (text)
  const [imagineApiKey, setImagineApiKey] = useLocalStorage('imagineApiKey', ''); // For ImagineAPI
  const [useapiApiKey, setUseapiApiKey] = useLocalStorage('useapiApiKey', ''); // For useapi.net


  // Admin and Analytics State
  const [adminSettings, setAdminSettings] = useLocalStorage<AdminSettings>('adminSettings', initialAdminSettings);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useLocalStorage<boolean>('isAdminLoggedIn', false);
  useAnalytics(adminSettings.analyticsId);

  // Assistant Page State
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
  
  // State for bulk generation
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateData.templateId, templateData.pinSize, templateData.website, templateData.mediaUrlPrefix, csvData]);


  useEffect(() => {
    // This handles navigation via browser back/forward buttons and direct hash links
    const handleHashChange = () => {
        setPage(getCurrentPage());
        window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', handleHashChange);
    
    // Set the initial page based on the hash
    handleHashChange();

    return () => {
        window.removeEventListener('hashchange', handleHashChange);
    };
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRowIndex, csvData]);

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
                img.onerror = () => resolve(); // Resolve even on error to prevent hanging
            }
        });
  };

  const handleGenerateImage = async (imageNumber: 1 | 2 | 3, throwOnError = false, overridePrompt?: string): Promise<void> => {
    // Determine prompt: Override (from bulk) > CSV Image Prompt > CSV Title (Title of recipes) > Current State Title
    let userPrompt = overridePrompt;
    
    if (!userPrompt && currentRowIndex !== null && csvData[currentRowIndex]) {
         // Prioritize CSV data over state to avoid race conditions
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

    const apiKey = falAiApiKey; // Use Fal.ai key for image generation
    const aspectRatio = templateData.imageAspectRatio;

    try {
        let imageUrl: string;
        if (apiKey && apiKey.length > 5) {
            // Use Fal.ai generation if key is available
            imageUrl = await generateImage(
                apiKey,
                templateData.imageModel,
                userPrompt,
                aspectRatio
            );
        } else {
            // Fallback to placeholder generation
            imageUrl = await generatePlaceholderImage(
                userPrompt,
                aspectRatio
            );
        }
        
        const field = `backgroundImage${imageNumber === 1 ? '' : imageNumber}` as 'backgroundImage' | 'backgroundImage2' | 'backgroundImage3';
        setImageData(prev => ({ ...prev, [field]: imageUrl }));
    } catch (error: any) {
        console.error(`Error generating image:`, error);
        if (throwOnError) {
            throw error; // Re-throw for bulk processor
        }
        setApiError({
            type: error.type || 'generic',
            message: error.message || 'Failed to generate image.',
            helpLink: error.helpLink
        });
    } finally {
        setIsGeneratingImage(prev => ({ ...prev, [imageNumber]: false }));
    }
  };

  const handleGenerateImageWithMidjourney = async (imageNumber: 1 | 2 | 3, throwOnError = false, overridePrompt?: string): Promise<void> => {
    // Determine prompt: Override (from bulk) > CSV Image Prompt > CSV Title (Title of recipes) > Current State Title
    let userPrompt = overridePrompt;
    
    if (!userPrompt && currentRowIndex !== null && csvData[currentRowIndex]) {
         // Prioritize CSV data over state to avoid race conditions
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

    const aspectRatio = templateData.imageAspectRatio;

    try {
        const imageUrls = await generateImageWithMidjourney(
            apiframeApiKey,
            userPrompt,
            aspectRatio
        );
        
        // Populate up to 3 image slots from the returned array
        setImageData(prev => ({
            ...prev,
            backgroundImage: imageUrls[0] || prev.backgroundImage,
            backgroundImage2: imageUrls[1] || prev.backgroundImage2,
            backgroundImage3: imageUrls[2] || prev.backgroundImage3,
        }));
    } catch (error: any) {
        console.error(`Error generating image with Midjourney:`, error);
        if (throwOnError) {
            throw error; // Re-throw for bulk processor
        }
        setApiError({
            type: error.type || 'generic',
            message: error.message || 'Failed to generate image with Midjourney.',
            helpLink: error.helpLink
        });
    } finally {
        setIsGeneratingMidjourneyImage({ 1: false, 2: false, 3: false });
    }
  };

  const handleGenerateImageWithMidApiAi = async (imageNumber: 1 | 2 | 3, throwOnError = false, overridePrompt?: string, onProgressUpdate?: (message: string) => void): Promise<void> => {
    // Determine prompt: Override (from bulk) > CSV Image Prompt > CSV Title (Title of recipes) > Current State Title
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

    const aspectRatio = templateData.imageAspectRatio;

    try {
        const imageUrls = await generateImageWithMidApiAi(
            midapiApiKey,
            userPrompt,
            aspectRatio,
            onProgressUpdate
        );
        
        // Populate up to 3 image slots from the returned array
        setImageData(prev => ({
            ...prev,
            backgroundImage: imageUrls[0] || prev.backgroundImage,
            backgroundImage2: imageUrls[1] || prev.backgroundImage2,
            backgroundImage3: imageUrls[2] || prev.backgroundImage3,
        }));
    } catch (error: any) {
        console.error(`Error generating image with midapi.ai:`, error);
        if (throwOnError) {
            throw error; // Re-throw for bulk processor
        }
        setApiError({
            type: error.type || 'generic',
            message: error.message || 'Failed to generate image with midapi.ai.',
            helpLink: error.helpLink
        });
    } finally {
        setIsGeneratingMidjourney2Image({ 1: false, 2: false, 3: false });
    }
  };

  const handleGenerateImageWithImagineApi = async (imageNumber: 1 | 2 | 3, throwOnError = false, overridePrompt?: string, onProgressUpdate?: (message: string) => void): Promise<void> => {
    // Determine prompt: Override (from bulk) > CSV Image Prompt > CSV Title (Title of recipes) > Current State Title
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

    const aspectRatio = templateData.imageAspectRatio;

    try {
        const imageUrls = await generateImageWithImagineApi(
            imagineApiKey,
            userPrompt,
            aspectRatio,
            onProgressUpdate
        );
        
        // Populate up to 3 image slots from the returned array
        setImageData(prev => ({
            ...prev,
            backgroundImage: imageUrls[0] || prev.backgroundImage,
            backgroundImage2: imageUrls[1] || prev.backgroundImage2,
            backgroundImage3: imageUrls[2] || prev.backgroundImage3,
        }));
    } catch (error: any) {
        console.error(`Error generating image with ImagineAPI:`, error);
        if (throwOnError) {
            throw error; // Re-throw for bulk processor
        }
        setApiError({
            type: error.type || 'generic',
            message: error.message || 'Failed to generate image with ImagineAPI.',
            helpLink: error.helpLink
        });
    } finally {
        setIsGeneratingImagineImage({ 1: false, 2: false, 3: false });
    }
  };

  const handleGenerateImageWithUseApi = async (imageNumber: 1 | 2 | 3, throwOnError = false, overridePrompt?: string, onProgressUpdate?: (message: string) => void): Promise<void> => {
    // Determine prompt: Override (from bulk) > CSV Image Prompt > CSV Title (Title of recipes) > Current State Title
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

    const aspectRatio = templateData.imageAspectRatio;

    try {
        const imageUrls = await generateImageWithUseApi(
            useapiApiKey,
            userPrompt,
            aspectRatio,
            onProgressUpdate
        );
        
        // Populate up to 3 image slots from the returned array
        setImageData(prev => ({
            ...prev,
            backgroundImage: imageUrls[0] || prev.backgroundImage,
            backgroundImage2: imageUrls[1] || prev.backgroundImage2,
            backgroundImage3: imageUrls[2] || prev.backgroundImage3,
        }));
    } catch (error: any) {
        console.error(`Error generating image with useapi.net:`, error);
        if (throwOnError) {
            throw error; // Re-throw for bulk processor
        }
        setApiError({
            type: error.type || 'generic',
            message: error.message || 'Failed to generate image with useapi.net.',
            helpLink: error.helpLink
        });
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
        console.error(`Error generating description:`, error);
        if (throwOnError) {
            throw error;
        }
        setApiError({
            type: error.type || 'generic',
            message: error.message || 'Failed to generate description.',
            helpLink: error.helpLink
        });
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
        console.error(`Error generating keywords:`, error);
        if (throwOnError) {
            throw error;
        }
        setApiError({
            type: error.type || 'generic',
            message: error.message || 'Failed to generate keywords.',
            helpLink: error.helpLink
        });
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
            // Fallback for when no API key is present
            newTitle = title.length > 35 ? title.substring(0, 32) + '...' : title;
        }
        handleFieldChange('title', newTitle);
    } catch (error: any) {
        console.error(`Error generating short title:`, error);
        setApiError({
            type: error.type || 'generic',
            message: error.message || 'Failed to shorten title.',
            helpLink: error.helpLink
        });
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
        const fileName = currentRowIndex !== null ? `pin_${currentRowIndex + 1}_${safeTitle}.png` : 'pinterest-pin.png';
        link.download = fileName;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('Oops, something went wrong!', err);
        setApiError({ type: 'generic', message: 'Could not generate image. Please try again.'});
      })
      .finally(() => setIsLoading(false));
  }, [previewRef, templateData.title, currentRowIndex]);

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
      setCurrentRowIndex(currentRowIndex + 1);
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
    const falApiKey = falAiApiKey;
    const mjApiKey = apiframeApiKey;
    const mj2ApiKey = midapiApiKey;
    const imgApiKey = imagineApiKey;
    const useApiKey = useapiApiKey;

    if (!orApiKey) {
        if (!window.confirm("You are missing an OpenRouter API key. Only basic placeholder text will be created. Do you want to continue?")) {
            return;
        }
    }

    if (imageGenerator === 'fal' && !falApiKey) {
        if (!window.confirm("You are missing a Fal.ai API key. Only basic placeholder images will be created. Do you want to continue?")) {
            return;
        }
    }
    
    if (imageGenerator === 'midjourney' && !mjApiKey) {
        if (!window.confirm("You are missing an APIFrame.ai API key for Midjourney. No images will be generated. Do you want to continue?")) {
            return;
        }
    }

    if (imageGenerator === 'midjourney2' && !mj2ApiKey) {
        if (!window.confirm("You are missing a midapi.ai API key. No images will be generated. Do you want to continue?")) {
            return;
        }
    }
    
    if (imageGenerator === 'imagine' && !imgApiKey) {
        if (!window.confirm("You are missing an ImagineAPI key. No images will be generated. Do you want to continue?")) {
            return;
        }
    }

    if (imageGenerator === 'useapi' && !useApiKey) {
        if (!window.confirm("You are missing a useapi.net API key. No images will be generated. Do you want to continue?")) {
            return;
        }
    }

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
        if (!resume) {
          setBulkJobType(imageGenerator);
        }
        currentRunCsvData = fullDataForGeneration; // Use the snapshot directly for this run
    } else {
        setBulkMessage(`Resuming from row ${startIndex + 1}...`);
        currentRunCsvData = [...inProgressCsvData]; // For a resumed run, we MUST use the state
    }

    const zip = zipRef.current;
    
    const { pinsPerDay, startDate, useRandomPinsPerDay, pinsPerDayMin, pinsPerDayMax } = templateData;
    const pinsPerDayNum = Math.max(1, parseInt(pinsPerDay.toString(), 10) || 1);
    const minPins = Math.max(1, parseInt(pinsPerDayMin.toString(), 10) || 1);
    const maxPins = Math.max(minPins, parseInt(pinsPerDayMax.toString(), 10) || 1);

    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
        setApiError({ type: 'generic', message: 'Invalid start date. Please select a valid date.'});
        setIsBulkGenerating(false);
        return;
    }
    start.setMinutes(start.getMinutes() + start.getTimezoneOffset());

    const mediaUrlHeaderKey = 'Media URL';
    const publishDateHeaderKey = 'Publish date';
    const descriptionHeaderKey = Object.keys(currentRunCsvData[0] || {}).find(k => k.toLowerCase().trim() === 'description') || 'Description';
    const keywordsHeaderKey = Object.keys(currentRunCsvData[0] || {}).find(k => k.toLowerCase().trim() === 'keywords' || k.toLowerCase().trim() === 'interest used') || 'Keywords';

    // Pre-calculate scheduling for ALL rows to ensure consistency, even if we only process from startIndex
    const schedule: { date: string }[] = [];
    let currentDate = new Date(start);
    let currentDayPinCount = 0;
    let targetPinsForDay = useRandomPinsPerDay 
        ? Math.floor(Math.random() * (maxPins - minPins + 1)) + minPins
        : pinsPerDayNum;

    for (let k = 0; k < dataForGeneration.length; k++) {
        const startHour = 9;
        const endHour = 17;
        const totalHoursInWindow = endHour - startHour;
        
        // Calculate time based on the specific count for THIS day
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
            targetPinsForDay = useRandomPinsPerDay 
                ? Math.floor(Math.random() * (maxPins - minPins + 1)) + minPins
                : pinsPerDayNum;
        }
    }

    let i = startIndex;
    try {
        for (i = startIndex; i < dataForGeneration.length; i++) {
            const currentData = dataForGeneration[i];
            setBulkMessage(`Processing row ${i + 1} of ${dataForGeneration.length}: ${currentData.title}`);
            setCurrentRowIndex(i);
            await sleep(100);

            if (!currentRunCsvData[i]) {
                throw new Error(`Data mismatch error at row ${i + 1}. Please restart the bulk generation.`);
            }
            
            // Generate description if missing
            if (!currentRunCsvData[i][descriptionHeaderKey]) {
                setBulkMessage(`Row ${i + 1}: Generating description...`);
                try {
                    let description: string;
                    if (orApiKey) {
                        description = await generateDescription(orApiKey, templateData.textModel, currentData.title);
                    } else {
                        description = generatePlaceholderDescription(currentData.title);
                    }
                    currentRunCsvData[i][descriptionHeaderKey] = description;
                } catch (error: any) {
                    console.warn(`Skipping description for row ${i + 1} due to error:`, error);
                    if (error.type === 'quota') throw error;
                    generationErrors.push(`Row ${i + 1}: Failed description - ${error.message}`);
                }
            }

            // Generate keywords if missing
            if (!currentRunCsvData[i][keywordsHeaderKey]) {
                setBulkMessage(`Row ${i + 1}: Generating keywords...`);
                try {
                    let keywords: string;
                    if (orApiKey) {
                        keywords = await generateKeywords(orApiKey, templateData.textModel, currentData.title);
                    } else {
                        keywords = generatePlaceholderKeywords(currentData.title);
                    }
                    currentRunCsvData[i][keywordsHeaderKey] = keywords;
                } catch (error: any) {
                    console.warn(`Skipping keywords for row ${i + 1} due to error:`, error);
                    if (error.type === 'quota') throw error;
                    generationErrors.push(`Row ${i + 1}: Failed keywords - ${error.message}`);
                }
            }

            const generatorName = imageGenerator === 'midjourney' ? 'Midjourney' : imageGenerator === 'midjourney2' ? 'midapi.ai' : imageGenerator === 'imagine' ? 'ImagineAPI' : imageGenerator === 'useapi' ? 'useapi.net' : 'Fal.ai';
            setBulkMessage(`Row ${i + 1}: Generating images with ${generatorName}...`);

            const prompt = currentData.title;
            let imageGenerated = false;

            if (prompt) {
                try {
                    const needsImage2 = ['2', '4', '7', '11', '13', '15', '16', '19', '22', '23', '29', '31', '32', '34', '35', '36', '38', '39', '40', '41', '42', '43', '48', '49', '50', '51', '53', '54', '55', '56', '57', '58', '59', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '70', '71'].includes(templateData.templateId);
                    const needsImage3 = ['7', '15', '19', '22'].includes(templateData.templateId);
                    const imagesNeeded = 1 + (needsImage2 ? 1 : 0) + (needsImage3 ? 1 : 0);
                    
                    // Determine if we should use batch processing (call API once) or loop (call API multiple times)
                    const isMultiImageGenerator = ['midjourney', 'midjourney2', 'imagine', 'useapi'].includes(imageGenerator);

                    if (isMultiImageGenerator) {
                        // For batch generators, call ONCE. The handler functions populate all image slots.
                        if (imageGenerator === 'midjourney' && mjApiKey) {
                            await handleGenerateImageWithMidjourney(1, true, prompt);
                            await sleep(500);
                        } else if (imageGenerator === 'midjourney2' && mj2ApiKey) {
                            const onProgress = (msg: string) => setBulkMessage(`Row ${i + 1}: ${msg}`);
                            await handleGenerateImageWithMidApiAi(1, true, prompt, onProgress);
                            await sleep(500);
                        } else if (imageGenerator === 'imagine' && imgApiKey) {
                            const onProgress = (msg: string) => setBulkMessage(`Row ${i + 1}: ${msg}`);
                            await handleGenerateImageWithImagineApi(1, true, prompt, onProgress);
                            await sleep(500);
                        } else if (imageGenerator === 'useapi' && useApiKey) {
                            const onProgress = (msg: string) => setBulkMessage(`Row ${i + 1}: ${msg}`);
                            await handleGenerateImageWithUseApi(1, true, prompt, onProgress);
                            await sleep(500);
                        }
                    } else {
                        // For single image generators (Fal.ai, or placeholder), loop through required slots
                        for (let imgIdx = 1; imgIdx <= imagesNeeded; imgIdx++) {
                            await handleGenerateImage(imgIdx as 1 | 2 | 3, true, prompt);
                        }
                    }
                    
                    imageGenerated = true;

                } catch (error: any) {
                    console.warn(`Original image generation failed for row ${i + 1}:`, error);
                    if (error.type === 'quota') {
                        throw error; // Re-throw critical quota errors
                    }
                    
                    const isBannedWordsError = error.message && error.message.toLowerCase().includes('banned words');

                    if (isBannedWordsError && orApiKey) {
                        setBulkMessage(`Row ${i + 1}: Banned words detected. Regenerating prompt...`);
                        await sleep(100);

                        try {
                            const newPrompt = await generateSafeImagePrompt(orApiKey, templateData.textModel, currentData.title);
                            setBulkMessage(`Row ${i + 1}: Retrying with new prompt...`);
                            
                            const needsImage2 = ['2', '4', '7', '11', '13', '15', '16', '19', '22', '23', '29', '31', '32', '34', '35', '36', '38', '39', '40', '41', '42', '43', '48', '49', '50', '51', '53', '54', '55', '56', '57', '58', '59', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '70', '71'].includes(templateData.templateId);
                            const needsImage3 = ['7', '15', '19', '22'].includes(templateData.templateId);
                            const imagesNeeded = 1 + (needsImage2 ? 1 : 0) + (needsImage3 ? 1 : 0);
                            const isMultiImageGenerator = ['midjourney', 'midjourney2', 'imagine', 'useapi'].includes(imageGenerator);

                            if (isMultiImageGenerator) {
                                // Batch retry
                                if (imageGenerator === 'midjourney' && mjApiKey) { await handleGenerateImageWithMidjourney(1, true, newPrompt); await sleep(500); }
                                else if (imageGenerator === 'midjourney2' && mj2ApiKey) { const onProgress = (msg: string) => setBulkMessage(`Row ${i + 1}: ${msg}`); await handleGenerateImageWithMidApiAi(1, true, newPrompt, onProgress); await sleep(500); }
                                else if (imageGenerator === 'imagine' && imgApiKey) { const onProgress = (msg: string) => setBulkMessage(`Row ${i + 1}: ${msg}`); await handleGenerateImageWithImagineApi(1, true, newPrompt, onProgress); await sleep(500); }
                                else if (imageGenerator === 'useapi' && useApiKey) { const onProgress = (msg: string) => setBulkMessage(`Row ${i + 1}: ${msg}`); await handleGenerateImageWithUseApi(1, true, newPrompt, onProgress); await sleep(500); }
                            } else {
                                // Single loop retry
                                for (let imgIdx = 1; imgIdx <= imagesNeeded; imgIdx++) {
                                    await handleGenerateImage(imgIdx as 1 | 2 | 3, true, newPrompt);
                                }
                            }
                            
                            imageGenerated = true;
                            console.log(`Row ${i + 1}: Image generation succeeded on retry.`);

                        } catch (retryError: any) {
                             console.warn(`Retry failed for row ${i + 1}:`, retryError);
                             const shortTitle = currentData.title.length > 30 ? `${currentData.title.substring(0, 27)}...` : currentData.title;
                             generationErrors.push(`Row ${i + 1} (${shortTitle}): Banned words, retry failed: ${retryError.message}`);
                             imageGenerated = false;
                        }
                    } else {
                        const shortTitle = currentData.title.length > 30 ? `${currentData.title.substring(0, 27)}...` : currentData.title;
                        generationErrors.push(`Row ${i + 1} (${shortTitle}): ${error.message}`);
                        imageGenerated = false;
                    }
                }
            }

            await sleep(2000); // Wait for rendering
            
            // Explicitly wait for images to load to prevent blank pins
            const { backgroundImage, backgroundImage2, backgroundImage3 } = imageData; // Get LATEST state
            await waitForImageLoad(backgroundImage);
            if (['2', '4', '7', '11', '13', '15', '16', '19', '22', '23', '29', '31', '32', '34', '35', '36', '38', '39', '40', '41', '42', '43', '48', '49', '50', '51', '53', '54', '55', '56', '57', '58', '59', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '70', '71'].includes(templateData.templateId)) {
                await waitForImageLoad(backgroundImage2);
            }
            if (['7', '15', '19', '22'].includes(templateData.templateId)) {
                await waitForImageLoad(backgroundImage3);
            }

            if (imageGenerated && previewRef.current) {
                const dataUrl = await window.htmlToImage.toPng(previewRef.current, { cacheBust: true, pixelRatio: 2, fetchRequestInit: { mode: 'cors' }});
                const safeTitle = currentData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                const filename = `pin_${i + 1}_${safeTitle}.png`;

                const base64Data = dataUrl.substring(dataUrl.indexOf(',') + 1);
                zip.file(filename, base64Data, { base64: true });

                const prefix = templateData.mediaUrlPrefix.endsWith('/') ? templateData.mediaUrlPrefix : `${templateData.mediaUrlPrefix}/`;
                const imageUrl = `${prefix}${filename}`;
                currentRunCsvData[i][mediaUrlHeaderKey] = imageUrl;
            }

            // Assign pre-calculated date
            currentRunCsvData[i][publishDateHeaderKey] = schedule[i] ? schedule[i].date : '';
            
            setInProgressCsvData([...currentRunCsvData]);
            setLastCompletedRowIndex(i);
            await sleep(100);
        }

        let finalMessage = 'Generation complete! Your files are ready to download.';
        if (generationErrors.length > 0) {
            finalMessage = `Generation completed with ${generationErrors.length} error(s). Some content may be missing. Files are ready.`;
            const errorDetails = `Bulk generation finished, but some rows had issues:\n\n${generationErrors.slice(0, 5).join('\n')}${generationErrors.length > 5 ? `\n...and ${generationErrors.length - 5} more.` : ''}`;
            setApiError({ type: 'generic', message: errorDetails });
        } else {
            setApiError(null);
        }

        setBulkMessage(finalMessage);
        
        const outputHeaders = ['Title', 'Media URL', 'Pinterest board', 'Description', 'Link', 'Publish date', 'Keywords'];

        const getOriginalHeader = (canonicalName: string): string | undefined => {
            const lowerCanonical = canonicalName.toLowerCase();
            return originalCsvHeaders.find(h => {
                const lowerH = h.toLowerCase().trim();
                if (lowerCanonical === 'title') return lowerH.startsWith('title');
                if (lowerCanonical === 'pinterest board') return lowerH === 'pinterest board' || lowerH === 'board';
                if (lowerCanonical === 'link') return lowerH === 'link' || lowerH === 'website' || lowerH === 'site';
                return lowerH === lowerCanonical;
            });
        };
        
        const escapeCsvCell = (cell: any): string => {
            const value = cell ? String(cell) : '';
            if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        };
        
        const csvHeaderString = outputHeaders.join(',');
        const csvRowStrings = currentRunCsvData.map(row => {
            const values = outputHeaders.map(header => {
                let value = '';
                if (header === 'Media URL') value = row[mediaUrlHeaderKey] || '';
                else if (header === 'Publish date') value = row[publishDateHeaderKey] || '';
                else if (header === 'Link') value = templateData.website;
                else if (header === 'Keywords') value = row[keywordsHeaderKey] || '';
                else {
                    const originalHeader = getOriginalHeader(header);
                    if (originalHeader) value = row[originalHeader] || '';
                }
                return escapeCsvCell(value);
            });
            return values.join(',');
        });

        const csvString = [csvHeaderString, ...csvRowStrings].join('\r\n');
        const csvBlob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
        const zipContent = await zip.generateAsync({ type: 'blob' });

        setGeneratedAssets({ zip: zipContent, csv: csvBlob });

    } catch (e: any) {
        console.error('Bulk generation failed:', e);
        const rowIndex = i + 1;
        
        let message: string;
        if (e.type === 'quota') {
            message = `API Quota Exceeded on row ${rowIndex}. Bulk generation has been paused.`;
        } else {
            message = `An error occurred on row ${rowIndex}: ${e.message}. Bulk generation stopped.`;
        }
        
        setApiError({ type: e.type || 'generic', message: message, helpLink: e.helpLink });
        setBulkMessage(message);
    } finally {
        setIsBulkGenerating(false);
    }
  };

  const handleDownloadGeneratedAssets = () => {
    if (!generatedAssets) return;

    const zipLink = document.createElement('a');
    zipLink.href = URL.createObjectURL(generatedAssets.zip);
    zipLink.download = 'pinterest_pins.zip';
    document.body.appendChild(zipLink);
    zipLink.click();
    document.body.removeChild(zipLink);
    URL.revokeObjectURL(zipLink.href);

    const csvLink = document.createElement('a');
    csvLink.href = URL.createObjectURL(generatedAssets.csv);
    csvLink.setAttribute('download', 'pinterest_bulk_with_media_urls.csv');
    document.body.appendChild(csvLink);
    csvLink.click();
    document.body.removeChild(csvLink);
    URL.revokeObjectURL(csvLink.href);

    handleResetBulkGeneration();
  };
  
  const handleImportSettings = (data: BackupData) => {
    if (data.adminSettings) {
        setAdminSettings(data.adminSettings);
    }
    // Only import OpenRouter API key, others are image specific
    if (typeof data.openRouterApiKey === 'string') {
        setOpenRouterApiKey(data.openRouterApiKey);
    }
    if (typeof data.falAiApiKey === 'string') {
        setFalAiApiKey(data.falAiApiKey);
    }
    if (typeof data.apiframeApiKey === 'string') {
        setApiframeApiKey(data.apiframeApiKey);
    }
    if (typeof data.midapiApiKey === 'string') {
        setMidapiApiKey(data.midapiApiKey);
    }
    if (typeof data.imagineApiKey === 'string') {
        setImagineApiKey(data.imagineApiKey);
    }
    if (typeof data.useapiApiKey === 'string') {
        setUseapiApiKey(data.useapiApiKey);
    }
    if (Array.isArray(data.pinterestAccounts)) {
        setPinterestAccounts(data.pinterestAccounts);
    }
    alert('Settings imported successfully!');
  };

  const allData: BackupData = {
    adminSettings,
    openRouterApiKey,
    falAiApiKey,
    apiframeApiKey,
    midapiApiKey,
    imagineApiKey,
    useapiApiKey,
    pinterestAccounts,
  };

  const controlProps = {
    data: templateData,
    onFieldChange: handleFieldChange,
    onImageUpload: handleImageUpload,
    onGenerateImage: handleGenerateImage,
    onGenerateImageWithMidjourney: handleGenerateImageWithMidjourney,
    onGenerateImageWithMidApiAi: handleGenerateImageWithMidApiAi,
    onGenerateImageWithImagineApi: handleGenerateImageWithImagineApi,
    onGenerateImageWithUseApi: handleGenerateImageWithUseApi,
    onGenerateDescription: handleGenerateDescription,
    onGenerateKeywords: handleGenerateKeywords,
    onGenerateShortTitle: handleGenerateShortTitle,
    onDownload: handleDownload,
    isLoading: isLoading,
    isGeneratingImage: isGeneratingImage,
    isGeneratingMidjourneyImage: isGeneratingMidjourneyImage,
    isGeneratingMidjourney2Image: isGeneratingMidjourney2Image,
    isGeneratingImagineImage: isGeneratingImagineImage,
    isGeneratingUseApiImage: isGeneratingUseApiImage,
    isGeneratingDescription: isGeneratingDescription,
    isGeneratingKeywords: isGeneratingKeywords,
    isGeneratingShortTitle: isGeneratingShortTitle,
    onCsvUpload: handleCsvUpload,
    onNextRow: handleNextRow,
    onPrevRow: handlePrevRow,
    csvData: csvData,
    currentRowIndex: currentRowIndex,
    onBulkGeneration: handleBulkGeneration,
    isBulkGenerating: isBulkGenerating,
    bulkMessage: bulkMessage,
    apiError: apiError,
    generatedAssets: generatedAssets,
    onDownloadGeneratedAssets: handleDownloadGeneratedAssets,
    lastCompletedRowIndex: lastCompletedRowIndex,
    onResetBulkGeneration: handleResetBulkGeneration,
    onSetFalAiApiKey: setFalAiApiKey,
    falAiApiKey: falAiApiKey,
    apiframeApiKey: apiframeApiKey,
    onSetApiframeApiKey: setApiframeApiKey,
    midapiApiKey: midapiApiKey,
    onSetMidapiApiKey: setMidapiApiKey,
    imagineApiKey: imagineApiKey,
    onSetImagineApiKey: setImagineApiKey,
    useapiApiKey: useapiApiKey,
    onSetUseapiApiKey: setUseapiApiKey,
    bulkJobType: bulkJobType,
    openRouterApiKey: openRouterApiKey, // Pass OpenRouter key for text AI
    onSetOpenRouterApiKey: setOpenRouterApiKey, // Pass setter for OpenRouter key
  };
  
  const renderPage = () => {
    switch(page) {
        case 'about':
            return <AboutPage content={adminSettings.aboutPageContent} />;
        case 'privacy':
            return <PrivacyPolicyPage content={adminSettings.privacyPageContent} />;
        case 'terms':
            return <TermsOfServicePage content={adminSettings.termsPageContent} />;
        case 'how-to-use':
            return <HowToUsePage content={adminSettings.howToUsePageContent} />;
        case 'contact':
            return <ContactPage content={adminSettings.contactPageContent} />;
        case 'content-generator':
            return <ContentGeneratorPage
                        openRouterApiKey={openRouterApiKey}
                        onSetOpenRouterApiKey={setOpenRouterApiKey}
                        textModel={templateData.textModel}
                        adminSettings={adminSettings}
                    />;
        case 'assistant':
             return <AssistantPage
                        accounts={pinterestAccounts}
                        setAccounts={setPinterestAccounts}
                        openRouterApiKey={openRouterApiKey}
                        textModel={templateData.textModel}
                    />;
        case 'domain-suggestor':
            return <DNRaterPage />;
        case 'author':
            return <AuthorPage />;
        case 'facebook-page-builder':
            return <FacebookPageBuilderPage
                        openRouterApiKey={openRouterApiKey}
                        onSetOpenRouterApiKey={setOpenRouterApiKey}
                        textModel={templateData.textModel}
                    />;
        case 'quote-generator':
            return <QuoteGeneratorPage
                        openRouterApiKey={openRouterApiKey}
                        onSetOpenRouterApiKey={setOpenRouterApiKey}
                        useapiApiKey={useapiApiKey}
                        onSetUseapiApiKey={setUseapiApiKey}
                        textModel={templateData.textModel}
                    />;
        case 'admin':
            return <AdminPage 
                        isAdminLoggedIn={isAdminLoggedIn}
                        setIsAdminLoggedIn={setIsAdminLoggedIn}
                        settings={adminSettings}
                        setSettings={setAdminSettings}
                        allData={allData}
                        onImportSettings={handleImportSettings}
                    />;
        case 'welcome':
             return <HomePage />;
        case 'facebook-post-generator':
            return <FacebookPostGeneratorPage
                        falAiApiKey={falAiApiKey}
                        onSetFalAiApiKey={setFalAiApiKey}
                        useapiApiKey={useapiApiKey}
                        onSetUseapiApiKey={setUseapiApiKey}
                        openRouterApiKey={openRouterApiKey}
                        onSetOpenRouterApiKey={setOpenRouterApiKey}
                        textModel={templateData.textModel}
                    />;
        case 'rewrite-title-description':
            return <DescriptionRewritePage 
                        openRouterApiKey={openRouterApiKey}
                        onSetOpenRouterApiKey={setOpenRouterApiKey}
                        adminSettings={adminSettings}
                    />;
        case 'pin-generator':
        default:
             return <GeneratorInterface controlProps={controlProps} previewRef={previewRef} templateData={templateData} apiError={apiError} />;
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