import { useEffect, useState } from "react";
import { GenericHomeScreen } from "./GenericScreen";
import { SupermarketList } from "../comp/list/SupermarketList";
import { Supermarket } from "../model/Supermarket";
import './ShopScreen.css'
import { SupermarketAPI } from "../api/SupermarketAPI";
import { LocationListItem } from "../model/LocationListItem";
import { ListItem } from "../model/ListItem";
import { ListItemWidget } from "../comp/list/ListItemWidget";
import { ReactComponent as CartSVG } from '../images/cart.svg';
import { SuccessBox } from "../comp/generic/SuccessBox";
import { TotoButton } from "../comp/generic/TotoButton";
import { useNavigate } from "react-router-dom";
import { TotoIconButton } from "../comp/generic/TotoIconButton";

import { ReactComponent as CloseSVG } from '../images/close.svg';
import TotoPopup from "../comp/generic/TotoPopup";

export function ShopScreen() {

    const [supermarketList, setSupermarketList] = useState<LocationListItem[]>([]);
    const [supermarkets, setSupermarkets] = useState<Supermarket[]>([]);
    const [chosenSupermarket, setChosenSupermarket] = useState<Supermarket | null>(null);
    const [numItemsLeft, setNumItemsLeft] = useState<number>(0);
    const [completed, setCompleted] = useState(false)
    const [closeListPopupOpen, setCloseListPopupOpen] = useState<boolean>(false);

    const navigate = useNavigate();

    /**
     * Load all the data
    */
    const load = () => {
        loadSupermarkets()
    }

    /**
     * Loads the supermarket list
     */
    const loadLocationList = async () => {

        if (!chosenSupermarket) return;

        const { items } = await new SupermarketAPI().getLocationList(chosenSupermarket)

        setSupermarketList(items)

        // Calculate how many articles are left to buy
        let itemsLeft = 0
        for (const item of items) {
            if (!item.ticked) itemsLeft++;
        }

        setNumItemsLeft(itemsLeft);

        // If there are no items left, set the list as complete!
        if (itemsLeft == 0) setCompleted(true);

    };

    /**
     * When the user clicks on an item
     */
    const onItemClick = async (item: ListItem) => {

        // Toggle the item's flag
        item.ticked = !item.ticked

        // Save the item
        await new SupermarketAPI().tickLocationItem(item as LocationListItem, chosenSupermarket!, item.ticked)

        // Reload the list 
        loadLocationList()

    }

    /**
     * Load the availble supermarkets
     */
    const loadSupermarkets = async () => {

        const { supermarkets } = await new SupermarketAPI().getSupermarkets();

        setSupermarkets(supermarkets)
    }

    /**
     * Closes the list even if not completed
     */
    const closeList = async () => {

        if (!chosenSupermarket) return;

        // Close the list
        await new SupermarketAPI().closeLocationList(chosenSupermarket.id!)

        // Leave
        navigate('/');

    }

    useEffect(load, [])
    useEffect(() => { loadLocationList() }, [chosenSupermarket])

    return (
        <GenericHomeScreen title={`Shopping`} back={true} rightButton={chosenSupermarket != null && supermarketList && supermarketList.length > 0 && <TotoIconButton image={<CloseSVG />} onPress={() => { setCloseListPopupOpen(true) }} />} >
            <div className="shopping-screen">
                <div className="header">
                    <div className="horizontal vertical-center extend">
                        <div className="icon-container"><CartSVG /></div>
                        <div className="location">
                            <div className="name">{chosenSupermarket ? chosenSupermarket.name : "Pick a location"}</div>
                            <div className="place">{chosenSupermarket?.location}</div>
                        </div>
                    </div>
                    <div className="items-count">
                        <div className="num">{numItemsLeft}<span>/{supermarketList?.length}</span></div>
                        <div className="label">items</div>
                    </div>
                </div>
                {!chosenSupermarket && supermarkets &&
                    <SupermarketsPicker items={supermarkets} onSelectItem={(sup) => { setChosenSupermarket(sup) }} />
                }
                {
                    !completed && chosenSupermarket &&
                    <SupermarketList
                        items={supermarketList}
                        onItemClick={onItemClick}
                    />
                }
                {completed &&
                    <div className="success-box-container">
                        <SuccessBox />
                    </div>
                }
                {completed &&
                    <div className="buttons-container">
                        <TotoButton label="Close" onPress={() => { navigate('/') }} />
                    </div>
                }
                <TotoPopup isOpen={closeListPopupOpen} onClose={() => { setCloseListPopupOpen(false) }}>
                    <div className="confirm-popup">
                        <div>
                            <p>Are you sure you want to close the list?</p>
                            <p className="small">All ticked items will be archived.<br />The others will remain in the main list.</p>
                        </div>
                        <div className="buttons-container">
                            <TotoButton label="Cancel" size="s" type="secondary" onPress={() => { setCloseListPopupOpen(false) }} />
                            <div style={{ flex: 1 }}></div>
                            <TotoButton label="Close it" size="s" onPress={closeList} />
                        </div>
                    </div>
                </TotoPopup>
            </div>

        </GenericHomeScreen>
    )
}

function SupermarketsPicker(props: { items: Supermarket[], onSelectItem: (item: Supermarket) => void }) {

    return (
        <div className="supermarkets">
            {
                props.items.map((item) => {
                    return (
                        <ListItemWidget description={item.name} key={Math.random()} style="plain" ticked={false} onPress={() => { props.onSelectItem(item) }} />
                    )
                })
            }
        </div>
    )

}
