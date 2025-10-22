
import React, { useState, useEffect, useCallback } from 'react';
import { AppState, DreamData } from './types';
import { getDreamInterpretation, generateDreamImage } from './services/geminiService';
import Recorder from './components/Recorder';
import DreamDisplay from './components/DreamDisplay';
import Chat from './components/Chat';
import Loader from './components/Loader';

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>(AppState.IDLE);
    const [dreamData, setDreamData] = useState<DreamData | null>(null);
    const [error, setError] = useState<string | null>(null);

    const checkMicPermission = useCallback(async () => {
        try {
            const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
            if (permissionStatus.state === 'granted') {
                setAppState(AppState.READY_TO_RECORD);
            } else {
                setAppState(AppState.REQUESTING_PERMISSION);
            }
        } catch (e) {
            console.error("Could not query microphone permission", e);
            setAppState(AppState.ERROR);
            setError("Could not check microphone permissions. Please use a compatible browser.");
        }
    }, []);
    
    useEffect(() => {
        checkMicPermission();
    }, [checkMicPermission]);

    const handleRecordingComplete = async (transcription: string) => {
        if (!transcription.trim()) {
            setError("The recording was empty. Please try again.");
            setAppState(AppState.READY_TO_RECORD);
            return;
        }
        setAppState(AppState.PROCESSING);
        setError(null);
        try {
            const [interpretation, imageUrl] = await Promise.all([
                getDreamInterpretation(transcription),
                generateDreamImage(transcription)
            ]);
            setDreamData({ transcription, interpretation, imageUrl });
            setAppState(AppState.DISPLAYING_RESULTS);
        } catch (e) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during processing.";
            setError(errorMessage);
            setAppState(AppState.ERROR);
        }
    };
    
    const requestMic = async () => {
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            setAppState(AppState.READY_TO_RECORD);
        } catch (e) {
            console.error("Microphone access denied", e);
            setAppState(AppState.PERMISSION_DENIED);
        }
    };

    const resetApp = () => {
        setDreamData(null);
        setError(null);
        checkMicPermission();
    };

    const renderContent = () => {
        switch (appState) {
            case AppState.REQUESTING_PERMISSION:
                return (
                    <div className="text-center">
                        <p className="mb-4">This application needs microphone access to record your dreams.</p>
                        <button onClick={requestMic} className="px-6 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg font-semibold transition-colors">Grant Access</button>
                    </div>
                );
            case AppState.PERMISSION_DENIED:
                return (
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-red-400 mb-2">Microphone Access Denied</h2>
                        <p>To use the Dream Journal, please enable microphone permissions in your browser settings and refresh the page.</p>
                    </div>
                );
            case AppState.READY_TO_RECORD:
            case AppState.RECORDING:
                return <Recorder onRecordingComplete={handleRecordingComplete} initialState={appState} />;
            case AppState.PROCESSING:
                return <Loader />;
            case AppState.DISPLAYING_RESULTS:
                return dreamData && (
                    <div className="w-full max-w-5xl mx-auto space-y-8">
                        <DreamDisplay dreamData={dreamData} />
                        <Chat dreamData={dreamData} />
                        <div className="text-center pt-4">
                            <button onClick={resetApp} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-colors">Record a New Dream</button>
                        </div>
                    </div>
                );
            case AppState.ERROR:
                 return (
                    <div className="text-center bg-red-900/50 p-6 rounded-lg">
                        <h2 className="text-xl font-bold text-red-400 mb-2">An Error Occurred</h2>
                        <p className="mb-4">{error}</p>
                        <button onClick={resetApp} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-colors">Try Again</button>
                    </div>
                );
            default:
                return (
                    <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-slate-400 animate-pulse"></div>
                        <div className="w-4 h-4 rounded-full bg-slate-400 animate-pulse [animation-delay:0.2s]"></div>
                        <div className="w-4 h-4 rounded-full bg-slate-400 animate-pulse [animation-delay:0.4s]"></div>
                    </div>
                );
        }
    };

    return (
        <main className="min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
            <div className="w-full text-center mb-8">
                <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-500">
                    Dream Journal AI
                </h1>
                <p className="text-slate-400 mt-2">Record, interpret, and visualize your subconscious mind.</p>
            </div>
            <div className="w-full max-w-3xl flex items-center justify-center">
                {renderContent()}
            </div>
        </main>
    );
};

export default App;
