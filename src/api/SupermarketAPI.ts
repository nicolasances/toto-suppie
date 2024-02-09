import { SupermarketListItem } from "../model/SupermarketListItem"
import { TotoAPI } from "./TotoAPI"

export class SupermarketAPI {

    async getItems(): Promise<{ items: SupermarketListItem[] }> {
        return (await new TotoAPI().fetch('supermarket', `/list/items`)).json()
    }

    async addItem(item: SupermarketListItem) {
        return (await new TotoAPI().fetch('supermarket', '/list/items', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(item)
        })).json()
    }

    async updateItem(item: SupermarketListItem) {
        return (await new TotoAPI().fetch('supermarket', `/list/items/${item.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(item)
        })).json()
    }


}
