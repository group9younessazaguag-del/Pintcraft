
import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200/80 prose prose-slate">
        <h1 className="text-4xl font-bold tracking-tight text-slate-800">Privacy Policy</h1>
        <p className="text-sm text-slate-500">Last updated: {new Date().toLocaleDateString()}</p>
        
        <p>
          This Privacy Policy describes how your information is handled when you use the AI Pinterest Pin Generator (the "Application"). Your privacy is critically important to us.
        </p>
        
        <h2>Information We Handle</h2>
        <p>
          The Application is designed to function without collecting or storing any of your personal information on our servers. The key piece of data you interact with is your Google AI API Key.
        </p>
        
        <h3>Google AI API Key</h3>
        <p>
          To use the AI image and text generation features, you must provide your own Google AI API Key. We are committed to handling this key with the utmost respect for your security and privacy.
        </p>
        <p>
          If an API key is not configured securely in the application's environment, you will be prompted to enter one in the user interface.
        </p>
        <ul>
          <li><strong>Local Storage:</strong> If you enter an API key in the input field, it is stored exclusively in your web browser's local storage. This allows you to use the application without re-entering the key on every visit.</li>
          <li><strong>Not Sent to Our Servers:</strong> Your API key is <strong>never</strong> transmitted to, stored on, or logged by our servers. It is used directly from your browser to communicate with the Google AI API for authentication.</li>
          <li><strong>Your Control:</strong> You have full control over your API key. You can view, change, or clear it from the "Model Settings" panel at any time. Clearing your browser's site data will also remove the key.</li>
          <li><strong>Security Responsibility:</strong> By storing the key in your browser, you accept responsibility for its security. We recommend using this feature only on a trusted, personal computer and avoiding public or shared devices. For the highest level of security, configure the key as an environment variable.</li>
        </ul>

        <h2>Information Google Collects</h2>
        <p>
            When you use your API key to generate images or text, your requests are sent directly to Google's Generative Language API. Your use of the Google AI API is subject to Google's own <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a> and <a href="https://ai.google.dev/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a>. We do not have access to or control over the data processed by Google.
        </p>
        
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
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
