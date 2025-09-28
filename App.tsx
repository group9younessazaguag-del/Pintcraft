
import React, { useCallback, useRef, useEffect, useState } from 'react';
import type { TemplateData, CsvRow } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import AboutPage from './components/pages/AboutPage';
import PrivacyPolicyPage from './components/pages/PrivacyPolicyPage';
import TermsOfServicePage from './components/pages/TermsOfServicePage';
import { generateImage, generateKeywords as generateKeywordsApi } from './services/googleAi';
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

const initialTemplateData: TemplateData = {
    title: 'GARLIC HERB MOZZARELLA BITES',
    subtitle: 'QUICK & EASY APPETIZER',
    website: 'YOURWEBSITE.COM',
    backgroundImage: null,
    backgroundImage2: null,
    backgroundImage3: null,
    templateId: 'product-spotlight',
    pinSize: 'long',
    imagePrompt: '',
    imageModel: 'imagen-4.0-generate-001',
    imageStyle: 'photorealistic',
    mediaUrlPrefix: 'http://yourwebsite.com/images/',
    pinsPerDay: 3,
    startDate: new Date().toISOString().split('T')[0],
};


const App: React.FC = () => {
  const [templateData, setTemplateData] = useLocalStorage<TemplateData>('templateData', initialTemplateData);
  const [userApiKey, setUserApiKey] = useLocalStorage('userApiKey', '');

  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState<{ [key: number]: boolean }>({});
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
    // Prioritize user-provided key from local storage over the environment variable.
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
      const { title, subtitle, website, imagePrompt } = csvData[currentRowIndex];
      setTemplateData(prev => ({
        ...prev,
        title: title || prev.title,
        subtitle: subtitle || prev.subtitle,
        website: website || prev.website,
        imagePrompt: imagePrompt || '',
        backgroundImage: null,
        backgroundImage2: null,
        backgroundImage3: null,
      }));
    }
  }, [currentRowIndex, csvData, setTemplateData]);

  const handleFieldChange = (field: keyof TemplateData, value: any) => {
    if (apiError) setApiError(null);
    if (generatedAssets) setGeneratedAssets(null);

    setTemplateData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (file: File, imageNumber: 1 | 2 | 3) => {
    if (apiError) setApiError(null);
    if (generatedAssets) setGeneratedAssets(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      const field = `backgroundImage${imageNumber === 1 ? '' : imageNumber}` as 'backgroundImage' | 'backgroundImage2' | 'backgroundImage3';
      setTemplateData(prev => ({ ...prev, [field]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };
  
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleGenerateImage = async (imageNumber: 1 | 2 | 3, throwOnError = false): Promise<void> => {
    const apiKey = getApiKey();
    if (!apiKey) {
      const msg = 'Please set your API key in the Model Settings to generate images.';
      if (throwOnError) throw new Error(msg);
      setApiError({ type: 'generic', message: msg });
      return;
    }

    const userPrompt = templateData.imagePrompt || templateData.title;
    if (!userPrompt) {
        const msg = 'Please enter a Title or an Image Prompt to generate an image.';
        if (throwOnError) throw new Error(msg);
        setApiError({ type: 'generic', message: msg });
        return;
    }

    setIsGeneratingImage(prev => ({ ...prev, [imageNumber]: true }));
    setApiError(null);

    try {
        const aspectRatio = templateData.pinSize === 'standard' ? '3:4' : '9:16';
        const imageUrl = await generateImage(
            apiKey,
            userPrompt,
            templateData.imageModel,
            templateData.imageStyle,
            aspectRatio
        );
        const field = `backgroundImage${imageNumber === 1 ? '' : imageNumber}` as 'backgroundImage' | 'backgroundImage2' | 'backgroundImage3';
        setTemplateData(prev => ({ ...prev, [field]: imageUrl }));
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

  const handleGenerateKeywords = useCallback(async (title: string): Promise<string> => {
    const apiKey = getApiKey();
    if (!apiKey) {
        const msg = 'API key is not set. Cannot generate keywords.';
        setBulkMessage(msg);
        throw new Error(msg);
    }

    try {
        const keywords = await generateKeywordsApi(apiKey, title);
        return keywords;
    } catch (error: any) {
        if (error.type === 'quota') {
            setBulkMessage(`Keyword generation failed due to quota limit.`);
        } else {
            setBulkMessage(`Keyword generation failed: ${error.message}`);
        }
        throw error;
    }
  }, [getApiKey, setBulkMessage]);

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
      const imagePromptHeader = headerMap['image prompt'];
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
          
          let prompt = '';
          if (imagePromptHeader && row[imagePromptHeader]) {
              prompt = row[imagePromptHeader];
          } else if (descriptionHeader && row[descriptionHeader]) {
              prompt = `${title}. ${row[descriptionHeader]}`;
          } else if (keywordsHeader && row[keywordsHeader]) {
              prompt = `${title}, with themes of ${row[keywordsHeader]}`;
          } else {
              prompt = title;
          }

          return {
              title: title,
              subtitle: row[boardHeader] || '',
              website: '',
              imagePrompt: prompt,
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
    if (!getApiKey()) {
        setApiError({ type: 'generic', message: 'Please set your API key to start bulk generation.' });
        return;
    }
    if (csvData.length === 0) {
      setApiError({ type: 'generic', message: 'Please upload a CSV file first.'});
      return;
    }
    
    setIsBulkGenerating(true);
    const startIndex = resume && lastCompletedRowIndex !== null ? lastCompletedRowIndex + 1 : 0;
    
    if (startIndex === 0) {
        setBulkMessage('Starting bulk generation...');
        zipRef.current = new window.JSZip();
        setInProgressCsvData(JSON.parse(JSON.stringify(fullCsvData)));
        setLastCompletedRowIndex(null);
    } else {
        setBulkMessage(`Resuming from row ${startIndex + 1}...`);
    }

    const zip = zipRef.current;
    const currentRunCsvData = [...inProgressCsvData];
    
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
    
    let i = startIndex;
    try {
        for (i = startIndex; i < csvData.length; i++) {
            const currentData = csvData[i];
            setBulkMessage(`Processing row ${i + 1} of ${csvData.length}: ${currentData.title}`);
            setCurrentRowIndex(i);
            await sleep(100);
            
            const originalKeywordsHeader = originalCsvHeaders.find(h => h.toLowerCase().trim() === 'keywords');
            let currentKeywords = originalKeywordsHeader ? currentRunCsvData[i][originalKeywordsHeader] : '';

            if (!currentKeywords) {
                setBulkMessage(`Row ${i + 1}: Generating keywords...`);
                const generatedKeywords = await handleGenerateKeywords(currentData.title);
                const targetKeywordsHeader = originalKeywordsHeader || 'Keywords';
                currentRunCsvData[i][targetKeywordsHeader] = generatedKeywords;
                if (!originalCsvHeaders.some(h => h.toLowerCase().trim() === 'keywords')) {
                    originalCsvHeaders.push('Keywords');
                }
            }
            
            setBulkMessage(`Row ${i + 1}: Generating images...`);
            const prompt = currentData.imagePrompt;
            if (prompt) {
                 await handleGenerateImage(1, true);
                
                const templateNeeds2Images = ['split', 'brush', 'clean-grid', 'trendy-collage', 'product-spotlight', 'before-after', 'shop-the-look'].includes(templateData.templateId);
                if (templateNeeds2Images) await handleGenerateImage(2, true);

                const templateNeeds3Images = ['clean-grid', 'shop-the-look'].includes(templateData.templateId);
                if (templateNeeds3Images) await handleGenerateImage(3, true);
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
        handleResetBulkGeneration();

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
        setGeneratedAssets(null);
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

    setGeneratedAssets(null);
    setBulkMessage('');
  };

  const controlProps = {
    data: templateData,
    onFieldChange: handleFieldChange,
    onImageUpload: handleImageUpload,
    onGenerateImage: handleGenerateImage,
    onDownload: handleDownload,
    isLoading: isLoading,
    isGeneratingImage: isGeneratingImage,
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
