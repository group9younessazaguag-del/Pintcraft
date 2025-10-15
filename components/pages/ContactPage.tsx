import React from 'react';

const ContactPage: React.FC<{ content?: string }> = ({ content }) => {

  const defaultContent = (
    <>
      <h1 className="text-4xl font-bold tracking-tight text-slate-800">Contact Us</h1>
      <p className="lead">
        We'd love to hear from you! Whether you have a question, a feature request, or just want to share your experience with Pin4You, please don't hesitate to reach out.
      </p>
      
      <h2>Get in Touch</h2>
      <p>
        The best way to contact us is via email. We do our best to respond to all inquiries within 1-2 business days.
      </p>
      
      <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 not-prose text-center">
          <h3 className="text-lg font-semibold text-slate-800">Support & Inquiries</h3>
          <a 
              href="mailto:support@pin4you.example.com" 
              className="text-2xl font-bold text-pink-600 hover:text-pink-700 hover:underline"
          >
              support@pin4you.example.com
          </a>
          <p className="text-sm text-slate-500 mt-2">(Please replace with a real email address)</p>
      </div>

      <h2>Feedback</h2>
      <p>
          Your feedback is invaluable to us as we continue to improve and evolve the tool. If you have any ideas on how we can make Pin4You better, please let us know.
      </p>
      
      <p>
          Thank you for using Pin4You!
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

export default ContactPage;