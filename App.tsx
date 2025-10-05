import React, { useCallback, useRef, useEffect, useState } from 'react';
import type { TemplateData, CsvRow } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import AboutPage from './components/pages/AboutPage';
import PrivacyPolicyPage from './components/pages/PrivacyPolicyPage';
import TermsOfServicePage from './components/pages/TermsOfServicePage';
import { generateImage, generatePlaceholderImage, generateDescription, generatePlaceholderDescription, generateKeywords, generatePlaceholderKeywords } from './services/googleAi';
import useLocalStorage from './hooks/useLocalStorage';
import GeneratorInterface from './components/GeneratorInterface';

// TypeScript declaration for the CDN-loaded libraries
declare global {
  interface Window {
    htmlToImage: {
      toPng: (element: HTMLElement, options?: object) => Promise<string>;
    };
    JSZip: any;
  }
}

const getCurrentPage = () => window.location.hash.replace('#', '') || 'home';

type PersistedData = Omit<TemplateData, 'backgroundImage' | 'backgroundImage2' | 'backgroundImage3'>;

const initialPersistedData: PersistedData = {
    title: 'GARLIC HERB MOZZARELLA BITES',
    subtitle: 'QUICK & EASY APPETIZER',
    website: 'YOURWEBSITE.COM',
    templateId: 'product-spotlight',
    pinSize: 'long',
    description: 'These garlic herb mozzarella bites are the perfect easy appetizer! They\'re cheesy, flavorful, and so simple to make. Get the recipe now!',
    keywords: '',
    mediaUrlPrefix: 'http://yourwebsite.com/images/',
    pinsPerDay: 3,
    startDate: new Date().toISOString().split('T')[0],
    imageModel: 'fal-ai/stable-diffusion-v3-medium',
    textModel: 'gemini-2.5-flash',
};

const initialImageData = {
    backgroundImage: null,
    backgroundImage2: null,
    backgroundImage3: null,
};


