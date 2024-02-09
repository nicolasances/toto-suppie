
export interface SupermarketListItem {

    id?: string
    name: string
    ticked: boolean
    temp?: boolean      // Specifies if this item is in the App list but not in the backend (it's being synchronized)
}