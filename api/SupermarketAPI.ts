import { LocationListItem } from "../model/LocationListItem"
import { Supermarket } from "../model/Supermarket"
import { SupermarketListItem } from "../model/SupermarketListItem"
import { TotoAPI } from "./TotoAPI"

export class SupermarketAPI {

    async getItems(): Promise<{ items: SupermarketListItem[] }> {
        return (await new TotoAPI().fetch('supermarket', `/list/items`)).json()
    }

    /**
     * Add an Item to the Main supermarket list
     * 
     * @param item 
     * @returns 
     */
    async addItem(item: SupermarketListItem) {
        return (await new TotoAPI().fetch('supermarket', '/list/items', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(item)
        })).json()
    }

    /**
     * Updates the item in the Main Supermarket List
     * 
     * @param item 
     * @returns 
     */
    async updateItem(item: SupermarketListItem) {

        return (await new TotoAPI().fetch('supermarket', `/list/items/${item.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(item)
        })).json()
    }

    /**
     * Deletes an item
     * 
     * @param itemId id of the item to delete
     */
    async deleteItem(itemId: string) {

        return (await new TotoAPI().fetch('supermarket', `/list/items/${itemId}`, { method: "DELETE" })).json()

    }

    /**
     * Retrieves the list of configured Supermarkets
     * 
     * @returns 
     */
    async getSupermarkets(): Promise<{ supermarkets: Supermarket[] }> {

        return (await new TotoAPI().fetch('supermarket', `/supermarkets`)).json()
    }

    /**
     * Retrieves the location list of a specific supermarket
     */
    async getLocationList(supermarket: Supermarket): Promise<{ items: LocationListItem[] }> {

        return (await new TotoAPI().fetch('supermarket', `/supermarkets/${supermarket.id}/items`)).json()
    }

    /**
     * Ticks or unticks an item of a Location List
     * 
     * @param item the item to tick or untick
     * @param supermarket the supermarket representing the location
     * @param ticked the tick value
     * 
     */
    async tickLocationItem(item: LocationListItem, supermarket: Supermarket, ticked: boolean) {

        if (!supermarket || !supermarket.id) { console.log("[ERROR]: SupermarketAPI.updateLocationListItem() called with a supermarket arg that is null or has no id"); return; }

        return (await new TotoAPI().fetch('supermarket', `/supermarkets/${supermarket.id}/items/${item.id}/tick`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ticked: ticked
            })
        })).json()
    }

    /**
     * Retrieves the list of most common names to support stuff like autocomplete
     * when inserting a new item.
     */
    async getNames(): Promise<{ names: string[] }> {

        return (await new TotoAPI().fetch('supermarket', `/names`)).json();
    }

    /**
     * Closes a location list. 
     * Typically used to close a list that is not complete.
     * 
     * @param supermarketId the id of the supermarket
     */
    async closeLocationList(supermarketId: string) {

        return (await new TotoAPI().fetch('supermarket', `/supermarkets/${supermarketId}/close`, { method: "POST" })).json();

    }

    /**
     * Checks all registered supermarkets and returns the first one whose
     * location list is non-empty (i.e. an active shopping session), or null
     * if no active session exists.
     */
    async getActiveSupermarket(): Promise<Supermarket | null> {
        const { supermarkets } = await this.getSupermarkets();

        const results = await Promise.allSettled(
            supermarkets.map((s) => this.getLocationList(s).then((r) => ({ supermarket: s, items: r.items })))
        );

        for (const result of results) {
            if (result.status === 'fulfilled' && result.value.items && result.value.items.length > 0) {
                return result.value.supermarket;
            }
        }

        return null;
    }

    /**
     * Opens an SSE connection to the conversation status stream.
     * Returns the raw fetch Response so the caller can read the streamed body.
     */
    async streamConversationStatus(conversationId: string): Promise<Response> {
        return new TotoAPI().fetch('galeBroker', `/conversations/${conversationId}/stream`);
    }

}
