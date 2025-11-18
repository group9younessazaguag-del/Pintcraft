
import React, { forwardRef } from 'react';
import type { TemplateData } from '../types';

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
            {/* Backgrounds */}
            <div className="flex-1 relative">
                <BackgroundImage imageUrl={backgroundImage} />
            </div>
            <div className="flex-1 relative">
                <BackgroundImage imageUrl={backgroundImage2} />
            </div>

            {/* Content Overlay */}
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

            {/* Content Box */}
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
            {/* Top Background */}
            <div className="flex-1 relative p-4 bg-white">
                <div className="w-full h-full relative">
                    <BackgroundImage imageUrl={backgroundImage} />
                </div>
            </div>

            {/* Content Band */}
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

            {/* Bottom Background */}
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
        <div className="w-full h-full grid grid-rows-3 relative font-poppins bg-white">
            {/* Image section - takes top 2/3 */}
            <div className="row-span-2 relative">
                <BackgroundImage imageUrl={backgroundImage} />
            </div>

            {/* Text section - takes bottom 1/3 */}
            <div className="row-span-1 flex flex-col justify-center items-start p-6 text-left text-[#4E443A]">
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
            {/* Main Image */}
            <div className="col-span-1 row-span-3 relative rounded-lg overflow-hidden">
                <BackgroundImage imageUrl={backgroundImage} />
                <div className="absolute inset-0 bg-gray-200 -z-10"></div>
            </div>

            {/* Top Right Image */}
            <div className="col-span-1 row-span-1 relative rounded-lg overflow-hidden">
                <BackgroundImage imageUrl={backgroundImage2} />
                 <div className="absolute inset-0 bg-gray-200 -z-10"></div>
            </div>
            
            {/* Bottom Right Image */}
            <div className="col-span-1 row-span-1 relative rounded-lg overflow-hidden">
                <BackgroundImage imageUrl={backgroundImage3} />
                 <div className="absolute inset-0 bg-gray-200 -z-10"></div>
            </div>

            {/* Text Box */}
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
            {/* Image Section */}
            <div className="w-full h-[60%] relative">
                <BackgroundImage imageUrl={backgroundImage} />
                {!backgroundImage && <div className="absolute inset-0 bg-slate-300"></div>}
                <div className="absolute inset-0 bg-gradient-to-t from-[#F7F2EE] to-transparent"></div>
            </div>

            {/* Content Section */}
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
             {/* Image 1 */}
            <div className="absolute w-3/4 h-1/2 top-8 left-4 transform -rotate-6 shadow-2xl rounded-md border-8 border-white box-border">
                <BackgroundImage imageUrl={backgroundImage} />
                <div className="absolute inset-0 bg-gray-200 -z-10"></div>
            </div>
            {/* Image 2 */}
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
            {/* Film grain effect */}
            <div 
                className="absolute inset-0 opacity-10 pointer-events-none" 
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 800 800' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
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
             {/* The main background image fills the pin, behind the white card */}
            <BackgroundImage imageUrl={backgroundImage} />
            {/* Adds a subtle dark overlay if an image is present, to help the card stand out */}
            {backgroundImage && <div className="absolute inset-0 bg-black/10"></div>}

            {/* White Content Card */}
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
            {/* Left side (Before) */}
            <div className="w-1/2 h-full relative">
                <BackgroundImage imageUrl={backgroundImage} />
                <div className="absolute inset-0 bg-black/30"></div>
                <div className="absolute top-4 left-4 bg-white/80 text-black text-xs font-bold uppercase px-2 py-1 rounded">BEFORE</div>
            </div>
            {/* Right side (After) */}
            <div className="w-1/2 h-full relative">
                 <BackgroundImage imageUrl={backgroundImage2} />
                 <div className="absolute inset-0 bg-black/10"></div>
                 <div className="absolute top-4 right-4 bg-white text-black text-xs font-bold uppercase px-2 py-1 rounded">AFTER</div>
            </div>

            {/* Center Content */}
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
             {/* Image 3 - bottom layer */}
            <div className="absolute w-2/3 h-1/3 bottom-12 right-[-10%] transform rotate-12 shadow-2xl rounded-lg border-8 border-white box-border">
                <BackgroundImage imageUrl={backgroundImage3} />
                <div className="absolute inset-0 bg-gray-300 -z-10"></div>
            </div>
             {/* Image 1 - middle layer */}
            <div className="absolute w-3/4 h-1/2 top-4 left-[-10%] transform -rotate-8 shadow-2xl rounded-lg border-8 border-white box-border">
                <BackgroundImage imageUrl={backgroundImage} />
                <div className="absolute inset-0 bg-gray-300 -z-10"></div>
            </div>
            {/* Image 2 - top layer */}
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
            {/* Hero Image */}
            <div className="h-1/2 w-full relative">
                <BackgroundImage imageUrl={backgroundImage} />
                {!backgroundImage && <div className="absolute inset-0 bg-slate-200"></div>}
                <div className="absolute inset-0 bg-black/30"></div>
                <div className="absolute inset-0 p-8 flex flex-col justify-center items-center text-center text-white">
                    {title && <h2 className={`font-playfair ${titleFontSize} font-bold leading-tight`} style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.6)', wordBreak: 'break-word' }}>{title}</h2>}
                </div>
            </div>
            {/* Steps Section */}
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
                <div className="text-center bg-white/90 backdrop-blur-sm p-8 shadow-2xl rounded-lg text-[#4E443A]">
                    {title && <h2 className={`font-playfair ${titleFontSize} font-bold leading-tight tracking-tight`} style={{ wordBreak: 'break-word' }}>{title}</h2>}
                    {subtitle && <p className="mt-4 text-sm font-semibold tracking-wide text-[#4E443A]/70">{subtitle}</p>}
                </div>
            </div>

            {website && <p className="absolute bottom-4 left-4 text-xs font-bold tracking-[0.15em] text-black/50 bg-white/50 px-2 py-1 rounded uppercase">{website}</p>}
        </div>
    )
}

const ElegantRecipeCardTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage } = data;
    return (
        <div className="w-full h-full flex flex-col relative font-poppins bg-[#FDF4E3] text-[#4E443A]">
            <div className="h-[70%] w-full relative">
                <BackgroundImage imageUrl={backgroundImage} />
                {!backgroundImage && <div className="absolute inset-0 bg-slate-200"></div>}
            </div>
            <div className="h-[30%] w-full flex flex-col justify-center items-center text-center p-4">
                {subtitle && <p className="text-xs sm:text-sm font-semibold tracking-wide text-[#4E443A]/70">{subtitle}</p>}
                {title && <h2 className="font-playfair text-3xl sm:text-4xl font-bold leading-tight tracking-tight mt-1" style={{ wordBreak: 'break-word' }}>{title}</h2>}
                <div className="flex-grow"></div>
                {website && <p className="text-xs font-bold tracking-[0.15em] text-[#4E443A]/50 uppercase">{website}</p>}
            </div>
        </div>
    );
};

const BoldTitleOverlayTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-3xl md:text-4xl', 'text-4xl md:text-5xl', 'text-5xl md:text-6xl');
    return (
        <div className="w-full h-full flex flex-col justify-center items-center relative font-poppins text-white p-8 text-center">
            <BackgroundImage imageUrl={backgroundImage} />
            {!backgroundImage && <div className="absolute inset-0 bg-slate-700"></div>}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-black/20"></div>
            <div className="relative z-10 w-full flex flex-col items-center bg-black/20 backdrop-blur-sm p-6 rounded-lg">
                {title && <h2 className={`font-anton font-bold ${titleFontSize} uppercase leading-none tracking-wider`} style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)', wordBreak: 'break-word' }}>{title}</h2>}
                {subtitle && <p className="text-sm font-semibold tracking-wide mt-4 opacity-90" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}>{subtitle}</p>}
                {website && <p className="text-xs font-bold tracking-[0.15em] mt-6 pt-3 border-t border-white/20 uppercase opacity-80" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}>{website}</p>}
            </div>
        </div>
    );
};

const GardeningTipsTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-2xl', 'text-3xl', 'text-4xl');
    return (
        <div className="w-full h-full relative font-poppins text-white">
            <BackgroundImage imageUrl={backgroundImage} />
            {!backgroundImage && <div className="absolute inset-0 bg-green-800"></div>}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8 w-full">
                {subtitle && <p className="text-sm font-semibold tracking-wider uppercase text-green-300">{subtitle}</p>}
                {title && <h2 className={`font-playfair ${titleFontSize} font-bold leading-tight tracking-tight mt-1`} style={{ wordBreak: 'break-word' }}>{title}</h2>}
                {website && <p className="mt-4 text-xs font-bold tracking-[0.15em] opacity-80 uppercase border-t border-white/20 pt-2">{website}</p>}
            </div>
        </div>
    );
};

const HomeDecorInspoTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-3xl', 'text-4xl', 'text-5xl');
    return (
        <div className="w-full h-full relative font-playfair bg-[#F1ECE7] text-[#5C554E] p-6">
            <div className="w-full h-full relative border-2 border-[#DCD3C9]">
                <BackgroundImage imageUrl={backgroundImage} />
                {!backgroundImage && <div className="absolute inset-0 bg-gray-200"></div>}
                <div className="absolute inset-0 flex flex-col justify-between p-6">
                    <div>
                        {subtitle && <p className="font-poppins text-sm font-semibold tracking-widest uppercase">{subtitle}</p>}
                    </div>
                    <div className="text-right">
                        {title && <h2 className={`${titleFontSize} font-bold leading-tight`} style={{ wordBreak: 'break-word' }}>{title}</h2>}
                        {website && <p className="font-poppins mt-2 text-xs font-bold tracking-[0.15em] opacity-80 uppercase">{website}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

const AuthorQuoteTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-xl', 'text-2xl', 'text-3xl');
    return (
        <div className="w-full h-full flex flex-col justify-center items-center relative font-serif p-8 bg-white text-gray-800">
            <BackgroundImage imageUrl={backgroundImage} />
            {backgroundImage && <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>}
            <div className="relative z-10 text-center max-w-md">
                {title && <p className={`${titleFontSize} leading-relaxed italic`} style={{wordBreak: 'break-word'}}>"{title}"</p>}
                {subtitle && <p className="mt-6 font-poppins text-sm font-bold tracking-widest uppercase text-gray-500">— {subtitle}</p>}
            </div>
            {website && <p className="absolute bottom-6 font-poppins text-xs font-bold tracking-[0.15em] text-gray-400 uppercase">{website}</p>}
        </div>
    );
};

const SplitImageFourBlockTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage, backgroundImage2 } = data;
    return (
        <div className="w-full h-full grid grid-cols-2 grid-rows-2 font-poppins bg-white">
            <div className="relative"><BackgroundImage imageUrl={backgroundImage} /></div>
            <div className="bg-[#F8F5F2] p-4 flex flex-col justify-center text-[#4E443A]">
                {title && <h2 className="font-playfair text-3xl font-bold leading-tight" style={{ wordBreak: 'break-word' }}>{title}</h2>}
            </div>
            <div className="bg-[#F8F5F2] p-4 flex flex-col justify-center text-[#4E443A]">
                 {subtitle && <p className="text-sm font-semibold tracking-wide">{subtitle}</p>}
                 {website && <p className="mt-auto pt-2 border-t border-gray-300 text-xs font-bold tracking-[0.15em] opacity-80 uppercase">{website}</p>}
            </div>
            <div className="relative"><BackgroundImage imageUrl={backgroundImage2} /></div>
        </div>
    );
};

const SimpleProductTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage } = data;
    return (
        <div className="w-full h-full relative font-poppins bg-white">
            <div className="h-4/5 w-full relative">
                <BackgroundImage imageUrl={backgroundImage} />
            </div>
            <div className="h-1/5 w-full flex flex-col justify-center items-center text-center p-4 bg-white text-gray-800 border-t border-gray-200">
                {title && <h2 className="font-semibold text-lg leading-tight" style={{ wordBreak: 'break-word' }}>{title}</h2>}
                {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
                {website && <p className="mt-1 text-xs font-bold tracking-widest text-pink-500 uppercase">{website}</p>}
            </div>
        </div>
    );
};

const FoodieSplitTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage, backgroundImage2 } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-2xl', 'text-3xl', 'text-4xl');
    return (
        <div className="w-full h-full flex flex-col relative font-poppins text-white">
            <div className="flex-1 relative">
                <BackgroundImage imageUrl={backgroundImage} />
                <div className="absolute inset-0 bg-gray-200 -z-10"></div>
            </div>
            <div className="flex-1 relative">
                <BackgroundImage imageUrl={backgroundImage2} />
                <div className="absolute inset-0 bg-gray-200 -z-10"></div>
            </div>
            <div className="absolute inset-0 flex flex-col justify-center items-center p-4">
                <div className="bg-[#4a4238] w-full max-w-lg text-center py-10 px-5 border-y-4 border-[#eacda3]">
                    {subtitle && <p className="font-lobster text-2xl text-[#eacda3]">{subtitle}</p>}
                    {title && <h2 className={`${titleFontSize} font-black uppercase tracking-wider mt-1`} style={{ wordBreak: 'break-word' }}>{title}</h2>}
                </div>
            </div>
            {website && <p className="absolute bottom-2 w-full text-center text-sm font-semibold tracking-wider text-black bg-white/70 py-1">{website}</p>}
        </div>
    );
};

const MinimalistLivingTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage, backgroundImage2 } = data;
    const parts = (title || '').split(' ');
    const number = parts.find(p => !isNaN(parseInt(p)));
    const textTitle = parts.filter(p => isNaN(parseInt(p))).join(' ');
    const textTitleFontSize = getDynamicTitleFontSize(textTitle.length, 'text-3xl', 'text-4xl', 'text-5xl', 40, 20);

    return (
        <div className="w-full h-full flex flex-col relative font-poppins text-white">
            <div className="flex-1 relative">
                <BackgroundImage imageUrl={backgroundImage} />
                <div className="absolute inset-0 bg-gray-200 -z-10"></div>
            </div>
            <div className="flex-1 relative">
                <BackgroundImage imageUrl={backgroundImage2} />
                <div className="absolute inset-0 bg-gray-200 -z-10"></div>
            </div>
            <div className="absolute inset-0 flex flex-col justify-center items-center p-4">
                <div className="bg-[#fdfcfb]/90 backdrop-blur-sm text-[#735e4e] w-full max-w-lg text-center p-6 space-y-2">
                    {number && <p className="font-luckiest-guy text-7xl" style={{ textShadow: '2px 2px 0px #fff, -2px -2px 0px #fff, 2px -2px 0px #fff, -2px 2px 0px #fff' }}>{number}</p>}
                    {textTitle && <h2 className={`font-luckiest-guy ${textTitleFontSize} uppercase leading-none`} style={{ textShadow: '2px 2px 0px #fff, -2px -2px 0px #fff, 2px -2px 0px #fff, -2px 2px 0px #fff', wordBreak: 'break-word' }}>{textTitle}</h2>}
                    {subtitle && <p className="text-xl font-playfair italic pt-2">{subtitle}</p>}
                </div>
            </div>
            {website && (
                <div className="absolute bottom-6 w-full flex justify-center">
                    <p className="text-center text-sm font-semibold tracking-wider text-white bg-[#735e4e]/80 py-1.5 px-4 rounded-full">{website}</p>
                </div>
            )}
        </div>
    );
};

const BoldFoodieTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, backgroundImage } = data;
    const titleWords = (title || '').split(' ');
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-3xl', 'text-4xl', 'text-5xl', 70, 40);

    return (
        <div className="w-full h-full relative font-sans text-white">
            {/* Background Image */}
            <BackgroundImage imageUrl={backgroundImage} />
            {!backgroundImage && <div className="absolute inset-0 bg-gray-800"></div>}
            <div className="absolute inset-0 bg-black/20"></div> {/* Add a slight overlay to ensure text is readable */}

            {/* Centered Content */}
            <div className="absolute inset-0 flex flex-col justify-center items-center p-4">
                {/* Dashed subtitle box */}
                {subtitle && (
                    <div className="bg-[#3a312a] border-2 border-dashed border-white/80 px-4 py-1 mb-2 shadow-lg">
                        <p className="font-sans font-bold text-lg tracking-wider text-white uppercase">{subtitle}</p>
                    </div>
                )}

                {/* Top Divider */}
                <div className="w-full max-w-sm h-px bg-white/50 my-2 shadow-lg"></div>
                
                {/* Main Title */}
                {title && (
                    <h2 className={`${titleFontSize} font-anton uppercase leading-none text-center`} style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)', wordBreak: 'break-word' }}>
                        {titleWords.map((word, index) => (
                            <span key={index} className={index % 2 !== 0 ? 'text-[#d9a46e]' : 'text-white'}>
                                {word}{' '}
                            </span>
                        ))}
                    </h2>
                )}

                {/* Bottom Divider */}
                <div className="w-full max-w-sm h-px bg-white/50 my-2 shadow-lg"></div>
            </div>
        </div>
    );
};

const BoldFoodieSplitTemplate2: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, backgroundImage, backgroundImage2 } = data;
    const titleWords = (title || '').split(' ');
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-3xl', 'text-4xl', 'text-5xl', 70, 40);

    return (
        <div className="w-full h-full flex flex-col relative font-sans text-white">
            {/* Top Image */}
            <div className="flex-1 relative">
                <BackgroundImage imageUrl={backgroundImage} />
                {!backgroundImage && <div className="absolute inset-0 bg-gray-400"></div>}
            </div>
            {/* Bottom Image */}
            <div className="flex-1 relative">
                <BackgroundImage imageUrl={backgroundImage2} />
                {!backgroundImage2 && <div className="absolute inset-0 bg-gray-500"></div>}
            </div>

            {/* Centered Content */}
            <div className="absolute inset-0 flex flex-col justify-center items-center p-4">
                {/* Dashed subtitle box */}
                {subtitle && (
                    <div className="bg-[#3a312a] border-2 border-dashed border-white/80 px-4 py-1 mb-2 shadow-lg">
                        <p className="font-sans font-bold text-lg tracking-wider text-white uppercase">{subtitle}</p>
                    </div>
                )}

                {/* Top Divider */}
                <div className="w-full max-w-sm h-px bg-white/50 my-2 shadow-lg"></div>
                
                {/* Main Title */}
                {title && (
                    <h2 className={`${titleFontSize} font-anton uppercase leading-none text-center`} style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)', wordBreak: 'break-word' }}>
                        {titleWords.map((word, index) => (
                            <span key={index} className={index % 2 !== 0 ? 'text-[#d9a46e]' : 'text-[#4a4238]'}>
                                {word}{' '}
                            </span>
                        ))}
                    </h2>
                )}

                {/* Bottom Divider */}
                <div className="w-full max-w-sm h-px bg-white/50 my-2 shadow-lg"></div>
            </div>
        </div>
    );
};

const VibrantFoodieSplitTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, backgroundImage, backgroundImage2 } = data;
    const subtitleFontSize = getDynamicTitleFontSize(subtitle?.length || 0, 'text-2xl', 'text-3xl', 'text-4xl');
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-2xl', 'text-3xl', 'text-4xl');
    return (
        <div className="w-full h-full flex flex-col relative font-poppins text-white">
            {/* Top Image */}
            <div className="flex-1 relative">
                <BackgroundImage imageUrl={backgroundImage} />
                {!backgroundImage && <div className="absolute inset-0 bg-gray-400"></div>}
            </div>
            {/* Bottom Image */}
            <div className="flex-1 relative">
                <BackgroundImage imageUrl={backgroundImage2} />
                {!backgroundImage2 && <div className="absolute inset-0 bg-gray-500"></div>}
            </div>

            {/* Centered Content */}
            <div className="absolute inset-0 flex flex-col justify-center items-center p-4">
                <div className="bg-orange-500 w-full max-w-lg text-center p-2 shadow-lg">
                    <div className="border-2 border-dashed border-white/90 p-4">
                        {/* The UI label for subtitle is "Pinterest Board" but we'll use it for the top line of text */}
                        {subtitle && (
                             <h2 className={`${subtitleFontSize} font-anton text-yellow-300 uppercase leading-none text-center`} style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.4)', wordBreak: 'break-word' }}>
                                {subtitle}
                            </h2>
                        )}
                         {/* The UI label for title is "Title" which we'll use for the bottom line */}
                        {title && (
                            <h2 className={`${titleFontSize} font-anton text-white uppercase leading-none text-center mt-1`} style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.4)', wordBreak: 'break-word' }}>
                                {title}
                            </h2>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ElegantFoodieSplitTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage, backgroundImage2 } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-2xl', 'text-3xl', 'text-4xl');
    return (
        <div className="w-full h-full flex flex-col relative font-poppins text-white">
            <div className="flex-1 relative">
                <BackgroundImage imageUrl={backgroundImage} />
                {!backgroundImage && <div className="absolute inset-0 bg-gray-400"></div>}
            </div>
            <div className="flex-1 relative">
                <BackgroundImage imageUrl={backgroundImage2} />
                {!backgroundImage2 && <div className="absolute inset-0 bg-gray-500"></div>}
            </div>

            <div className="absolute inset-0 flex flex-col justify-center items-center p-4">
                <div className="relative text-center flex flex-col items-center">
                    {subtitle && (
                        <div className="relative inline-block z-10 mb-1">
                             <div className="absolute -left-2 top-0 h-full w-4 bg-[#e0d6c7] -z-10" style={{clipPath: 'polygon(100% 0, 0 50%, 100% 100%)'}}></div>
                             <div className="absolute -right-2 top-0 h-full w-4 bg-[#e0d6c7] -z-10" style={{clipPath: 'polygon(0 0, 100% 50%, 0 100%)'}}></div>
                            <div className="relative bg-[#F8F5F2] text-[#4E443A] px-6 py-1 shadow-md">
                                <p className="font-lobster text-xl leading-none">{subtitle}</p>
                            </div>
                        </div>
                    )}
                    {title && (
                        <div className="bg-[#c7913e] px-4 py-3 shadow-md">
                            <h2 className={`${titleFontSize} font-anton uppercase leading-none tracking-wide text-white`} style={{ wordBreak: 'break-word' }}>
                                {title}
                            </h2>
                        </div>
                    )}
                </div>
            </div>

            {website && (
                <div className="absolute bottom-6 w-full flex justify-center px-4">
                    <div className="bg-[#c7913e] text-white font-semibold text-sm px-6 py-2 rounded-md shadow-lg">
                         <span>{website} ✨</span>
                    </div>
                </div>
            )}
        </div>
    );
};

const ElegantFoodieSingleTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-2xl', 'text-3xl', 'text-4xl');
    return (
        <div className="w-full h-full relative font-poppins text-white">
            <BackgroundImage imageUrl={backgroundImage} />
            {!backgroundImage && <div className="absolute inset-0 bg-gray-600"></div>}
            <div className="absolute inset-0 bg-black/10"></div>

            <div className="absolute inset-0 flex flex-col justify-center items-center p-4">
                <div className="relative text-center flex flex-col items-center">
                    {subtitle && (
                        <div className="relative inline-block z-10 mb-1">
                             <div className="absolute -left-2 top-0 h-full w-4 bg-[#e0d6c7] -z-10" style={{clipPath: 'polygon(100% 0, 0 50%, 100% 100%)'}}></div>
                             <div className="absolute -right-2 top-0 h-full w-4 bg-[#e0d6c7] -z-10" style={{clipPath: 'polygon(0 0, 100% 50%, 0 100%)'}}></div>
                            <div className="relative bg-[#F8F5F2] text-[#4E443A] px-6 py-1 shadow-md">
                                <p className="font-lobster text-xl leading-none">{subtitle}</p>
                            </div>
                        </div>
                    )}
                    {title && (
                        <div className="bg-[#c7913e] px-4 py-3 shadow-md">
                            <h2 className={`${titleFontSize} font-anton uppercase leading-none tracking-wide text-white`} style={{ wordBreak: 'break-word' }}>
                                {title}
                            </h2>
                        </div>
                    )}
                </div>
            </div>

            {website && (
                <div className="absolute bottom-6 w-full flex justify-center px-4">
                    <div className="bg-[#c7913e] text-white font-semibold text-sm px-6 py-2 rounded-md shadow-lg">
                         <span>{website} ✨</span>
                    </div>
                </div>
            )}
        </div>
    );
};

const AntonVerticalTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage, backgroundImage2 } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-2xl', 'text-3xl', 'text-4xl');

    return (
        <div className="w-full h-full flex flex-col relative font-poppins bg-white">
            {/* Top Image Section */}
            <div className="flex-[3] relative">
                <BackgroundImage imageUrl={backgroundImage} />
                {!backgroundImage && <div className="absolute inset-0 bg-slate-200"></div>}
            </div>

            {/* Content Banner */}
            <div
                className="flex-[1] flex flex-col justify-center items-center text-center p-4 font-anton"
                style={{ backgroundColor: '#D9C332' }}
            >
                {subtitle && (
                    <p
                        className="text-sm tracking-wide mb-1"
                        style={{ color: '#B50202' }}
                    >
                        {subtitle}
                    </p>
                )}
                {title && (
                    <h2
                        className={`${titleFontSize} leading-tight tracking-tight text-white`}
                        style={{ wordBreak: 'break-word' }}
                    >
                        {title}
                    </h2>
                )}
            </div>

            {/* Bottom Image Section */}
            <div className="flex-[3] relative">
                <BackgroundImage imageUrl={backgroundImage2} />
                {!backgroundImage2 && <div className="absolute inset-0 bg-slate-200"></div>}
            </div>

            {/* Website Overlay at the bottom */}
            {website && (
                <div className="absolute bottom-0 left-0 w-full p-2 bg-black/50 text-center">
                    <p className="text-xs tracking-[0.15em] text-white/80 uppercase font-semibold">
                        {website}
                    </p>
                </div>
            )}
        </div>
    );
};

const MontserratVerticalTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage, backgroundImage2 } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-xl', 'text-2xl', 'text-3xl');

    return (
        <div className="w-full h-full flex flex-col relative font-poppins bg-white">
            {/* Top Image Section */}
            <div className="flex-[3] relative">
                <BackgroundImage imageUrl={backgroundImage} />
                {!backgroundImage && <div className="absolute inset-0 bg-slate-200"></div>}
            </div>

            {/* Content Banner */}
            <div
                className="flex-[1] flex flex-col justify-center items-center text-center p-4 font-montserrat font-extrabold"
                style={{ backgroundColor: 'black', color: '#FFFFFF' }}
            >
                {subtitle && (
                    <p
                        className="text-xs tracking-wide mb-1 font-semibold" /* Adjusted weight for subtitle */
                        style={{ color: '#B50202' }}
                    >
                        {subtitle}
                    </p>
                )}
                {title && (
                    <h2
                        className={`${titleFontSize} leading-tight tracking-tight uppercase`} /* Added uppercase for style */
                        style={{ wordBreak: 'break-word' }}
                    >
                        {title}
                    </h2>
                )}
            </div>

            {/* Bottom Image Section */}
            <div className="flex-[3] relative">
                <BackgroundImage imageUrl={backgroundImage2} />
                {!backgroundImage2 && <div className="absolute inset-0 bg-slate-200"></div>}
            </div>

            {/* Website Overlay at the bottom */}
            {website && (
                <div className="absolute bottom-0 left-0 w-full p-2 bg-black/50 text-center">
                    <p className="text-xs tracking-[0.15em] text-white/80 uppercase font-semibold">
                        {website}
                    </p>
                </div>
            )}
        </div>
    );
};

const MontserratVerticalTemplateGreen: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage, backgroundImage2 } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-xl', 'text-2xl', 'text-3xl');

    return (
        <div className="w-full h-full flex flex-col relative font-poppins bg-white">
            {/* Top Image Section */}
            <div className="flex-[3] relative">
                <BackgroundImage imageUrl={backgroundImage} />
                {!backgroundImage && <div className="absolute inset-0 bg-slate-200"></div>}
            </div>

            {/* Content Banner */}
            <div
                className="flex-[1] flex flex-col justify-center items-center text-center p-4 font-montserrat font-extrabold"
                style={{ backgroundColor: '#A5D6A7', color: '#263238' }}
            >
                {subtitle && (
                    <p
                        className="text-xs tracking-wide mb-1 font-semibold"
                        style={{ color: '#81C784' }}
                    >
                        {subtitle}
                    </p>
                )}
                {title && (
                    <h2
                        className={`${titleFontSize} leading-tight tracking-tight uppercase`}
                        style={{ wordBreak: 'break-word' }}
                    >
                        {title}
                    </h2>
                )}
            </div>

            {/* Bottom Image Section */}
            <div className="flex-[3] relative">
                <BackgroundImage imageUrl={backgroundImage2} />
                {!backgroundImage2 && <div className="absolute inset-0 bg-slate-200"></div>}
            </div>

            {/* Website Overlay at the bottom */}
            {website && (
                <div className="absolute bottom-0 left-0 w-full p-2 bg-black/50 text-center">
                    <p className="text-xs tracking-[0.15em] text-white/80 uppercase font-semibold">
                        {website}
                    </p>
                </div>
            )}
        </div>
    );
};

const MontserratVerticalTemplateBrown: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage, backgroundImage2 } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-xl', 'text-2xl', 'text-3xl');

    return (
        <div className="w-full h-full flex flex-col relative font-poppins bg-white">
            {/* Top Image Section */}
            <div className="flex-[3] relative">
                <BackgroundImage imageUrl={backgroundImage} />
                {!backgroundImage && <div className="absolute inset-0 bg-slate-200"></div>}
            </div>

            {/* Content Banner */}
            <div
                className="flex-[1] flex flex-col justify-center items-center text-center p-4 font-montserrat font-extrabold"
                style={{ backgroundColor: '#4B2E05', color: '#FFF8E1' }}
            >
                {subtitle && (
                    <p
                        className="text-xs tracking-wide mb-1 font-semibold"
                        style={{ color: '#F5C16C' }}
                    >
                        {subtitle}
                    </p>
                )}
                {title && (
                    <h2
                        className={`${titleFontSize} leading-tight tracking-tight uppercase`}
                        style={{ wordBreak: 'break-word' }}
                    >
                        {title}
                    </h2>
                )}
            </div>

            {/* Bottom Image Section */}
            <div className="flex-[3] relative">
                <BackgroundImage imageUrl={backgroundImage2} />
                {!backgroundImage2 && <div className="absolute inset-0 bg-slate-200"></div>}
            </div>

            {/* Website Overlay at the bottom */}
            {website && (
                <div className="absolute bottom-0 left-0 w-full p-2 bg-black/50 text-center">
                    <p className="text-xs tracking-[0.15em] text-white/80 uppercase font-semibold">
                        {website}
                    </p>
                </div>
            )}
        </div>
    );
};

const ThreePartVerticalTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage, backgroundImage2 } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-2xl', 'text-3xl', 'text-4xl');

    return (
        <div className="w-full h-full flex flex-col relative font-poppins bg-white">
            {/* Top Image Section */}
            <div className="flex-[3] relative">
                <BackgroundImage imageUrl={backgroundImage} />
                {!backgroundImage && <div className="absolute inset-0 bg-slate-200"></div>}
            </div>

            {/* Content Banner */}
            <div className="flex-[1] flex flex-col justify-center items-center text-center p-4 bg-black text-white font-fredoka-one">
                {subtitle && (
                    <p className="text-sm tracking-wide mb-1 text-white/70">
                        {subtitle}
                    </p>
                )}
                {title && (
                    <h2 
                        className={`${titleFontSize} leading-tight tracking-tight`}
                        style={{ wordBreak: 'break-word' }}
                    >
                        {title}
                    </h2>
                )}
            </div>

            {/* Bottom Image Section */}
            <div className="flex-[3] relative">
                <BackgroundImage imageUrl={backgroundImage2} />
                {!backgroundImage2 && <div className="absolute inset-0 bg-slate-200"></div>}
            </div>

            {/* Website Overlay at the bottom */}
            {website && (
                <div className="absolute bottom-0 left-0 w-full p-2 bg-black/50 text-center">
                    <p className="text-xs tracking-[0.15em] text-white/80 uppercase font-semibold">
                        {website}
                    </p>
                </div>
            )}
        </div>
    );
};

const ThreePartVerticalTemplateDark: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage, backgroundImage2 } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-2xl', 'text-3xl', 'text-4xl');

    return (
        <div className="w-full h-full flex flex-col relative font-poppins bg-white">
            {/* Top Image Section */}
            <div className="flex-[3] relative">
                <BackgroundImage imageUrl={backgroundImage} />
                {!backgroundImage && <div className="absolute inset-0 bg-slate-200"></div>}
            </div>

            {/* Content Banner */}
            <div 
                className="flex-[1] flex flex-col justify-center items-center text-center p-4 text-white font-fredoka-one"
                style={{ backgroundColor: '#2E2E2E' }}
            >
                {subtitle && (
                    <p 
                        className="text-sm tracking-wide mb-1"
                        style={{ color: '#EED9A3' }}
                    >
                        {subtitle}
                    </p>
                )}
                {title && (
                    <h2 
                        className={`${titleFontSize} leading-tight tracking-tight`}
                        style={{ wordBreak: 'break-word' }}
                    >
                        {title}
                    </h2>
                )}
            </div>

            {/* Bottom Image Section */}
            <div className="flex-[3] relative">
                <BackgroundImage imageUrl={backgroundImage2} />
                {!backgroundImage2 && <div className="absolute inset-0 bg-slate-200"></div>}
            </div>

            {/* Website Overlay at the bottom */}
            {website && (
                <div className="absolute bottom-0 left-0 w-full p-2 bg-black/50 text-center">
                    <p className="text-xs tracking-[0.15em] text-white/80 uppercase font-semibold">
                        {website}
                    </p>
                </div>
            )}
        </div>
    );
};

const ComicBookTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-3xl', 'text-4xl', 'text-5xl', 40, 20);
    return (
        <div className="w-full h-full relative font-bangers text-black p-4 bg-yellow-300">
            {/* Background with halftone effect */}
            <BackgroundImage imageUrl={backgroundImage} className="opacity-80" />
            <div 
                className="absolute inset-0 opacity-20 pointer-events-none" 
                style={{
                    backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
                    backgroundSize: '4px 4px',
                }}
            ></div>
            
            <div className="relative z-10 w-full h-full flex flex-col justify-between">
                {/* Top Banner */}
                {subtitle && (
                    <div className="bg-blue-500 text-white p-2 transform -skew-y-3 shadow-lg">
                        <p className="text-center font-bold tracking-wider text-sm md:text-base">{subtitle}</p>
                    </div>
                )}
                
                {/* Middle content / title */}
                <div className="flex-grow flex justify-center items-center">
                     {title && (
                         <div className="relative">
                            {/* Explosion shape */}
                            <svg className="absolute inset-0 w-full h-full text-red-500 drop-shadow-lg" viewBox="0 0 100 100">
                                <path d="M50 0 L61 39 L100 50 L61 61 L50 100 L39 61 L0 50 L39 39 Z" />
                                <path d="M50 0 L61 39 L100 50 L61 61 L50 100 L39 61 L0 50 L39 39 Z" transform="rotate(45 50 50)" />
                            </svg>
                             <div className="relative bg-yellow-300 p-4 rounded-full">
                                <h2 
                                    className={`${titleFontSize} text-white leading-none text-center uppercase`}
                                    style={{ textShadow: '3px 3px 0px #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000', wordBreak: 'break-word' }}
                                >
                                    {title}
                                </h2>
                            </div>
                         </div>
                     )}
                </div>

                {/* Bottom Website */}
                 {website && (
                    <div className="bg-blue-500 text-white p-1 text-center font-bold text-xs tracking-widest shadow-lg">
                        {website}
                    </div>
                )}
            </div>
        </div>
    );
};

const MinimalistPhotoFocusTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage } = data;
    return (
        <div className="w-full h-full relative font-poppins text-gray-800">
            <BackgroundImage imageUrl={backgroundImage} />
            {!backgroundImage && <div className="absolute inset-0 bg-slate-200"></div>}
            
            <div className="absolute bottom-4 left-4 right-4 z-10">
                <div className="bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-md">
                    <h2 className="font-semibold text-lg leading-tight" style={{ wordBreak: 'break-word' }}>{title}</h2>
                    {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
                    {website && <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mt-3 pt-2 border-t border-gray-200">{website}</p>}
                </div>
            </div>
        </div>
    );
};

const DidYouKnowTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, backgroundImage } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-2xl', 'text-3xl', 'text-4xl', 100, 60);
    return (
        <div className="w-full h-full relative flex flex-col justify-center items-center text-center p-8 text-slate-800">
            <BackgroundImage imageUrl={backgroundImage} />
            {!backgroundImage && <div className="absolute inset-0 bg-slate-200"></div>}
            
            <div className="relative z-10 w-full flex flex-col items-center">
                <div className="bg-yellow-400 text-black p-2 mb-6 shadow-lg">
                    <p className="font-anton text-2xl md:text-3xl tracking-wider">DID YOU KNOW?</p>
                </div>

                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-lg">
                    {title && (
                        <h2 
                            className={`font-playfair font-bold ${titleFontSize} leading-tight tracking-tight`}
                            style={{ wordBreak: 'break-word' }}
                        >
                            {title}
                        </h2>
                    )}
                    {subtitle && (
                         <p 
                            className="text-sm font-semibold tracking-wide mt-4 opacity-90 max-w-md mx-auto"
                            style={{ wordBreak: 'break-word' }}
                        >
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

const ElegantTextBorderTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-3xl', 'text-4xl', 'text-5xl');
    return (
        <div className="w-full h-full relative flex flex-col justify-center items-center text-center p-6 text-white">
            <BackgroundImage imageUrl={backgroundImage} />
            <div className="absolute inset-0 bg-slate-800/60"></div>
            {/* Border */}
            <div className="absolute inset-4 border-2 border-white/50"></div>
            
            <div className="relative z-10 w-full flex flex-col items-center max-w-md">
                 {subtitle && (
                    <p 
                        className="font-poppins text-sm font-semibold tracking-widest uppercase mb-4 opacity-80"
                        style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}
                    >
                        {subtitle}
                    </p>
                )}
                {title && (
                    <h2 
                        className={`font-playfair font-bold ${titleFontSize} leading-tight tracking-tight`}
                        style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.6)', wordBreak: 'break-word' }}
                    >
                        {title}
                    </h2>
                )}
                 {website && (
                    <p 
                        className="font-poppins text-xs font-bold tracking-[0.15em] mt-8 pt-4 border-t-2 border-white/50 w-2/3 mx-auto uppercase opacity-80"
                        style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}
                    >
                        {website}
                    </p>
                )}
            </div>
        </div>
    );
};

const FoodieRecipeSplitTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage, backgroundImage2 } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-3xl', 'text-4xl', 'text-5xl', 40, 25);

    return (
        <div className="w-full h-full flex flex-col relative font-poppins text-white">
            {/* Top Image */}
            <div className="flex-1 relative">
                <BackgroundImage imageUrl={backgroundImage} />
                {!backgroundImage && <div className="absolute inset-0 bg-slate-300"></div>}
            </div>
            {/* Bottom Image */}
            <div className="flex-1 relative">
                <BackgroundImage imageUrl={backgroundImage2} />
                {!backgroundImage2 && <div className="absolute inset-0 bg-slate-300"></div>}
            </div>

            {/* Centered Content */}
            <div className="absolute inset-0 flex flex-col justify-center items-center p-4">
                <div className="bg-[#603813] w-[90%] text-center py-4 px-2 shadow-lg border-4 border-white">
                    {subtitle && (
                        <p className="font-montserrat font-bold text-lg tracking-wider text-white/90 uppercase">{subtitle}</p>
                    )}
                    {title && (
                        <h2 className={`${titleFontSize} font-anton uppercase leading-none tracking-wide ${subtitle ? 'mt-1' : ''} text-white`} style={{ wordBreak: 'break-word', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                            {title}
                        </h2>
                    )}
                </div>
            </div>
            {website && (
                 <div className="absolute bottom-4 w-full flex justify-center px-4">
                    <p className="text-sm font-semibold text-black bg-white/80 py-1.5 px-4 rounded">{website}</p>
                </div>
            )}
        </div>
    );
};

const FoodieRecipeSplitTemplateStyle2: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, backgroundImage, backgroundImage2 } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-3xl', 'text-4xl', 'text-5xl', 30, 20);

    return (
        <div className="w-full h-full flex flex-col relative font-poppins text-white">
            {/* Top Image */}
            <div className="flex-1 relative">
                <BackgroundImage imageUrl={backgroundImage} />
                {!backgroundImage && <div className="absolute inset-0 bg-slate-300"></div>}
            </div>
            {/* Bottom Image */}
            <div className="flex-1 relative">
                <BackgroundImage imageUrl={backgroundImage2} />
                {!backgroundImage2 && <div className="absolute inset-0 bg-slate-300"></div>}
            </div>

            {/* Centered Content */}
            <div className="absolute inset-0 flex flex-col justify-center items-center p-4">
                <div 
                    className="w-[90%] text-center py-3 px-2 shadow-lg"
                    style={{ 
                        backgroundColor: '#c56633',
                        borderTop: '2px solid #3d1c07',
                        borderBottom: '2px solid #3d1c07',
                    }}
                >
                    {subtitle && (
                        <p 
                            className="font-montserrat font-bold text-sm md:text-base tracking-widest text-white uppercase"
                             style={{
                                textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000'
                            }}
                        >{subtitle}</p>
                    )}
                    {title && (
                        <h2 
                            className={`${titleFontSize} font-anton uppercase leading-none tracking-wide ${subtitle ? 'mt-1' : ''} text-white`} 
                            style={{
                                textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 0px 0 #000, -2px 0px 0 #000, 0px 2px 0 #000, 0px -2px 0 #000',
                                wordBreak: 'break-word'
                            }}
                        >
                            {title}
                        </h2>
                    )}
                </div>
            </div>
        </div>
    );
};

