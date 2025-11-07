
import React from 'react';

const PrivacyPolicyPage: React.FC<{ content?: string }> = ({ content }) => {

  const defaultContent = (
    <>
      <h1 className="text-4xl font-bold tracking-tight text-slate-800">Privacy Policy</h1>
      <p className="text-sm text-slate-500">Last updated: {new Date().toLocaleDateString()}</p>
      
      <p>
        This Privacy Policy describes how your information is handled when you use Pin4You (the "Application"). Your privacy is critically important to us.
      </p>
      
      <h2>Information We Handle</h2>
      <p>
        The Application is designed to function without collecting or storing any of your personal information on our servers. The key pieces of data you interact with are your API Keys for various AI services.
      </p>
      
      <h3>API Keys (Google AI, Fal.ai, etc.)</h3>
      <p>
        To use the AI text and image generation features, you must provide your own API keys. We are committed to handling these keys with the utmost respect for your security and privacy.
      </p>
      <ul>
        <li><strong>Local Storage:</strong> When you enter an API key, it is stored exclusively in your web browser's local storage. This allows you to use the application without re-entering the key on every visit.</li>
        <li><strong>Not Sent to Our Servers:</strong> Your API keys are <strong>never</strong> transmitted to, stored on, or logged by our servers. They are used directly from your browser to communicate with the respective AI service APIs for authentication.</li>
        <li><strong>Your Control:</strong> You have full control over your API keys. You can view, change, or clear them from the "AI Configuration" panel at any time. Clearing your browser's site data will also remove the keys.</li>
        <li><strong>Security Responsibility:</strong> By storing keys in your browser, you accept responsibility for their security. We recommend using this feature only on a trusted, personal computer.</li>
      </ul>

      <h2>Third-Party AI Services</h2>
      <p>
          When you use an API key to generate content, your requests are sent directly from your browser to the corresponding third-party service. Your use of these services is subject to their own privacy policies and terms.
      </p>
      <ul>
        <li><strong>Google AI (for Text):</strong> Text generation requests (descriptions, keywords) are sent to Google's Generative Language API. Your use is subject to Google's <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a> and <a href="https://ai.google.dev/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a>.</li>
        <li><strong>Fal.ai (for Images):</strong> Image generation requests using Fal.ai are subject to their <a href="https://fal.ai/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.</li>
        <li><strong>APIFrame.ai (for Midjourney Images):</strong> Requests using APIFrame.ai are subject to their <a href="https://www.apiframe.ai/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.</li>
        <li><strong>midapi.ai (for Midjourney Images):</strong> Requests using midapi.ai are subject to their <a href="https://midapi.ai/docs/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.</li>
      </ul>
      <p>We do not have access to or control over the data processed by these third-party services.</p>
      
      <h2>Uploaded Content</h2>
      <p>
        Any CSV files or images you upload are processed entirely within your browser. This data is not sent to our servers. It is used locally to populate the templates and prepare your pins for generation.
      </p>

      <h2>Changes to This Privacy Policy</h2>
      <p>
        We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
      </p>
      
      <h2>Contact Us</h2>
      <p>
        If you have any questions about this Privacy Policy, you can contact us through the support channels provided.
      </p>
    </>
  );

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200/80 prose prose-slate">
        {content ? <div dangerouslySetInnerHTML={{ __html: content }} /> : defaultContent}
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
