
import React from 'react';
import type { TemplateData } from '@/types';
import { SettingsAndCustomizeControls, PinContentControls, CsvAndActionsControls, ControlsProps } from './Controls';
import TemplatePreview from './TemplatePreview';
import ErrorIcon from './icons/ErrorIcon';

interface GeneratorInterfaceProps {
    controlProps: ControlsProps;
    previewRef: React.RefObject<HTMLDivElement>;
    templateData: TemplateData;
    apiError: { type: string; message: string; helpLink?: string } | null;
}

const GeneratorInterface: React.FC<GeneratorInterfaceProps> = ({ controlProps, previewRef, templateData, apiError }) => {
    const openRouterKeyIsConfigured = controlProps.openRouterApiKey && controlProps.openRouterApiKey.length > 5;
    const anyImageKeyIsConfigured =
        (controlProps.falAiApiKey && controlProps.falAiApiKey.length > 5) ||
        (controlProps.apiframeApiKey && controlProps.apiframeApiKey.length > 5) ||
        (controlProps.midapiApiKey && controlProps.midapiApiKey.length > 5) ||
        (controlProps.imagineApiKey && controlProps.imagineApiKey.length > 5) ||
        (controlProps.useapiApiKey && controlProps.useapiApiKey.length > 5);

    return (
        <div className="container mx-auto">
             {/* API Key Missing Warning Banner */}
            {(!openRouterKeyIsConfigured || !anyImageKeyIsConfigured) && !controlProps.isBulkGenerating && (
                <div className="bg-amber-50 border-l-4 border-amber-400 text-amber-800 p-4 rounded-r-lg shadow-md mb-8" role="alert">
                    <div className="flex">
                        <div className="py-1">
                            <ErrorIcon className="w-6 h-6 text-amber-500 mr-4" />
                        </div>
                        <div>
                            <p className="font-bold">AI Features Limited</p>
                            <p className="text-sm mt-2">
                                AI generation is running in a limited, placeholder-only mode because one or more API keys are missing.
                            </p>
                            <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                                {!openRouterKeyIsConfigured && <li><strong>OpenRouter.ai API Key (Text):</strong> Required for generating descriptions, keywords, and titles.</li>}
                                {!anyImageKeyIsConfigured && <li><strong>Image AI API Key:</strong> Required for generating images. Add a key for Fal.ai, APIFrame.ai, midapi.ai, ImagineAPI, or useapi.net.</li>}
                            </ul>
                            <p className="text-sm mt-3">
                                Please add your key(s) in the <strong>AI Configuration</strong> panel below to enable all features.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-1 space-y-8">
                    {apiError && apiError.type === 'quota' && (
                        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl" role="alert">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <ErrorIcon className="w-5 h-5 mt-0.5 text-amber-500" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-base font-semibold">API Quota Reached</h3>
                                    <div className="text-sm mt-2 space-y-1">
                                        <p>You've exceeded the free usage limit for your OpenRouter API key. This is an issue with your OpenRouter account, not the application.</p>
                                        <p>To continue, please review your OpenRouter billing or use a different API key.</p>
                                        {apiError.helpLink && (
                                            <a href={apiError.helpLink} target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:text-amber-900">
                                                Learn more about OpenRouter API billing here.
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {apiError && apiError.type !== 'quota' && (
                        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-start" role="alert">
                            <div className="flex-shrink-0">
                                <ErrorIcon className="w-5 h-5 mt-0.5 text-red-500" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-semibold">An error occurred</p>
                                <p className="text-sm mt-1 whitespace-pre-wrap">{apiError.message}</p>
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
        </div>
    );
}

export default GeneratorInterface;