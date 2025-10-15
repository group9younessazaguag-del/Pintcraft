import React from 'react';

const HowToUsePage: React.FC = () => {
  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200/80 prose prose-slate">
        <h1 className="text-4xl font-bold tracking-tight text-slate-800">How to Use Pin4You</h1>
        <p className="lead">
          Welcome to your new favorite Pinterest tool! Follow this guide to get started creating beautiful, AI-powered pins in minutes.
        </p>

        <h2>Step 1: Configure Your AI Keys</h2>
        <p>
          To unlock the full power of AI generation for text and images, you need to provide your own API keys. You'll find the configuration panel on the left side of the main generator page.
        </p>
        <ul>
            <li><strong>Google AI API Key (for Text):</strong> This key is used for generating pin descriptions, keywords, and shortening titles. You can get a key from the <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a>.</li>
            <li><strong>Fal.ai API Key (for Images):</strong> This key is used for generating high-quality background images from your pin titles. You can get a key from the <a href="https://fal.ai/dashboard/keys" target="_blank" rel="noopener noreferrer">Fal.ai dashboard</a>.</li>
        </ul>
        <p>
            Enter each key into its respective field and click "Save". Your keys are stored securely in your browser's local storage and are never sent to our servers.
        </p>

        <h2>Step 2: Customize Your Pin's Look</h2>
        <p>
            In the "Customize Your Pin" card, you can change the visual style of your pin.
        </p>
        <ul>
            <li><strong>Template:</strong> Select from over 30 professionally designed templates. Click a number to see a live preview.</li>
            <li><strong>Pin Size:</strong> Choose between a 'Standard' (3:4) or 'Long' (9:16) aspect ratio.</li>
        </ul>

        <h2>Step 3: Add Your Content</h2>
        <p>
            This is where you define what your pin is about.
        </p>
        <ul>
            <li><strong>Title:</strong> The main headline of your pin. This is also used as the prompt for AI image generation.</li>
            <li><strong>Pinterest Board:</strong> The name of the board this pin belongs to (often used as a subtitle in templates).</li>
            <li><strong>Link:</strong> Your website or blog URL that will appear on the pin.</li>
            <li><strong>Description & Keywords:</strong> You can write these yourself or use the "✨ Generate" buttons to have our AI create SEO-friendly text for you.</li>
        </ul>

        <h2>Step 4: Add Images</h2>
        <p>
            Each template has one or more image slots.
        </p>
        <ul>
            <li><strong>Upload:</strong> Click "Upload" to choose an image from your computer.</li>
            <li><strong>Generate:</strong> Click "✨ Generate" to create a unique image using AI based on your pin's title.</li>
        </ul>
        
        <h2>Step 5: Generate a Single Pin</h2>
        <p>
            Once you're happy with the preview, click the "Download Pin" button in the "Single Pin Actions" card to save the final image as a PNG file.
        </p>
        
        <hr/>

        <h2>Advanced: Bulk Generation with CSV</h2>
        <p>
            This is the most powerful feature for creating a large volume of content quickly.
        </p>
        <ol>
            <li><strong>Prepare Your CSV:</strong> Create a CSV file with at least a column named <strong>Title</strong>. You can also include columns for <strong>Pinterest board</strong>, <strong>Description</strong>, and <strong>Keywords</strong>. If you leave Description or Keywords blank, the AI will generate them for you during the bulk process.</li>
            <li><strong>Upload CSV:</strong> In the "CSV Import" card, upload your prepared file.</li>
            <li><strong>Navigate Rows:</strong> Use the arrow buttons to preview each pin and make manual adjustments if needed.</li>
            <li><strong>Configure Bulk Settings:</strong> In the "Bulk Actions" card, set your desired "Pins Per Day," "Start Date" for scheduling, and the "Media URL Prefix" (the URL where you will host the generated images).</li>
            <li><strong>Start Generation:</strong> Click the "✨ Generate All Pins & CSV" button. The tool will iterate through each row, generating descriptions, keywords, and images, and then create the final pin image.</li>
            <li><strong>Download Files:</strong> Once complete, you'll be prompted to download a <code>.zip</code> file containing all your pin images and a final <code>.csv</code> file, ready for you to upload to Pinterest's native scheduler or another scheduling tool.</li>
        </ol>

      </div>
    </div>
  );
};

export default HowToUsePage;
