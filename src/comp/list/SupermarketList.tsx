import './SupermarketList.css'
import { SupermarketListItem } from "../../model/SupermarketListItem";
import { ListItem } from "./ListItem";

interface SupermarketListProps {
    items: SupermarketListItem[],
    onItemClick?: (item: SupermarketListItem) => void
}

export function SupermarketList(props: SupermarketListProps) {

    return (
        <div className="supermarket-list">
            {props.items.map((item) => {
                return (
                    <ListItem
                        description={item.name}
                        ticked={item.ticked}
                        temp={item.temp}
                        key={Math.random()}
                        onPress={() => { if (props.onItemClick) props.onItemClick(item) }}
                    />
                )
            })}
        </div>
    )

}