
import React, { useState, useEffect } from 'react';

const messages = [
    "Consulting the archetypes...",
    "Translating dream symbols...",
    "Painting your subconscious...",
    "Navigating the collective unconscious...",
    "Unraveling psychic threads...",
];

const Loader: React.FC = () => {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex(prevIndex => (prevIndex + 1) % messages.length);
        }, 2500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <svg className="animate-spin h-12 w-12 text-violet-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-lg text-slate-300 transition-opacity duration-500">{messages[messageIndex]}</p>
        </div>
    );
};

export default Loader;
