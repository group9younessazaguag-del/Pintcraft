import React from 'react';

const AuthorPage: React.FC = () => {
    return (
        <div className="container mx-auto max-w-4xl py-8 px-4">
            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200/80 prose prose-slate">
                <h1 className="text-4xl font-bold tracking-tight text-slate-800">About the Author</h1>
                <p className="lead">
                    This application, Pin4You, was created by a passionate developer dedicated to building helpful and innovative tools.
                </p>
                
                <h2>Our Mission</h2>
                <p>
                    The goal behind Pin4You is to leverage the power of artificial intelligence to simplify and automate creative workflows. We believe that great tools can unlock creativity and productivity, allowing creators and marketers to focus on what they do best: creating amazing content and growing their brands.
                </p>
                <p>
                    Thank you for using this application. We hope it helps you achieve your goals on Pinterest and beyond!
                </p>
            </div>
        </div>
    );
};

export default AuthorPage;
