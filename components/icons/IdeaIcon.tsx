import React from 'react';

const IdeaIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M15.05 5A5 5 0 0 1 19 8.95a5 5 0 0 1-4 4.95V17a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-3.1a5 5 0 0 1-4-4.95A5 5 0 0 1 9 5.05a3 3 0 0 1 6 0Z"></path>
        <path d="M9 18h6"></path>
        <path d="M12 22v-4"></path>
    </svg>
);

export default IdeaIcon;