const FoodieRecipeSplitTemplateStyle3: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, website, backgroundImage, backgroundImage2 } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-4xl', 'text-5xl', 'text-6xl', 35, 20);

    return (
        <div className="w-full h-full flex flex-col relative font-poppins text-white">
            {/* Top Image */}
            <div className="flex-1 relative">
                <BackgroundImage imageUrl={backgroundImage} />
                {!backgroundImage && <div className="absolute inset-0 bg-slate-300"></div>}
            </div>
            {/* Bottom Image */}
            <div className="flex-1 relative">
                <BackgroundImage imageUrl={backgroundImage2} />
                {!backgroundImage2 && <div className="absolute inset-0 bg-slate-300"></div>}
            </div>

            {/* Centered Content */}
            <div className="absolute inset-0 flex flex-col justify-center items-center p-4">
                <div 
                    className="w-full text-center py-3 px-2 shadow-lg"
                    style={{ 
                        backgroundColor: '#4a2c1a',
                        borderTop: '2px solid white',
                        borderBottom: '2px solid white',
                    }}
                >
                    {title && (
                        <h2 
                            className={`${titleFontSize} font-anton uppercase leading-none tracking-wide text-white`} 
                            style={{
                                textShadow: '2px 2px 0 #3d1c07, -2px -2px 0 #3d1c07, 2px -2px 0 #3d1c07, -2px 2px 0 #3d1c07, 2px 0px 0 #3d1c07, -2px 0px 0 #3d1c07, 0px 2px 0 #3d1c07, 0px -2px 0 #3d1c07',
                                wordBreak: 'break-word'
                            }}
                        >
                            {title}
                        </h2>
                    )}
                </div>
            </div>

            {/* Website URL */}
            {website && (
                 <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-auto flex justify-center px-4">
                    <p className="text-sm font-semibold text-white bg-[#4a2c1a]/80 py-1.5 px-4 rounded">{website}</p>
                </div>
            )}
        </div>
    );
};

const FoodieRecipeSplitTemplateStyle4: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, website, backgroundImage, backgroundImage2 } = data;
    const titleFontSize = getDynamicTitleFontSize(title?.length || 0, 'text-4xl', 'text-5xl', 'text-6xl', 35, 20);
    const words = (title || '').split(' ');
    const firstWord = words[0];
    const restOfTitle = words.slice(1).join(' ');

    return (
        <div className="w-full h-full flex flex-col relative font-poppins text-white">
            {/* Top Image */}
            <div className="flex-1 relative">
                <BackgroundImage imageUrl={backgroundImage} />
                {!backgroundImage && <div className="absolute inset-0 bg-slate-300"></div>}
            </div>
            {/* Bottom Image */}
            <div className="flex-1 relative">
                <BackgroundImage imageUrl={backgroundImage2} />
                {!backgroundImage2 && <div className="absolute inset-0 bg-slate-300"></div>}
            </div>

            {/* Centered Content */}
            <div className="absolute inset-0 flex flex-col justify-center items-center p-4">
                <div className="w-full text-center py-3 px-2">
                    {title && (
                        <h2 
                            className={`${titleFontSize} font-anton uppercase leading-none tracking-wide text-white`} 
                            style={{
                                textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 0px 0 #000, -2px 0px 0 #000, 0px 2px 0 #000, 0px -2px 0 #000',
                                wordBreak: 'break-word'
                            }}
                        >
                           <span className="text-[#f9d749]">{firstWord}</span> {restOfTitle}
                        </h2>
                    )}
                </div>
            </div>

            {/* Website URL */}
            {website && (
                 <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-auto flex justify-center px-4">
                    <p className="text-sm font-semibold text-white bg-black/60 py-1.5 px-4 rounded">{website}</p>
                </div>
            )}
        </div>
    );
};

// Fixed: Corrected syntax for the comment and ensured template map is defined
const templateMap: { [key: string]: React.FC<{ data: TemplateData }> } = {
    '1': ClassicTemplate,
    '2': SplitTemplate,
    '3': ModernTemplate,
    '4': BrushStrokeTemplate,
    '5': BorderTemplate,
    '6': EditorialTemplate,
    '7': CleanGridTemplate,
    '8': MinimalistQuoteTemplate,
    '9': TastyRecipeTemplate,
    '10': DetailedRecipeTemplate,
    '11': TrendyCollageTemplate,
    '12': RetroVibesTemplate,
    '13': ProductSpotlightTemplate,
    '14': QuoteOverlayTemplate,
    '15': ShopTheLookTemplate,
    '16': BeforeAfterTemplate,
    '17': ChecklistTemplate,
    '18': NewArticleTemplate,
    '19': MoodBoardTemplate,
    '20': RecipeCardTemplate,
    '21': GourmetCloseUpTemplate,
    '22': StepByStepGuideTemplate,
    '23': MinimalistIngredientsTemplate,
    '24': ElegantRecipeCardTemplate,
    '25': BoldTitleOverlayTemplate,
    '26': GardeningTipsTemplate,
    '27': HomeDecorInspoTemplate,
    '28': AuthorQuoteTemplate,
    '29': SplitImageFourBlockTemplate,
    '30': SimpleProductTemplate,
    '31': FoodieSplitTemplate,
    '32': MinimalistLivingTemplate,
    '33': BoldFoodieTemplate,
    '34': BoldFoodieSplitTemplate2,
    '35': VibrantFoodieSplitTemplate,
    '36': ElegantFoodieSplitTemplate,
    '37': ElegantFoodieSingleTemplate,
    '38': AntonVerticalTemplate,
    '39': MontserratVerticalTemplate,
    '40': MontserratVerticalTemplateGreen,
    '41': MontserratVerticalTemplateBrown,
    '42': ThreePartVerticalTemplate,
    '43': ThreePartVerticalTemplateDark,
    '44': ComicBookTemplate,
    '45': MinimalistPhotoFocusTemplate,
    '46': DidYouKnowTemplate,
    '47': ElegantTextBorderTemplate,
    '48': FoodieRecipeSplitTemplate,
    '49': FoodieRecipeSplitTemplateStyle2,
    '50': FoodieRecipeSplitTemplateStyle3,
    '51': FoodieRecipeSplitTemplateStyle4,
};

const TemplatePreview = forwardRef<HTMLDivElement, TemplatePreviewProps>(({ data }, ref) => {
    const { templateId, pinSize } = data;
    const SelectedTemplate = templateMap[templateId] || ClassicTemplate;
    
    const sizeClasses = {
        standard: 'aspect-[3/4]',
        long: 'aspect-[9/16]',
        extraLong: 'aspect-[5/12]'
    };

    return (
        <div className={`w-full ${sizeClasses[pinSize] || sizeClasses['long']} overflow-hidden shadow-2xl rounded-2xl bg-slate-200`}>
            <div ref={ref} className="w-full h-full relative">
                <SelectedTemplate data={{...data, subtitle: data.board}} />
            </div>
        </div>
    );
});

export default TemplatePreview;