const App: React.FC = () => {
  const [persistedData, setPersistedData] = useLocalStorage<PersistedData>('templateData', initialPersistedData);
  const [imageData, setImageData] = useState(initialImageData);
  const templateData: TemplateData = { ...persistedData, ...imageData };

  const [userApiKey, setUserApiKey] = useLocalStorage('userApiKey', ''); // For Google AI (text)
  const [falAiApiKey, setFalAiApiKey] = useLocalStorage('falAiApiKey', ''); // For Fal.ai (images)


  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState<{ [key: number]: boolean }>({});
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isGeneratingKeywords, setIsGeneratingKeywords] = useState(false);
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [currentRowIndex, setCurrentRowIndex] = useState<number | null>(null);
  const [apiError, setApiError] = useState<{ type: string; message: string; helpLink?: string } | null>(null);
  const [isApiKeyFromEnv, setIsApiKeyFromEnv] = useState(false);

  // State for bulk generation
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [bulkMessage, setBulkMessage] = useState('');
  const [originalCsvHeaders, setOriginalCsvHeaders] = useState<string[]>([]);
  const [fullCsvData, setFullCsvData] = useState<{ [key: string]: string }[]>([]);
  const [generatedAssets, setGeneratedAssets] = useState<{ zip: Blob; csv: Blob } | null>(null);
  const [page, setPage] = useState(getCurrentPage());
  const [lastCompletedRowIndex, setLastCompletedRowIndex] = useState<number | null>(null);
  const [inProgressCsvData, setInProgressCsvData] = useState<{[key: string]: string}[]>([]);
  
  const zipRef = useRef<any>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (process.env.API_KEY && process.env.API_KEY.length > 5) {
        setIsApiKeyFromEnv(true);
    }
  }, []);

  const getApiKey = useCallback((): string | undefined => {
    // This is for Google AI (text) only now.
    if (userApiKey && userApiKey.length > 5) {
      return userApiKey;
    }
    if (process.env.API_KEY && process.env.API_KEY.length > 5) {
      return process.env.API_KEY;
    }
    return undefined;
  }, [userApiKey]);

  const handleResetBulkGeneration = useCallback(() => {
    setLastCompletedRowIndex(null);
    setInProgressCsvData([]);
    zipRef.current = null;
    setBulkMessage('');
    setGeneratedAssets(null);
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
    const handleHashChange = () => {
        setPage(getCurrentPage());
        window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (currentRowIndex !== null && csvData[currentRowIndex]) {
      const { title, subtitle, description, keywords } = csvData[currentRowIndex];
      setPersistedData(prev => ({
        ...prev,
        title: title,
        subtitle: subtitle,
        description: description,
        keywords: keywords,
      }));
      setImageData({
        backgroundImage: null,
        backgroundImage2: null,
        backgroundImage3: null,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRowIndex]);

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

  const handleGenerateImage = async (imageNumber: 1 | 2 | 3, throwOnError = false, overridePrompt?: string): Promise<void> => {
    const userPrompt = overridePrompt || templateData.title;
    if (!userPrompt) {
        const msg = 'Please enter a Title to generate an image.';
        if (throwOnError) throw new Error(msg);
        setApiError({ type: 'generic', message: msg });
        return;
    }

    setIsGeneratingImage(prev => ({ ...prev, [imageNumber]: true }));
    setApiError(null);

    const apiKey = falAiApiKey; // Use Fal.ai key for image generation
    const aspectRatio = templateData.pinSize === 'standard' ? '3:4' : '9:16';

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

    const apiKey = getApiKey(); // Use Google AI key for text

    try {
        let newDescription: string;
        if (apiKey) {
            newDescription = await generateDescription(apiKey, templateData.textModel, title, templateData.subtitle);
        } else {
            newDescription = generatePlaceholderDescription(title, templateData.subtitle);
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
    const { title, subtitle, textModel } = templateData;
    if (!title) {
        const msg = 'Please enter a Title to generate keywords.';
        if (throwOnError) throw new Error(msg);
        setApiError({ type: 'generic', message: msg });
        return;
    }

    setIsGeneratingKeywords(true);
    setApiError(null);

    const apiKey = getApiKey(); // Use Google AI key for text

    try {
        let newKeywords: string;
        if (apiKey) {
            newKeywords = await generateKeywords(apiKey, textModel, title, subtitle);
        } else {
            newKeywords = generatePlaceholderKeywords(title, subtitle);
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
      
      const headerMap: { [key: string]: string } = {};
      headers.forEach(h => headerMap[h.toLowerCase().trim()] = h);

      const titleHeader = headerMap['title'] || headerMap['title of recipes'];
      const boardHeader = headerMap['pinterest board'] || headerMap['board'];
      const descriptionHeader = headerMap['description'];
      const keywordsHeader = headerMap['keywords'];


      if (!titleHeader) {
        setApiError({ type: 'generic', message: "CSV must contain a 'Title' or 'Title of recipes' column."});
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
          const title = row[titleHeader] || '';
          
          return {
              title: title,
              subtitle: row[boardHeader] || '',
              website: '',
              description: row[descriptionHeader] || '',
              keywords: row[keywordsHeader] || '',
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

  const handleBulkGeneration = async (resume = false) => {
    setApiError(null);
    setGeneratedAssets(null);
    if (csvData.length === 0) {
      setApiError({ type: 'generic', message: 'Please upload a CSV file first.'});
      return;
    }

    const googleApiKey = getApiKey();
    const falApiKey = falAiApiKey;

    if (!googleApiKey || !falApiKey) {
        let missingKeys = [];
        if (!googleApiKey) missingKeys.push("Google AI (for text)");
        if (!falApiKey) missingKeys.push("Fal.ai (for images)");
        if (!window.confirm(`You are missing API keys for: ${missingKeys.join(' and ')}. Only basic placeholder assets will be created for the missing parts. Do you want to continue?`)) {
            return;
        }
    }
    
    const dataForGeneration = [...csvData];
    const fullDataForGeneration = JSON.parse(JSON.stringify(fullCsvData));
    
    setIsBulkGenerating(true);
    const startIndex = resume && lastCompletedRowIndex !== null ? lastCompletedRowIndex + 1 : 0;
    
    let currentRunCsvData;

    if (startIndex === 0) {
        setBulkMessage('Starting bulk generation...');
        zipRef.current = new window.JSZip();
        setInProgressCsvData(fullDataForGeneration);
        setLastCompletedRowIndex(null);
        currentRunCsvData = fullDataForGeneration; // Use the snapshot directly for this run
    } else {
        setBulkMessage(`Resuming from row ${startIndex + 1}...`);
        currentRunCsvData = [...inProgressCsvData]; // For a resumed run, we MUST use the state
    }

    const zip = zipRef.current;
    
    const { pinsPerDay, startDate } = templateData;
    const pinsPerDayNum = Math.max(1, parseInt(pinsPerDay.toString(), 10) || 1);
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
    const keywordsHeaderKey = Object.keys(currentRunCsvData[0] || {}).find(k => k.toLowerCase().trim() === 'keywords') || 'Keywords';

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
                let description: string;
                if (googleApiKey) {
                    description = await generateDescription(googleApiKey, templateData.textModel, currentData.title, currentData.subtitle);
                } else {
                    description = generatePlaceholderDescription(currentData.title, currentData.subtitle);
                }
                currentRunCsvData[i][descriptionHeaderKey] = description;
            }

            // Generate keywords if missing
            if (!currentRunCsvData[i][keywordsHeaderKey]) {
                setBulkMessage(`Row ${i + 1}: Generating keywords...`);
                let keywords: string;
                if (googleApiKey) {
                    keywords = await generateKeywords(googleApiKey, templateData.textModel, currentData.title, currentData.subtitle);
                } else {
                    keywords = generatePlaceholderKeywords(currentData.title, currentData.subtitle);
                }
                currentRunCsvData[i][keywordsHeaderKey] = keywords;
            }

            setBulkMessage(`Row ${i + 1}: Generating images...`);
            const prompt = currentData.title;
            if (prompt) {
                 await handleGenerateImage(1, true, prompt);
                
                const templateNeeds2Images = ['split', 'brush', 'clean-grid', 'trendy-collage', 'product-spotlight', 'before-after', 'shop-the-look'].includes(templateData.templateId);
                if (templateNeeds2Images) await handleGenerateImage(2, true, prompt);

                const templateNeeds3Images = ['clean-grid', 'shop-the-look'].includes(templateData.templateId);
                if (templateNeeds3Images) await handleGenerateImage(3, true, prompt);
            }
            await sleep(100);

            if (previewRef.current) {
                const dataUrl = await window.htmlToImage.toPng(previewRef.current, { cacheBust: true, pixelRatio: 2, fetchRequestInit: { mode: 'cors' }});
                const safeTitle = currentData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                const filename = `pin_${i + 1}_${safeTitle}.png`;

                const base64Data = dataUrl.substring(dataUrl.indexOf(',') + 1);
                zip.file(filename, base64Data, { base64: true });

                const prefix = templateData.mediaUrlPrefix.endsWith('/') ? templateData.mediaUrlPrefix : `${templateData.mediaUrlPrefix}/`;
                const imageUrl = `${prefix}${filename}`;
                currentRunCsvData[i][mediaUrlHeaderKey] = imageUrl;

                const daysToAdd = Math.floor(i / pinsPerDayNum);
                const publishDate = new Date(start);
                publishDate.setDate(start.getDate() + daysToAdd);

                const pinIndexInDay = i % pinsPerDayNum;
                const startHour = 9;
                const endHour = 17;
                const totalHoursInWindow = endHour - startHour;
                const hourIncrement = pinsPerDayNum > 1 ? totalHoursInWindow / (pinsPerDayNum - 1) : 0;
                const publishHourFloat = startHour + (pinIndexInDay * hourIncrement);
                const publishHour = Math.floor(publishHourFloat);
                const publishMinute = Math.round((publishHourFloat - publishHour) * 60);
                
                publishDate.setHours(publishHour, publishMinute, 0, 0);

                const year = publishDate.getFullYear();
                const month = (publishDate.getMonth() + 1).toString().padStart(2, '0');
                const day = publishDate.getDate().toString().padStart(2, '0');
                const hour = publishDate.getHours().toString().padStart(2, '0');
                const minute = publishDate.getMinutes().toString().padStart(2, '0');
                const formattedPublishDate = `${year}-${month}-${day}T${hour}:${minute}:00`;
                currentRunCsvData[i][publishDateHeaderKey] = formattedPublishDate;
            }
            setInProgressCsvData([...currentRunCsvData]);
            setLastCompletedRowIndex(i);
            await sleep(100);
        }

        setBulkMessage('Finalizing files...');
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

        const csvRows = [outputHeaders.join(',')];
        currentRunCsvData.forEach(row => {
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
                const escaped = value.includes(',') || value.includes('"') ? `"${value.replace(/"/g, '""')}"` : value;
                return escaped;
            });
            csvRows.push(values.join(','));
        });

        const csvString = csvRows.join('\n');
        const csvBlob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const zipContent = await zip.generateAsync({ type: 'blob' });

        setGeneratedAssets({ zip: zipContent, csv: csvBlob });
        setBulkMessage('Generation complete! Your files are ready to download.');

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

  const controlProps = {
    data: templateData,
    onFieldChange: handleFieldChange,
    onImageUpload: handleImageUpload,
    onGenerateImage: handleGenerateImage,
    onGenerateDescription: handleGenerateDescription,
    onGenerateKeywords: handleGenerateKeywords,
    onDownload: handleDownload,
    isLoading: isLoading,
    isGeneratingImage: isGeneratingImage,
    isGeneratingDescription: isGeneratingDescription,
    isGeneratingKeywords: isGeneratingKeywords,
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
    onSetUserApiKey: setUserApiKey,
    isApiKeyFromEnv: isApiKeyFromEnv,
    userApiKey: userApiKey,
    onSetFalAiApiKey: setFalAiApiKey,
    falAiApiKey: falAiApiKey,
  };
  
  const renderPage = () => {
    switch(page) {
        case 'about':
            return <AboutPage />;
        case 'privacy':
            return <PrivacyPolicyPage />;
        case 'terms':
            return <TermsOfServicePage />;
        case 'home':
        default:
            return <GeneratorInterface controlProps={controlProps} previewRef={previewRef} templateData={templateData} apiError={apiError} />;
    }
  };


  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow p-4 md:p-8">
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
};

export default App;
