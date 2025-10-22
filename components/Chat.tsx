
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat as GeminiChat } from '@google/genai';
import type { ChatMessage, DreamData } from '../types';
import SendIcon from './icons/SendIcon';
import Markdown from 'react-markdown';

interface ChatProps {
    dreamData: DreamData;
}

const Chat: React.FC<ChatProps> = ({ dreamData }) => {
    const [chat, setChat] = useState<GeminiChat | null>(null);
    const [history, setHistory] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const initialHistory = [
            {
                role: 'user' as const,
                parts: [{ text: `Here is my dream: "${dreamData.transcription}". And here is an initial interpretation: "${dreamData.interpretation}". Please act as a Jungian dream analyst and help me understand it better.` }]
            },
            {
                role: 'model' as const,
                parts: [{ text: "Of course. I have reviewed your dream and the initial interpretation. What specific symbols, feelings, or parts of the dream would you like to explore further?" }]
            }
        ];

        const chatSession = ai.chats.create({
            model: 'gemini-2.5-flash',
            history: initialHistory,
        });
        
        setChat(chatSession);
        setHistory([
            { role: 'model', text: "Of course. I have reviewed your dream and the initial interpretation. What specific symbols, feelings, or parts of the dream would you like to explore further?" }
        ]);
    }, [dreamData]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [history]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || !chat || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', text: userInput };
        setHistory(prev => [...prev, userMessage]);
        setUserInput('');
        setIsLoading(true);

        try {
            const response = await chat.sendMessage({ message: userInput });
            const modelMessage: ChatMessage = { role: 'model', text: response.text };
            setHistory(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage: ChatMessage = { role: 'model', text: "Sorry, I encountered an error. Please try again." };
            setHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full bg-slate-800/50 p-4 sm:p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-500 mb-4 pb-2 border-b border-slate-700">
                Explore Your Dream
            </h2>
            <div ref={chatContainerRef} className="h-64 overflow-y-auto pr-4 space-y-4 mb-4">
                {history.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg ${msg.role === 'user' ? 'bg-violet-700' : 'bg-slate-700'}`}>
                           <div className="prose prose-invert prose-sm max-w-none">
                             <Markdown>{msg.text}</Markdown>
                           </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                         <div className="p-3 rounded-lg bg-slate-700">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse"></div>
                                <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse [animation-delay:0.2s]"></div>
                                <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse [animation-delay:0.4s]"></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Ask about a symbol in your dream..."
                    className="flex-grow bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-violet-500 focus:outline-none transition"
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading} className="bg-violet-600 hover:bg-violet-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg p-3 transition-colors">
                    <SendIcon />
                </button>
            </form>
        </div>
    );
};

export default Chat;
