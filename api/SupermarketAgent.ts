import { TotoAPI } from "./TotoAPI";

/**
 * This class is a proxy for the SuppieAgent in Supermarket API
 */
export class SuppieAgent {

    async postMessage(userMessage: string): Promise<{ conversationId: string, messageId: string }> {
        const payload = {
            "agentId": "suppie",
            "actor": "user",
            "message": userMessage
        }

        return (await new TotoAPI().fetch('galeBroker', `/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        })).json();
    }

}