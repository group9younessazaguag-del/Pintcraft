
import React, { forwardRef } from 'react';
import type { TemplateData } from '@/types';
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

const DistressedBannerTemplate: React.FC<{
    data: TemplateData;
    mainBgColor: string;
    mainTextColor: string;
    subtitleColor: string;
    websiteTagBgColor: string;
    websiteTagTextColor: string;
    websiteTagBorderColor: string;
    lightBgImage?: string;
    darkBgImage?: string;
    mainClipPath?: string;
    mainRotation?: string;
    websiteTagClipPath?: string;
    websiteTagRotation?: string;
    websiteTagTransform?: string;
}> = ({
    data,
    mainBgColor,
    mainTextColor,
    subtitleColor,
    websiteTagBgColor,
    websiteTagTextColor,
    websiteTagBorderColor,
    lightBgImage,
    darkBgImage,
    mainClipPath = 'polygon(0% 5%, 3% 0%, 97% 1%, 100% 5%, 100% 95%, 97% 100%, 3% 99%, 0% 95%)',
    mainRotation = '-rotate-2',
    websiteTagClipPath = 'polygon(2% 0%, 100% 8%, 98% 100%, 0% 92%)',
    websiteTagRotation = 'rotate-0.5',
    websiteTagTransform = 'translate-x-[-5px] translate-y-[5px]',
}) => {
    const { title, subtitle, website, backgroundImage, backgroundImage2 } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-3xl', 'text-4xl', 'text-5xl');
    return (
        <div className="w-full h-full flex flex-col relative font-poppins bg-white">
            <div className="flex-1 relative overflow-hidden">
                <BackgroundImage imageUrl={backgroundImage} />
                {!backgroundImage && <div className="absolute inset-0" style={{backgroundColor: lightBgImage || 'bg-emerald-50'}}></div>}
            </div>
            <div className="flex-1 relative overflow-hidden">
                <BackgroundImage imageUrl={backgroundImage2} />
                {!backgroundImage2 && <div className="absolute inset-0" style={{backgroundColor: darkBgImage || 'bg-emerald-100'}}></div>}
            </div>

            <div className="absolute inset-0 flex flex-col justify-center items-center p-6">
                <div 
                    className={`relative p-6 md:p-8 transform ${mainRotation} max-w-[90%] text-center shadow-[10px_10px_15px_rgba(0,0,0,0.3)]`}
                    style={{
                        backgroundColor: mainBgColor,
                        color: mainTextColor,
                        clipPath: mainClipPath,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3Cfilter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")`
                    }}
                >
                    <div className="p-0 flex flex-col justify-center items-center h-full"> 
                        {title && (
                            <h2 
                                className={`font-anton font-extrabold ${titleFontSize} leading-[0.9] tracking-normal uppercase drop-shadow-md`}
                                style={{ wordBreak: 'break-word', textShadow: '4px 4px 8px rgba(0,0,0,0.8)' }}
                            >
                                {title}
                            </h2>
                        )}
                        {subtitle && (
                            <p className="font-nunito font-bold text-lg sm:text-xl mt-3 uppercase tracking-wide leading-tight drop-shadow-lg"
                                style={{color: subtitleColor, textShadow: '2px 2px 4px rgba(0,0,0,0.6)'}}
                            > 
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {website && (
                <div className={`absolute bottom-6 right-6 transform ${websiteTagRotation} ${websiteTagTransform}`}>
                     <p 
                        className="text-xs font-extrabold tracking-[0.15em] px-4 py-2 uppercase font-nunito shadow-md"
                        style={{
                            color: websiteTagTextColor,
                            backgroundColor: websiteTagBgColor,
                            border: `2px solid ${websiteTagBorderColor}`,
                            clipPath: websiteTagClipPath,
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 50 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='1' stitchTiles='stitch'/%3E%3Cfilter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.2'/%3E%3C/svg%3E")`
                        }}
                     >
                        {website}
                    </p>
                </div>
            )}
        </div>
    );
};

/* Fix: Added missing GreenGrungeTemplate definition */
const GreenGrungeTemplate: React.FC<{ data: TemplateData }> = (props) => (
    <DistressedBannerTemplate
        {...props}
        mainBgColor="#2D5A27"
        mainTextColor="#F0F0F0"
        subtitleColor="#A4C639"
        websiteTagBgColor="#1A3317"
        websiteTagTextColor="#FFFFFF"
        websiteTagBorderColor="#A4C639"
        mainRotation="rotate-1"
    />
);

/* Fix: Added missing SmoothieStyleTemplate definition */
const SmoothieStyleTemplate: React.FC<{ data: TemplateData }> = (props) => (
    <DistressedBannerTemplate
        {...props}
        mainBgColor="#FF6B6B"
        mainTextColor="#FFFFFF"
        subtitleColor="#FFE66D"
        websiteTagBgColor="#4ECDC4"
        websiteTagTextColor="#FFFFFF"
        websiteTagBorderColor="#FFFFFF"
    />
);

/* Fix: Added missing BlueberrySmoothieTemplate definition */
const BlueberrySmoothieTemplate: React.FC<{ data: TemplateData }> = (props) => (
    <DistressedBannerTemplate
        {...props}
        mainBgColor="#4B0082"
        mainTextColor="#FFFFFF"
        subtitleColor="#E6E6FA"
        websiteTagBgColor="#8A2BE2"
        websiteTagTextColor="#FFFFFF"
        websiteTagBorderColor="#E6E6FA"
    />
);

const EarthyGreenSmoothieTemplate: React.FC<{ data: TemplateData }> = (props) => (
    <DistressedBannerTemplate
        {...props}
        mainBgColor="#388E3C"
        mainTextColor="#FFFFFF"
        subtitleColor="#FFFFFF" 
        websiteTagBgColor="#81C784"
        websiteTagTextColor="#2E7D32"
        websiteTagBorderColor="#2E7D32"
    />
);

const OceanBlueSmoothieTemplate: React.FC<{ data: TemplateData }> = (props) => (
    <DistressedBannerTemplate
        {...props}
        mainBgColor="#1D3557"
        mainTextColor="#FFFFFF"
        subtitleColor="#A8DADC"
        websiteTagBgColor="#457B9D"
        websiteTagTextColor="#1D3557"
        websiteTagBorderColor="#1D3557"
    />
);

const SunsetOrangeSmoothieTemplate: React.FC<{ data: TemplateData }> = (props) => (
    <DistressedBannerTemplate
        {...props}
        mainBgColor="#E63946"
        mainTextColor="#FFFFFF"
        subtitleColor="#F1FAEE"
        websiteTagBgColor="#F4A261"
        websiteTagTextColor="#E63946"
        websiteTagBorderColor="#E63946"
    />
);

const ForestGreenSmoothieTemplate: React.FC<{ data: TemplateData }> = (props) => (
    <DistressedBannerTemplate
        {...props}
        mainBgColor="#2F4F4F"
        mainTextColor="#F8F8F8"
        subtitleColor="#A9D0A9"
        websiteTagBgColor="#6B8E23"
        websiteTagTextColor="#2F4F4F"
        websiteTagBorderColor="#2F4F4F"
    />
);

const LavenderDreamSmoothieTemplate: React.FC<{ data: TemplateData }> = (props) => (
    <DistressedBannerTemplate
        {...props}
        mainBgColor="#8A89A5"
        mainTextColor="#FFFFFF"
        subtitleColor="#D8BFD8"
        websiteTagBgColor="#C3B1E1"
        websiteTagTextColor="#5F4B8B"
        websiteTagBorderColor="#5F4B8B"
    />
);

const EarthyBrownSmoothieTemplate: React.FC<{ data: TemplateData }> = (props) => (
    <DistressedBannerTemplate
        {...props}
        mainBgColor="#5A3E2B"
        mainTextColor="#F5F5DC"
        subtitleColor="#D4B89B"
        websiteTagBgColor="#A0785A"
        websiteTagTextColor="#5A3E2B"
        websiteTagBorderColor="#5A3E2B"
    />
);

const UrbanGrungeTemplate: React.FC<{ data: TemplateData }> = (props) => (
    <DistressedBannerTemplate
        {...props}
        mainBgColor="#2F2F2F"
        mainTextColor="#E0E0E0"
        subtitleColor="#00FFFF"
        websiteTagBgColor="#8B0000"
        websiteTagTextColor="#FFFFFF"
        websiteTagBorderColor="#A0A0A0"
        lightBgImage="#424242"
        darkBgImage="#212121"
        mainRotation="-rotate-1"
        websiteTagRotation="rotate-1"
        websiteTagTransform="translate-x-0 translate-y-0"
    />
);

const AestheticFoodRecipeTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-3xl', 'text-4xl', 'text-5xl');
    return (
        <div className="w-full h-full flex flex-col relative font-poppins bg-[#F9F6F2] p-8 overflow-hidden">
            <div className="absolute inset-4 border border-[#87A96B]/20 rounded-[2.5rem] pointer-events-none"></div>
            <div className="relative w-full h-[65%] mb-4 group">
                <div className="absolute -inset-2 bg-[#87A96B]/10 rounded-[2.2rem] blur-lg transition-all"></div>
                <div className="w-full h-full relative rounded-[2rem] overflow-hidden shadow-sm border-4 border-white">
                    <BackgroundImage imageUrl={backgroundImage} />
                    {!backgroundImage && <div className="absolute inset-0 bg-[#E8E1D9] flex items-center justify-center text-[#87A96B]/40 font-bold uppercase tracking-widest">Main Image</div>}
                </div>
                <div className="absolute top-4 right-4 bg-[#E2725B] text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg tracking-wide transform transition-transform hover:scale-110">
                    SAVE FOR LATER
                </div>
            </div>
            <div className="relative flex-grow flex flex-col items-center justify-center text-center">
                {subtitle && (
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-4 h-px bg-[#87A96B]"></span>
                        <p className="text-[#87A96B] text-[10px] font-bold uppercase tracking-[0.2em]">{subtitle}</p>
                        <span className="w-4 h-px bg-[#87A96B]"></span>
                    </div>
                )}
                <div className="px-4 py-2">
                    {title && (
                        <h2 className={`font-playfair font-black ${titleFontSize} leading-[1.1] text-[#3A2E4A] tracking-tight drop-shadow-sm`} style={{ wordBreak: 'break-word' }}>
                            {title}
                        </h2>
                    )}
                </div>
                {website && (
                    <div className="mt-auto">
                        <p className="text-[#3A2E4A]/40 text-[10px] font-bold tracking-[0.3em] uppercase italic">
                            {website}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

const AestheticDualFoodTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage, backgroundImage2 } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-2xl', 'text-3xl', 'text-4xl');
    return (
        <div className="w-full h-full flex flex-col relative font-poppins bg-[#FAF9F6] overflow-hidden">
            <div className="relative h-1/2 w-full">
                <BackgroundImage imageUrl={backgroundImage} />
                {!backgroundImage && <div className="absolute inset-0 bg-slate-200 flex items-center justify-center text-slate-400 font-bold uppercase text-xs">Hero Image</div>}
            </div>
            <div className="relative h-1/2 w-full">
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#FAF9F6] z-20 shadow-sm"></div>
                <BackgroundImage imageUrl={backgroundImage2} />
                {!backgroundImage2 && <div className="absolute inset-0 bg-slate-100 flex items-center justify-center text-slate-300 font-bold uppercase text-xs">Detail Image</div>}
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-[88%] max-w-[90%]">
                <div className="bg-white/95 backdrop-blur-md p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 rounded-sm text-center transform transition-transform duration-500">
                    {subtitle && (
                        <div className="flex items-center justify-center gap-3 mb-3">
                            <div className="h-[1px] w-6 bg-[#87A96B]"></div>
                            <p className="text-[#87A96B] text-[10px] font-bold tracking-[0.25em] uppercase whitespace-nowrap">
                                {subtitle}
                            </p>
                            <div className="h-[1px] w-6 bg-[#87A96B]"></div>
                        </div>
                    )}
                    {title && (
                        <h2 className={`font-playfair font-black ${titleFontSize} leading-[1.1] text-[#2C2420] tracking-tight mb-4`} style={{ wordBreak: 'break-word' }}>
                            {title}
                        </h2>
                    )}
                    <div className="inline-block bg-[#87A96B] text-white px-5 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-sm">
                        SAVE RECIPE
                    </div>
                </div>
            </div>
            <div className="absolute bottom-4 w-full text-center z-40">
                {website && (
                    <p className="text-white/80 font-bold text-[9px] tracking-[0.4em] uppercase italic" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                        {website}
                    </p>
                )}
            </div>
        </div>
    );
};

const AestheticRecipeTwoImagesTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage, backgroundImage2 } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-3xl', 'text-4xl', 'text-5xl');
    return (
        <div className="w-full h-full flex flex-col relative font-poppins bg-[#FAF9F6] p-0 overflow-hidden">
            <div className="relative w-full h-[60%] overflow-hidden">
                <BackgroundImage imageUrl={backgroundImage} className="group-hover:scale-105 transition-transform duration-700" />
                {!backgroundImage && (
                    <div className="absolute inset-0 bg-[#E8E1D9] flex items-center justify-center text-[#87A96B]/40 font-bold uppercase tracking-[0.3em] text-sm">
                        Main Food Shot
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent h-1/4"></div>
            </div>
            <div className="relative w-full h-[25%] overflow-hidden border-t-4 border-[#FAF9F6] shadow-inner">
                <BackgroundImage imageUrl={backgroundImage2} />
                {!backgroundImage2 && (
                    <div className="absolute inset-0 bg-[#F2EDE7] flex items-center justify-center text-[#87A96B]/30 font-bold uppercase tracking-[0.2em] text-xs">
                        Texture / Steps
                    </div>
                )}
            </div>
            <div className="absolute top-[48%] left-1/2 -translate-x-1/2 z-30 w-[88%] max-w-[90%] pointer-events-none">
                <div className="bg-white/95 backdrop-blur-sm p-6 sm:p-8 rounded-sm shadow-2xl border-t-2 border-[#87A96B]/10 text-center pointer-events-auto">
                    {subtitle && (
                        <div className="flex flex-col items-center mb-3">
                            <p className="text-[#87A96B] text-[10px] font-bold tracking-[0.4em] uppercase mb-1">{subtitle}</p>
                            <div className="w-12 h-[1.5px] bg-[#E2725B]/40"></div>
                        </div>
                    )}
                    {title && (
                        <h2 className={`font-playfair font-black ${titleFontSize} leading-[1.1] text-[#1A1A1A] tracking-tight mb-5`} style={{ wordBreak: 'break-word' }}>
                            {title}
                        </h2>
                    )}
                    <div className="inline-block bg-[#E2725B] hover:bg-[#d15f4a] text-white px-6 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-lg transition-colors cursor-pointer">
                        TRY THIS RECIPE
                    </div>
                </div>
            </div>
            <div className="relative flex-grow flex flex-col items-center justify-end pb-6 px-8 text-center">
                 {website && (
                    <p className="text-[#4E443A]/60 text-[9px] font-bold tracking-[0.5em] uppercase italic bg-[#FAF9F6]/80 px-4 py-1 rounded-full">
                        {website}
                    </p>
                )}
            </div>
            <div className="absolute inset-4 border border-[#87A96B]/5 rounded-sm pointer-events-none"></div>
        </div>
    );
};

const AestheticFreshColorfulTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage, backgroundImage2 } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-3xl', 'text-4xl', 'text-5xl');
    
    return (
        <div className="w-full h-full flex flex-col relative font-poppins bg-[#FCFBF9] overflow-hidden">
            <div className="relative h-[60%] w-full overflow-hidden">
                <BackgroundImage imageUrl={backgroundImage} className="transition-transform duration-1000" />
                {!backgroundImage && <div className="absolute inset-0 bg-slate-100 flex items-center justify-center text-slate-300 font-bold uppercase tracking-widest text-xs">Hero Shot</div>}
                <div className="absolute bottom-0 left-0 w-full h-[6px] bg-[#919970] z-20 shadow-sm"></div>
            </div>
            <div className="relative z-30 flex justify-center -mt-8">
                <div className="bg-[#F4B69C] w-[88%] p-6 shadow-xl border-b-4 border-[#E2725B]/20 text-center">
                    {subtitle && (
                        <p className="text-[#919970] text-[10px] font-black uppercase tracking-[0.3em] mb-2 leading-none">
                            {subtitle}
                        </p>
                    )}
                    {title && (
                        <h2 className={`font-playfair font-black ${titleFontSize} leading-[1.1] text-[#2C415A] tracking-tight`} style={{ wordBreak: 'break-word' }}>
                            {title}
                        </h2>
                    )}
                </div>
            </div>
            <div className="relative flex-grow w-full mt-4 overflow-hidden border-t border-[#FCFBF9]">
                <BackgroundImage imageUrl={backgroundImage2} />
                {!backgroundImage2 && <div className="absolute inset-0 bg-[#F2EDE7] flex items-center justify-center text-[#9BB7D4]/40 font-bold uppercase text-[10px]">Process Shot</div>}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
            </div>
            <div className="absolute bottom-4 left-0 w-full flex flex-col items-center gap-3 z-40">
                <div className="bg-white/95 backdrop-blur-sm text-[#9BB7D4] px-4 py-1.5 rounded-full text-[10px] font-bold tracking-[0.2em] shadow-md border border-[#9BB7D4]/10 uppercase">
                    TRY THIS TONIGHT
                </div>
                {website && (
                    <p className="text-white text-[9px] font-bold tracking-[0.4em] uppercase italic opacity-90 drop-shadow-md">
                        {website}
                    </p>
                )}
            </div>
            <div className="absolute inset-2 border border-[#919970]/10 pointer-events-none rounded-sm"></div>
        </div>
    );
};

const AestheticWhimsicalKitchenTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage, backgroundImage2 } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-3xl', 'text-4xl', 'text-5xl');
    
    return (
        <div className="w-full h-full flex flex-col relative font-poppins bg-[#FFFDF0] overflow-hidden">
            <div className="relative w-full h-[60%] overflow-hidden">
                <BackgroundImage imageUrl={backgroundImage} className="scale-105" />
                {!backgroundImage && (
                    <div className="absolute inset-0 bg-slate-200 flex items-center justify-center text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">
                        Hero Dish
                    </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-[#FFD700] w-64 h-64 sm:w-80 sm:h-80 rounded-[40%_60%_70%_30%/50%_40%_60%_50%] shadow-xl transform translate-y-12 border-4 border-white opacity-95"></div>
                </div>
            </div>
            <div className="absolute top-[48%] left-1/2 -translate-x-1/2 z-30 w-full flex flex-col items-center text-center px-8">
                {subtitle && (
                    <p className="text-[#FF7F50] text-[10px] font-black uppercase tracking-[0.4em] mb-2 bg-[#FFFDF0]/90 px-3 py-1 rounded-sm shadow-sm">
                        {subtitle}
                    </p>
                )}
                {title && (
                    <h2 
                        className={`font-permanent-marker ${titleFontSize} leading-[1] text-[#2C2420] tracking-normal mb-4 drop-shadow-sm`}
                        style={{ wordBreak: 'break-word', transform: 'rotate(-1deg)' }}
                    >
                        {title}
                    </h2>
                )}
            </div>
            <div className="w-full h-0 border-t-2 border-dashed border-[#FF7F50]/40 z-20 mt-16"></div>
            <div className="relative flex-grow w-full flex items-center justify-center p-6 mt-4">
                <div className="relative w-[70%] aspect-square bg-[#BDFCC9] p-2 shadow-lg transform rotate-2">
                    <div className="w-full h-full relative bg-white overflow-hidden">
                        <BackgroundImage imageUrl={backgroundImage2} />
                        {!backgroundImage2 && (
                            <div className="absolute inset-0 flex items-center justify-center text-[#FF7F50]/30 font-bold text-[10px] uppercase">Detail View</div>
                        )}
                    </div>
                    <div className="absolute -top-3 -right-3 bg-[#FF7F50] text-[#FFFDF0] px-3 py-1 text-[8px] font-black tracking-widest uppercase shadow-md -rotate-6">
                        YUM!
                    </div>
                </div>
            </div>
            <div className="absolute bottom-4 left-0 w-full flex flex-col items-center gap-2 z-40">
                <div className="bg-white text-[#FF7F50] px-5 py-1.5 rounded-full text-[9px] font-black tracking-widest shadow-md border border-[#FF7F50]/10 uppercase transition-transform hover:scale-110">
                    SAVE RECIPE
                </div>
                {website && (
                    <p className="text-[#2C2420]/40 text-[9px] font-bold tracking-[0.4em] uppercase italic">
                        {website}
                    </p>
                )}
            </div>
            <div className="absolute top-10 left-10 text-[#FFD700] opacity-50">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0l3 9h9l-7 5 3 10-8-6-8 6 3-10-7-5h9z" />
                </svg>
            </div>
            <div className="absolute bottom-20 right-12 text-[#FF7F50] opacity-30 transform scale-75">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0l3 9h9l-7 5 3 10-8-6-8 6 3-10-7-5h9z" />
                </svg>
            </div>
        </div>
    );
};

const AestheticDuoFinishedDishTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage, backgroundImage2 } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-3xl', 'text-4xl', 'text-5xl');
    
    return (
        <div className="w-full h-full flex flex-col relative font-poppins bg-[#FFFDF9] overflow-hidden">
            <div className="relative h-1/2 w-full overflow-hidden">
                <BackgroundImage imageUrl={backgroundImage} className="hover:scale-105 transition-transform duration-1000" />
                {!backgroundImage && (
                    <div className="absolute inset-0 bg-slate-100 flex items-center justify-center text-slate-300 font-bold uppercase tracking-widest text-xs">Dish One</div>
                )}
            </div>
            <div className="relative h-1/2 w-full overflow-hidden border-t-2 border-white shadow-inner">
                <BackgroundImage imageUrl={backgroundImage2} className="hover:scale-105 transition-transform duration-1000" />
                {!backgroundImage2 && (
                    <div className="absolute inset-0 bg-slate-50 flex items-center justify-center text-slate-200 font-bold uppercase tracking-widest text-xs">Dish Two</div>
                )}
            </div>
            <div className="absolute top-1/2 left-0 w-full h-[4px] bg-[#FF7F50] z-20 -translate-y-1/2 shadow-sm"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-[85%] max-w-[90%]">
                <div 
                    className="p-6 sm:p-8 shadow-[0_15px_45px_rgba(0,0,0,0.18)] border border-white/20 text-center"
                    style={{ backgroundColor: '#FF7A61' }}
                >
                    {subtitle && (
                        <p className="text-white text-[10px] font-black uppercase tracking-[0.3em] mb-3 leading-none italic opacity-90">
                            {subtitle}
                        </p>
                    )}
                    {title && (
                        <h2 className={`font-playfair font-black ${titleFontSize} leading-[1.1] text-white tracking-tight`} style={{ wordBreak: 'break-word' }}>
                            {title}
                        </h2>
                    )}
                </div>
            </div>
            <div className="absolute bottom-6 left-6 z-40 bg-black/20 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[9px] font-bold tracking-widest uppercase border border-white/20 shadow-lg">
                SAVE FOR LATER
            </div>
            {website && (
                <div className="absolute bottom-6 right-6 z-40">
                    <p className="text-white text-[9px] font-bold tracking-[0.4em] uppercase italic opacity-90 drop-shadow-md" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                        {website}
                    </p>
                </div>
            )}
            <div className="absolute top-4 right-4 text-white opacity-20 transform rotate-12">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C8,6.45 7,6.7 6,7C5.19,7.36 4.41,7.77 3.69,8.25C3.33,8.5 3.05,8.82 2.85,9.21C2.35,10.2 2,11.3 2,12C2,16.5 10.5,20 10.5,20C10.5,20 7,15.5 7,12C7,11.3 7.35,10.2 7.85,9.21C8.05,8.82 8.33,8.5 8.69,8.25C9.41,7.77 10.19,7.36 11,7C12,6.7 13,6.45 14,6.25C19,5.25 21,5 22,3C22,3 19,20 8,20C7.64,20 7.14,19.87 6.66,19.7L5.71,22L3.82,21.34C5.9,16.17 8,10 17,8Z" />
                </svg>
            </div>
        </div>
    );
};

const AestheticDynamicDuoTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage, backgroundImage2 } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-3xl', 'text-4xl', 'text-5xl');
    
    return (
        <div className="w-full h-full flex flex-col relative font-poppins bg-[#E0F2FE] overflow-hidden">
            <div 
                className="relative h-1/2 w-full overflow-hidden z-10"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0 100%)' }}
            >
                <BackgroundImage imageUrl={backgroundImage} className="scale-110" />
                {!backgroundImage && (
                    <div className="absolute inset-0 bg-slate-200 flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-xs">Recipe One</div>
                )}
                <div className="absolute top-6 right-6 z-20">
                     <p className="text-white text-[9px] font-bold tracking-[0.2em] uppercase bg-black/20 backdrop-blur-sm px-2 py-1 rounded-sm shadow-sm">
                        {website}
                    </p>
                </div>
            </div>
            <div className="relative h-1/2 w-full overflow-hidden -mt-4 bg-[#E0F2FE]">
                <BackgroundImage imageUrl={backgroundImage2} className="scale-110" />
                {!backgroundImage2 && (
                    <div className="absolute inset-0 bg-slate-100 flex items-center justify-center text-slate-300 font-bold uppercase tracking-widest text-xs">Recipe Two</div>
                )}
                
                <div className="absolute bottom-6 left-6 z-20 bg-[#FDBA74] text-[#1E3A8A] px-4 py-1.5 rounded-sm font-black text-[10px] tracking-widest uppercase shadow-md transform -rotate-3 border-b-2 border-[#1E3A8A]/20">
                    TRY BOTH!
                </div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-[90%] max-w-[92%] flex flex-col items-center">
                <div className="bg-[#FDE047] p-6 shadow-[0_15px_35px_rgba(0,0,0,0.2)] border-2 border-white transform rotate-1">
                    {title && (
                        <h2 className={`font-permanent-marker ${titleFontSize} leading-[1] text-[#1E3A8A] text-center`} style={{ wordBreak: 'break-word' }}>
                            {title}
                        </h2>
                    )}
                    {subtitle && (
                        <div className="mt-3 flex items-center justify-center gap-2">
                             <div className="h-[2px] w-4 bg-[#1E3A8A]/30"></div>
                             <p className="text-[#1E3A8A] text-[10px] font-black uppercase tracking-[0.25em] leading-none">
                                {subtitle}
                            </p>
                             <div className="h-[2px] w-4 bg-[#1E3A8A]/30"></div>
                        </div>
                    )}
                </div>
            </div>
            <div className="absolute top-[10%] left-[8%] z-20 text-[#FDE047] opacity-60 drop-shadow-md transform -rotate-12">
                <StarIcon className="w-8 h-8" />
            </div>
             <div className="absolute bottom-[10%] right-[8%] z-20 text-[#FDBA74] opacity-80 drop-shadow-md transform rotate-12">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
            </div>
        </div>
    );
};

const AestheticGourmetEleganceTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage, backgroundImage2 } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-3xl', 'text-4xl', 'text-5xl');
    
    return (
        <div className="w-full h-full flex flex-col relative font-poppins bg-[#121212] overflow-hidden">
            <div className="relative h-1/2 w-full overflow-hidden">
                <BackgroundImage imageUrl={backgroundImage} className="scale-105 opacity-90 transition-opacity hover:opacity-100 duration-500" />
                {!backgroundImage && (
                    <div className="absolute inset-0 bg-slate-900 flex items-center justify-center text-slate-700 font-bold uppercase tracking-[0.3em] text-sm">Exquisite Main</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/10"></div>
            </div>

            <div className="relative h-1/2 w-full overflow-hidden border-t-2 border-[#D4AF37]/30">
                <BackgroundImage imageUrl={backgroundImage2} className="scale-105 opacity-90 transition-opacity hover:opacity-100 duration-500" />
                {!backgroundImage2 && (
                    <div className="absolute inset-0 bg-[#0f0f0f] flex items-center justify-center text-slate-800 font-bold uppercase tracking-[0.3em] text-xs">Elegant Side</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            </div>

            <div className="absolute top-1/2 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent z-20 -translate-y-1/2 shadow-[0_0_10px_rgba(212,175,55,0.5)]"></div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-[88%] max-w-[92%]">
                <div className="bg-[#121212]/90 backdrop-blur-md p-6 sm:p-10 border border-[#D4AF37]/40 shadow-[0_25px_50px_rgba(0,0,0,0.5)] text-center relative overflow-hidden">
                    <div className="absolute top-2 left-2 text-[#D4AF37] opacity-40">
                         <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l3 9h9l-7 5 3 10-8-6-8 6 3-10-7-5h9z" /></svg>
                    </div>
                    <div className="absolute bottom-2 right-2 text-[#D4AF37] opacity-40">
                         <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l3 9h9l-7 5 3 10-8-6-8 6 3-10-7-5h9z" /></svg>
                    </div>

                    {title && (
                        <h2 
                            className={`font-playfair font-black ${titleFontSize} leading-[1.1] text-[#F9E79F] tracking-tight mb-4`} 
                            style={{ wordBreak: 'break-word', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                        >
                            {title}
                        </h2>
                    )}

                    {subtitle && (
                        <p className="text-[#F5F5DC]/70 text-[9px] font-bold uppercase tracking-[0.4em] leading-none italic">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            {website && (
                <div className="absolute bottom-6 right-8 z-40">
                    <p className="text-[#D4AF37] text-[10px] font-bold tracking-[0.3em] uppercase italic opacity-80">
                        {website}
                    </p>
                </div>
            )}

            <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-[#D4AF37]/20 z-10 pointer-events-none"></div>
            <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-[#D4AF37]/20 z-10 pointer-events-none"></div>
        </div>
    );
};

const AestheticFreshDuoTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage, backgroundImage2 } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-3xl', 'text-4xl', 'text-5xl');
    
    return (
        <div className="w-full h-full flex flex-col relative font-poppins bg-[#E0F2F1] overflow-hidden">
            <div className="relative h-1/2 w-full overflow-hidden">
                <BackgroundImage imageUrl={backgroundImage} className="scale-105" />
                {!backgroundImage && (
                    <div className="absolute inset-0 bg-[#B2DFDB] flex items-center justify-center text-teal-800/40 font-bold uppercase tracking-widest text-xs">Recipe Hero</div>
                )}
            </div>

            <div className="relative h-1/2 w-full overflow-hidden border-t-4 border-white shadow-inner">
                <BackgroundImage imageUrl={backgroundImage2} className="scale-105" />
                {!backgroundImage2 && (
                    <div className="absolute inset-0 bg-[#E0F2F1] flex items-center justify-center text-teal-700/30 font-bold uppercase tracking-widest text-xs">Recipe Duo</div>
                )}
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-[90%]">
                <div className="bg-white/90 backdrop-blur-md p-6 sm:p-8 shadow-2xl rounded-sm border-t-4 border-[#FF7F50] text-center">
                    {title && (
                        <h2 
                            className={`font-permanent-marker ${titleFontSize} leading-[1] text-[#004D40] tracking-tight mb-3`} 
                            style={{ wordBreak: 'break-word', transform: 'rotate(-0.5deg)' }}
                        >
                            {title}
                        </h2>
                    )}

                    {subtitle && (
                        <p className="text-[#004D40]/60 text-[10px] font-black uppercase tracking-[0.3em] mb-1 leading-none italic">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40">
                <div className="bg-[#FF7F50] text-white px-8 py-2.5 rounded-sm shadow-[0_5px_15px_rgba(255,127,80,0.4)] transform hover:scale-105 transition-transform cursor-pointer border-b-4 border-black/10">
                    <p className="text-[11px] font-black tracking-[0.2em] uppercase whitespace-nowrap">
                        GET THE RECIPE
                    </p>
                </div>
            </div>

            {website && (
                <div className="absolute bottom-4 right-6 z-40 opacity-50">
                    <p className="text-[#004D40] text-[9px] font-bold tracking-[0.4em] uppercase italic">
                        {website}
                    </p>
                </div>
            )}
            
            <div className="absolute top-6 left-6 w-16 h-16 rounded-full border-2 border-dashed border-[#FF7F50]/30 z-20 pointer-events-none"></div>
            <div className="absolute bottom-[20%] right-[-5%] w-24 h-24 rounded-full bg-[#FFF176]/20 z-20 pointer-events-none blur-xl"></div>
        </div>
    );
};

const AestheticPastelDessertDuoTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage, backgroundImage2 } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-3xl', 'text-4xl', 'text-5xl');
    
    return (
        <div className="w-full h-full flex flex-col relative font-poppins overflow-hidden" style={{ background: 'linear-gradient(135deg, #E9D5FF 0%, #FCE7F3 100%)' }}>
            <div className="relative h-1/2 w-full overflow-hidden">
                <BackgroundImage imageUrl={backgroundImage} className="scale-105" />
                {!backgroundImage && (
                    <div className="absolute inset-0 bg-white/20 flex items-center justify-center text-[#4E443A]/40 font-bold uppercase tracking-widest text-xs">Dessert One</div>
                )}
            </div>

            <div className="relative h-1/2 w-full overflow-hidden border-t-2 border-white/50">
                <BackgroundImage imageUrl={backgroundImage2} className="scale-105" />
                {!backgroundImage2 && (
                    <div className="absolute inset-0 bg-white/10 flex items-center justify-center text-[#4E443A]/40 font-bold uppercase tracking-widest text-xs">Dessert Two</div>
                )}
            </div>

            <div className="absolute top-1/2 left-[15%] right-[15%] h-[1px] bg-[#D4AF37]/40 z-20 -translate-y-1/2"></div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-[88%]">
                <div className="bg-white/95 backdrop-blur-md p-6 sm:p-8 shadow-xl rounded-sm border-l-4 border-[#D4AF37] text-center">
                    {title && (
                        <h2 className={`font-playfair font-black ${titleFontSize} leading-[1.1] text-[#4E443A] tracking-tight mb-2`} style={{ wordBreak: 'break-word' }}>
                            {title}
                        </h2>
                    )}
                    {subtitle && (
                        <p className="text-[#87A96B] text-[10px] font-black uppercase tracking-[0.35em] leading-none mb-1">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40">
                <div className="bg-[#D4AF37] text-white px-8 py-2.5 rounded-sm shadow-lg transform hover:scale-105 transition-transform cursor-pointer border-b-2 border-black/10">
                    <p className="text-[11px] font-black tracking-[0.2em] uppercase whitespace-nowrap">
                        GET THE RECIPE
                    </p>
                </div>
            </div>

            {website && (
                <div className="absolute bottom-4 right-6 z-40">
                    <p className="text-[#D4AF37] text-[9px] font-bold tracking-[0.3em] uppercase italic">
                        {website}
                    </p>
                </div>
            )}

            <div className="absolute top-6 right-6 w-12 h-12 rounded-full border border-white/40 z-20 pointer-events-none"></div>
            <div className="absolute bottom-1/4 left-[-2rem] w-24 h-24 rounded-full bg-white/20 z-10 pointer-events-none blur-2xl"></div>
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
                <BackgroundImage imageUrl={backgroundImage} className="scale-110 shadow-lg brightness-105" />
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

const MiraRecipeTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, website, backgroundImage, backgroundImage2 } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-2xl', 'text-4xl', 'text-3xl');
    
    return (
        <div className="w-full h-full flex flex-col justify-center items-center relative font-serif overflow-hidden">
            {/* Background Images - Split Layout */}
            <div className="absolute inset-0 flex flex-col">
                <div className="flex-1 relative overflow-hidden border-b border-[#F8F5F0]/20">
                    <BackgroundImage imageUrl={backgroundImage} />
                    {!backgroundImage && <div className="absolute inset-0 bg-slate-200 flex items-center justify-center text-slate-400 text-xs uppercase tracking-widest">Image 1</div>}
                </div>
                <div className="flex-1 relative overflow-hidden">
                    <BackgroundImage imageUrl={backgroundImage2} />
                    {!backgroundImage2 && <div className="absolute inset-0 bg-slate-300 flex items-center justify-center text-slate-500 text-xs uppercase tracking-widest">Image 2</div>}
                </div>
            </div>
            
            {/* Subtle Herb Illustrations in corners */}
            <div className="absolute top-6 left-6 opacity-20 text-[#4F6F52] pointer-events-none z-20">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L12 22" />
                    <path d="M12 7c-2 0-4 1-5 3s-1 4 0 6" />
                    <path d="M12 7c2 0 4 1 5 3s1 4 0 6" />
                    <path d="M12 12c-2 0-4 1-5 3s-1 4 0 6" />
                    <path d="M12 12c2 0 4 1 5 3s1 4 0 6" />
                </svg>
            </div>
            <div className="absolute bottom-6 right-6 opacity-20 text-[#4F6F52] pointer-events-none transform rotate-180 z-20">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L12 22" />
                    <path d="M12 7c-2 0-4 1-5 3s-1 4 0 6" />
                    <path d="M12 7c2 0 4 1 5 3s1 4 0 6" />
                    <path d="M12 12c-2 0-4 1-5 3s-1 4 0 6" />
                    <path d="M12 12c2 0 4 1 5 3s1 4 0 6" />
                </svg>
            </div>

            {/* Centered horizontal text banner */}
            <div className="relative z-30 w-full bg-[#4F6F52]/95 py-10 px-8 text-center shadow-2xl border-y border-[#F8F5F0]/20">
                {title && (
                    <h2 
                        className={`font-serif font-bold ${titleFontSize} uppercase leading-tight tracking-tight text-[#F8F5F0]`}
                        style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)', wordBreak: 'break-word' }}
                    >
                        {title}
                    </h2>
                )}
            </div>

            {/* Website at the bottom */}
            {website && (
                <div className="absolute bottom-12 left-0 w-full text-center z-30">
                    <p className="text-xs font-bold tracking-[0.25em] text-white uppercase drop-shadow-lg opacity-90">
                        {website}
                    </p>
                </div>
            )}
        </div>
    );
};

const TerracottaRecipeTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, website, backgroundImage, backgroundImage2 } = data;
    
    return (
        <div className="w-full h-full flex flex-col justify-center items-center relative font-serif overflow-hidden">
            {/* Background Images - Stacked Layout */}
            <div className="absolute inset-0 flex flex-col">
                <div className="flex-1 relative overflow-hidden">
                    <BackgroundImage imageUrl={backgroundImage} />
                    {!backgroundImage && <div className="absolute inset-0 bg-slate-200 flex items-center justify-center text-slate-400 text-xs uppercase tracking-widest">Top Image</div>}
                </div>
                <div className="flex-1 relative overflow-hidden">
                    <BackgroundImage imageUrl={backgroundImage2} />
                    {!backgroundImage2 && <div className="absolute inset-0 bg-slate-300 flex items-center justify-center text-slate-500 text-xs uppercase tracking-widest">Bottom Image</div>}
                </div>
            </div>

            {/* Centered Rounded Rectangle Text Area */}
            <div className="relative z-30 w-[85%] bg-[#C5705D] py-8 px-6 text-center shadow-2xl rounded-2xl border border-white/20">
                {title && (
                    <h2 
                        className="font-serif font-bold uppercase leading-tight tracking-tight text-white"
                        style={{ fontSize: '50px', textShadow: '1px 1px 3px rgba(0,0,0,0.2)', wordBreak: 'break-word' }}
                    >
                        {title}
                    </h2>
                )}
            </div>

            {/* Website at the bottom */}
            {website && (
                <div className="absolute bottom-8 left-0 w-full text-center z-30">
                    <p className="text-xs font-bold tracking-[0.2em] text-white uppercase drop-shadow-md opacity-90">
                        {website}
                    </p>
                </div>
            )}
        </div>
    );
};

const PurpleBannerTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, backgroundImage, backgroundImage2 } = data;
    
    // Split title into two lines if it's the default text or if it's long
    // User specifically asked for "text text texte" split as "text text" and "texte"
    const displayTitle = title || "";
    const lines = displayTitle ? displayTitle.split('\n') : [];
    
    return (
        <div className="w-full h-full bg-white relative overflow-hidden flex flex-col">
            {/* Background Images - Stacked Layout */}
            <div className="absolute inset-0 flex flex-col">
                <div className="flex-1 relative overflow-hidden">
                    <BackgroundImage imageUrl={backgroundImage} />
                </div>
                <div className="flex-1 relative overflow-hidden">
                    <BackgroundImage imageUrl={backgroundImage2} />
                </div>
            </div>

            {/* Purple Banner */}
            <div 
                className="absolute left-0 w-full bg-[#BB00FF] flex items-center justify-center z-20"
                style={{ 
                    top: '42.17%', // Y=620px on 1470px height
                    height: '19.05%', // 280px on 1470px height
                    boxShadow: 'none'
                }}
            >
                <div className="text-center w-full">
                    {lines.map((line, i) => (
                        <div 
                            key={i}
                            className="text-white font-nunito font-[900] leading-[1.1] uppercase px-4"
                            style={{ 
                                fontSize: '50px',
                                // 3D Pressed effect with stroke matching background
                                textShadow: `
                                    -1px -1px 0 #BB00FF,  
                                     1px -1px 0 #BB00FF,
                                    -1px  1px 0 #BB00FF,
                                     1px  1px 0 #BB00FF,
                                     3px  3px 0px rgba(0,0,0,0.15)
                                `,
                                WebkitTextStroke: '2px #BB00FF',
                                paintOrder: 'stroke fill'
                            }}
                        >
                            {line}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const RoyalBlueBannerTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, backgroundImage, backgroundImage2 } = data;
    
    const displayTitle = title || "";
    const lines = displayTitle ? displayTitle.split('\n') : [];
    
    return (
        <div className="w-full h-full bg-white relative overflow-hidden flex flex-col">
            {/* Background Images - Stacked Layout */}
            <div className="absolute inset-0 flex flex-col">
                <div className="flex-1 relative overflow-hidden">
                    <BackgroundImage imageUrl={backgroundImage} />
                </div>
                <div className="flex-1 relative overflow-hidden">
                    <BackgroundImage imageUrl={backgroundImage2} />
                </div>
            </div>

            {/* Royal Blue Banner */}
            <div 
                className="absolute left-0 w-full bg-[#2563EB] flex items-center justify-center z-20"
                style={{ 
                    top: '42.17%', 
                    height: '19.05%',
                    boxShadow: 'none'
                }}
            >
                <div className="text-center w-full">
                    {lines.map((line, i) => (
                        <div 
                            key={i}
                            className="text-white font-nunito font-[900] leading-[1.1] uppercase px-4"
                            style={{ 
                                fontSize: '50px',
                                // 3D Pressed effect with black stroke
                                textShadow: `
                                    -3px -3px 0 #000000,  
                                     3px -3px 0 #000000,
                                    -3px  3px 0 #000000,
                                     3px  3px 0 #000000,
                                     3px  3px 0px rgba(0,0,0,0.15)
                                `,
                                WebkitTextStroke: '3px #000000',
                                paintOrder: 'stroke fill'
                            }}
                        >
                            {line}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const DeepVioletBannerTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, backgroundImage, backgroundImage2 } = data;
    
    const displayTitle = title || "";
    const lines = displayTitle ? displayTitle.split('\n') : [];
    
    return (
        <div className="w-full h-full bg-white relative overflow-hidden flex flex-col">
            {/* Background Images - Stacked Layout */}
            <div className="absolute inset-0 flex flex-col">
                <div className="flex-1 relative overflow-hidden">
                    <BackgroundImage imageUrl={backgroundImage} />
                </div>
                <div className="flex-1 relative overflow-hidden">
                    <BackgroundImage imageUrl={backgroundImage2} />
                </div>
            </div>

            {/* Deep Violet Banner */}
            <div 
                className="absolute left-0 w-full bg-[#7C3AED] flex items-center justify-center z-20"
                style={{ 
                    top: '42.17%', 
                    height: '19.05%',
                    boxShadow: 'none'
                }}
            >
                <div className="text-center w-full">
                    {lines.map((line, i) => (
                        <div 
                            key={i}
                            className="text-white font-nunito font-[900] leading-[1.1] uppercase px-4"
                            style={{ 
                                fontSize: '50px',
                                // 3D Pressed effect with stroke matching background
                                textShadow: `
                                    -1px -1px 0 #7C3AED,  
                                     1px -1px 0 #7C3AED,
                                    -1px  1px 0 #7C3AED,
                                     1px  1px 0 #7C3AED,
                                     3px  3px 0px rgba(0,0,0,0.15)
                                `,
                                WebkitTextStroke: '2px #7C3AED',
                                paintOrder: 'stroke fill'
                            }}
                        >
                            {line}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const BlackBannerTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, backgroundImage, backgroundImage2 } = data;
    
    const displayTitle = title || "";
    const lines = displayTitle ? displayTitle.split('\n') : [];
    
    return (
        <div className="w-full h-full bg-white relative overflow-hidden flex flex-col">
            {/* Background Images - Stacked Layout */}
            <div className="absolute inset-0 flex flex-col">
                <div className="flex-1 relative overflow-hidden">
                    <BackgroundImage imageUrl={backgroundImage} />
                </div>
                <div className="flex-1 relative overflow-hidden">
                    <BackgroundImage imageUrl={backgroundImage2} />
                </div>
            </div>

            {/* Black Banner */}
            <div 
                className="absolute left-0 w-full bg-[#111111] flex items-center justify-center z-20"
                style={{ 
                    top: '42.17%', 
                    height: '19.05%',
                    boxShadow: 'none'
                }}
            >
                <div className="text-center w-full">
                    {lines.map((line, i) => (
                        <div 
                            key={i}
                            className="text-white font-nunito font-[900] leading-[1.1] uppercase px-4"
                            style={{ 
                                fontSize: '50px',
                                // 3D Pressed effect with stroke matching background
                                textShadow: `
                                    -1px -1px 0 #111111,  
                                     1px -1px 0 #111111,
                                    -1px  1px 0 #111111,
                                     1px  1px 0 #111111,
                                     3px  3px 0px rgba(255,255,255,0.1)
                                `,
                                WebkitTextStroke: '2px #111111',
                                paintOrder: 'stroke fill'
                            }}
                        >
                            {line}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const WarmTomatoBannerTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, backgroundImage, backgroundImage2 } = data;
    
    const displayTitle = title || "";
    const lines = displayTitle ? displayTitle.split('\n') : [];
    
    return (
        <div className="w-full h-full bg-white relative overflow-hidden flex flex-col">
            {/* Background Images - Stacked Layout */}
            <div className="absolute inset-0 flex flex-col">
                <div className="flex-1 relative overflow-hidden">
                    <BackgroundImage imageUrl={backgroundImage} />
                </div>
                <div className="flex-1 relative overflow-hidden">
                    <BackgroundImage imageUrl={backgroundImage2} />
                </div>
            </div>

            {/* Warm Tomato Red Banner */}
            <div 
                className="absolute left-0 w-full bg-[#D62828] flex items-center justify-center z-20"
                style={{ 
                    top: '42.17%', 
                    height: '19.05%',
                    boxShadow: 'none'
                }}
            >
                <div className="text-center w-full">
                    {lines.map((line, i) => (
                        <div 
                            key={i}
                            className="text-[#FFF8F0] font-nunito font-[900] leading-[1.1] uppercase px-4"
                            style={{ 
                                fontSize: '50px',
                                // 3D Pressed effect with stroke matching background
                                textShadow: `
                                    -1px -1px 0 #D62828,  
                                     1px -1px 0 #D62828,
                                    -1px  1px 0 #D62828,
                                     1px  1px 0 #D62828,
                                     3px  3px 0px rgba(0,0,0,0.15)
                                `,
                                WebkitTextStroke: '2px #D62828',
                                paintOrder: 'stroke fill'
                            }}
                        >
                            {line}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const M98Template: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, backgroundImage, backgroundImage2 } = data;
    
    const displayTitle = title || "";
    const lines = displayTitle ? displayTitle.split('\n') : [];
    
    return (
        <div className="w-full h-full bg-white relative overflow-hidden flex flex-col">
            <div className="absolute inset-0 flex flex-col">
                <div className="flex-1 relative overflow-hidden">
                    <BackgroundImage imageUrl={backgroundImage} />
                </div>
                <div className="flex-1 relative overflow-hidden">
                    <BackgroundImage imageUrl={backgroundImage2} />
                </div>
            </div>

            <div 
                className="absolute left-0 w-full bg-[#42706F] flex items-center justify-center z-20"
                style={{ 
                    top: '42.17%',
                    height: '19.05%',
                    boxShadow: 'none'
                }}
            >
                <div className="text-center w-full">
                    {lines.map((line, i) => (
                        <div 
                            key={i}
                            className="text-white font-nunito font-[900] leading-[1.1] uppercase px-4"
                            style={{ 
                                fontSize: '50px',
                                textShadow: `
                                    -1px -1px 0 #42706F,  
                                     1px -1px 0 #42706F,
                                    -1px  1px 0 #42706F,
                                     1px  1px 0 #42706F,
                                     3px  3px 0px rgba(0,0,0,0.15)
                                `,
                                WebkitTextStroke: '2px #42706F',
                                paintOrder: 'stroke fill'
                            }}
                        >
                            {line}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const M99Template: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, backgroundImage, backgroundImage2 } = data;
    
    const displayTitle = title || "";
    const lines = displayTitle ? displayTitle.split('\n') : [];
    
    return (
        <div className="w-full h-full bg-white relative overflow-hidden flex flex-col">
            <div className="absolute inset-0 flex flex-col">
                <div className="flex-1 relative overflow-hidden">
                    <BackgroundImage imageUrl={backgroundImage} />
                </div>
                <div className="flex-1 relative overflow-hidden">
                    <BackgroundImage imageUrl={backgroundImage2} />
                </div>
            </div>

            <div 
                className="absolute left-0 w-full bg-[#A67624] flex items-center justify-center z-20"
                style={{ 
                    top: '42.17%',
                    height: '19.05%',
                    boxShadow: 'none'
                }}
            >
                <div className="text-center w-full">
                    {lines.map((line, i) => (
                        <div 
                            key={i}
                            className="text-white font-nunito font-[900] leading-[1.1] uppercase px-4"
                            style={{ 
                                fontSize: '50px',
                                textShadow: `
                                    -3px -3px 0 #000000,  
                                     3px -3px 0 #000000,
                                    -3px  3px 0 #000000,
                                     3px  3px 0 #000000,
                                     3px  3px 0px rgba(0,0,0,0.15)
                                `,
                                WebkitTextStroke: '3px #000000',
                                paintOrder: 'stroke fill'
                            }}
                        >
                            {line}
                        </div>
                    ))}
                </div>
            </div>
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
            case '72': return <EarthyGreenSmoothieTemplate data={data} />;
            case '73': return <OceanBlueSmoothieTemplate data={data} />;
            case '74': return <SunsetOrangeSmoothieTemplate data={data} />;
            case '75': return <ForestGreenSmoothieTemplate data={data} />;
            case '76': return <LavenderDreamSmoothieTemplate data={data} />;
            case '77': return <EarthyBrownSmoothieTemplate data={data} />;
            case '78': return <UrbanGrungeTemplate data={data} />;
            case '79': return <AestheticFoodRecipeTemplate data={data} />;
            case '80': return <AestheticDualFoodTemplate data={data} />;
            case '81': return <AestheticRecipeTwoImagesTemplate data={data} />;
            case '82': return <AestheticFreshColorfulTemplate data={data} />;
            case '83': return <AestheticWhimsicalKitchenTemplate data={data} />;
            case '84': return <AestheticDuoFinishedDishTemplate data={data} />; 
            case '85': return <AestheticDynamicDuoTemplate data={data} />;
            case '86': return <AestheticGourmetEleganceTemplate data={data} />;
            case '87': return <AestheticFreshDuoTemplate data={data} />;
            case '88': return <AestheticPastelDessertDuoTemplate data={data} />;
            case '90': return <AestheticLuxuryMagazineDuoTemplate data={data} />;
            case '91': return <MiraRecipeTemplate data={data} />;
            case '92': return <TerracottaRecipeTemplate data={data} />;
            case '93': return <PurpleBannerTemplate data={data} />;
            case '94': return <RoyalBlueBannerTemplate data={data} />;
            case '95': return <DeepVioletBannerTemplate data={data} />;
            case '96': return <BlackBannerTemplate data={data} />;
            case '97': return <WarmTomatoBannerTemplate data={data} />;
            case '98': return <M98Template data={data} />;
            case '99': return <M99Template data={data} />;

            default: return <ClassicTemplate data={data} />;
        }
    };

    const getAspectRatioClass = () => {
        switch(data.pinSize) {
            case 'standard': return 'aspect-[3/4]';
            case 'long': return 'aspect-[9/16]';
            case 'extraLong': return 'aspect-[1/2.4]';
            case 'recipe': return 'aspect-[2/3]';
            case 'tall': return 'aspect-[1/2]';
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
