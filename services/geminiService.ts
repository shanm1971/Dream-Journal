
import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getDreamInterpretation(dreamText: string): Promise<string> {
    try {
        const prompt = `Based on Jungian archetypes, provide a structured psychological interpretation of the following dream. Focus on identifying key symbols, their potential meanings, and the overall emotional theme. Structure your response with clear headings (e.g., "Core Theme", "Key Symbols", "Potential Meaning"). Dream: "${dreamText}"`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error getting dream interpretation:", error);
        throw new Error("Failed to interpret the dream.");
    }
}

async function getImagePromptFromDream(dreamText: string): Promise<string> {
    try {
        const prompt = `Read the following dream transcription. Summarize the core emotional theme and the most vivid visual elements into a short, descriptive prompt for an AI image generator. The prompt should result in a surrealist, dream-like, and emotionally resonant image. For example: "A surrealist oil painting of a lone figure navigating a labyrinth of melting clocks under a purple moon, evoking a sense of confusion and the passage of time." Here is the dream: "${dreamText}"`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error getting image prompt:", error);
        throw new Error("Failed to create an image prompt from the dream.");
    }
}


export async function generateDreamImage(dreamText: string): Promise<string> {
    try {
        const imagePrompt = await getImagePromptFromDream(dreamText);
        console.log("Generated Image Prompt:", imagePrompt);
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: imagePrompt,
            config: {
                numberOfImages: 1,
                aspectRatio: "4:3",
            },
        });

        if (response.generatedImages.length > 0 && response.generatedImages[0].image.imageBytes) {
             const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
             return `data:image/png;base64,${base64ImageBytes}`;
        } else {
            throw new Error("No image was generated.");
        }
    } catch (error) {
        console.error("Error generating dream image:", error);
        throw new Error("Failed to generate the dream image.");
    }
}
