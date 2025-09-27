import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200/80 prose prose-slate">
        <h1 className="text-4xl font-bold tracking-tight text-slate-800">About the AI Pinterest Pin Generator</h1>
        <p className="lead">
          Welcome to the ultimate tool for social media managers, bloggers, and e-commerce brands looking to supercharge their Pinterest marketing. Our AI Pinterest Pin Generator is designed to streamline your content creation process, saving you time and effort while producing beautiful, high-converting pins.
        </p>
        
        <h2>Why We Built This</h2>
        <p>
          Pinterest is a visual discovery engine, and success on the platform requires a consistent stream of fresh, eye-catching content. However, creating dozens or even hundreds of unique pins can be a time-consuming and repetitive task. We saw a need for a smart, automated solution that combines the power of professional design templates with cutting-edge artificial intelligence.
        </p>
        
        <h2>Key Features</h2>
        <ul>
          <li><strong>Professional Templates:</strong> Choose from a diverse library of fully customizable templates designed to perform well on Pinterest, covering everything from recipes and product spotlights to quotes and infographics.</li>
          <li><strong>AI Image Generation:</strong> Don't have the right image? No problem. Describe what you need, and our integrated AI will generate stunning, high-quality images for your pins in seconds, perfectly sized for your chosen template.</li>
          <li><strong>Bulk Creation via CSV:</strong> Have a content calendar in a spreadsheet? Upload a CSV file with your titles, board names, and descriptions, and our tool will prepare all your pins for generation in one go.</li>
          <li><strong>Automated Scheduling Fields:</strong> The generator automatically creates a ready-to-upload CSV file with image URLs and staggered publish dates, making it compatible with Pinterest's own bulk scheduling tools or third-party schedulers.</li>
          <li><strong>AI Keyword Generation:</strong> Boost your pin's visibility with SEO-optimized keywords. Our tool can automatically generate relevant, high-traffic keywords for each pin based on its title, helping you reach a wider audience.</li>
        </ul>
        
        <h2>Who Is It For?</h2>
        <p>
          This tool is perfect for anyone serious about leveraging Pinterest for growth:
        </p>
        <ul>
            <li><strong>Bloggers & Content Creators</strong> who want to drive more traffic to their articles and posts.</li>
            <li><strong>E-commerce Store Owners</strong> looking to promote products with engaging visuals.</li>
            <li><strong>Social Media Managers & Agencies</strong> who manage multiple Pinterest accounts and need an efficient workflow.</li>
            <li><strong>Marketers</strong> who want to increase brand awareness and engagement on the platform.</li>
        </ul>

        <p>
            Our mission is to make powerful marketing tools accessible to everyone. We hope this generator helps you unlock your creative potential and achieve your goals on Pinterest.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
