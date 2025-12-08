




import React, { useCallback, useRef, useEffect, useState } from 'react';
import type { TemplateData, CsvRow, AdminSettings, BackupData, PinterestAccount, CustomTheme } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import AboutPage from './components/pages/AboutPage';
import PrivacyPolicyPage from './components/pages/PrivacyPolicyPage';
import TermsOfServicePage from './components/pages/TermsOfServicePage';
import AdminPage from './components/pages/AdminPage';
import AdBanner from './components/AdBanner';
import { 
    generateImage, 
    generatePlaceholderImage, 
    generateDescription, 
    generatePlaceholderDescription, 
    generateKeywords, 
    generatePlaceholderKeywords, 
    generateShortTitle, 
    DEFAULT_CONTENT_PROMPT, 
    generateImageWithMidjourney,
    generateImageWithMidApiAi,
    generateImageWithImagineApi,
    generateImageWithUseApi,
    generateSafeImagePrompt
} from './services/googleAi';
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
import FacebookPostGeneratorPage from './components/pages/FacebookPostGeneratorPage';
import FacebookPageBuilderPage from './components/pages/FacebookPageBuilderPage';
import QuoteGeneratorPage from './components/pages/QuoteGeneratorPage';
import DescriptionRewritePage from './components/pages/DescriptionRewritePage';
import TemplateCustomizerPage from './components/pages/TemplateCustomizerPage';

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
  return hash || 'template-customizer';
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
    startDate: new Date().toISOString().split('T')[0],
    imageModel: 'fal-ai/recraft/v3/text-to-image',
    textModel: 'gemini-2.5-flash',
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

const DEFAULT_THEME: CustomTheme = {
    primaryColor: '#F472B6',
    textColor: '#334155',
    titleFont: "'Playfair Display', serif",
    bodyFont: "'Poppins', sans-serif",
};

