import React from 'react';
import type { TemplateData } from '../types';
import { SettingsAndCustomizeControls, PinContentControls, CsvAndActionsControls, ControlsProps } from './Controls';
import TemplatePreview from './TemplatePreview';
import ErrorIcon from './icons/ErrorIcon';

interface GeneratorInterfaceProps {
    controlProps: ControlsProps;
    previewRef: React.RefObject<HTMLDivElement>;
    templateData: TemplateData;
    apiError: { type: string; message: React.ReactNode } | null;
}

const GeneratorInterface: React.FC<GeneratorInterfaceProps> = ({ controlProps, previewRef, templateData, apiError }) => (
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

export default GeneratorInterface;
