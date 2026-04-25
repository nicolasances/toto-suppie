import { TotoAPI } from './TotoAPI';

/**
 * API client for the Gale Broker microservice.
 * Handles conversation streaming endpoints.
 */
export class GaleBrokerAPI {

    /**
     * Opens an SSE connection to the conversation status stream.
     * Returns the raw fetch Response so the caller can read the streamed body.
     */
    async streamConversationStatus(conversationId: string): Promise<Response> {
        return new TotoAPI().fetch('galeBroker', `/conversations/${conversationId}/stream`);
    }

}
