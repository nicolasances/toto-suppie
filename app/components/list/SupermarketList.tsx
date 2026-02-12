import './SupermarketList.css'
import { SupermarketListItem } from "../../model/SupermarketListItem";
import { LocationListItem } from '../../model/LocationListItem';
import { ListItem } from '../../model/ListItem';
import { ListItemWidget } from './ListItemWidget';

interface SupermarketListProps {
    items: ListItem[],
    onItemClick?: (item: ListItem) => void
    tickable?: boolean
}

export function SupermarketList(props: SupermarketListProps) {

    return (
        <div className="supermarket-list">
            {props.items.map((item) => {
                return (
                    <ListItemWidget
                        description={item.name}
                        ticked={item.ticked}
                        temp={item.temp}
                        key={Math.random()}
                        tickable={props.tickable}
                        onPress={() => { if (props.onItemClick) props.onItemClick(item) }}
                    />
                )
            })}
        </div>
    )

}