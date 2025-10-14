import React, { forwardRef } from 'react';
import type { TemplateData } from '../types';

interface TemplatePreviewProps {
  data: TemplateData;
}

const BackgroundImage: React.FC<{ imageUrl: string | null; className?: string }> = ({ imageUrl, className = '' }) => (
    <div
        className={`absolute inset-0 bg-cover bg-center transition-all duration-300 ${className}`}
        style={{ backgroundImage: imageUrl ? `url(${imageUrl})` : 'none' }}
    ></div>
);

const ClassicTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage } = data;
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
                        className="font-playfair font-bold text-4xl md:text-5xl leading-tight tracking-tight"
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
                <div className="w-full max-w-md bg-white/95 backdrop-blur-sm border border-black/5 p-8 shadow-2xl text-center rounded-lg text-[#4E443A]">
                     {subtitle && (
                        <p className="text-sm font-semibold tracking-wide mb-2 text-[#4E443A]/70">
                            {subtitle}
                        </p>
                    )}
                    {title && (
                        <h2 className="font-playfair text-4xl font-bold leading-tight tracking-tight" style={{ wordBreak: 'break-word' }}>
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
                        className="font-playfair font-bold text-4xl md:text-5xl leading-tight tracking-tight text-white"
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
    return (
        <div className="w-full h-full flex flex-col relative font-poppins bg-white">
            {/* Top Background */}
            <div className="flex-1 relative">
                <BackgroundImage imageUrl={backgroundImage} />
            </div>

            {/* Content Band */}
            <div 
                className="bg-[#FDF4E3] py-4 px-2 text-center shadow-lg text-[#4E443A]"
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
                        className="font-playfair text-4xl md:text-5xl font-bold leading-tight tracking-tight"
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
            <div className="flex-1 relative">
                <BackgroundImage imageUrl={backgroundImage2} />
            </div>
        </div>
    );
};

const BorderTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage } = data;
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
                                className="font-playfair text-4xl font-bold leading-tight tracking-tight"
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
                        className="font-playfair font-bold text-4xl leading-tight tracking-tight"
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
    return (
        <div className="w-full h-full flex flex-col justify-center items-center relative font-serif p-8 bg-[#FDFCFB]">
            <BackgroundImage imageUrl={backgroundImage} />
            {backgroundImage && <div className="absolute inset-0 bg-white/70 backdrop-blur-sm"></div>}
            
            <div className="relative z-10 text-center text-gray-800 max-w-md">
                {title && (
                    <h2 
                        className="text-3xl md:text-4xl leading-tight font-light tracking-wide"
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
                        className="font-playfair text-4xl font-bold leading-tight tracking-tight"
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
    const details = subtitle.split(',').map(s => s.trim()).filter(Boolean);

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
                    <h2 className="font-playfair text-4xl font-bold leading-tight tracking-tight" style={{ wordBreak: 'break-word' }}>
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
                        className="font-playfair font-bold text-4xl leading-none tracking-tight text-white bg-[#4E443A] px-4 py-2"
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
                {title && (
                    <h2 className="font-playfair font-bold text-5xl leading-none tracking-tight" style={{textShadow: '1px 1px 2px rgba(255,255,255,0.5)', wordBreak: 'break-word'}}>{title}</h2>
                )}
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
    return (
        <div className="w-full h-full flex flex-col justify-center items-center relative font-serif p-8">
            <BackgroundImage imageUrl={backgroundImage} />
            <div className="absolute inset-0 bg-black/30"></div>
            <div className="relative z-10 text-center text-white max-w-md bg-black/20 backdrop-blur-md p-8 rounded-lg">
                {title && (
                    <h2 className="font-playfair text-4xl leading-tight font-medium" style={{ wordBreak: 'break-word' }}>
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
                    {title && <h2 className="font-playfair font-bold text-4xl leading-tight tracking-tight" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)', wordBreak: 'break-word' }}>{title}</h2>}
                    {subtitle && <p className="mt-2 text-sm tracking-wide font-semibold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>{subtitle}</p>}
                </div>
            </div>
            {website && <p className="absolute bottom-4 text-xs font-bold tracking-[0.15em] text-white/70 uppercase">{website}</p>}
        </div>
    );
};

const ChecklistTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage } = data;
    const listItems = subtitle.split(',').map(item => item.trim()).filter(Boolean);

    return (
        <div className="w-full h-full flex flex-col items-center relative font-poppins text-[#4E443A] bg-[#F8F5F2] p-8">
            <BackgroundImage imageUrl={backgroundImage} />
            {backgroundImage && <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>}
            
            <div className="relative z-10 flex flex-col h-full w-full text-center">
                {title && (
                    <h2 className="font-playfair font-bold text-4xl leading-tight tracking-tight mb-8" style={{ wordBreak: 'break-word' }}>
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
                        className="font-playfair font-bold text-5xl md:text-6xl leading-tight tracking-tight"
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
                        className="font-playfair text-4xl font-bold leading-tight"
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
    const details = subtitle.split(',').map(s => s.trim()).filter(Boolean);
    return (
        <div className="w-full h-full flex flex-col relative font-poppins bg-[#FDFCFB] text-[#4E443A]">
            <div className="h-[60%] w-full relative">
                 <BackgroundImage imageUrl={backgroundImage} />
                 {!backgroundImage && <div className="absolute inset-0 bg-slate-200"></div>}
            </div>
            <div className="h-[40%] w-full flex flex-col justify-center items-center text-center p-6">
                 {title && (
                    <h2 className="font-playfair text-4xl font-bold leading-tight tracking-tight" style={{ wordBreak: 'break-word' }}>
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
    return (
        <div className="w-full h-full relative font-poppins text-white">
            <BackgroundImage imageUrl={backgroundImage} />
            {!backgroundImage && <div className="absolute inset-0 bg-gray-800"></div>}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent"></div>
            <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <div className="bg-black/30 backdrop-blur-sm p-5 rounded-lg">
                    {subtitle && <p className="text-sm font-semibold tracking-wide uppercase opacity-80">{subtitle}</p>}
                    {title && <h2 className="font-playfair text-4xl font-bold leading-tight tracking-tight mt-1" style={{ wordBreak: 'break-word' }}>{title}</h2>}
                </div>
            </div>
            {website && <p className="absolute top-5 right-5 text-xs font-bold tracking-[0.15em] opacity-70 uppercase" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>{website}</p>}
        </div>
    )
}

const StepByStepGuideTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage, backgroundImage2, backgroundImage3 } = data;
    const steps = subtitle.split(',').map(s => s.trim()).filter(Boolean);
    return (
        <div className="w-full h-full flex flex-col relative font-poppins bg-white text-gray-800">
            {/* Hero Image */}
            <div className="h-1/2 w-full relative">
                <BackgroundImage imageUrl={backgroundImage} />
                {!backgroundImage && <div className="absolute inset-0 bg-slate-200"></div>}
                <div className="absolute inset-0 bg-black/30"></div>
                <div className="absolute inset-0 p-8 flex flex-col justify-center items-center text-center text-white">
                    {title && <h2 className="font-playfair text-5xl font-bold leading-tight" style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.6)', wordBreak: 'break-word' }}>{title}</h2>}
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
                    {title && <h2 className="font-playfair text-4xl font-bold leading-tight tracking-tight" style={{ wordBreak: 'break-word' }}>{title}</h2>}
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
    return (
        <div className="w-full h-full flex flex-col justify-center items-center relative font-poppins text-white p-8 text-center">
            <BackgroundImage imageUrl={backgroundImage} />
            {!backgroundImage && <div className="absolute inset-0 bg-slate-700"></div>}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-black/20"></div>
            <div className="relative z-10 w-full flex flex-col items-center bg-black/20 backdrop-blur-sm p-6 rounded-lg">
                {title && <h2 className="font-anton font-bold text-5xl md:text-6xl uppercase leading-none tracking-wider" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)', wordBreak: 'break-word' }}>{title}</h2>}
                {subtitle && <p className="text-sm font-semibold tracking-widest mt-4 opacity-90 uppercase">{subtitle}</p>}
            </div>
            {website && <p className="absolute bottom-6 text-xs font-bold tracking-[0.15em] opacity-80 uppercase">{website}</p>}
        </div>
    );
};

const MagazineFeaturetteTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage } = data;
    return (
        <div className="w-full h-full flex relative font-poppins">
            <div className="flex-grow h-full relative">
                <BackgroundImage imageUrl={backgroundImage} />
                {!backgroundImage && <div className="absolute inset-0 bg-slate-200"></div>}
            </div>
            <div className="w-2/5 h-full bg-slate-800/80 backdrop-blur-sm text-white p-6 flex flex-col justify-center">
                {title && <h2 className="font-playfair font-bold text-4xl leading-tight tracking-tight" style={{ wordBreak: 'break-word' }}>{title}</h2>}
                {subtitle && <p className="text-sm tracking-wide mt-4 opacity-80">{subtitle}</p>}
                <div className="flex-grow"></div>
                {website && <p className="mt-auto text-xs font-bold tracking-[0.15em] opacity-60 uppercase">{website}</p>}
            </div>
        </div>
    );
};

const HorizontalSplitTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage, backgroundImage2 } = data;
    return (
        <div className="w-full h-full flex flex-col relative font-poppins bg-gray-100">
            <div className="h-1/2 w-full relative">
                <BackgroundImage imageUrl={backgroundImage} />
                {!backgroundImage && <div className="absolute inset-0 bg-slate-200"></div>}
            </div>
            <div className="h-1/2 w-full relative">
                <BackgroundImage imageUrl={backgroundImage2} />
                {!backgroundImage2 && <div className="absolute inset-0 bg-slate-200"></div>}
            </div>
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-10">
                <div className="bg-white/95 backdrop-blur-sm shadow-lg py-6 px-4 text-center text-[#4E443A]">
                    {subtitle && <p className="text-sm font-semibold tracking-wide text-[#4E443A]/70">{subtitle}</p>}
                    {title && <h2 className="font-playfair text-4xl font-bold leading-tight tracking-tight mt-1" style={{ wordBreak: 'break-word' }}>{title}</h2>}
                    {website && <p className="mt-4 text-xs font-bold tracking-[0.15em] text-[#4E443A]/50 uppercase">{website}</p>}
                </div>
            </div>
        </div>
    );
};

const IngredientSpotlightTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, website, backgroundImage, backgroundImage2 } = data;
    return (
        <div className="w-full h-full flex flex-col relative font-poppins bg-white">
            <div className="h-2/3 w-full relative">
                <BackgroundImage imageUrl={backgroundImage} />
                {!backgroundImage && <div className="absolute inset-0 bg-slate-200"></div>}
            </div>
            <div className="h-1/3 w-full flex justify-center items-center text-center p-4 bg-[#F8F5F2] text-[#4E443A] relative">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full overflow-hidden border-4 border-[#F8F5F2] shadow-lg bg-slate-200">
                     <BackgroundImage imageUrl={backgroundImage2} />
                </div>
                <div className="pt-10">
                    {title && <h2 className="font-playfair text-3xl font-bold leading-tight tracking-tight" style={{ wordBreak: 'break-word' }}>{title}</h2>}
                    {website && <p className="mt-3 text-xs font-bold tracking-[0.15em] text-[#4E443A]/50 uppercase">{website}</p>}
                </div>
            </div>
        </div>
    );
};

const PinForLaterTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage } = data;
    return (
        <div className="w-full h-full flex flex-col relative font-poppins bg-white">
            <div className="h-3/5 w-full relative">
                <BackgroundImage imageUrl={backgroundImage} />
                {!backgroundImage && <div className="absolute inset-0 bg-slate-200"></div>}
            </div>
            <div className="h-2/5 w-full flex flex-col justify-center items-center text-center p-6 bg-[#FFEFEF] text-[#4E443A]">
                {subtitle && <p className="text-sm font-semibold tracking-wide text-[#4E443A]/70">{subtitle}</p>}
                {title && <h2 className="font-playfair text-4xl font-bold leading-tight tracking-tight mt-1" style={{ wordBreak: 'break-word' }}>{title}</h2>}
                <div className="flex-grow"></div>
                <div className="flex items-center gap-2 bg-rose-600 text-white font-bold text-sm px-5 py-2.5 rounded-full shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zM9 8a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" /><path d="M9 12a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" /></svg>
                    <span>PIN FOR LATER</span>
                </div>
                {website && <p className="mt-4 text-xs font-bold tracking-[0.15em] text-[#4E443A]/50 uppercase">{website}</p>}
            </div>
        </div>
    );
};

const LuxuryDarkModeTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage } = data;
    return (
        <div className="w-full h-full flex flex-col justify-center items-center relative font-poppins text-[#E0D8C0] p-8 text-center bg-[#1A1A1A]">
            <BackgroundImage imageUrl={backgroundImage} className="opacity-50" />
            <div className="relative z-10 w-full flex flex-col items-center">
                {subtitle && <p className="text-sm font-semibold tracking-[0.2em] mb-4 opacity-70 uppercase">{subtitle}</p>}
                {title && <h2 className="font-playfair font-bold text-5xl leading-tight tracking-tight" style={{ textShadow: '1px 1px 15px rgba(0,0,0,0.5)', wordBreak: 'break-word' }}>{title}</h2>}
                <div className="w-24 mt-8 border-t border-[#E0D8C0]/40"></div>
            </div>
            {website && <p className="absolute bottom-8 text-xs font-bold tracking-[0.15em] opacity-50 uppercase">{website}</p>}
        </div>
    );
};

const HolidayCheerTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage } = data;
    return (
        <div className="w-full h-full flex flex-col relative font-poppins bg-[#F7F2EE]">
            <div className="h-3/4 w-full relative">
                <BackgroundImage imageUrl={backgroundImage} />
                {!backgroundImage && <div className="absolute inset-0 bg-slate-200"></div>}
            </div>
            <div className="h-1/4 w-full flex flex-col justify-center items-center text-center p-4 bg-[#A42C2C] text-white">
                {subtitle && <p className="text-sm font-semibold tracking-wide opacity-80">{subtitle}</p>}
                {title && <h2 className="font-playfair text-3xl font-bold leading-tight mt-1" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.3)', wordBreak: 'break-word' }}>{title}</h2>}
            </div>
            {website && <p className="absolute bottom-3 text-center w-full text-xs font-bold tracking-[0.1em] text-white/50 uppercase">{website}</p>}
        </div>
    );
};

const TemplatePreview = forwardRef<HTMLDivElement, TemplatePreviewProps>(({ data }, ref) => {
  const { templateId, pinSize } = data;

  const aspectRatio = pinSize === 'standard' ? '3 / 4' : '9 / 16';

  const renderTemplate = () => {
    switch (templateId) {
      case '1': return <BeforeAfterTemplate data={data} />;
      case '2': return <BorderTemplate data={data} />;
      case '3': return <BrushStrokeTemplate data={data} />;
      case '4': return <ChecklistTemplate data={data} />;
      case '5': return <ClassicTemplate data={data} />;
      case '6': return <CleanGridTemplate data={data} />;
      case '7': return <DetailedRecipeTemplate data={data} />;
      case '8': return <EditorialTemplate data={data} />;
      case '9': return <GourmetCloseUpTemplate data={data} />;
      case '10': return <MinimalistIngredientsTemplate data={data} />;
      case '11': return <MinimalistQuoteTemplate data={data} />;
      case '12': return <ModernTemplate data={data} />;
      case '13': return <MoodBoardTemplate data={data} />;
      case '14': return <NewArticleTemplate data={data} />;
      case '15': return <ProductSpotlightTemplate data={data} />;
      case '16': return <QuoteOverlayTemplate data={data} />;
      case '17': return <RecipeCardTemplate data={data} />;
      case '18': return <RetroVibesTemplate data={data} />;
      case '19': return <ShopTheLookTemplate data={data} />;
      case '20': return <SplitTemplate data={data} />;
      case '21': return <StepByStepGuideTemplate data={data} />;
      case '22': return <TastyRecipeTemplate data={data} />;
      case '23': return <TrendyCollageTemplate data={data} />;
      case '24': return <ElegantRecipeCardTemplate data={data} />;
      case '25': return <BoldTitleOverlayTemplate data={data} />;
      case '26': return <MagazineFeaturetteTemplate data={data} />;
      case '27': return <HorizontalSplitTemplate data={data} />;
      case '28': return <IngredientSpotlightTemplate data={data} />;
      case '29': return <PinForLaterTemplate data={data} />;
      case '30': return <LuxuryDarkModeTemplate data={data} />;
      case '31': return <HolidayCheerTemplate data={data} />;
      default:
        return <ClassicTemplate data={data} />;
    }
  };

  return (
    <div 
        ref={ref} 
        className="w-full bg-white rounded-2xl shadow-lg overflow-hidden ring-1 ring-slate-200"
        style={{ aspectRatio: aspectRatio }}
    >
        {renderTemplate()}
    </div>
  );
});

export default TemplatePreview;