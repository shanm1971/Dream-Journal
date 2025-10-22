
import React from 'react';
import { DreamData } from '../types';
import Markdown from 'react-markdown';

interface DreamDisplayProps {
    dreamData: DreamData;
}

const DreamDisplay: React.FC<DreamDisplayProps> = ({ dreamData }) => {
    return (
        <div className="w-full space-y-8 animate-fade-in">
            <div className="bg-slate-800 rounded-xl shadow-2xl overflow-hidden">
                <img 
                    src={dreamData.imageUrl} 
                    alt="AI-generated representation of the dream" 
                    className="w-full object-cover aspect-[4/3]"
                />
            </div>

            <div className="space-y-6">
                <Section title="Dream Transcription">
                    <p className="text-slate-300 italic">"{dreamData.transcription}"</p>
                </Section>
                
                <Section title="Psychological Interpretation">
                    <div className="prose prose-invert prose-slate max-w-none">
                       <Markdown>{dreamData.interpretation}</Markdown>
                    </div>
                </Section>
            </div>
        </div>
    );
};

interface SectionProps {
    title: string;
    children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => (
    <div className="bg-slate-800/50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-500 mb-4 pb-2 border-b border-slate-700">
            {title}
        </h2>
        {children}
    </div>
);

export default DreamDisplay;
