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

}
