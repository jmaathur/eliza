import {
    elizaLogger,
    ActionExample,
    Memory,
    State,
    IAgentRuntime,
    type Action,
    HandlerCallback,
} from "@elizaos/core";
import { DeeplProService } from "../services/DeeplProService";

/**
 * Interface describing the content needed for a Deepl translation action.
 */
export interface DeeplMessageContent {
    text: string; // text to translate
    targetLang: string; // e.g. 'DE'
    sourceLang?: string; // e.g. 'EN' (optional)
    debug?: boolean; // optional debug flag
}

function isValidDeeplMessageContent(
    content: any
): content is DeeplMessageContent {
    return (
        typeof content.text === "string" &&
        typeof content.targetLang === "string"
    );
}

const _deeplTemplate = `Request translation from DeepL.
  Example:
  \`\`\`json
  {
    "text": "Hello, World!",
    "sourceLang": "EN",
    "targetLang": "DE"
  }
  \`\`\`

  {{recentMessages}}

  Create a translation action for the text above.`;

export default {
    name: "TRANSLATE_WITH_DEEPL",
    similes: ["TRANSLATE_TEXT", "ASK_TRANSLATION"],
    description:
        "Send a text-translation request to DeepL API and obtain translation.",

    validate: async (runtime: IAgentRuntime, _message: Memory) => {
        console.log("Validating environment for DeepL...");
        const apiKey = runtime.getSetting("DEEPL_AUTH_KEY");
        if (!apiKey) {
            throw new Error("DEEPL_AUTH_KEY not set in runtime.");
        }
        return true;
    },

    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback?: HandlerCallback
    ) => {
        elizaLogger.log("Executing TRANSLATE_WITH_DEEPL...");

        // Ensure we have a valid state
        if (!state) {
            state = (await runtime.composeState(message)) as State;
        } else {
            state = await runtime.updateRecentMessageState(state);
        }

        // Prepare translation context
        const content = {
            text: message.content.text,
            sourceLang: message.content.sourceLang,
            targetLang: message.content.targetLang,
            debug: message.content.debug || false,
        };

        if (!isValidDeeplMessageContent(content)) {
            console.error("Invalid content for TRANSLATE_WITH_DEEPL.");
            if (callback) {
                callback({
                    text: "Unable to process request. Invalid translation parameters.",
                    content: { error: "Invalid translation parameters." },
                });
            }
            return false;
        }

        try {
            const service = new DeeplProService();
            await service.initialize(runtime);

            // Make the translation request
            const response = await service.translate({
                text: content.text,
                target_lang: content.targetLang,
                source_lang: content.sourceLang,
            });

            if (response.success) {
                if (callback) {
                    callback({
                        text: `Translated: ${response.translatedText}`,
                        content: response.data,
                    });
                }
                return true;
            } else {
                throw new Error(response.error || "Unknown translation error.");
            }
        } catch (error) {
            console.error("Error during translation:", error);
            if (callback) {
                callback({
                    text: `Translation error: ${error instanceof Error ? error.message : String(error)}`,
                    content: { error: error.message },
                });
            }
            return false;
        }
    },

    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Hello, how are you?",
                    action: "TRANSLATE_WITH_DEEPL",
                    sourceLang: "EN",
                    targetLang: "DE",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Hallo, wie geht es dir?",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "What's your name?",
                    action: "TRANSLATE_WITH_DEEPL",
                    sourceLang: "EN",
                    targetLang: "FR",
                    debug: true,
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Comment vous appelez-vous ?",
                },
            },
        ],
    ] as ActionExample[][],
} as Action;
