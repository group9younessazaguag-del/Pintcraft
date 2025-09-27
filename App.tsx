import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import type { TemplateData, CsvRow, ImageStyle } from './types';
import Header from './components/Header';
import { SettingsAndCustomizeControls, PinContentControls, CsvAndActionsControls } from './components/Controls';
import TemplatePreview from './components/TemplatePreview';
import ErrorIcon from './components/icons/ErrorIcon';
import Footer from './components/Footer';
import AboutPage from './components/pages/AboutPage';
import PrivacyPolicyPage from './components/pages/PrivacyPolicyPage';
import TermsOfServicePage from './components/pages/TermsOfServicePage';

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


const GeneratorInterface: React.FC<{ controlProps: any; previewRef: React.RefObject<HTMLDivElement>; templateData: TemplateData; apiError: { type: string; message: React.ReactNode } | null }> = ({ controlProps, previewRef, templateData, apiError }) => (
    <div className="container mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-1 space-y-8">
            {apiError && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-start" role="alert">
                    <div className="flex-shrink-0">
                        <ErrorIcon className="w-5 h-5 mt-0.5 text-red-500" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-semibold">An error occurred</p>
                        <p className="text-sm mt-1">{apiError.message}</p>
                    </div>
                </div>
            )}
            <SettingsAndCustomizeControls {...controlProps} />
        </div>

        <div className="lg:col-span-1 space-y-8">
            <PinContentControls {...controlProps} />
        </div>

        <div className="lg:col-span-1 space-y-8">
            <CsvAndActionsControls {...controlProps} />
        </div>

        <div className="lg:col-span-2 flex justify-center">
            <div className="w-full max-w-md sticky top-24">
                <TemplatePreview ref={previewRef} data={templateData} />
            </div>
        </div>
    </div>
);


