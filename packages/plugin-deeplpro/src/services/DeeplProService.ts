import axios from "axios";
import { IAgentRuntime, Service } from "@elizaos/core";

interface DeeplResponseData {
    translatedText: string;
    detectedSourceLanguage?: string;
}

interface DeeplResponse {
    success: boolean;
    translatedText?: string; // convenience
    data?: DeeplResponseData;
    error?: string;
}

export class DeeplProService extends Service {
    private runtime: IAgentRuntime | null = null;
    private apiKey: string = "";

    async initialize(runtime: IAgentRuntime): Promise<void> {
        console.log("Initializing DeepLPro Service");
        this.runtime = runtime;
        this.apiKey = runtime.getSetting("DEEPL_AUTH_KEY") ?? "";
        if (!this.apiKey) {
            throw new Error("DEEPL_AUTH_KEY not set in runtime.");
        }
    }

    /**
     * Calls the DeepL translate endpoint and returns a single translation result.
     * You can expand this to handle multiple texts, or to pass more parameters
     * (e.g. formality, tag handling, etc.) based on your needs.
     */
    async translate(payload: {
        text: string;
        target_lang: string;
        source_lang?: string;
    }): Promise<DeeplResponse> {
        const endpoint = "https://api.deepl.com/v2/translate";

        try {
            const response = await axios.post(
                endpoint,
                {
                    text: [payload.text],
                    source_lang: payload.source_lang,
                    target_lang: payload.target_lang,
                },
                {
                    headers: {
                        Authorization: `DeepL-Auth-Key ${this.apiKey}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            /**
             * Sample success response from DeepL looks like:
             * {
             *   translations: [
             *     {
             *       detected_source_language: "EN",
             *       text: "Hallo, Welt!"
             *     }
             *   ]
             * }
             */
            const translations = response.data.translations;
            if (Array.isArray(translations) && translations.length > 0) {
                return {
                    success: true,
                    translatedText: translations[0].text,
                    data: {
                        translatedText: translations[0].text,
                        detectedSourceLanguage:
                            translations[0].detected_source_language,
                    },
                };
            }

            return {
                success: false,
                error: "No translations returned from DeepL.",
            };
        } catch (error) {
            console.error("Error calling DeepL API:", error);
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "An unknown error occurred while calling DeepL.",
            };
        }
    }
}

export default DeeplProService;
