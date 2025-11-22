
import React, { useCallback, useRef, useEffect, useState } from 'react';
import type { TemplateData, CsvRow, AdminSettings, BackupData, PinterestAccount } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import AboutPage from './components/pages/AboutPage';
import PrivacyPolicyPage from './components/pages/PrivacyPolicyPage';
import TermsOfServicePage from './components/pages/TermsOfServicePage';
import AdminPage from './components/pages/AdminPage';
import AdBanner from './components/AdBanner';
import { generateImage, generatePlaceholderImage, generateDescription, generatePlaceholderDescription, generateKeywords, generatePlaceholderKeywords, generateShortTitle, DEFAULT_CONTENT_PROMPT, generateImageWithMidjourney, generateSafeImagePrompt, generateImageWithMidApiAi, generateImageWithImagineApi, generateImageWithUseApi } from './services/googleAi';
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

  // --- Generic Image Generator Wrapper ---
  const handleGenerateImageGeneric = async (
      imageNumber: 1 | 2 | 3,
      generatorType: 'fal' | 'apiframe' | 'midapi' | 'imagine' | 'useapi',
      throwOnError: boolean = false,
      overridePrompt?: string
  ) => {
        const csvImagePrompt = currentRowIndex !== null && csvData[currentRowIndex]?.imagePrompt ? csvData[currentRowIndex].imagePrompt : null;
        const userPrompt = overridePrompt || (csvImagePrompt && csvImagePrompt.trim() ? csvImagePrompt : null) || templateData.title;

        if (!userPrompt) {
            const msg = 'Please enter a Title or have an Image Prompt in your CSV.';
            if (throwOnError) throw new Error(msg);
            setApiError({ type: 'generic', message: msg });
            return;
        }

        // Set specific loading state
        if (generatorType === 'fal') setIsGeneratingImage(prev => ({ ...prev, [imageNumber]: true }));
        if (generatorType === 'apiframe') setIsGeneratingMidjourneyImage(prev => ({ ...prev, [imageNumber]: true }));
        if (generatorType === 'midapi') setIsGeneratingMidjourney2Image(prev => ({ ...prev, [imageNumber]: true }));
        if (generatorType === 'imagine') setIsGeneratingImagineImage(prev => ({ ...prev, [imageNumber]: true }));
        if (generatorType === 'useapi') setIsGeneratingUseApiImage(prev => ({ ...prev, [imageNumber]: true }));
        
        setApiError(null);

        try {
            let imageUrl: string | string[] = '';
            const aspectRatio = templateData.imageAspectRatio;

            if (generatorType === 'fal' && falAiApiKey) {
                imageUrl = await generateImage(falAiApiKey, templateData.imageModel, userPrompt, aspectRatio);
            } else if (generatorType === 'apiframe' && apiframeApiKey) {
                const results = await generateImageWithMidjourney(apiframeApiKey, userPrompt, aspectRatio);
                imageUrl = results[0] || '';
            } else if (generatorType === 'midapi' && midapiApiKey) {
                const results = await generateImageWithMidApiAi(midapiApiKey, userPrompt, aspectRatio);
                imageUrl = results[0] || '';
            } else if (generatorType === 'imagine' && imagineApiKey) {
                const results = await generateImageWithImagineApi(imagineApiKey, userPrompt, aspectRatio);
                imageUrl = results[0] || '';
            } else if (generatorType === 'useapi' && useapiApiKey) {
                const results = await generateImageWithUseApi(useapiApiKey, userPrompt, aspectRatio);
                imageUrl = results[0] || '';
            } else {
                // Fallback
                imageUrl = await generatePlaceholderImage(userPrompt, aspectRatio);
            }

            const finalUrl = Array.isArray(imageUrl) ? imageUrl[0] : imageUrl;
            if (finalUrl) {
                const field = `backgroundImage${imageNumber === 1 ? '' : imageNumber}` as any;
                setImageData(prev => ({ ...prev, [field]: finalUrl }));
            } else {
                throw new Error("No image returned.");
            }

        } catch (error: any) {
            console.error(`Error generating image (${generatorType}):`, error);
            if (throwOnError) throw error;
            setApiError({ type: error.type || 'generic', message: error.message || 'Failed to generate image.' });
        } finally {
            if (generatorType === 'fal') setIsGeneratingImage(prev => ({ ...prev, [imageNumber]: false }));
            if (generatorType === 'apiframe') setIsGeneratingMidjourneyImage(prev => ({ ...prev, [imageNumber]: false }));
            if (generatorType === 'midapi') setIsGeneratingMidjourney2Image(prev => ({ ...prev, [imageNumber]: false }));
            if (generatorType === 'imagine') setIsGeneratingImagineImage(prev => ({ ...prev, [imageNumber]: false }));
            if (generatorType === 'useapi') setIsGeneratingUseApiImage(prev => ({ ...prev, [imageNumber]: false }));
        }
  };

  const handleGenerateImage = (n: 1|2|3) => handleGenerateImageGeneric(n, 'fal');
  const handleGenerateImageWithMidjourney = (n: 1|2|3) => handleGenerateImageGeneric(n, 'apiframe');
  const handleGenerateImageWithMidApiAi = (n: 1|2|3) => handleGenerateImageGeneric(n, 'midapi');
  const handleGenerateImageWithImagineApi = (n: 1|2|3) => handleGenerateImageGeneric(n, 'imagine');
  const handleGenerateImageWithUseApi = (n: 1|2|3) => handleGenerateImageGeneric(n, 'useapi');

  const handleGenerateDescription = async () => {
        if (!templateData.title) { setApiError({type: 'generic', message: "Please enter a title first."}); return; }
        setIsGeneratingDescription(true);
        try {
            const desc = await generateDescription(userApiKey, templateData.textModel, templateData.title, templateData.keywords);
            setPersistedData(prev => ({ ...prev, description: desc }));
        } catch (e) { console.error(e); } finally { setIsGeneratingDescription(false); }
  };

  const handleGenerateKeywords = async () => {
        if (!templateData.title) { setApiError({type: 'generic', message: "Please enter a title first."}); return; }
        setIsGeneratingKeywords(true);
        try {
            const keys = await generateKeywords(userApiKey, templateData.textModel, templateData.title);
            setPersistedData(prev => ({ ...prev, keywords: keys }));
        } catch (e) { console.error(e); } finally { setIsGeneratingKeywords(false); }
  };

  const handleGenerateShortTitle = async () => {
        if (!templateData.title) { setApiError({type: 'generic', message: "Please enter a title first."}); return; }
        setIsGeneratingShortTitle(true);
        try {
            const short = await generateShortTitle(userApiKey, templateData.textModel, templateData.title);
            setPersistedData(prev => ({ ...prev, title: short }));
        } catch (e) { console.error(e); } finally { setIsGeneratingShortTitle(false); }
  };

  const handleDownload = useCallback(async () => {
    if (!previewRef.current) return;
    setIsLoading(true);
    try {
      const dataUrl = await window.htmlToImage.toPng(previewRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `pin-${templateData.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download error', err);
      setApiError({ type: 'generic', message: "Failed to download image. Try again." });
    } finally {
      setIsLoading(false);
    }
  }, [templateData.title]);

  const handleCsvUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
        if (lines.length < 2) return;

        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
        setOriginalCsvHeaders(lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '')));
        
        const dataStartIndex = 1;
        const parsedFullData: {[key: string]: string}[] = [];

        const rows = lines.slice(dataStartIndex).map(line => {
            // Simple CSV parser handling quoted fields
            const values: string[] = [];
            let current = '';
            let inQuotes = false;
            for(let i=0; i<line.length; i++){
                if(line[i] === '"' && line[i+1] === '"') { current += '"'; i++; }
                else if(line[i] === '"') { inQuotes = !inQuotes; }
                else if(line[i] === ',' && !inQuotes) { values.push(current); current = ''; }
                else { current += line[i]; }
            }
            values.push(current);

            const rowData: {[key: string]: string} = {};
            headers.forEach((h, i) => {
                rowData[h] = values[i]?.trim() || ''; 
            });
            
            const rawRowData: {[key: string]: string} = {};
            lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '')).forEach((h, i) => {
                rawRowData[h] = values[i]?.trim() || '';
            });
            parsedFullData.push(rawRowData);

            return {
                title: rowData['title'] || rowData['headline'] || '',
                website: rowData['website'] || rowData['link'] || rowData['url'] || '',
                board: rowData['board'] || rowData['pinterest board'] || '',
                description: rowData['description'] || rowData['pin description'] || '',
                keywords: rowData['keywords'] || rowData['tags'] || '',
                imagePrompt: rowData['image prompt'] || rowData['image_prompt'] || rowData['prompt'] || '',
            };
        });

        setFullCsvData(parsedFullData);
        setCsvData(rows);
        setCurrentRowIndex(0);
        setLastCompletedRowIndex(null);
        setGeneratedAssets(null);
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

  // --- BULK GENERATION LOGIC ---
  const handleBulkGeneration = async (imageGeneratorType: 'fal' | 'midjourney' | 'midjourney2' | 'imagine' | 'useapi', resume: boolean = false) => {
    if (csvData.length === 0) return;
    
    setIsBulkGenerating(true);
    setBulkJobType(imageGeneratorType);
    setApiError(null);
    
    if (!zipRef.current) {
        zipRef.current = new window.JSZip();
    }
    
    const zip = zipRef.current;
    const pinsFolder = zip.folder("pins");
    
    let startIndex = 0;
    if (resume && lastCompletedRowIndex !== null) {
        startIndex = lastCompletedRowIndex + 1;
    } else {
        setInProgressCsvData([]); 
    }

    const updatedCsvData = resume ? [...inProgressCsvData] : [];

    try {
        for (let i = startIndex; i < csvData.length; i++) {
            setCurrentRowIndex(i);
            setBulkMessage(`Processing row ${i + 1} of ${csvData.length}...`);
            await sleep(300); // Wait for state to update UI

            const row = csvData[i];
            let description = row.description;
            let keywords = row.keywords;
            
            // Auto-generate text if missing
            if (!description && userApiKey) {
                try { description = await generateDescription(userApiKey, templateData.textModel, row.title, row.keywords); } catch(e) {}
                setPersistedData(prev => ({ ...prev, description })); 
            }
            if (!keywords && userApiKey) {
                try { keywords = await generateKeywords(userApiKey, templateData.textModel, row.title); } catch(e) {}
                setPersistedData(prev => ({ ...prev, keywords }));
            }

            await sleep(200);

            const imagePrompt = row.imagePrompt || row.title;
            
            // Determine how many images are needed based on template
            const needsImage2 = ['1', '3', '6', '13', '19', '20', '21', '22', '23', '27', '28', '34', '35', '37', '38', '39', '40', '41', '42', '44', '45', '46', '47', '48', '49', '50', '51'].includes(templateData.templateId);
            const needsImage3 = ['6', '19', '21', '28'].includes(templateData.templateId);
            const imagesNeeded = 1 + (needsImage2 ? 1 : 0) + (needsImage3 ? 1 : 0);

            try {
                const safePrompt = await generateSafeImagePrompt(userApiKey, templateData.textModel, imagePrompt);
                
                for(let imgIdx=1; imgIdx<=imagesNeeded; imgIdx++) {
                    let url = '';
                    if (imageGeneratorType === 'fal' && falAiApiKey) {
                        url = await generateImage(falAiApiKey, templateData.imageModel, safePrompt, templateData.imageAspectRatio);
                    } else if (imageGeneratorType === 'useapi' && useapiApiKey) {
                        const res = await generateImageWithUseApi(useapiApiKey, safePrompt, templateData.imageAspectRatio);
                        url = res[0] || '';
                    } else if (imageGeneratorType === 'midjourney' && apiframeApiKey) {
                        const res = await generateImageWithMidjourney(apiframeApiKey, safePrompt, templateData.imageAspectRatio);
                        url = res[0] || '';
                    } else if (imageGeneratorType === 'midjourney2' && midapiApiKey) {
                        const res = await generateImageWithMidApiAi(midapiApiKey, safePrompt, templateData.imageAspectRatio);
                        url = res[0] || '';
                    } else if (imageGeneratorType === 'imagine' && imagineApiKey) {
                        const res = await generateImageWithImagineApi(imagineApiKey, safePrompt, templateData.imageAspectRatio);
                        url = res[0] || '';
                    } else {
                        url = await generatePlaceholderImage(safePrompt, templateData.imageAspectRatio);
                    }
                    
                    if(url) {
                        const field = `backgroundImage${imgIdx === 1 ? '' : imgIdx}` as any;
                        setImageData(prev => ({ ...prev, [field]: url }));
                    }
                }
            } catch (err: any) {
                console.error("Bulk image gen error:", err);
                if (err.message && err.message.includes('quota')) throw err;
            }

            await sleep(3000); // Wait for images to render

            if (previewRef.current) {
                const blob = await window.htmlToImage.toBlob(previewRef.current, { cacheBust: true, pixelRatio: 2 });
                if (blob) {
                    const fileName = `pin-${i+1}-${row.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`;
                    pinsFolder.file(fileName, blob);
                    
                    const currentRowFull = fullCsvData[i] || {};
                    const csvRowOutput = { ...currentRowFull };
                    const startDate = new Date(templateData.startDate);
                    const publishDate = new Date(startDate);
                    publishDate.setDate(startDate.getDate() + Math.floor(i / templateData.pinsPerDay));
                    
                    csvRowOutput['Description'] = description;
                    csvRowOutput['Keywords'] = keywords;
                    csvRowOutput['Image URL'] = `${templateData.mediaUrlPrefix.replace(/\/$/, '')}/${fileName}`;
                    csvRowOutput['Publish Date'] = publishDate.toISOString().split('T')[0];
                    
                    updatedCsvData.push(csvRowOutput);
                    setInProgressCsvData([...updatedCsvData]);
                    setLastCompletedRowIndex(i);
                }
            }
        }

        const zipContent = await zip.generateAsync({ type: "blob" });
        const allHeaders = new Set<string>();
        updatedCsvData.forEach(r => Object.keys(r).forEach(k => allHeaders.add(k)));
        const csvHeaderArr = Array.from(allHeaders);
        const csvString = [
            csvHeaderArr.join(','),
            ...updatedCsvData.map(r => csvHeaderArr.map(h => {
                const val = r[h] || '';
                return `"${val.replace(/"/g, '""')}"`;
            }).join(','))
        ].join('\r\n');
        const csvBlob = new Blob([csvString], { type: 'text/csv' });

        setGeneratedAssets({ zip: zipContent, csv: csvBlob });
        setBulkMessage('Generation Complete! Download your files below.');
        setLastCompletedRowIndex(null);

    } catch (error: any) {
        console.error("Bulk generation stopped:", error);
        setBulkMessage(`Stopped at row ${currentRowIndex ? currentRowIndex + 1 : 0} due to error: ${error.message}`);
        if (error.message && (error.message.includes('429') || error.message.includes('quota'))) {
            setApiError({ type: 'quota', message: "API Limit Reached. Wait and click 'Resume' below.", helpLink: error.helpLink });
        } else {
            setApiError({ type: 'generic', message: error.message });
        }
    } finally {
        setIsBulkGenerating(false);
    }
  };

  const handleDownloadGeneratedAssets = () => {
    if (!generatedAssets) return;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(generatedAssets.zip);
    link.download = `pins-batch-${new Date().toISOString().split('T')[0]}.zip`;
    link.click();
    
    const csvLink = document.createElement('a');
    csvLink.href = URL.createObjectURL(generatedAssets.csv);
    csvLink.download = `pins-schedule-${new Date().toISOString().split('T')[0]}.csv`;
    csvLink.click();
  };

  const handleImportSettings = (data: BackupData) => {
    if (data.adminSettings) setAdminSettings(data.adminSettings);
    if (data.googleAiApiKey) setUserApiKey(data.googleAiApiKey);
    if (data.falAiApiKey) setFalAiApiKey(data.falAiApiKey);
    if (data.apiframeApiKey) setApiframeApiKey(data.apiframeApiKey);
    if (data.midapiApiKey) setMidapiApiKey(data.midapiApiKey);
    if (data.openRouterApiKey) setOpenRouterApiKey(data.openRouterApiKey);
    if (data.imagineApiKey) setImagineApiKey(data.imagineApiKey);
    if (data.useapiApiKey) setUseapiApiKey(data.useapiApiKey);
    if (data.pinterestAccounts) setPinterestAccounts(data.pinterestAccounts);
    alert('Settings imported successfully!');
  };

  const allData: BackupData = {
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

  const controlProps: any = {
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
      bulkJobType,
  };
  
  const renderPage = () => {
    switch(page) {
        case 'rewrite-title-description':
            return <DescriptionRewritePage 
                        openRouterApiKey={openRouterApiKey}
                        onSetOpenRouterApiKey={setOpenRouterApiKey}
                    />;
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
                        userApiKey={userApiKey}
                        onSetUserApiKey={setUserApiKey}
                        openRouterApiKey={openRouterApiKey}
                        onSetOpenRouterApiKey={setOpenRouterApiKey}
                        textModel={templateData.textModel}
                        adminSettings={adminSettings}
                    />;
        case 'assistant':
             return <AssistantPage
                        accounts={pinterestAccounts}
                        setAccounts={setPinterestAccounts}
                        userApiKey={userApiKey}
                        textModel={templateData.textModel}
                    />;
        case 'domain-suggestor':
            return <DNRaterPage />;
        case 'author':
            return <AuthorPage />;
        case 'facebook-page-builder':
            return <FacebookPageBuilderPage
                        userApiKey={userApiKey}
                        onSetUserApiKey={setUserApiKey}
                        textModel={templateData.textModel}
                    />;
        case 'quote-generator':
            return <QuoteGeneratorPage
                        userApiKey={userApiKey}
                        onSetUserApiKey={setUserApiKey}
                        useapiApiKey={useapiApiKey}
                        onSetUseapiApiKey={setUseapiApiKey}
                        openRouterApiKey={openRouterApiKey}
                        onSetOpenRouterApiKey={setOpenRouterApiKey}
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
                        userApiKey={userApiKey}
                        onSetUserApiKey={setUserApiKey}
                        falAiApiKey={falAiApiKey}
                        onSetFalAiApiKey={setFalAiApiKey}
                        useapiApiKey={useapiApiKey}
                        onSetUseapiApiKey={setUseapiApiKey}
                        openRouterApiKey={openRouterApiKey}
                        onSetOpenRouterApiKey={setOpenRouterApiKey}
                        textModel={templateData.textModel}
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