const App: React.FC = () => {
  const [templateData, setTemplateData] = useState<TemplateData>({
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
    apiKey: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState<{ [key: number]: boolean }>({});
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [currentRowIndex, setCurrentRowIndex] = useState<number | null>(null);
  const [apiError, setApiError] = useState<{ type: string; message: React.ReactNode } | null>(null);

  // State for bulk generation
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [bulkMessage, setBulkMessage] = useState('');
  const [originalCsvHeaders, setOriginalCsvHeaders] = useState<string[]>([]);
  const [fullCsvData, setFullCsvData] = useState<{ [key: string]: string }[]>([]);
  const [generatedAssets, setGeneratedAssets] = useState<{ zip: Blob; csv: Blob } | null>(null);
  const [page, setPage] = useState(getCurrentPage());


  const previewRef = useRef<HTMLDivElement>(null);
  
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
        // Reset images when changing rows to avoid confusion
        backgroundImage: null,
        backgroundImage2: null,
        backgroundImage3: null,
      }));
    }
  }, [currentRowIndex, csvData]);

  const handleFieldChange = (field: keyof TemplateData, value: string) => {
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
  
  const stylePromptMap: { [key in ImageStyle]: string } = {
      photorealistic: 'A hyper-realistic, professional photograph. Cinematic lighting, dramatic, highly detailed, photorealistic.',
      realistic: 'A realistic, true-to-life image. Natural lighting, sharp focus, high fidelity, looking like a real photograph.',
      fantasy: 'A vibrant digital painting in a fantasy art style. Epic, illustrative, highly detailed, magical.',
      anime: 'A high-quality anime style artwork. Vibrant colors, clean lines, detailed characters, Japanese animation style.',
      minimalist: 'A minimalist and clean product shot. Simple background, soft lighting, focus on the subject.',
      vintage: 'A retro-style photograph with a vintage film look. Grainy texture, faded colors, nostalgic feel.',
      vibrant: 'An incredibly vibrant and colorful image. Saturated colors, high contrast, energetic, and eye-catching.',
  };

  const handleGenerateImage = async (imageNumber: 1 | 2 | 3, throwOnError = false) => {
    setApiError(null);
    if (!templateData.apiKey) {
        const msg = 'Please enter your Google AI API Key in the Model Settings section.';
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

    const MAX_RETRIES = 3;
    let attempt = 0;

    while (attempt < MAX_RETRIES) {
        try {
            const ai = new GoogleGenAI({ apiKey: templateData.apiKey });
            const aspectRatio = templateData.pinSize === 'standard' ? '3:4' : '9:16';
            const styleDescription = stylePromptMap[templateData.imageStyle] || stylePromptMap.photorealistic;
            const enhancedPrompt = `${styleDescription} For a Pinterest pin about: ${userPrompt}.`;

            const response = await ai.models.generateImages({
                model: templateData.imageModel,
                prompt: enhancedPrompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/jpeg',
                    aspectRatio: aspectRatio,
                },
            });

            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
            const field = `backgroundImage${imageNumber === 1 ? '' : imageNumber}` as 'backgroundImage' | 'backgroundImage2' | 'backgroundImage3';
            setTemplateData(prev => ({ ...prev, [field]: imageUrl }));
            
            // Success, so we clear any lingering error and exit the retry loop
            setApiError(null);
            setIsGeneratingImage(prev => ({ ...prev, [imageNumber]: false }));
            return; // Exit the function on success

        } catch (error: any) {
            console.error(`Error generating image (attempt ${attempt + 1}):`, error);
            const errorBody = error.error || error;
            const errorString = JSON.stringify(errorBody);
            const isServiceUnavailable = errorString.includes('UNAVAILABLE') || errorString.includes('503');

            attempt++;

            if (isServiceUnavailable && attempt < MAX_RETRIES) {
                const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s
                console.log(`Service unavailable. Retrying in ${delay / 1000} seconds...`);
                await sleep(delay);
                continue; // Go to the next iteration of the loop
            }

            const isQuotaError = errorString.includes('RESOURCE_EXHAUSTED') || errorString.includes('quota');
            
            if (throwOnError) {
                if (isQuotaError) throw new Error('API Quota Exceeded');
                if (isServiceUnavailable) throw new Error('Image generation service is temporarily unavailable. Please try again later.');
                throw new Error('Failed to generate image');
            }

            let errorMessage: React.ReactNode = 'Failed to generate image. Please check the console for more details.';
            let errorType = 'generic';

            if (isQuotaError) {
                errorType = 'quota';
                let helpLink = '';
                try {
                    const details = errorBody.details;
                    if (details && Array.isArray(details)) {
                        const helpDetail = details.find(d => d['@type'] === 'type.googleapis.com/google.rpc.Help' && d.links && d.links.length > 0 && d.links[0].url);
                        if (helpDetail) {
                            helpLink = helpDetail.links[0].url;
                        }
                    }
                } catch (parseError) {
                    console.error("Could not parse help link from error object:", parseError);
                }

                errorMessage = (
                    <>
                        API Quota Exceeded. You may have hit your usage limit. Please check your plan and billing details.
                        {helpLink && (
                            <>
                                {' '}
                                <a href={helpLink} target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:text-red-900">
                                    Learn more here.
                                </a>
                            </>
                        )}
                    </>
                );
            } else if (isServiceUnavailable) {
                errorType = 'service';
                errorMessage = 'The image generation service is temporarily unavailable. Please try again in a few moments.';
            }
            setApiError({ type: errorType, message: errorMessage });
            break; // Exit the loop on non-retryable error or max retries
        }
    }

    // This will only be reached if all retries fail or a non-retryable error occurs
    setIsGeneratingImage(prev => ({ ...prev, [imageNumber]: false }));
};


  const handleDownload = useCallback(() => {
    if (previewRef.current === null) {
      return;
    }
    setIsLoading(true);

    window.htmlToImage.toPng(previewRef.current, { 
        cacheBust: true,
        pixelRatio: 2, // for higher resolution
        fetchRequestInit: { mode: 'cors' } // Fix for CORS issue with Google Fonts
      })
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
      .finally(() => {
        setIsLoading(false);
      });
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
                i++; // Skip next quote
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
    if (apiError) setApiError(null);
    if (generatedAssets) setGeneratedAssets(null);
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
      // const linkHeader = headerMap['link'] || headerMap['website'] || headerMap['site'];
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

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  const generateKeywords = async (title: string): Promise<string> => {
    if (!title) return '';
    if (!templateData.apiKey) {
      throw new Error('API Key is missing. Please add it in the Model Settings section.');
    }

    try {
      const ai = new GoogleGenAI({ apiKey: templateData.apiKey });
      const prompt = `You are a Pinterest SEO expert. Based on the pin title "${title}", generate a comma-separated list of 5-10 highly relevant keywords that users would search for on Pinterest. Focus on long-tail keywords and popular search terms. Do not include hashtags, quotes, or any other text, just the keywords. Example output: recipe, easy recipe, dinner ideas, healthy food`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const keywords = response.text
        .trim()
        .replace(/\n/g, ', ')
        .replace(/, ,/g, ',')
        .replace(/['"]+/g, '');
      return keywords;
    } catch (error: any) {
      console.error(`Failed to generate keywords for title: "${title}"`, error);
      const errorString = JSON.stringify(error);
      if (errorString.includes('RESOURCE_EXHAUSTED') || errorString.includes('quota')) {
          throw new Error('API Quota Exceeded');
      }
      throw new Error(`Failed to generate keywords for "${title}"`);
    }
  };

  const handleAutoGenerateAll = async () => {
    setApiError(null);
    setGeneratedAssets(null);
    if (csvData.length === 0) {
      setApiError({ type: 'generic', message: 'Please upload a CSV file first.'});
      return;
    }
     if (!templateData.apiKey) {
      setApiError({ type: 'generic', message: 'Please enter your Google AI API Key in the Model Settings section before starting a bulk generation.'});
      return;
    }

    setIsBulkGenerating(true);
    setBulkMessage('Starting bulk generation...');

    const zip = new window.JSZip();
    const updatedFullCsvData = JSON.parse(JSON.stringify(fullCsvData));
    
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

    try {
        for (let i = 0; i < csvData.length; i++) {
            const currentData = csvData[i];
            setBulkMessage(`Processing row ${i + 1} of ${csvData.length}: ${currentData.title}`);
            setCurrentRowIndex(i);
            await sleep(100);
            
            const originalKeywordsHeader = originalCsvHeaders.find(h => h.toLowerCase().trim() === 'keywords');
            let currentKeywords = originalKeywordsHeader ? updatedFullCsvData[i][originalKeywordsHeader] : '';

            if (!currentKeywords) {
                setBulkMessage(`Row ${i + 1}: Generating keywords for "${currentData.title}"`);
                const generatedKeywords = await generateKeywords(currentData.title);
                const targetKeywordsHeader = originalKeywordsHeader || 'Keywords';
                updatedFullCsvData[i][targetKeywordsHeader] = generatedKeywords;
                if (!originalCsvHeaders.some(h => h.toLowerCase().trim() === 'keywords')) {
                    originalCsvHeaders.push('Keywords');
                }
            }
            
            setBulkMessage(`Row ${i + 1}: Generating images for "${currentData.title}"`);
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
                const dataUrl = await window.htmlToImage.toPng(previewRef.current, { 
                    cacheBust: true, 
                    pixelRatio: 2,
                    fetchRequestInit: { mode: 'cors' } // Fix for CORS issue with Google Fonts
                });
                const safeTitle = currentData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                const filename = `pin_${i + 1}_${safeTitle}.png`;

                const base64Data = dataUrl.substring(dataUrl.indexOf(',') + 1);
                zip.file(filename, base64Data, { base64: true });

                const prefix = templateData.mediaUrlPrefix.endsWith('/') ? templateData.mediaUrlPrefix : `${templateData.mediaUrlPrefix}/`;
                const imageUrl = `${prefix}${filename}`;
                updatedFullCsvData[i][mediaUrlHeaderKey] = imageUrl;

                const daysToAdd = Math.floor(i / pinsPerDayNum);
                const publishDate = new Date(start);
                publishDate.setDate(start.getDate() + daysToAdd);

                // Distribute pins throughout a daily 9am-5pm window
                const pinIndexInDay = i % pinsPerDayNum;
                const startHour = 9;
                const endHour = 17;
                const totalHoursInWindow = endHour - startHour;
                
                // If only one pin per day, schedule it at the start time.
                // Otherwise, distribute evenly between start and end times.
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
                updatedFullCsvData[i][publishDateHeaderKey] = formattedPublishDate;
            }
            await sleep(100);
        }

        setBulkMessage('Finalizing files...');
        
        // Prepare CSV
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
        updatedFullCsvData.forEach(row => {
            const values = outputHeaders.map(header => {
                let value = '';
                if (header === 'Media URL') {
                    value = row[mediaUrlHeaderKey] || '';
                } else if (header === 'Publish date') {
                    value = row[publishDateHeaderKey] || '';
                } else if (header === 'Link') {
                    value = templateData.website;
                }
                else {
                    const originalHeader = getOriginalHeader(header);
                    if (originalHeader) {
                        value = row[originalHeader] || '';
                    }
                }
                const escaped = value.includes(',') || value.includes('"') ? `"${value.replace(/"/g, '""')}"` : value;
                return escaped;
            });
            csvRows.push(values.join(','));
        });

        const csvString = csvRows.join('\n');
        const csvBlob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        
        // Prepare ZIP
        const zipContent = await zip.generateAsync({ type: 'blob' });

        setGeneratedAssets({ zip: zipContent, csv: csvBlob });
        setBulkMessage('Generation complete! Your files are ready to download.');

    } catch (e: any) {
        console.error('Bulk generation failed:', e);
        const rowIndex = currentRowIndex !== null ? currentRowIndex + 1 : 'current';
        let finalMessage = `An error occurred on row ${rowIndex}: ${e.message}. Bulk generation stopped.`;
        if (e.message === 'API Quota Exceeded') {
            finalMessage = `API Quota Exceeded on row ${rowIndex}. Bulk generation stopped. Please check your billing/quota settings.`;
        }
        setBulkMessage(finalMessage);
        setGeneratedAssets(null);
    } finally {
        setIsBulkGenerating(false);
    }
  };

  const handleDownloadGeneratedAssets = () => {
    if (!generatedAssets) return;

    // Download ZIP
    const zipLink = document.createElement('a');
    zipLink.href = URL.createObjectURL(generatedAssets.zip);
    zipLink.download = 'pinterest_pins.zip';
    document.body.appendChild(zipLink);
    zipLink.click();
    document.body.removeChild(zipLink);
    URL.revokeObjectURL(zipLink.href);

    // Download CSV
    const csvLink = document.createElement('a');
    csvLink.href = URL.createObjectURL(generatedAssets.csv);
    csvLink.setAttribute('download', 'pinterest_bulk_with_media_urls.csv');
    document.body.appendChild(csvLink);
    csvLink.click();
    document.body.removeChild(csvLink);
    URL.revokeObjectURL(csvLink.href);

    // Reset state after download
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
    onAutoGenerateAll: handleAutoGenerateAll,
    isBulkGenerating: isBulkGenerating,
    bulkMessage: bulkMessage,
    apiError: apiError,
    generatedAssets: generatedAssets,
    onDownloadGeneratedAssets: handleDownloadGeneratedAssets,
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