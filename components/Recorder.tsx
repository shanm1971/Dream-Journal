
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality } from '@google/genai';
import { AppState } from '../types';
import MicIcon from './icons/MicIcon';
import StopIcon from './icons/StopIcon';

interface RecorderProps {
    onRecordingComplete: (transcription: string) => void;
    initialState: AppState;
}

// Helper to encode raw audio data to base64
function encode(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

const Recorder: React.FC<RecorderProps> = ({ onRecordingComplete, initialState }) => {
    const [isRecording, setIsRecording] = useState(initialState === AppState.RECORDING);
    const transcriptionRef = useRef<string>('');
    const sessionRef = useRef<LiveSession | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

    const stopRecording = () => {
        setIsRecording(false);
        if (sessionRef.current) {
            sessionRef.current.close();
            sessionRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (mediaStreamSourceRef.current) {
            mediaStreamSourceRef.current.disconnect();
            mediaStreamSourceRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
        }

        onRecordingComplete(transcriptionRef.current);
        transcriptionRef.current = '';
    };

    const startRecording = async () => {
        setIsRecording(true);
        transcriptionRef.current = '';

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => console.log('Live session opened.'),
                    onmessage: (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            transcriptionRef.current += message.serverContent.inputTranscription.text;
                        }
                    },
                    onerror: (e: ErrorEvent) => console.error('Live session error:', e),
                    onclose: (e: CloseEvent) => console.log('Live session closed.'),
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                },
            });
            
            sessionRef.current = await sessionPromise;

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            mediaStreamSourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
            scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

            scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                const l = inputData.length;
                const int16 = new Int16Array(l);
                for (let i = 0; i < l; i++) {
                    int16[i] = inputData[i] * 32768;
                }
                const pcmBlob = {
                    data: encode(new Uint8Array(int16.buffer)),
                    mimeType: 'audio/pcm;rate=16000',
                };
                sessionRef.current?.sendRealtimeInput({ media: pcmBlob });
            };

            mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
            scriptProcessorRef.current.connect(audioContextRef.current.destination);

        } catch (error) {
            console.error('Failed to start recording:', error);
            setIsRecording(false);
            // Optionally, pass an error message up to the parent component
        }
    };

    useEffect(() => {
        return () => { // Cleanup on unmount
            if (isRecording) {
                stopRecording();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRecording]);

    return (
        <div className="flex flex-col items-center justify-center space-y-4">
            <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 ease-in-out
                    ${isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-violet-600 hover:bg-violet-700'}`}
            >
                {isRecording ? <StopIcon /> : <MicIcon />}
            </button>
            <p className="text-slate-400">{isRecording ? 'Recording your dream...' : 'Press the button to start recording'}</p>
        </div>
    );
};

export default Recorder;
