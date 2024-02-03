import './SupermarketList.css'
import { SupermarketListItem } from "../../model/SupermarketListItem";
import { ListItem } from "./ListItem";

interface SupermarketListProps {
    items: SupermarketListItem[]
}

export function SupermarketList(props: SupermarketListProps) {

    return (
        <div className="supermarket-list">
            {props.items.map((item) => {
                return (
                    <ListItem
                        description={item.description}
                        ticked={item.ticked}
                        key={Math.random()} />
                )
            })}
        </div>
    )

}