const App: React.FC = () => {
  const [persistedData, setPersistedData] = useLocalStorage<PersistedData>('templateData', initialPersistedData);
  const [imageData, setImageData] = useState(initialImageData);
  const templateData: TemplateData = { ...persistedData, ...imageData };

  const [userApiKey, setUserApiKey] = useLocalStorage('googleAiApiKey', '');
  const [falAiApiKey, setFalAiApiKey] = useLocalStorage('falAiApiKey', '');
  const [apiframeApiKey, setApiframeApiKey] = useLocalStorage('apiframeApiKey', '');
  const [midapiApiKey, setMidapiApiKey] = useLocalStorage('midapiApiKey', '');
  const [openRouterApiKey, setOpenRouterApiKey] = useLocalStorage('openRouterApiKey', '');
  const [imagineApiKey, setImagineApiKey] = useLocalStorage('imagineApiKey', '');
  const [useapiApiKey, setUseapiApiKey] = useLocalStorage('useapiApiKey', '');
  const [customTheme, setCustomTheme] = useLocalStorage<CustomTheme>('customTheme', DEFAULT_THEME);

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

  const handleFieldChange = useCallback((field: keyof TemplateData, value: any) => {
    if (field in initialImageData) {
      setImageData(prev => ({ ...prev, [field]: value }));
    } else {
      setPersistedData(prev => ({ ...prev, [field]: value }));
    }
  }, [setPersistedData]);

  const handleImageUpload = useCallback((file: File, imageNumber: 1 | 2 | 3) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const key = `backgroundImage${imageNumber === 1 ? '' : imageNumber}` as keyof typeof initialImageData;
      setImageData(prev => ({ ...prev, [key]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  }, []);

  const handleTextGeneration = useCallback(async (
    generationFn: (apiKey: string, model: string, title: string) => Promise<string>,
    placeholderFn: (title: string) => string,
    field: keyof TemplateData,
    loadingSetter: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (!userApiKey) {
      handleFieldChange(field, placeholderFn(templateData.title));
      return;
    }
    loadingSetter(true);
    setApiError(null);
    try {
      const result = await generationFn(userApiKey, templateData.textModel, templateData.title);
      handleFieldChange(field, result);
    } catch (err: any) {
      setApiError(err);
    } finally {
      loadingSetter(false);
    }
  }, [userApiKey, templateData.textModel, templateData.title, handleFieldChange]);

  const handleGenerateDescription = useCallback(() => handleTextGeneration(generateDescription, generatePlaceholderDescription, 'description', setIsGeneratingDescription), [handleTextGeneration]);
  const handleGenerateKeywords = useCallback(() => handleTextGeneration(generateKeywords, generatePlaceholderKeywords, 'keywords', setIsGeneratingKeywords), [handleTextGeneration]);
  const handleGenerateShortTitle = useCallback(() => handleTextGeneration(generateShortTitle, (t) => t, 'title', setIsGeneratingShortTitle), [handleTextGeneration]);

  const handleImageGeneration = useCallback(async (
    imageNumber: 1 | 2 | 3,
    generator: 'fal' | 'midjourney' | 'midjourney2' | 'imagine' | 'useapi',
    loadingSetter: React.Dispatch<React.SetStateAction<{ [key: number]: boolean }>>,
    apiKey: string,
    generationFunc: (...args: any[]) => Promise<any>,
    throwOnError: boolean = false,
    overridePrompt?: string,
    onProgressUpdate?: (message: string) => void
  ) => {
    const key = `backgroundImage${imageNumber === 1 ? '' : imageNumber}` as keyof typeof initialImageData;
    const prompt = overridePrompt || (currentRowIndex !== null && csvData[currentRowIndex]?.imagePrompt) || templateData.title;

    if (!apiKey) {
      const placeholder = await generatePlaceholderImage(prompt, templateData.imageAspectRatio);
      setImageData(prev => ({ ...prev, [key]: placeholder }));
      if (throwOnError) throw new Error("API key is missing.");
      return;
    }

    loadingSetter(prev => ({ ...prev, [imageNumber]: true }));
    if (!throwOnError) setApiError(null);

    try {
      const result = await generationFunc(apiKey, prompt, templateData.imageAspectRatio, onProgressUpdate);
      const imageUrl = Array.isArray(result) ? result[0] : result;
      setImageData(prev => ({ ...prev, [key]: imageUrl }));
    } catch (error: any) {
      console.error(`Error with ${generator}:`, error);
      let finalError = error;
      
      const isContentFilterError = error.message?.toLowerCase().includes('banned prompt');
      if (isContentFilterError) {
          try {
              if (onProgressUpdate) onProgressUpdate('Prompt was rejected. Attempting to rewrite...');
              const safePrompt = await generateSafeImagePrompt(userApiKey, templateData.textModel, prompt);
              if (onProgressUpdate) onProgressUpdate(`Retrying with new prompt: "${safePrompt}"`);
              const result = await generationFunc(apiKey, safePrompt, templateData.imageAspectRatio, onProgressUpdate);
              const imageUrl = Array.isArray(result) ? result[0] : result;
              setImageData(prev => ({ ...prev, [key]: imageUrl }));
              return;
          } catch (retryError: any) {
              finalError = retryError;
          }
      }

      if (throwOnError) throw finalError;
      setApiError(finalError);
    } finally {
      loadingSetter(prev => ({ ...prev, [imageNumber]: false }));
    }
  }, [currentRowIndex, csvData, templateData.title, templateData.imageAspectRatio, userApiKey, templateData.textModel]);

  const handleGenerateImage = (num: 1|2|3) => handleImageGeneration(num, 'fal', setIsGeneratingImage, falAiApiKey, (...args) => generateImage(args[0], templateData.imageModel, args[1], args[2]));
  const handleGenerateImageWithMidjourney = (num: 1|2|3) => handleImageGeneration(num, 'midjourney', setIsGeneratingMidjourneyImage, apiframeApiKey, generateImageWithMidjourney);
  const handleGenerateImageWithMidApiAi = (num: 1|2|3, throwOnError?: boolean, overridePrompt?: string, onProgressUpdate?: (msg: string) => void) => handleImageGeneration(num, 'midjourney2', setIsGeneratingMidjourney2Image, midapiApiKey, generateImageWithMidApiAi, throwOnError, overridePrompt, onProgressUpdate);
  const handleGenerateImageWithImagineApi = (num: 1|2|3, throwOnError?: boolean, overridePrompt?: string, onProgressUpdate?: (msg: string) => void) => handleImageGeneration(num, 'imagine', setIsGeneratingImagineImage, imagineApiKey, generateImageWithImagineApi, throwOnError, overridePrompt, onProgressUpdate);
  const handleGenerateImageWithUseApi = (num: 1|2|3, throwOnError?: boolean, overridePrompt?: string, onProgressUpdate?: (msg: string) => void) => handleImageGeneration(num, 'useapi', setIsGeneratingUseApiImage, useapiApiKey, generateImageWithUseApi, throwOnError, overridePrompt, onProgressUpdate);
  
  const handleDownload = useCallback(() => {
    if (!previewRef.current) return;
    setIsLoading(true);
    setApiError(null);
    window.htmlToImage.toPng(previewRef.current, { cacheBust: true, pixelRatio: 2 })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `${templateData.title.replace(/ /g, '_')}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('oops, something went wrong!', err);
        setApiError({ type: 'generic', message: 'Could not generate image. If using an AI image, it might be blocked by browser security (CORS). Try another image source.' });
      })
      .finally(() => setIsLoading(false));
  }, [templateData.title]);

  const handleCsvUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        setOriginalCsvHeaders(lines[0].split(',').map(h => h.trim()));

        const rows = lines.slice(1).map(line => {
            const values = line.split(',');
            const rowData: { [key: string]: string } = {};
            headers.forEach((header, index) => {
                rowData[header] = values[index]?.trim() || '';
            });
            return rowData;
        });

        // FIX: Add 'website' to mappedRows to satisfy CsvRow type.
        const mappedRows: CsvRow[] = rows.map(row => ({
            title: row['title'] || row['title of recipes'] || '',
            website: row['website'] || row['link'] || persistedData.website,
            description: row['description'] || '',
            keywords: row['keywords'] || '',
            board: row['pinterest board'] || '',
            imagePrompt: row['image prompt'] || row['image_prompt'] || ''
        }));
        
        setFullCsvData(rows);
        setCsvData(mappedRows);
        setCurrentRowIndex(0);
    };
    reader.readAsText(file);
  }, [persistedData.website]);

  const handleNextRow = () => setCurrentRowIndex(prev => (prev === null || prev >= csvData.length - 1) ? prev : prev + 1);
  const handlePrevRow = () => setCurrentRowIndex(prev => (prev === null || prev <= 0) ? prev : prev - 1);

  const handleBulkGeneration = useCallback(async (imageGenerator: 'fal' | 'midjourney' | 'midjourney2' | 'imagine' | 'useapi', resume: boolean) => {
    if (csvData.length === 0) return;
    
    setIsBulkGenerating(true);
    setApiError(null);
    setGeneratedAssets(null);
    setBulkJobType(imageGenerator);

    if (!resume) {
        handleResetBulkGeneration();
        zipRef.current = new window.JSZip();
        setInProgressCsvData(fullCsvData);
    }

    const startIndex = resume && lastCompletedRowIndex !== null ? lastCompletedRowIndex + 1 : 0;

    for (let i = startIndex; i < csvData.length; i++) {
        const row = csvData[i];
        setBulkMessage(`Processing row ${i + 1}/${csvData.length}: ${row.title}`);
        setCurrentRowIndex(i);
        
        try {
            // Wait for state to update
            await new Promise(resolve => setTimeout(resolve, 100));
            
            let currentDescription = row.description;
            if (!currentDescription && userApiKey) {
                setBulkMessage(`Generating description for "${row.title}"...`);
                currentDescription = await generateDescription(userApiKey, templateData.textModel, row.title);
            }
            
            let currentKeywords = row.keywords;
            if (!currentKeywords && userApiKey) {
                setBulkMessage(`Generating keywords for "${row.title}"...`);
                currentKeywords = await generateKeywords(userApiKey, templateData.textModel, row.title);
            }
            
            const imagePrompt = row.imagePrompt || row.title;
            const needsImage2 = ['2', '4', '7', '11', '13', '15', '16', '19', '22', '23', '29', '31', '32', '34', '35', '36', '38', '39', '40', '41', '42', '43', '48', '49', '50', '51', '53', '56'].includes(templateData.templateId);
            const needsImage3 = ['7', '15', '19', '22', '56'].includes(templateData.templateId);

            const imageGenFunc = {
                'fal': (num: 1|2|3) => handleImageGeneration(num, 'fal', setIsGeneratingImage, falAiApiKey, (...args) => generateImage(args[0], templateData.imageModel, args[1], args[2]), true, imagePrompt, (msg) => setBulkMessage(msg)),
                'midjourney': (num: 1|2|3) => handleImageGeneration(num, 'midjourney', setIsGeneratingMidjourneyImage, apiframeApiKey, generateImageWithMidjourney, true, imagePrompt, (msg) => setBulkMessage(msg)),
                'midjourney2': (num: 1|2|3) => handleImageGeneration(num, 'midjourney2', setIsGeneratingMidjourney2Image, midapiApiKey, generateImageWithMidApiAi, true, imagePrompt, (msg) => setBulkMessage(msg)),
                'imagine': (num: 1|2|3) => handleImageGeneration(num, 'imagine', setIsGeneratingImagineImage, imagineApiKey, generateImageWithImagineApi, true, imagePrompt, (msg) => setBulkMessage(msg)),
                'useapi': (num: 1|2|3) => handleImageGeneration(num, 'useapi', setIsGeneratingUseApiImage, useapiApiKey, generateImageWithUseApi, true, imagePrompt, (msg) => setBulkMessage(msg)),
            }[imageGenerator];
            
            setBulkMessage(`Generating image 1 for "${row.title}"...`);
            await imageGenFunc(1);
            if (needsImage2) {
                setBulkMessage(`Generating image 2 for "${row.title}"...`);
                await imageGenFunc(2);
            }
            if (needsImage3) {
                setBulkMessage(`Generating image 3 for "${row.title}"...`);
                await imageGenFunc(3);
            }

            // Wait for image to render
            await new Promise(resolve => setTimeout(resolve, 500));
            
            if (previewRef.current) {
                setBulkMessage(`Creating pin for "${row.title}"...`);
                const blob = await window.htmlToImage.toBlob(previewRef.current, { cacheBust: true, pixelRatio: 2 });
                if (blob) {
                    const filename = `${row.title.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
                    zipRef.current.file(filename, blob);

                    const updatedCsvRow = {
                        ...inProgressCsvData[i],
                        'description': currentDescription || row.description,
                        'keywords': currentKeywords || row.keywords,
                        'media url': `${templateData.mediaUrlPrefix}${filename}`
                    };

                    const date = new Date(templateData.startDate);
                    date.setDate(date.getDate() + Math.floor(i / templateData.pinsPerDay));
                    updatedCsvRow['publish date'] = date.toISOString().split('T')[0];

                    const newInProgressData = [...inProgressCsvData];
                    newInProgressData[i] = updatedCsvRow;
                    setInProgressCsvData(newInProgressData);
                }
            }
            setLastCompletedRowIndex(i);

        } catch (err: any) {
            setApiError(err);
            setBulkMessage(`Error on row ${i + 1}: ${err.message}. Generation paused.`);
            setIsBulkGenerating(false);
            return;
        }
    }

    setBulkMessage('Finalizing files...');
    const csvContent = [originalCsvHeaders.join(','), ...inProgressCsvData.map(row => originalCsvHeaders.map(header => row[header.toLowerCase()] || '').join(','))].join('\r\n');
    const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    zipRef.current.generateAsync({ type: 'blob' }).then((zipBlob: Blob) => {
        setGeneratedAssets({ zip: zipBlob, csv: csvBlob });
        setBulkMessage('Bulk generation complete! Your files are ready to download.');
    });

    setIsBulkGenerating(false);

  }, [csvData, userApiKey, templateData, falAiApiKey, apiframeApiKey, midapiApiKey, imagineApiKey, useapiApiKey, inProgressCsvData, originalCsvHeaders, lastCompletedRowIndex, handleImageGeneration]);

  const handleDownloadGeneratedAssets = useCallback(() => {
    if (!generatedAssets) return;
    const zipUrl = URL.createObjectURL(generatedAssets.zip);
    const zipLink = document.createElement('a');
    zipLink.href = zipUrl;
    zipLink.download = 'pinterest_pins.zip';
    zipLink.click();
    URL.revokeObjectURL(zipUrl);

    const csvUrl = URL.createObjectURL(generatedAssets.csv);
    const csvLink = document.createElement('a');
    csvLink.href = csvUrl;
    csvLink.download = 'pinterest_schedule.csv';
    csvLink.click();
    URL.revokeObjectURL(csvUrl);
  }, [generatedAssets]);

  const handleImportSettings = (data: BackupData) => {
    setAdminSettings(data.adminSettings);
    setUserApiKey(data.googleAiApiKey);
    setFalAiApiKey(data.falAiApiKey);
    setApiframeApiKey(data.apiframeApiKey);
    setMidapiApiKey(data.midapiApiKey);
    setOpenRouterApiKey(data.openRouterApiKey);
    setImagineApiKey(data.imagineApiKey);
    setUseapiApiKey(data.useapiApiKey);
    setPinterestAccounts(data.pinterestAccounts);
    alert("Settings imported successfully!");
  };

  const allDataForBackup: BackupData = {
    adminSettings,
    googleAiApiKey: userApiKey,
    falAiApiKey,
    apiframeApiKey,
    midapiApiKey,
    openRouterApiKey,
    imagineApiKey,
    useapiApiKey,
    pinterestAccounts,
  };


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
    const root = document.documentElement;
    if (customTheme) {
        root.style.setProperty('--primary-color', customTheme.primaryColor);
        root.style.setProperty('--text-color', customTheme.textColor);
        root.style.setProperty('--title-font', customTheme.titleFont);
        root.style.setProperty('--body-font', customTheme.bodyFont);
    }
  }, [customTheme]);

  useEffect(() => {
    if (currentRowIndex !== null && csvData[currentRowIndex]) {
      const row = csvData[currentRowIndex];
      // FIX: Also update website from CSV row data for consistency.
      setPersistedData(prev => ({
        ...prev,
        title: row.title || 'Your Title Here',
        description: row.description || '',
        keywords: row.keywords || '',
        board: row.board || prev.board,
        website: row.website || prev.website,
      }));
      setImageData(initialImageData);
    }
  }, [currentRowIndex, csvData, setPersistedData]);
  
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
      isLoading,
      isGeneratingImage,
      isGeneratingMidjourneyImage,
      isGeneratingMidjourney2Image,
      isGeneratingImagineImage,
      isGeneratingUseApiImage,
      isGeneratingDescription,
      isGeneratingKeywords,
      isGeneratingShortTitle,
      onCsvUpload: handleCsvUpload,
      onNextRow: handleNextRow,
      onPrevRow: handlePrevRow,
      csvData,
      currentRowIndex,
      onBulkGeneration: handleBulkGeneration,
      isBulkGenerating,
      bulkMessage,
      apiError,
      generatedAssets,
      // FIX: Correctly assign handleDownloadGeneratedAssets to onDownloadGeneratedAssets prop.
      onDownloadGeneratedAssets: handleDownloadGeneratedAssets,
      lastCompletedRowIndex,
      onResetBulkGeneration: handleResetBulkGeneration,
      userApiKey,
      onSetUserApiKey: setUserApiKey,
      falAiApiKey,
      onSetFalAiApiKey: setFalAiApiKey,
      apiframeApiKey,
      onSetApiframeApiKey: setApiframeApiKey,
      midapiApiKey,
      onSetMidapiApiKey: setMidapiApiKey,
      imagineApiKey,
      onSetImagineApiKey: setImagineApiKey,
      useapiApiKey,
      onSetUseapiApiKey: setUseapiApiKey,
      bulkJobType
  };

  const welcomePages = ['welcome', '', undefined];

  return (
    <>
      <Header />
      <main className="py-8 px-4 md:px-8">
        <AdBanner adScript={adminSettings.adScript} />
        {welcomePages.includes(page) && <HomePage />}
        {page === 'pin-generator' && (
          <GeneratorInterface
            controlProps={controlProps}
            previewRef={previewRef}
            templateData={templateData}
            apiError={apiError}
          />
        )}
        {page === 'how-to-use' && <HowToUsePage content={adminSettings.howToUsePageContent} />}
        {page === 'content-generator' && <ContentGeneratorPage userApiKey={userApiKey} onSetUserApiKey={setUserApiKey} openRouterApiKey={openRouterApiKey} onSetOpenRouterApiKey={setOpenRouterApiKey} textModel={persistedData.textModel} adminSettings={adminSettings}/>}
        {page === 'assistant' && <AssistantPage accounts={pinterestAccounts} setAccounts={setPinterestAccounts} userApiKey={userApiKey} textModel={persistedData.textModel} />}
        {page === 'domain-suggestor' && <DNRaterPage />}
        {page === 'author' && <AuthorPage />}
        {page === 'facebook-post-generator' && <FacebookPostGeneratorPage userApiKey={userApiKey} onSetUserApiKey={setUserApiKey} falAiApiKey={falAiApiKey} onSetFalAiApiKey={setFalAiApiKey} useapiApiKey={useapiApiKey} onSetUseapiApiKey={setUseapiApiKey} openRouterApiKey={openRouterApiKey} onSetOpenRouterApiKey={setOpenRouterApiKey} textModel={persistedData.textModel}/>}
        {page === 'facebook-page-builder' && <FacebookPageBuilderPage userApiKey={userApiKey} onSetUserApiKey={setUserApiKey} textModel={persistedData.textModel} />}
        {page === 'quote-generator' && <QuoteGeneratorPage userApiKey={userApiKey} onSetUserApiKey={setUserApiKey} useapiApiKey={useapiApiKey} onSetUseapiApiKey={setUseapiApiKey} openRouterApiKey={openRouterApiKey} onSetOpenRouterApiKey={setOpenRouterApiKey} textModel={persistedData.textModel} />}
        {page === 'rewrite-title-description' && <DescriptionRewritePage openRouterApiKey={openRouterApiKey} onSetOpenRouterApiKey={setOpenRouterApiKey} adminSettings={adminSettings} />}
        {page === 'template-customizer' && <TemplateCustomizerPage />}

        {page === 'about' && <AboutPage content={adminSettings.aboutPageContent} />}
        {page === 'contact' && <ContactPage content={adminSettings.contactPageContent} />}
        {page === 'privacy' && <PrivacyPolicyPage content={adminSettings.privacyPageContent} />}
        {page === 'terms' && <TermsOfServicePage content={adminSettings.termsPageContent} />}
        {/* FIX: Cannot find name 'setSettings'. Use 'setAdminSettings' instead. */}
        {page === 'admin' && <AdminPage isAdminLoggedIn={isAdminLoggedIn} setIsAdminLoggedIn={setIsAdminLoggedIn} settings={adminSettings} setSettings={setAdminSettings} allData={allDataForBackup} onImportSettings={handleImportSettings} />}
      </main>
      <Footer />
    </>
  );
};

export default App;
