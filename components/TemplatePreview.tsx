
import React, { forwardRef } from 'react';
import type { TemplateData } from '../types';
// FIX: Import StarIcon component
import StarIcon from './icons/StarIcon';

interface TemplatePreviewProps {
  data: TemplateData;
}

const getDynamicTitleFontSize = (
  titleLength: number,
  longClass: string,
  mediumClass: string,
  shortClass: string,
  longThreshold: number = 80,
  mediumThreshold: number = 50
): string => {
    if (titleLength > longThreshold) return longClass;
    if (titleLength > mediumThreshold) return shortClass;
    return mediumClass;
};

const BackgroundImage: React.FC<{ imageUrl: string | null; className?: string }> = ({ imageUrl, className = '' }) => (
    <div
        className={`absolute inset-0 bg-cover bg-center transition-all duration-300 ${className}`}
        style={{ backgroundImage: imageUrl ? `url(${imageUrl})` : 'none' }}
    ></div>
);

const ClassicTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-2xl md:text-3xl', 'text-3xl md:text-4xl', 'text-4xl md:text-5xl');
    return (
        <div className="w-full h-full flex flex-col justify-center items-center relative font-poppins text-white p-8 text-center">
            <BackgroundImage imageUrl={backgroundImage} />
            {!backgroundImage && <div className="absolute inset-0 bg-slate-700"></div>}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
            
            <div className="relative z-10 w-full flex flex-col items-center">
                 {subtitle && (
                    <p 
                        className="text-sm font-semibold tracking-wide mb-4 opacity-90"
                        style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}
                    >
                        {subtitle}
                    </p>
                )}
                {title && (
                    <h2 
                        className={`font-playfair font-bold ${titleFontSize} leading-tight tracking-tight`}
                        style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)', wordBreak: 'break-word' }}
                    >
                        {title}
                    </h2>
                )}
                 {website && (
                    <div className="w-full max-w-xs mt-8 pt-4 border-t border-white/30">
                        <p 
                            className="text-xs font-bold tracking-[0.15em] opacity-80 uppercase"
                            style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}
                        >
                            {website}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

const SplitTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage, backgroundImage2 } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-2xl', 'text-3xl', 'text-4xl');
    return (
        <div className="w-full h-full flex flex-col relative font-poppins text-gray-800">
            <div className="flex-1 relative">
                <BackgroundImage imageUrl={backgroundImage} />
            </div>
            <div className="flex-1 relative">
                <BackgroundImage imageUrl={backgroundImage2} />
            </div>
            <div className="absolute inset-0 z-10 flex flex-col justify-center items-center p-8">
                <div className="w-full max-w-md bg-white/95 backdrop-blur-sm border border-black/5 p-8 shadow-2xl text-center text-[#4E443A]">
                     {subtitle && (
                        <p className="text-sm font-semibold tracking-wide mb-2 text-[#4E443A]/70">
                            {subtitle}
                        </p>
                    )}
                    {title && (
                        <h2 className={`font-playfair ${titleFontSize} font-bold leading-tight tracking-tight`} style={{ wordBreak: 'break-word' }}>
                            {title}
                        </h2>
                    )}
                     {website && (
                        <p className="mt-6 text-xs font-bold tracking-[0.15em] text-[#4E443A]/50 uppercase">
                            {website}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

const ModernTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-2xl md:text-3xl', 'text-3xl md:text-4xl', 'text-4xl md:text-5xl');
    return (
        <div className="w-full h-full flex flex-col justify-end items-center relative font-poppins text-white p-6">
            <BackgroundImage imageUrl={backgroundImage} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="relative z-10 w-full flex flex-col justify-center text-left p-4">
                {subtitle && (
                    <p 
                        className="text-sm font-semibold tracking-wide mb-2 opacity-80"
                        style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.6)' }}
                    >
                        {subtitle}
                    </p>
                )}
                {title && (
                    <h2 
                        className={`font-playfair font-bold ${titleFontSize} leading-tight tracking-tight text-white`}
                        style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.6)', wordBreak: 'break-word' }}
                    >
                        {title}
                    </h2>
                )}
                 {website && (
                    <p 
                        className="mt-4 text-xs font-bold tracking-[0.15em] uppercase opacity-70 border-t border-white/20 pt-2"
                        style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.6)' }}
                    >
                        {website}
                    </p>
                )}
            </div>
        </div>
    );
};

const BrushStrokeTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage, backgroundImage2 } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-2xl md:text-3xl', 'text-3xl md:text-4xl', 'text-4xl md:text-5xl');
    return (
        <div className="w-full h-full flex flex-col relative font-poppins bg-white">
            <div className="flex-1 relative p-4 bg-white">
                <div className="w-full h-full relative">
                    <BackgroundImage imageUrl={backgroundImage} />
                </div>
            </div>
            <div 
                className="bg-[#FDF4E3] py-2 px-12 text-center shadow-lg text-[#4E443A]"
                style={{
                    backgroundImage: 'linear-gradient(to right, rgba(210, 143, 93, 0.05), transparent, rgba(210, 143, 93, 0.05)), linear-gradient(to bottom, rgba(210, 143, 93, 0.05), transparent, rgba(210, 143, 93, 0.05))',
                    borderTop: '2px solid rgba(199, 131, 80, 0.3)',
                    borderBottom: '2px solid rgba(199, 131, 80, 0.3)',
                }}
            >
                 {subtitle && (
                    <p className="text-sm font-semibold tracking-wide mb-1 text-[#4E443A]/70">
                        {subtitle}
                    </p>
                )}
                {title && (
                    <h2 
                        className={`font-playfair ${titleFontSize} font-bold leading-tight tracking-tight`}
                        style={{ textShadow: '1px 1px 3px rgba(0, 0, 0, 0.1)', wordBreak: 'break-word' }}
                    >
                        {title}
                    </h2>
                )}
                 {website && (
                    <p className="mt-2 text-xs font-bold tracking-[0.15em] text-[#4E443A]/50 uppercase">
                        {website}
                    </p>
                )}
            </div>
            <div className="flex-1 relative p-4 bg-white">
                 <div className="w-full h-full relative">
                    <BackgroundImage imageUrl={backgroundImage2} />
                </div>
            </div>
        </div>
    );
};

const BorderTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-2xl', 'text-3xl', 'text-4xl');
    return (
        <div className="w-full h-full flex flex-col bg-[#F8F5F2] p-4 sm:p-6 md:p-8">
            <div className="w-full h-full flex flex-col justify-end relative font-poppins text-gray-800 shadow-inner">
                <BackgroundImage imageUrl={backgroundImage} />
                <div className="relative z-10 p-4 text-center">
                    <div className="bg-white/90 backdrop-blur-md p-6 rounded-lg shadow-lg text-[#4E443A]">
                        {subtitle && (
                            <p className="text-sm font-semibold tracking-wide mt-3 text-[#4E443A]/70">
                                {subtitle}
                            </p>
                        )}
                        {title && (
                            <h2
                                className={`font-playfair ${titleFontSize} font-bold leading-tight tracking-tight`}
                                style={{ wordBreak: 'break-word' }}
                            >
                                {title}
                            </h2>
                        )}
                        {website && (
                            <p className="mt-4 text-xs font-bold tracking-[0.15em] text-[#4E443A]/50 uppercase">
                                {website}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const EditorialTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-2xl', 'text-3xl', 'text-4xl');
    return (
        <div className="w-full h-full flex flex-col relative font-poppins bg-white">
            <div className="h-2/3 relative">
                <BackgroundImage imageUrl={backgroundImage} />
            </div>
            <div className="h-1/3 flex flex-col justify-center items-start p-6 text-left text-[#4E443A]">
                {subtitle && (
                    <p className="text-sm font-semibold tracking-wide text-[#4E443A]/70 mb-2">
                        {subtitle}
                    </p>
                )}
                {title && (
                    <h2
                        className={`font-playfair font-bold ${titleFontSize} leading-tight tracking-tight`}
                        style={{ wordBreak: 'break-word' }}
                    >
                        {title}
                    </h2>
                )}
                 {website && (
                    <p className="mt-4 text-xs font-bold tracking-[0.15em] text-[#4E443A]/50 uppercase border-t border-gray-200 w-full pt-3">
                        {website}
                    </p>
                )}
            </div>
        </div>
    );
};

const CleanGridTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage, backgroundImage2, backgroundImage3 } = data;
    return (
        <div className="w-full h-full grid grid-cols-2 grid-rows-3 gap-2 p-2 bg-gray-100 font-poppins">
            <div className="col-span-1 row-span-3 relative rounded-lg overflow-hidden">
                <BackgroundImage imageUrl={backgroundImage} />
                <div className="absolute inset-0 bg-gray-200 -z-10"></div>
            </div>
            <div className="col-span-1 row-span-1 relative rounded-lg overflow-hidden">
                <BackgroundImage imageUrl={backgroundImage2} />
                 <div className="absolute inset-0 bg-gray-200 -z-10"></div>
            </div>
            <div className="col-span-1 row-span-1 relative rounded-lg overflow-hidden">
                <BackgroundImage imageUrl={backgroundImage3} />
                 <div className="absolute inset-0 bg-gray-200 -z-10"></div>
            </div>
            <div className="col-span-1 row-span-1 bg-white rounded-lg flex flex-col justify-center items-center p-4 text-center text-[#4E443A] shadow-md">
                {subtitle && (
                    <p className="text-xs font-semibold tracking-wide mb-1 text-[#4E443A]/70 uppercase">
                        {subtitle}
                    </p>
                )}
                {title && (
                    <h2 className="font-playfair font-bold text-xl sm:text-2xl md:text-3xl leading-none tracking-tight" style={{ wordBreak: 'break-word' }}>
                        {title}
                    </h2>
                )}
                {website && (
                    <p className="mt-2 text-xs font-bold tracking-[0.15em] text-[#4E443A]/50 uppercase">
                        {website}
                    </p>
                )}
            </div>
        </div>
    );
};

const MinimalistQuoteTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, backgroundImage } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-xl md:text-2xl', 'text-2xl md:text-3xl', 'text-3xl md:text-4xl');
    return (
        <div className="w-full h-full flex flex-col justify-center items-center relative font-serif p-8 bg-[#FDFCFB]">
            <BackgroundImage imageUrl={backgroundImage} />
            {backgroundImage && <div className="absolute inset-0 bg-white/70 backdrop-blur-sm"></div>}
            
            <div className="relative z-10 text-center text-gray-800 max-w-md">
                {title && (
                    <h2 
                        className={`${titleFontSize} leading-tight font-light tracking-wide`}
                        style={{ fontVariantLigatures: 'common-ligatures', wordBreak: 'break-word' }}
                    >
                        “{title}”
                    </h2>
                )}
                {subtitle && (
                    <p 
                        className="text-sm font-semibold tracking-wide mt-6 font-poppins text-[#4E443A]/70"
                    >
                        — {subtitle}
                    </p>
                )}
            </div>
        </div>
    );
};

const TastyRecipeTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-2xl', 'text-3xl', 'text-4xl');
    return (
        <div className="w-full h-full flex flex-col justify-end relative font-serif text-white p-8">
            <BackgroundImage imageUrl={backgroundImage} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent"></div>
            
            <div className="relative z-10 text-center font-poppins">
                {subtitle && (
                    <p 
                        className="text-sm font-semibold tracking-wide mb-2"
                        style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.8)' }}
                    >
                        {subtitle}
                    </p>
                )}
                {title && (
                    <h2 
                        className={`font-playfair ${titleFontSize} font-bold leading-tight tracking-tight`}
                        style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.8)', wordBreak: 'break-word' }}
                    >
                        {title}
                    </h2>
                )}
                {website && (
                    <p 
                        className="mt-6 text-xs font-bold tracking-[0.15em] opacity-80 uppercase"
                        style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.8)' }}
                    >
                        {website}
                    </p>
                )}
            </div>
        </div>
    );
};

const DetailedRecipeTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage } = data;
    const details = (subtitle || '').split(',').map(s => s.trim()).filter(Boolean);
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-2xl', 'text-3xl', 'text-4xl');

    return (
        <div className="w-full h-full flex flex-col relative font-poppins bg-[#F7F2EE] text-[#4E443A]">
            <div className="w-full h-[60%] relative">
                <BackgroundImage imageUrl={backgroundImage} />
                {!backgroundImage && <div className="absolute inset-0 bg-slate-300"></div>}
                <div className="absolute inset-0 bg-gradient-to-t from-[#F7F2EE] to-transparent"></div>
            </div>
            <div className="w-full h-[40%] p-6 flex flex-col justify-center items-center text-center">
                {title && (
                    <h2 className={`font-playfair ${titleFontSize} font-bold leading-tight tracking-tight`} style={{ wordBreak: 'break-word' }}>
                        {title}
                    </h2>
                )}
                {details.length > 0 && details[0] && (
                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4 text-[#4E443A]/80">
                        {details.map((detail, index) => {
                            const parts = detail.split(':');
                            const detailLower = detail.toLowerCase();
                            return (
                                <div key={index} className="flex items-center text-sm font-semibold tracking-wide">
                                    { (detailLower.includes('time') || detailLower.includes('cook') || detailLower.includes('prep')) &&
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    }
                                    { detailLower.includes('serves') &&
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    }
                                    {parts.length > 1 ? (
                                        <span>
                                            <strong className="font-bold">{parts[0]}</strong>:
                                            <span className="font-medium">{parts.slice(1).join(':')}</span>
                                        </span>
                                    ) : (
                                        <span className="font-medium">{detail}</span>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
                <div className="flex-grow"></div>
                {website && (
                    <p className="mt-auto text-xs font-bold tracking-[0.2em] text-[#4E443A]/60 uppercase">
                        {website}
                    </p>
                )}
            </div>
        </div>
    );
};

const TrendyCollageTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage, backgroundImage2 } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-2xl', 'text-3xl', 'text-4xl');
    return (
        <div className="w-full h-full flex flex-col justify-center items-center relative font-poppins p-6 bg-[#F4EFEA] overflow-hidden">
            <div className="absolute w-3/4 h-1/2 top-8 left-4 transform -rotate-6 shadow-2xl rounded-md border-8 border-white box-border">
                <BackgroundImage imageUrl={backgroundImage} />
                <div className="absolute inset-0 bg-gray-200 -z-10"></div>
            </div>
            <div className="absolute w-1/2 h-1/2 bottom-8 right-4 transform rotate-3 shadow-2xl rounded-md border-8 border-white box-border">
                <BackgroundImage imageUrl={backgroundImage2} />
                 <div className="absolute inset-0 bg-gray-200 -z-10"></div>
            </div>

            <div className="relative z-10 text-center flex flex-col items-center">
                 {title && (
                    <h2 
                        className={`font-playfair font-bold ${titleFontSize} leading-none tracking-tight text-white bg-[#4E443A] px-4 py-2`}
                        style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.2)', wordBreak: 'break-word' }}
                    >
                        {title}
                    </h2>
                )}
                {subtitle && (
                    <p className="text-sm font-semibold tracking-wide mt-2 text-[#4E443A] bg-[#F4EFEA]/80 px-3 py-1">
                        {subtitle}
                    </p>
                )}
            </div>
            
            {website && (
                <p className="absolute bottom-4 left-4 z-10 text-xs font-bold tracking-[0.15em] text-black/40 uppercase">
                    {website}
                </p>
            )}
        </div>
    );
};

const RetroVibesTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-3xl', 'text-4xl', 'text-5xl');
    return (
        <div className="w-full h-full flex flex-col justify-between relative font-poppins p-8 bg-[#F0EAD6] text-[#4E443A] overflow-hidden">
            <div 
                className="absolute inset-0 opacity-10 pointer-events-none" 
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 800 800' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3Cfilter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}
            ></div>
            
            <div className="relative z-10">
                {subtitle && (
                    <p className="text-sm font-semibold tracking-wide uppercase">{subtitle}</p>
                )}
            </div>

            <div className="relative z-10 flex-grow flex items-center justify-center">
                 <div className="w-[80%] aspect-square rounded-full overflow-hidden border-8 border-white shadow-2xl">
                     <BackgroundImage imageUrl={backgroundImage} />
                     {!backgroundImage && <div className="absolute inset-0 bg-[#E6DBCB]"></div>}
                 </div>
            </div>

            <div className="relative z-10 text-center">
                {title && <h2 className={`font-playfair font-bold ${titleFontSize} leading-none tracking-tight`} style={{textShadow: '1px 1px 2px rgba(255,255,255,0.5)', wordBreak: 'break-word'}}>{title}</h2>}
                {website && (
                    <p className="mt-4 text-xs font-bold tracking-[0.15em] opacity-80 uppercase">{website}</p>
                )}
            </div>
        </div>
    );
};

const ProductSpotlightTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage, backgroundImage2 } = data;
    return (
        <div className="w-full h-full flex flex-col justify-end relative font-poppins p-4 sm:p-5 bg-slate-200">
            <BackgroundImage imageUrl={backgroundImage} />
            {backgroundImage && <div className="absolute inset-0 bg-black/10"></div>}

            <div className="relative z-10 bg-white w-full rounded-2xl p-4 shadow-lg flex items-end text-[#4E443A]">
                <div className="flex-1 pr-3">
                    {title && (
                        <h2 className="font-playfair font-bold text-2xl sm:text-3xl leading-tight tracking-tight" style={{ wordBreak: 'break-word' }}>{title}</h2>
                    )}
                    {website && (
                        <p className="mt-2 text-xs font-bold tracking-[0.15em] uppercase text-[#4E443A]/60">{website}</p>
                    )}
                </div>
                <div className="w-1/3 flex flex-col items-center">
                    <div className="w-full aspect-square relative rounded-lg overflow-hidden shadow-inner bg-slate-200 border-2 border-white">
                        <BackgroundImage imageUrl={backgroundImage2} />
                    </div>
                    {subtitle && (
                        <p className="mt-2 text-center text-[10px] font-bold text-white bg-pink-500 px-2 py-1 rounded-full shadow-md transform translate-y-1">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

const QuoteOverlayTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-2xl', 'text-3xl', 'text-4xl');
    return (
        <div className="w-full h-full flex flex-col justify-center items-center relative font-serif p-8">
            <BackgroundImage imageUrl={backgroundImage} />
            <div className="absolute inset-0 bg-black/30"></div>
            <div className="relative z-10 text-center text-white max-w-md bg-black/20 backdrop-blur-md p-8 rounded-lg">
                {title && (
                    <h2 className={`font-playfair ${titleFontSize} leading-tight font-medium`} style={{ wordBreak: 'break-word' }}>
                        "{title}"
                    </h2>
                )}
                {subtitle && (
                    <p className="text-sm tracking-wide mt-6 font-poppins font-semibold text-white/80">
                        — {subtitle}
                    </p>
                )}
            </div>
             {website && (
                <p className="absolute bottom-6 text-xs font-poppins font-bold tracking-[0.15em] text-white/60 uppercase">
                    {website}
                </p>
            )}
        </div>
    );
};

const ShopTheLookTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage, backgroundImage2, backgroundImage3 } = data;
    return (
        <div className="w-full h-full grid grid-rows-3 font-poppins bg-white">
            <div className="row-span-2 relative">
                <BackgroundImage imageUrl={backgroundImage} />
                <div className="absolute inset-0 bg-gray-200 -z-10"></div>
            </div>
            <div className="row-span-1 p-4 flex flex-col justify-center bg-gray-50 border-t border-gray-200 text-[#4E443A]">
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        {title && <h2 className="font-playfair font-bold text-3xl leading-tight tracking-tight" style={{ wordBreak: 'break-word' }}>{title}</h2>}
                        {subtitle && <p className="text-sm font-semibold tracking-wide text-[#4E443A]/70 mt-1">{subtitle}</p>}
                        {website && <p className="mt-2 text-xs font-bold tracking-[0.15em] text-[#4E443A]/50 uppercase">{website}</p>}
                    </div>
                    <div className="w-1/3 flex gap-2">
                        <div className="aspect-square flex-1 relative rounded-md overflow-hidden bg-gray-200 border-2 border-white shadow-md">
                             <BackgroundImage imageUrl={backgroundImage2} />
                        </div>
                        <div className="aspect-square flex-1 relative rounded-md overflow-hidden bg-gray-200 border-2 border-white shadow-md">
                             <BackgroundImage imageUrl={backgroundImage3} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const BeforeAfterTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage, backgroundImage2 } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-2xl', 'text-3xl', 'text-4xl');
    return (
        <div className="w-full h-full flex relative font-poppins text-white">
            <div className="w-1/2 h-full relative">
                <BackgroundImage imageUrl={backgroundImage} />
                <div className="absolute inset-0 bg-black/30"></div>
                <div className="absolute top-4 left-4 bg-white/80 text-black text-xs font-bold uppercase px-2 py-1 rounded">BEFORE</div>
            </div>
            <div className="w-1/2 h-full relative">
                 <BackgroundImage imageUrl={backgroundImage2} />
                 <div className="absolute inset-0 bg-black/10"></div>
                 <div className="absolute top-4 right-4 bg-white text-black text-xs font-bold uppercase px-2 py-1 rounded">AFTER</div>
            </div>

            <div className="absolute inset-0 flex flex-col justify-center items-center p-6 text-center z-10">
                <div className="bg-black/40 backdrop-blur-sm p-6 rounded-lg">
                    {title && <h2 className={`font-playfair font-bold ${titleFontSize} leading-tight tracking-tight`} style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)', wordBreak: 'break-word' }}>{title}</h2>}
                    {subtitle && <p className="mt-2 text-sm tracking-wide font-semibold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>{subtitle}</p>}
                </div>
            </div>
            {website && <p className="absolute bottom-4 text-xs font-bold tracking-[0.15em] text-white/70 uppercase">{website}</p>}
        </div>
    );
};

const ChecklistTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage } = data;
    const listItems = (subtitle || '').split(',').map(item => item.trim()).filter(Boolean);
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-2xl', 'text-3xl', 'text-4xl');

    return (
        <div className="w-full h-full flex flex-col items-center relative font-poppins text-[#4E443A] bg-[#F8F5F2] p-8">
            <BackgroundImage imageUrl={backgroundImage} />
            {backgroundImage && <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>}
            
            <div className="relative z-10 flex flex-col h-full w-full text-center">
                {title && (
                    <h2 className={`font-playfair font-bold ${titleFontSize} leading-tight tracking-tight mb-8`} style={{ wordBreak: 'break-word' }}>
                        {title}
                    </h2>
                )}

                {listItems.length > 0 && (
                    <ul className="space-y-3 text-lg text-left max-w-md mx-auto w-full">
                        {listItems.map((item, index) => (
                            <li key={index} className="flex items-start">
                                <span className="mr-3 mt-1 flex-shrink-0 bg-teal-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                    </svg>
                                </span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                )}
                
                <div className="flex-grow"></div>

                {website && (
                    <p className="mt-auto text-xs font-bold tracking-[0.15em] text-[#4E443A]/50 uppercase">
                        {website}
                    </p>
                )}
            </div>
        </div>
    );
};

const NewArticleTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-3xl md:text-4xl', 'text-4xl md:text-5xl', 'text-5xl md:text-6xl');
    return (
        <div className="w-full h-full flex flex-col justify-between items-center relative font-poppins text-white p-8 text-center">
            <BackgroundImage imageUrl={backgroundImage} />
            {!backgroundImage && <div className="absolute inset-0 bg-slate-800"></div>}
            <div className="absolute inset-0 bg-black/50"></div>
            
            <div className="relative z-10 w-full">
                {website && (
                    <p 
                        className="text-xs font-bold tracking-[0.15em] opacity-80 uppercase"
                        style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}
                    >
                        {website}
                    </p>
                )}
            </div>

            <div className="relative z-10 w-full flex flex-col items-center">
                {title && (
                    <h2 
                        className={`font-playfair font-bold ${titleFontSize} leading-tight tracking-tight`}
                        style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)', wordBreak: 'break-word' }}
                    >
                        {title}
                    </h2>
                )}
            </div>

            <div className="relative z-10 w-full flex flex-col items-center">
                <div className="bg-rose-500 text-white font-bold tracking-widest uppercase px-6 py-3 rounded-sm shadow-lg">
                    {subtitle || 'NEW POST'}
                </div>
            </div>
        </div>
    );
};

const MoodBoardTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, website, backgroundImage, backgroundImage2, backgroundImage3 } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-2xl', 'text-3xl', 'text-4xl');
    return (
        <div className="w-full h-full flex flex-col justify-center items-center relative font-poppins p-6 bg-[#EAE6E1] overflow-hidden">
            <div className="absolute w-2/3 h-1/3 bottom-12 right-[-10%] transform rotate-12 shadow-2xl rounded-lg border-8 border-white box-border">
                <BackgroundImage imageUrl={backgroundImage3} />
                <div className="absolute inset-0 bg-gray-300 -z-10"></div>
            </div>
            <div className="absolute w-3/4 h-1/2 top-4 left-[-10%] transform -rotate-8 shadow-2xl rounded-lg border-8 border-white box-border">
                <BackgroundImage imageUrl={backgroundImage} />
                <div className="absolute inset-0 bg-gray-300 -z-10"></div>
            </div>
            <div className="absolute w-1/2 h-2/5 bottom-4 left-[10%] transform rotate-3 shadow-2xl rounded-lg border-8 border-white box-border">
                <BackgroundImage imageUrl={backgroundImage2} />
                 <div className="absolute inset-0 bg-gray-300 -z-10"></div>
            </div>

            <div className="relative z-20 text-center flex flex-col items-center bg-white/70 backdrop-blur-sm p-6 rounded-md shadow-lg text-[#4E443A]">
                 {title && (
                    <h2 
                        className={`font-playfair ${titleFontSize} font-bold leading-tight`}
                        style={{ wordBreak: 'break-word' }}
                    >
                        {title}
                    </h2>
                )}
                {website && (
                    <p className="text-xs font-bold tracking-[0.15em] mt-4 text-[#4E443A]/50 uppercase">
                        {website}
                    </p>
                )}
            </div>
        </div>
    );
};

const RecipeCardTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage } = data;
    const details = (subtitle || '').split(',').map(s => s.trim()).filter(Boolean);
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-2xl', 'text-3xl', 'text-4xl');
    return (
        <div className="w-full h-full flex flex-col relative font-poppins bg-[#FDFCFB] text-[#4E443A]">
            <div className="h-[60%] w-full relative">
                 <BackgroundImage imageUrl={backgroundImage} />
                 {!backgroundImage && <div className="absolute inset-0 bg-slate-200"></div>}
            </div>
            <div className="h-[40%] w-full flex flex-col justify-center items-center text-center p-6">
                 {title && (
                    <h2 className={`font-playfair ${titleFontSize} font-bold leading-tight tracking-tight`} style={{ wordBreak: 'break-word' }}>
                        {title}
                    </h2>
                )}
                 {details.length > 0 && details[0] && (
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-4 text-[#4E443A]/70">
                        {details.map((detail, index) => (
                            <div key={index} className="flex items-center text-xs sm:text-sm font-semibold tracking-wide">
                                <span className="font-medium">{detail}</span>
                            </div>
                        ))}
                    </div>
                 )}
                 <div className="flex-grow"></div>
                {website && (
                    <p className="mt-auto text-xs font-bold tracking-[0.15em] text-[#4E443A]/50 uppercase">
                        {website}
                    </p>
                )}
            </div>
        </div>
    )
}

const GourmetCloseUpTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-2xl', 'text-3xl', 'text-4xl');
    return (
        <div className="w-full h-full relative font-poppins text-white">
            <BackgroundImage imageUrl={backgroundImage} />
            {!backgroundImage && <div className="absolute inset-0 bg-gray-800"></div>}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent"></div>
            <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <div className="bg-black/30 backdrop-blur-sm p-5 rounded-lg">
                    {subtitle && <p className="text-sm font-semibold tracking-wide uppercase opacity-80">{subtitle}</p>}
                    {title && <h2 className={`font-playfair ${titleFontSize} font-bold leading-tight tracking-tight mt-1`} style={{ wordBreak: 'break-word' }}>{title}</h2>}
                </div>
            </div>
            {website && <p className="absolute top-5 right-5 text-xs font-bold tracking-[0.15em] opacity-70 uppercase" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>{website}</p>}
        </div>
    )
}

const StepByStepGuideTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage, backgroundImage2, backgroundImage3 } = data;
    const steps = (subtitle || '').split(',').map(s => s.trim()).filter(Boolean);
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-3xl', 'text-4xl', 'text-5xl');
    return (
        <div className="w-full h-full flex flex-col relative font-poppins bg-white text-gray-800">
            <div className="h-1/2 w-full relative">
                <BackgroundImage imageUrl={backgroundImage} />
                {!backgroundImage && <div className="absolute inset-0 bg-slate-200"></div>}
                <div className="absolute inset-0 bg-black/30"></div>
                <div className="absolute inset-0 p-8 flex flex-col justify-center items-center text-center text-white">
                    {title && <h2 className={`font-playfair ${titleFontSize} font-bold leading-tight`} style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.6)', wordBreak: 'break-word' }}>{title}</h2>}
                </div>
            </div>
            <div className="h-1/2 w-full flex flex-col p-4">
                <div className="flex-grow grid grid-cols-2 gap-4">
                    <div className="relative rounded-lg overflow-hidden">
                        <BackgroundImage imageUrl={backgroundImage2} />
                        {!backgroundImage2 && <div className="absolute inset-0 bg-slate-200"></div>}
                         <div className="absolute bottom-0 left-0 bg-black/50 text-white text-xs font-bold p-2">
                           {steps[0] || 'STEP 1'}
                        </div>
                    </div>
                     <div className="relative rounded-lg overflow-hidden">
                        <BackgroundImage imageUrl={backgroundImage3} />
                        {!backgroundImage3 && <div className="absolute inset-0 bg-slate-200"></div>}
                        <div className="absolute bottom-0 left-0 bg-black/50 text-white text-xs font-bold p-2">
                           {steps[1] || 'STEP 2'}
                        </div>
                    </div>
                </div>
                {website && <p className="text-center mt-4 text-xs font-bold tracking-[0.15em] text-[#4E443A]/50 uppercase">{website}</p>}
            </div>
        </div>
    )
}

const MinimalistIngredientsTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage, backgroundImage2 } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-2xl', 'text-3xl', 'text-4xl');
    return (
        <div className="w-full h-full flex flex-col relative font-poppins bg-white">
            <div className="flex-1 relative">
                <BackgroundImage imageUrl={backgroundImage} />
                 {!backgroundImage && <div className="absolute inset-0 bg-slate-200"></div>}
            </div>
             <div className="flex-1 relative">
                <BackgroundImage imageUrl={backgroundImage2} />
                 {!backgroundImage2 && <div className="absolute inset-0 bg-slate-200"></div>}
            </div>

            <div className="absolute inset-0 flex justify-center items-center p-8">
                <div
                    className="text-center p-8 shadow-2xl rounded-lg border-4 text-white"
                    style={{ backgroundColor: '#FF8603', borderColor: '#F28400' }}
                >
                    {title && <h2 className={`font-playfair ${titleFontSize} font-bold leading-tight tracking-tight text-white`} style={{ wordBreak: 'break-word' }}>{title}</h2>}
                    {subtitle && <p className="mt-4 text-sm font-semibold tracking-wide opacity-90">{subtitle}</p>}
                </div>
            </div>

            {website && <p className="absolute bottom-4 left-4 text-xs font-bold tracking-[0.15em] text-black/50 bg-white/50 px-2 py-1 rounded uppercase">{website}</p>}
        </div>
    );
};

const SoftLavenderTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage, backgroundImage2 } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-2xl', 'text-3xl', 'text-4xl');
    return (
        <div className="w-full h-full flex flex-col relative font-poppins bg-white">
            <div className="flex-1 relative"><BackgroundImage imageUrl={backgroundImage} />{!backgroundImage && <div className="absolute inset-0 bg-slate-200"></div>}</div>
            <div className="flex-1 relative"><BackgroundImage imageUrl={backgroundImage2} />{!backgroundImage2 && <div className="absolute inset-0 bg-slate-200"></div>}</div>
            <div className="absolute inset-0 flex justify-center items-center p-8">
                <div className="text-center p-8 shadow-2xl rounded-lg border-2" style={{ backgroundColor: '#F3E8FF', borderColor: '#FFFFFF', color: '#3A2E4A' }}>
                    {title && <h2 className={`font-poppins font-bold ${titleFontSize} leading-tight tracking-tight`} style={{ wordBreak: 'break-word' }}>{title}</h2>}
                    {subtitle && <p className="font-allura text-3xl mt-2 opacity-90">{subtitle}</p>}
                </div>
            </div>
            {website && <p className="absolute bottom-4 left-4 text-xs font-bold tracking-[0.15em] text-black/50 bg-white/50 px-2 py-1 rounded uppercase">{website}</p>}
        </div>
    );
};

const WarmCaramelTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage, backgroundImage2 } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-2xl', 'text-3xl', 'text-4xl');
    return (
        <div className="w-full h-full flex flex-col relative font-poppins bg-white">
            <div className="flex-1 relative"><BackgroundImage imageUrl={backgroundImage} />{!backgroundImage && <div className="absolute inset-0 bg-slate-200"></div>}</div>
            <div className="flex-1 relative"><BackgroundImage imageUrl={backgroundImage2} />{!backgroundImage2 && <div className="absolute inset-0 bg-slate-200"></div>}</div>
            <div className="absolute inset-0 flex justify-center items-center p-8">
                <div className="text-center p-8 shadow-2xl rounded-lg border-2" style={{ backgroundColor: '#F5D9B0', borderColor: '#FFFFFF', color: '#3C2F1C' }}>
                    {title && <h2 className={`font-montserrat font-extrabold ${titleFontSize} leading-tight tracking-tight`} style={{ wordBreak: 'break-word' }}>{title}</h2>}
                    {subtitle && <p className="font-caveat-brush text-2xl mt-2 opacity-90">{subtitle}</p>}
                </div>
            </div>
            {website && <p className="absolute bottom-4 left-4 text-xs font-bold tracking-[0.15em] text-black/50 bg-white/50 px-2 py-1 rounded uppercase">{website}</p>}
        </div>
    );
};

const SkyBlueTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage, backgroundImage2 } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-2xl', 'text-3xl', 'text-4xl');
    return (
        <div className="w-full h-full flex flex-col relative font-poppins bg-white">
            <div className="flex-1 relative"><BackgroundImage imageUrl={backgroundImage} />{!backgroundImage && <div className="absolute inset-0 bg-slate-200"></div>}</div>
            <div className="flex-1 relative"><BackgroundImage imageUrl={backgroundImage2} />{!backgroundImage2 && <div className="absolute inset-0 bg-slate-200"></div>}</div>
            <div className="absolute inset-0 flex justify-center items-center p-8">
                <div className="text-center p-8 shadow-2xl rounded-lg border-2" style={{ backgroundColor: '#DFF3FF', borderColor: '#FFFFFF', color: '#13334C' }}>
                    {title && <h2 className={`font-nunito font-black ${titleFontSize} leading-tight tracking-tight`} style={{ wordBreak: 'break-word' }}>{title}</h2>}
                    {subtitle && <p className="font-pacifico text-2xl mt-2 opacity-90">{subtitle}</p>}
                </div>
            </div>
            {website && <p className="absolute bottom-4 left-4 text-xs font-bold tracking-[0.15em] text-black/50 bg-white/50 px-2 py-1 rounded uppercase">{website}</p>}
        </div>
    );
};

const BlushPinkTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage, backgroundImage2 } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-2xl', 'text-3xl', 'text-4xl');
    return (
        <div className="w-full h-full flex flex-col relative font-poppins bg-white">
            <div className="flex-1 relative"><BackgroundImage imageUrl={backgroundImage} />{!backgroundImage && <div className="absolute inset-0 bg-slate-200"></div>}</div>
            <div className="flex-1 relative"><BackgroundImage imageUrl={backgroundImage2} />{!backgroundImage2 && <div className="absolute inset-0 bg-slate-200"></div>}</div>
            <div className="absolute inset-0 flex justify-center items-center p-8">
                <div className="text-center p-8 shadow-2xl rounded-lg border-2" style={{ backgroundColor: '#FFE4EC', borderColor: '#FFFFFF', color: '#842B47' }}>
                    {title && <h2 className={`font-playfair font-bold ${titleFontSize} leading-tight tracking-tight`} style={{ wordBreak: 'break-word' }}>{title}</h2>}
                    {subtitle && <p className="font-montserrat font-medium text-sm uppercase tracking-widest mt-2">{subtitle}</p>}
                </div>
            </div>
            {website && <p className="absolute bottom-4 left-4 text-xs font-bold tracking-[0.15em] text-black/50 bg-white/50 px-2 py-1 rounded uppercase">{website}</p>}
        </div>
    );
};

const MochaCafeTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage, backgroundImage2 } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-3xl', 'text-4xl', 'text-5xl');
    return (
        <div className="w-full h-full flex flex-col relative font-poppins bg-white">
            <div className="flex-1 relative"><BackgroundImage imageUrl={backgroundImage} />{!backgroundImage && <div className="absolute inset-0 bg-slate-200"></div>}</div>
            <div className="flex-1 relative"><BackgroundImage imageUrl={backgroundImage2} />{!backgroundImage2 && <div className="absolute inset-0 bg-slate-200"></div>}</div>
            <div className="absolute inset-0 flex justify-center items-center p-8">
                <div className="text-center p-8 shadow-2xl rounded-lg border-2" style={{ backgroundColor: '#E9D7C5', borderColor: '#FFFFFF', color: '#4B2E14' }}>
                    {title && <h2 className={`font-cormorant-garamond font-bold ${titleFontSize} leading-none tracking-tight`} style={{ wordBreak: 'break-word' }}>{title}</h2>}
                    {subtitle && <p className="font-poppins text-xs uppercase tracking-widest mt-3">{subtitle}</p>}
                </div>
            </div>
            {website && <p className="absolute bottom-4 left-4 text-xs font-bold tracking-[0.15em] text-black/50 bg-white/50 px-2 py-1 rounded uppercase">{website}</p>}
        </div>
    );
};

const PastelYellowTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage, backgroundImage2 } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-3xl', 'text-4xl', 'text-5xl');
    return (
        <div className="w-full h-full flex flex-col relative font-poppins bg-white">
            <div className="flex-1 relative"><BackgroundImage imageUrl={backgroundImage} />{!backgroundImage && <div className="absolute inset-0 bg-slate-200"></div>}</div>
            <div className="flex-1 relative"><BackgroundImage imageUrl={backgroundImage2} />{!backgroundImage2 && <div className="absolute inset-0 bg-slate-200"></div>}</div>
            <div className="absolute inset-0 flex justify-center items-center p-8">
                <div className="text-center p-8 shadow-2xl rounded-lg border-2" style={{ backgroundColor: '#FFF4B8', borderColor: '#FFFFFF', color: '#2A2A2A' }}>
                    {title && <h2 className={`font-anton uppercase ${titleFontSize} leading-tight tracking-tight`} style={{ wordBreak: 'break-word' }}>{title}</h2>}
                    {subtitle && <p className="font-dm-sans text-sm mt-3">{subtitle}</p>}
                </div>
            </div>
            {website && <p className="absolute bottom-4 left-4 text-xs font-bold tracking-[0.15em] text-black/50 bg-white/50 px-2 py-1 rounded uppercase">{website}</p>}
        </div>
    );
};

const CoolGreyTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage, backgroundImage2 } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-3xl', 'text-4xl', 'text-5xl');
    return (
        <div className="w-full h-full flex flex-col relative font-poppins bg-white">
            <div className="flex-1 relative"><BackgroundImage imageUrl={backgroundImage} />{!backgroundImage && <div className="absolute inset-0 bg-slate-200"></div>}</div>
            <div className="flex-1 relative"><BackgroundImage imageUrl={backgroundImage2} />{!backgroundImage2 && <div className="absolute inset-0 bg-slate-200"></div>}</div>
            <div className="absolute inset-0 flex justify-center items-center p-8">
                <div className="text-center p-8 shadow-2xl rounded-lg border-2" style={{ backgroundColor: '#F2F2F2', borderColor: '#FFFFFF', color: '#111111' }}>
                    {title && <h2 className={`font-bebas-neue ${titleFontSize} tracking-wide leading-tight`} style={{ wordBreak: 'break-word' }}>{title}</h2>}
                    {subtitle && <p className="font-open-sans text-sm mt-2 font-semibold uppercase">{subtitle}</p>}
                </div>
            </div>
            {website && <p className="absolute bottom-4 left-4 text-xs font-bold tracking-[0.15em] text-black/50 bg-white/50 px-2 py-1 rounded uppercase">{website}</p>}
        </div>
    );
};

const SoftCoralTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage, backgroundImage2 } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-2xl', 'text-3xl', 'text-4xl');
    return (
        <div className="w-full h-full flex flex-col relative font-poppins bg-white">
            <div className="flex-1 relative"><BackgroundImage imageUrl={backgroundImage} />{!backgroundImage && <div className="absolute inset-0 bg-slate-200"></div>}</div>
            <div className="flex-1 relative"><BackgroundImage imageUrl={backgroundImage2} />{!backgroundImage2 && <div className="absolute inset-0 bg-slate-200"></div>}</div>
            <div className="absolute inset-0 flex justify-center items-center p-8">
                <div className="text-center p-8 shadow-2xl rounded-lg border-2" style={{ backgroundColor: '#FFD8C8', borderColor: '#FFFFFF', color: '#5A2E25' }}>
                    {title && <h2 className={`font-nunito font-extrabold ${titleFontSize} leading-tight tracking-tight`} style={{ wordBreak: 'break-word' }}>{title}</h2>}
                    {subtitle && <p className="font-great-vibes text-3xl mt-2">{subtitle}</p>}
                </div>
            </div>
            {website && <p className="absolute bottom-4 left-4 text-xs font-bold tracking-[0.15em] text-black/50 bg-white/50 px-2 py-1 rounded uppercase">{website}</p>}
        </div>
    );
};

const FreshLimeTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage, backgroundImage2 } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-2xl', 'text-3xl', 'text-4xl');
    return (
        <div className="w-full h-full flex flex-col relative font-poppins bg-white">
            <div className="flex-1 relative"><BackgroundImage imageUrl={backgroundImage} />{!backgroundImage && <div className="absolute inset-0 bg-slate-200"></div>}</div>
            <div className="flex-1 relative"><BackgroundImage imageUrl={backgroundImage2} />{!backgroundImage2 && <div className="absolute inset-0 bg-slate-200"></div>}</div>
            <div className="absolute inset-0 flex justify-center items-center p-8">
                <div className="text-center p-8 shadow-2xl rounded-lg border-2" style={{ backgroundColor: '#E6FFC9', borderColor: '#FFFFFF', color: '#1C3A13' }}>
                    {title && <h2 className={`font-poppins font-black ${titleFontSize} leading-tight tracking-tight`} style={{ wordBreak: 'break-word' }}>{title}</h2>}
                    {subtitle && <p className="font-allura text-3xl mt-2">{subtitle}</p>}
                </div>
            </div>
            {website && <p className="absolute bottom-4 left-4 text-xs font-bold tracking-[0.15em] text-black/50 bg-white/50 px-2 py-1 rounded uppercase">{website}</p>}
        </div>
    );
};

const VanillaRoseTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage, backgroundImage2 } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-2xl', 'text-3xl', 'text-4xl');
    return (
        <div className="w-full h-full flex flex-col relative font-poppins bg-white">
            <div className="flex-1 relative"><BackgroundImage imageUrl={backgroundImage} />{!backgroundImage && <div className="absolute inset-0 bg-slate-200"></div>}</div>
            <div className="flex-1 relative"><BackgroundImage imageUrl={backgroundImage2} />{!backgroundImage2 && <div className="absolute inset-0 bg-slate-200"></div>}</div>
            <div className="absolute inset-0 flex justify-center items-center p-8">
                <div className="text-center p-8 shadow-2xl rounded-lg border-2" style={{ backgroundColor: '#FBF7F2', borderColor: '#D7AFA6', color: '#6D3F36' }}>
                    {title && <h2 className={`font-playfair font-black ${titleFontSize} leading-tight tracking-tight`} style={{ wordBreak: 'break-word' }}>{title}</h2>}
                    {subtitle && <p className="font-montserrat font-light text-sm uppercase tracking-widest mt-2">{subtitle}</p>}
                </div>
            </div>
            {website && <p className="absolute bottom-4 left-4 text-xs font-bold tracking-[0.15em] text-black/50 bg-white/50 px-2 py-1 rounded uppercase">{website}</p>}
        </div>
    );
};

const GreenGrungeTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage, backgroundImage2 } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-3xl', 'text-4xl', 'text-5xl');
    return (
        <div className="w-full h-full flex flex-col relative font-poppins bg-white">
            <div className="flex-1 relative overflow-hidden">
                <BackgroundImage imageUrl={backgroundImage} />
                {!backgroundImage && <div className="absolute inset-0 bg-stone-300"></div>}
            </div>
            <div className="flex-1 relative overflow-hidden">
                <BackgroundImage imageUrl={backgroundImage2} />
                {!backgroundImage2 && <div className="absolute inset-0 bg-stone-400"></div>}
            </div>

            <div className="absolute inset-0 flex flex-col justify-center items-center p-6">
                <div 
                    className="relative p-6 md:p-8 transform -rotate-1 max-w-[90%] text-center shadow-[4px_4px_0px_rgba(0,0,0,0.25)]"
                    style={{
                        backgroundColor: '#4F6F3A',
                        color: '#FFFFFF',
                        clipPath: 'polygon(2% 0%, 98% 1%, 100% 98%, 0% 100%)' 
                    }}
                >
                    <div className="border-2 border-dashed border-white/40 p-4 flex flex-col justify-center items-center h-full">
                        {title && (
                            <h2 
                                className={`font-nunito font-extrabold ${titleFontSize} leading-[0.9] tracking-normal uppercase drop-shadow-md`}
                                style={{ wordBreak: 'break-word' }}
                            >
                                {title}
                            </h2>
                        )}
                        {subtitle && (
                            <p className="font-nunito font-bold text-lg sm:text-xl mt-3 text-[#E0F2D5] uppercase tracking-wide leading-tight">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {website && (
                <div className="absolute bottom-4 right-4 transform rotate-2">
                     <p className="text-xs font-extrabold tracking-[0.15em] text-[#4F6F3A] bg-white/90 px-3 py-1.5 uppercase font-nunito shadow-sm border border-[#4F6F3A]">
                        {website}
                    </p>
                </div>
            )}
        </div>
    );
};

const SmoothieStyleTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage, backgroundImage2 } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-3xl', 'text-4xl', 'text-5xl');
    return (
        <div className="w-full h-full flex flex-col relative font-poppins bg-white">
            <div className="flex-1 relative overflow-hidden">
                <BackgroundImage imageUrl={backgroundImage} />
                {!backgroundImage && <div className="absolute inset-0 bg-orange-100"></div>}
            </div>
            <div className="flex-1 relative overflow-hidden">
                <BackgroundImage imageUrl={backgroundImage2} />
                {!backgroundImage2 && <div className="absolute inset-0 bg-pink-100"></div>}
            </div>

            <div className="absolute inset-0 flex flex-col justify-center items-center p-6">
                <div 
                    className="relative p-6 md:p-8 transform -rotate-1 max-w-[90%] text-center shadow-[4px_4px_0px_rgba(0,0,0,0.15)]"
                    style={{
                        backgroundColor: '#EF476F',
                        color: '#FFFFFF',
                        clipPath: 'polygon(2% 0%, 98% 1%, 100% 98%, 0% 100%)' 
                    }}
                >
                    <div className="border-2 border-dashed border-white/60 p-4 flex flex-col justify-center items-center h-full">
                        {title && (
                            <h2 
                                className={`font-nunito font-extrabold ${titleFontSize} leading-[0.9] tracking-normal uppercase drop-shadow-sm`}
                                style={{ wordBreak: 'break-word' }}
                            >
                                {title}
                            </h2>
                        )}
                        {subtitle && (
                            <p className="font-nunito font-bold text-lg sm:text-xl mt-3 text-[#FFE3E3] uppercase tracking-wide leading-tight">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {website && (
                <div className="absolute bottom-4 right-4 transform rotate-2">
                     <p className="text-xs font-extrabold tracking-[0.15em] text-[#EF476F] bg-white/95 px-3 py-1.5 uppercase font-nunito shadow-sm border border-[#EF476F]">
                        {website}
                    </p>
                </div>
            )}
        </div>
    );
};

const BlueberrySmoothieTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage, backgroundImage2 } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-3xl', 'text-4xl', 'text-5xl');
    return (
        <div className="w-full h-full flex flex-col relative font-poppins bg-white">
            <div className="flex-1 relative overflow-hidden">
                <BackgroundImage imageUrl={backgroundImage} />
                {!backgroundImage && <div className="absolute inset-0 bg-purple-100"></div>}
            </div>
            <div className="flex-1 relative overflow-hidden">
                <BackgroundImage imageUrl={backgroundImage2} />
                {!backgroundImage2 && <div className="absolute inset-0 bg-blue-100"></div>}
            </div>

            <div className="absolute inset-0 flex flex-col justify-center items-center p-6">
                <div 
                    className="relative p-6 md:p-8 transform -rotate-1 max-w-[90%] text-center shadow-[4px_4px_0px_rgba(0,0,0,0.15)]"
                    style={{
                        backgroundColor: '#7209B7',
                        color: '#FFFFFF',
                        clipPath: 'polygon(2% 0%, 98% 1%, 100% 98%, 0% 100%)' 
                    }}
                >
                    <div className="border-2 border-dashed border-white/60 p-4 flex flex-col justify-center items-center h-full">
                        {title && (
                            <h2 
                                className={`font-nunito font-extrabold ${titleFontSize} leading-[0.9] tracking-normal uppercase drop-shadow-sm`}
                                style={{ wordBreak: 'break-word' }}
                            >
                                {title}
                            </h2>
                        )}
                        {subtitle && (
                            <p className="font-nunito font-bold text-lg sm:text-xl mt-3 text-[#E0AAFF] uppercase tracking-wide leading-tight">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {website && (
                <div className="absolute bottom-4 right-4 transform rotate-2">
                     <p className="text-xs font-extrabold tracking-[0.15em] text-[#7209B7] bg-white/95 px-3 py-1.5 uppercase font-nunito shadow-sm border border-[#7209B7]">
                        {website}
                    </p>
                </div>
            )}
        </div>
    );
};

// FIX: Added missing template component AestheticGourmetEleganceTemplate
const AestheticGourmetEleganceTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-4xl', 'text-5xl', 'text-6xl');
    return (
        <div className="w-full h-full flex flex-col relative font-poppins overflow-hidden bg-[#1A1A1A]">
            <BackgroundImage imageUrl={backgroundImage} className="opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80"></div>
            <div className="relative z-10 h-full flex flex-col justify-end p-10 text-center">
                 <div className="mb-6 border-b border-white/30 pb-6">
                    {subtitle && (
                        <p className="text-pink-400 text-xs font-bold uppercase tracking-[0.4em] mb-3">
                            {subtitle}
                        </p>
                    )}
                    {title && (
                        <h2 className={`font-playfair font-black ${titleFontSize} leading-tight text-white uppercase italic`} style={{ wordBreak: 'break-word' }}>
                            {title}
                        </h2>
                    )}
                </div>
                {website && (
                    <p className="text-white/60 text-[10px] font-bold tracking-[0.3em] uppercase">
                        {website}
                    </p>
                )}
            </div>
        </div>
    );
};

// FIX: Added missing template component AestheticFreshDuoTemplate
const AestheticFreshDuoTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage, backgroundImage2 } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-2xl', 'text-3xl', 'text-4xl');
    return (
        <div className="w-full h-full flex flex-col relative font-poppins bg-[#F9F9F9] p-4">
            <div className="flex-1 flex gap-4 mb-4">
                <div className="flex-1 relative rounded-2xl overflow-hidden shadow-md">
                    <BackgroundImage imageUrl={backgroundImage} />
                </div>
                <div className="flex-1 relative rounded-2xl overflow-hidden shadow-md">
                    <BackgroundImage imageUrl={backgroundImage2} />
                </div>
            </div>
            <div className="h-1/3 bg-white rounded-3xl p-6 shadow-xl flex flex-col justify-center items-center text-center">
                {subtitle && <p className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest mb-2">{subtitle}</p>}
                {title && <h2 className={`font-playfair font-bold ${titleFontSize} leading-tight text-slate-800`} style={{ wordBreak: 'break-word' }}>{title}</h2>}
                {website && <p className="mt-4 text-[9px] text-slate-400 font-bold tracking-widest uppercase">{website}</p>}
            </div>
        </div>
    );
};

