import { ListItem } from "./ListItem"

export interface LocationListItem extends ListItem {

    supermarketName: string
    supermarketLocation: string
    index: number
}