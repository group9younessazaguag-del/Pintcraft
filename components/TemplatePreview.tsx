import React, { forwardRef } from 'react';
import type { TemplateData } from '../types';

interface TemplatePreviewProps {
  data: TemplateData;
}

const BackgroundImage: React.FC<{ imageUrl: string | null }> = ({ imageUrl }) => (
    <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-300"
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
                        className="text-base tracking-widest mb-4 font-light opacity-90"
                        style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}
                    >
                        {subtitle}
                    </p>
                )}
                {title && (
                    <h2 
                        className="font-bold text-5xl md:text-6xl lg:text-7xl leading-tight tracking-tight break-words"
                        style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}
                    >
                        {title}
                    </h2>
                )}
                 {website && (
                    <div className="w-full max-w-xs mt-8 pt-4 border-t border-white/30">
                        <p 
                            className="text-sm font-semibold tracking-[0.2em] opacity-80"
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
                <div className="w-full max-w-md bg-white/95 backdrop-blur-sm border border-black/5 p-8 shadow-2xl text-center rounded-lg">
                     {subtitle && (
                        <p className="text-base tracking-widest mb-2 font-light text-gray-600">
                            {subtitle}
                        </p>
                    )}
                    {title && (
                        <h2 className="font-anton uppercase text-4xl md:text-5xl leading-tight tracking-tight break-words">
                            {title}
                        </h2>
                    )}
                     {website && (
                        <p className="mt-6 text-sm font-bold tracking-[0.2em] text-gray-500">
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
                        className="text-base tracking-wide mb-2 font-light opacity-80"
                        style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.6)' }}
                    >
                        {subtitle}
                    </p>
                )}
                {title && (
                    <h2 
                        className="font-bold text-4xl md:text-5xl lg:text-6xl leading-tight tracking-tight text-white"
                        style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.6)' }}
                    >
                        {title}
                    </h2>
                )}
                 {website && (
                    <p 
                        className="mt-4 text-sm font-light tracking-[0.2em] opacity-70 border-t border-white/20 pt-2"
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
                className="bg-[#FDF4E3] py-4 px-2 text-center shadow-lg"
                style={{
                    backgroundImage: 'linear-gradient(to right, rgba(210, 143, 93, 0.05), transparent, rgba(210, 143, 93, 0.05)), linear-gradient(to bottom, rgba(210, 143, 93, 0.05), transparent, rgba(210, 143, 93, 0.05))',
                    borderTop: '2px solid rgba(199, 131, 80, 0.3)',
                    borderBottom: '2px solid rgba(199, 131, 80, 0.3)',
                }}
            >
                 {subtitle && (
                    <p className="text-sm tracking-widest mb-1 font-light text-black/60">
                        {subtitle}
                    </p>
                )}
                {title && (
                    <h2 
                        className="font-anton uppercase text-4xl sm:text-5xl md:text-6xl text-stone-800 tracking-wide break-words leading-tight"
                        style={{ textShadow: '1px 1px 3px rgba(0, 0, 0, 0.2)' }}
                    >
                        {title}
                    </h2>
                )}
                 {website && (
                    <p className="mt-2 text-xs font-bold tracking-[0.1em] text-black/50">
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
                    <div className="bg-white/90 backdrop-blur-md p-6 rounded-lg shadow-lg">
                        {title && (
                            <h2
                                className="font-anton uppercase text-4xl sm:text-5xl text-gray-800 leading-tight tracking-tight break-words"
                            >
                                {title}
                            </h2>
                        )}
                        {subtitle && (
                            <p className="text-sm tracking-widest mt-3 font-semibold text-gray-600">
                                {subtitle}
                            </p>
                        )}
                        {website && (
                            <p className="mt-4 text-xs font-bold tracking-[0.15em] text-gray-500">
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
            <div className="row-span-1 flex flex-col justify-center items-start p-6 text-left text-gray-800">
                {subtitle && (
                    <p className="text-sm tracking-widest font-light text-gray-500 mb-2">
                        {subtitle}
                    </p>
                )}
                {title && (
                    <h2
                        className="font-bold text-4xl md:text-5xl leading-tight tracking-tight text-gray-900"
                    >
                        {title}
                    </h2>
                )}
                 {website && (
                    <p className="mt-4 text-xs font-bold tracking-[0.2em] text-gray-400 border-t border-gray-200 w-full pt-3">
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
            <div className="col-span-1 row-span-1 bg-white rounded-lg flex flex-col justify-center items-center p-4 text-center text-gray-800 shadow-md">
                {subtitle && (
                    <p className="text-xs tracking-widest mb-1 font-light text-gray-500 uppercase">
                        {subtitle}
                    </p>
                )}
                {title && (
                    <h2 className="font-anton uppercase text-xl sm:text-2xl md:text-3xl leading-none tracking-tight">
                        {title}
                    </h2>
                )}
                {website && (
                    <p className="mt-2 text-xs font-bold tracking-[0.1em] text-gray-400">
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
                        className="text-4xl md:text-5xl lg:text-6xl leading-tight font-light tracking-wide"
                        style={{ fontVariantLigatures: 'common-ligatures' }}
                    >
                        “{title}”
                    </h2>
                )}
                {subtitle && (
                    <p 
                        className="text-lg tracking-wider mt-6 font-sans font-bold uppercase text-gray-500"
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
            
            <div className="relative z-10 text-center">
                {subtitle && (
                    <p 
                        className="text-base tracking-[0.2em] mb-2 font-sans uppercase font-light"
                        style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.8)' }}
                    >
                        {subtitle}
                    </p>
                )}
                {title && (
                    <h2 
                        className="text-4xl md:text-5xl leading-tight font-medium break-words"
                        style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.8)' }}
                    >
                        {title}
                    </h2>
                )}
                {website && (
                    <p 
                        className="mt-6 text-sm font-sans font-semibold tracking-[0.15em] opacity-80"
                        style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.8)' }}
                    >
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
                        className="font-anton uppercase text-4xl sm:text-5xl leading-none tracking-tight text-white bg-stone-800 px-4 py-2"
                        style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
                    >
                        {title}
                    </h2>
                )}
                {subtitle && (
                    <p className="text-base tracking-widest mt-2 font-light text-gray-800 bg-[#F4EFEA]/80 px-3 py-1">
                        {subtitle}
                    </p>
                )}
            </div>
            
            {website && (
                <p className="absolute bottom-4 left-4 z-10 text-xs font-bold tracking-[0.1em] text-black/40">
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
                    <p className="text-sm tracking-[0.3em] font-semibold uppercase">{subtitle}</p>
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
                    <h2 className="font-anton uppercase text-5xl sm:text-6xl md:text-7xl leading-none tracking-wide" style={{textShadow: '1px 1px 2px rgba(255,255,255,0.5)'}}>{title}</h2>
                )}
                {website && (
                    <p className="mt-4 text-xs font-bold tracking-[0.2em] opacity-80 uppercase">{website}</p>
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
            <div className="relative z-10 bg-white w-full rounded-2xl p-4 shadow-lg flex items-end">
                <div className="flex-1 pr-3">
                    {title && (
                        <h2 className="font-bold text-2xl sm:text-3xl leading-tight tracking-tighter text-gray-800 break-words">{title}</h2>
                    )}
                    {website && (
                        <p className="mt-2 text-xs font-semibold tracking-widest text-gray-500 uppercase">{website}</p>
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

const InfographicTemplate: React.FC<{ data: TemplateData }> = ({ data }) => {
    const { title, subtitle, website, backgroundImage } = data;
    const listItems = subtitle.split(',').map(item => item.trim()).filter(Boolean);
    return (
        <div className="w-full h-full flex flex-col relative font-poppins text-gray-800 bg-gray-50">
            <BackgroundImage imageUrl={backgroundImage} />
            {backgroundImage && <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>}
            <div className="relative z-10 flex flex-col h-full p-8">
                {title && (
                    <h2 className="font-anton uppercase text-4xl md:text-5xl text-center leading-tight tracking-tight mb-8">
                        {title}
                    </h2>
                )}
                {listItems.length > 0 && (
                    <ol className="space-y-4 text-lg">
                        {listItems.map((item, index) => (
                            <li key={index} className="flex items-start">
                                <span className="mr-4 mt-1 flex-shrink-0 bg-rose-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-md">{index + 1}</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ol>
                )}
                <div className="flex-grow"></div>
                {website && (
                    <p className="mt-8 text-center text-sm font-bold tracking-[0.2em] text-gray-400">
                        {website}
                    </p>
                )}
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
                    <h2 className="text-4xl md:text-5xl leading-tight font-medium">
                        "{title}"
                    </h2>
                )}
                {subtitle && (
                    <p className="text-lg tracking-wider mt-6 font-sans font-bold uppercase text-white/80">
                        — {subtitle}
                    </p>
                )}
            </div>
             {website && (
                <p className="absolute bottom-6 text-sm font-sans font-semibold tracking-[0.15em] text-white/60">
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
            <div className="row-span-1 p-4 flex flex-col justify-center bg-gray-50 border-t border-gray-200">
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        {title && <h2 className="font-bold text-3xl leading-tight text-gray-800">{title}</h2>}
                        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
                        {website && <p className="mt-2 text-xs font-bold tracking-widest text-gray-400">{website}</p>}
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
                    {title && <h2 className="font-anton uppercase text-4xl md:text-5xl leading-tight" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>{title}</h2>}
                    {subtitle && <p className="mt-2 text-sm tracking-widest" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>{subtitle}</p>}
                </div>
            </div>
            {website && <p className="absolute bottom-4 text-xs font-bold tracking-widest text-white/70">{website}</p>}
        </div>
    );
};


const TemplatePreview = forwardRef<HTMLDivElement, TemplatePreviewProps>(({ data }, ref) => {
  const { templateId, pinSize } = data;

  const aspectRatio = pinSize === 'standard' ? '3 / 4' : '9 / 16';

  const renderTemplate = () => {
    switch (templateId) {
      case 'classic':
        return <ClassicTemplate data={data} />;
      case 'split':
        return <SplitTemplate data={data} />;
      case 'modern':
        return <ModernTemplate data={data} />;
      case 'brush':
        return <BrushStrokeTemplate data={data} />;
      case 'border':
        return <BorderTemplate data={data} />;
      case 'editorial':
        return <EditorialTemplate data={data} />;
      case 'clean-grid':
        return <CleanGridTemplate data={data} />;
      case 'minimalist-quote':
        return <MinimalistQuoteTemplate data={data} />;
      case 'tasty-recipe':
        return <TastyRecipeTemplate data={data} />;
      case 'trendy-collage':
        return <TrendyCollageTemplate data={data} />;
      case 'retro-vibes':
        return <RetroVibesTemplate data={data} />;
      case 'product-spotlight':
        return <ProductSpotlightTemplate data={data} />;
      case 'infographic':
        return <InfographicTemplate data={data} />;
      case 'quote-overlay':
        return <QuoteOverlayTemplate data={data} />;
      case 'shop-the-look':
        return <ShopTheLookTemplate data={data} />;
      case 'before-after':
        return <BeforeAfterTemplate data={data} />;
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