// FIX: Added missing template component AestheticPastelDessertDuoTemplate
const AestheticPastelDessertDuoTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage, backgroundImage2 } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-3xl', 'text-4xl', 'text-5xl');
    return (
        <div className="w-full h-full flex flex-col relative font-poppins bg-[#FFF5F7]">
            <div className="h-1/2 relative flex">
                <div className="w-1/2 h-full relative border-r-4 border-white">
                    <BackgroundImage imageUrl={backgroundImage} />
                </div>
                <div className="w-1/2 h-full relative">
                    <BackgroundImage imageUrl={backgroundImage2} />
                </div>
            </div>
            <div className="h-1/2 flex flex-col justify-center items-center p-8 text-center">
                <div className="relative">
                    <div className="absolute -top-6 -left-6 w-12 h-12 bg-pink-100 rounded-full -z-10 opacity-50"></div>
                    {title && <h2 className={`font-playfair font-black ${titleFontSize} leading-[1.1] text-pink-900 tracking-tight mb-4`} style={{ wordBreak: 'break-word' }}>{title}</h2>}
                </div>
                {subtitle && <p className="text-pink-500/80 font-medium italic text-lg mb-6">{subtitle}</p>}
                <div className="w-16 h-1 bg-pink-200 mb-6"></div>
                {website && <p className="text-pink-300 text-[10px] font-bold tracking-[0.2em] uppercase">{website}</p>}
            </div>
        </div>
    );
};

const AestheticLuxuryMagazineDuoTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage, backgroundImage2 } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-3xl', 'text-4xl', 'text-5xl');
    
    return (
        <div className="w-full h-full flex flex-col relative font-poppins overflow-hidden bg-gradient-to-br from-[#FFFDF0] to-[#FDF5E6]">
            {/* Top Half */}
            <div className="relative h-1/2 w-full overflow-hidden">
                <BackgroundImage imageUrl={backgroundImage} className="scale-110 shadow-lg" />
                {!backgroundImage && (
                    <div className="absolute inset-0 bg-[#043927]/10 flex items-center justify-center text-[#043927]/40 font-bold uppercase tracking-widest text-xs">Dish One</div>
                )}
            </div>

            {/* Bottom Half */}
            <div className="relative h-1/2 w-full overflow-hidden border-t-2 border-[#B76E79]/30">
                <BackgroundImage imageUrl={backgroundImage2} className="scale-125" />
                {!backgroundImage2 && (
                    <div className="absolute inset-0 bg-[#B76E79]/5 flex items-center justify-center text-[#B76E79]/40 font-bold uppercase tracking-widest text-xs">Dish Two</div>
                )}
                <div className="absolute inset-0 bg-black/10"></div>
            </div>

            {/* Rose Gold Metallic Divider */}
            <div className="absolute top-1/2 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-[#B76E79] to-transparent z-20 -translate-y-1/2 shadow-[0_2px_4px_rgba(0,0,0,0.1)]"></div>

            {/* Centered Floating Content Card */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-[88%]">
                <div className="bg-white/80 backdrop-blur-md p-6 sm:p-10 border border-[#B76E79]/20 shadow-[0_20px_40px_rgba(0,0,0,0.1)] text-center relative">
                    {/* Decorative Elements */}
                    <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#B76E79]/30"></div>
                    <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#B76E79]/30"></div>

                    {/* Main Title - Elegant Serif */}
                    {title && (
                        <h2 className={`font-playfair font-black ${titleFontSize} leading-[1.1] text-slate-900 tracking-tight mb-3 uppercase`} style={{ wordBreak: 'break-word' }}>
                            {title}
                        </h2>
                    )}

                    {/* Subtitle - Clean tracked-out Sans */}
                    {subtitle && (
                        <p className="text-[#043927] text-[10px] font-bold uppercase tracking-[0.4em] leading-none mb-1">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            {/* Visual CTA Button at Bottom */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-40">
                <div className="bg-gradient-to-br from-[#B76E79] to-[#8E5A63] text-white px-10 py-2.5 rounded-sm shadow-xl transform hover:scale-105 transition-transform cursor-pointer border-b-2 border-black/10">
                    <p className="text-[11px] font-black tracking-[0.25em] uppercase whitespace-nowrap">
                        GET THE RECIPE
                    </p>
                </div>
            </div>

            {/* Small Branding (Bottom Right) */}
            {website && (
                <div className="absolute bottom-5 right-8 z-40">
                    <p className="text-[#B76E79] text-[10px] font-bold tracking-[0.3em] uppercase italic opacity-80">
                        {website}
                    </p>
                </div>
            )}
            
            {/* Emerald Geometric Accent */}
            <div className="absolute top-8 left-8 w-12 h-12 rounded-sm border border-[#043927]/10 z-20 pointer-events-none rotate-45"></div>
        </div>
    );
};

const TemplatePreview = forwardRef<HTMLDivElement, TemplatePreviewProps>(({ data }, ref) => {
    const { templateId } = data;

    const renderTemplate = () => {
        switch (templateId) {
            case '1': return <ClassicTemplate data={data} />;
            case '2': return <SplitTemplate data={data} />;
            case '3': return <ModernTemplate data={data} />;
            case '4': return <BrushStrokeTemplate data={data} />;
            case '5': return <BorderTemplate data={data} />;
            case '6': return <EditorialTemplate data={data} />;
            case '7': return <CleanGridTemplate data={data} />;
            case '8': return <MinimalistQuoteTemplate data={data} />;
            case '9': return <TastyRecipeTemplate data={data} />;
            case '10': return <DetailedRecipeTemplate data={data} />;
            case '11': return <TrendyCollageTemplate data={data} />;
            case '12': return <RetroVibesTemplate data={data} />;
            case '13': return <ProductSpotlightTemplate data={data} />;
            case '14': return <QuoteOverlayTemplate data={data} />;
            case '15': return <ShopTheLookTemplate data={data} />;
            case '16': return <BeforeAfterTemplate data={data} />;
            case '17': return <ChecklistTemplate data={data} />;
            case '18': return <NewArticleTemplate data={data} />;
            case '19': return <MoodBoardTemplate data={data} />;
            case '20': return <RecipeCardTemplate data={data} />;
            case '21': return <GourmetCloseUpTemplate data={data} />;
            case '22': return <StepByStepGuideTemplate data={data} />;
            case '23': return <MinimalistIngredientsTemplate data={data} />;
            
            case '59': return <SoftLavenderTemplate data={data} />;
            case '60': return <WarmCaramelTemplate data={data} />;
            case '61': return <SkyBlueTemplate data={data} />;
            case '62': return <BlushPinkTemplate data={data} />;
            case '63': return <MochaCafeTemplate data={data} />;
            case '64': return <PastelYellowTemplate data={data} />;
            case '65': return <CoolGreyTemplate data={data} />;
            case '66': return <SoftCoralTemplate data={data} />;
            case '67': return <FreshLimeTemplate data={data} />;
            case '68': return <VanillaRoseTemplate data={data} />;
            case '69': return <GreenGrungeTemplate data={data} />;
            case '70': return <SmoothieStyleTemplate data={data} />;
            case '71': return <BlueberrySmoothieTemplate data={data} />;
            case '86': return <AestheticGourmetEleganceTemplate data={data} />;
            case '87': return <AestheticFreshDuoTemplate data={data} />;
            case '88': return <AestheticPastelDessertDuoTemplate data={data} />;
            case '90': return <AestheticLuxuryMagazineDuoTemplate data={data} />; // New Template

            default: return <ClassicTemplate data={data} />;
        }
    };

    const getAspectRatioClass = () => {
        switch(data.pinSize) {
            case 'standard': return 'aspect-[3/4]';
            case 'long': return 'aspect-[9/16]';
            case 'extraLong': return 'aspect-[1/2.4]';
            default: return 'aspect-[2/3]';
        }
    };

    return (
        <div ref={ref} className={`w-full ${getAspectRatioClass()} bg-white shadow-xl overflow-hidden relative text-slate-800`}>
            {renderTemplate()}
        </div>
    );
});

export default TemplatePreview;
