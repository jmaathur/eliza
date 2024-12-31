import { Plugin } from "@elizaos/core";
import translateWithDeeplAction from "./actions/DeeplProAction";
import { DeeplProService } from "./services/DeeplProService";

export const deeplProPlugin: Plugin = {
    name: "deeplPro",
    description:
        "DeepL Pro Plugin for Eliza - Enables text translation using the DeepL API",
    actions: [translateWithDeeplAction],
    evaluators: [],
    providers: [],
    services: [new DeeplProService()],
};

export default deeplProPlugin;
