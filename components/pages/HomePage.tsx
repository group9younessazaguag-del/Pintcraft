import React from 'react';
import AssistantIcon from '../icons/AssistantIcon';
import PinIcon from '../icons/PinIcon';
import ContentIcon from '../icons/ContentIcon';
import CheckIcon from '../icons/CheckIcon';
import DomainIcon from '../icons/DomainIcon';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; ctaText: string; href: string }> = ({ icon, title, description, ctaText, href }) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col text-center items-center transition-colors duration-300">
        <div className="flex-shrink-0 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 p-3 rounded-full">
            {icon}
        </div>
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mt-4">{title}</h3>
        <p className="text-slate-600 dark:text-slate-400 mt-2 flex-grow">{description}</p>
        <a
            href={href}
            className="mt-6 inline-block w-full px-5 py-2.5 bg-slate-800 dark:bg-slate-700 text-white font-semibold text-sm rounded-lg shadow-md hover:bg-slate-900 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-all duration-300"
        >
            {ctaText}
        </a>
    </div>
);

const BenefitItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <li className="flex items-start">
        <div className="flex-shrink-0 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-1.5 rounded-full mr-4">
            <CheckIcon className="w-5 h-5" />
        </div>
        <span className="text-slate-700 dark:text-slate-300">{children}</span>
    </li>
);

const HomePage: React.FC = () => {
    return (
        <div className="space-y-24 md:space-y-32">
            {/* Hero Section */}
            <section className="text-center">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Automate Your Pinterest, <span className="text-pink-500">Effortlessly</span>.
                    </h1>
                    <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-slate-600 dark:text-slate-400">
                        From scheduling and content ideas to bulk pin creation, our AI tools streamline your entire workflow, saving you time and boosting your creativity.
                    </p>
                    <a
                        href="/#/pin-generator"
                        className="mt-8 inline-block px-8 py-3 bg-pink-500 text-white font-semibold rounded-lg shadow-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-all duration-300 transform hover:scale-105"
                    >
                        Get Started for Free
                    </a>
                </div>
            </section>

            {/* Features Section */}
            <section>
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-100 text-center">Your All-in-One AI Toolkit</h2>
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                        <FeatureCard
                            icon={<AssistantIcon className="w-7 h-7" />}
                            title="AI Posting Assistant"
                            description="Never miss a post again. Our AI tracks your schedule, provides strategic suggestions, and helps you manage all your accounts from one smart dashboard."
                            ctaText="Manage Schedule"
                            href="/#/assistant"
                        />
                        <FeatureCard
                            icon={<PinIcon className="w-7 h-7" />}
                            title="Bulk Pin Generator"
                            description="Create hundreds of unique, on-brand pins in minutes. Upload a CSV, choose a template, and let our AI handle the design and scheduling data."
                            ctaText="Create Pins"
                            href="/#/pin-generator"
                        />
                        <FeatureCard
                            icon={<ContentIcon className="w-7 h-7" />}
                            title="AI Content Generator"
                            description="Stuck on ideas? Turn a list of keywords into a complete content plan with titles, descriptions, and image prompts for your next campaign."
                            ctaText="Generate Ideas"
                            href="/#/content-generator"
                        />
                        <FeatureCard
                            icon={<DomainIcon className="w-7 h-7" />}
                            title="Domain Name Rater"
                            description="Use our AI-powered tool to estimate the value of any domain name and determine the best Buy-It-Now (BIN) price for your digital assets."
                            ctaText="Rate a Domain"
                            href="/#/domain-suggestor"
                        />
                    </div>
                </div>
            </section>
            
            {/* Benefits Section */}
            <section>
                <div className="container mx-auto px-4">
                     <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 transition-colors duration-300">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-100 text-center">Unlock Your Pinterest Potential</h2>
                        <ul className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-lg">
                            <BenefitItem><strong className="text-slate-900 dark:text-white">Save Countless Hours</strong> by automating repetitive design and scheduling tasks.</BenefitItem>
                            <BenefitItem><strong className="text-slate-900 dark:text-white">Stay Perfectly Consistent</strong> with a clear, manageable posting schedule across all accounts.</BenefitItem>
                            <BenefitItem><strong className="text-slate-900 dark:text-white">Boost Your Creativity</strong> with endless AI-generated ideas, titles, and descriptions.</BenefitItem>
                            <BenefitItem><strong className="text-slate-900 dark:text-white">Streamline Your Workflow</strong> by managing everything from a single, intuitive platform.</BenefitItem>
                        </ul>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;