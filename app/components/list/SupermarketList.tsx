import './SupermarketList.css'
import { ListItem } from '@/model/ListItem';
import { ListItemWidget } from './ListItemWidget';
import { SkeletonListItem } from './SkeletonListItem';

interface SupermarketListProps {
    items: ListItem[],
    onItemClick?: (item: ListItem) => void
    tickable?: boolean
    loading?: boolean
}

export function SupermarketList(props: SupermarketListProps) {

    return (
        <div className="supermarket-list" aria-busy={props.loading ?? false}>
            {props.items.map((item, index) => {
                return (
                    <ListItemWidget
                        description={item.name}
                        ticked={item.ticked}
                        temp={item.temp}
                        key={item.id || `item-${index}`}
                        tickable={props.tickable}
                        onPress={() => { if (props.onItemClick) props.onItemClick(item) }}
                    />
                )
            })}
            {props.loading && (
                <>
                    <SkeletonListItem />
                    <SkeletonListItem />
                </>
            )}
        </div>
    )

}