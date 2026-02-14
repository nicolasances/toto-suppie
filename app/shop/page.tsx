"use client";

import { useEffect, useState } from "react";
import { GenericHomeScreen } from "@/app/components/GenericScreen";
import { SupermarketList } from "@/app/components/list/SupermarketList";
import { Supermarket } from "@/model/Supermarket";
import './ShopScreen.css';
import { SupermarketAPI } from "@/api/SupermarketAPI";
import { LocationListItem } from "@/model/LocationListItem";
import { ListItem } from "@/model/ListItem";
import { ListItemWidget } from "@/app/components/list/ListItemWidget";
import Image from 'next/image';
import { SuccessBox } from "@/app/components/generic/SuccessBox";
import { TotoButton } from "@/app/components/generic/TotoButton";
import { useRouter } from "next/navigation";
import { TotoIconButton } from "@/app/components/generic/TotoIconButton";
import TotoPopup from "@/app/components/generic/TotoPopup";

export default function ShopScreen() {

    const [supermarketList, setSupermarketList] = useState<LocationListItem[]>([]);
    const [supermarkets, setSupermarkets] = useState<Supermarket[]>([]);
    const [chosenSupermarket, setChosenSupermarket] = useState<Supermarket | null>(null);
    const [numItemsLeft, setNumItemsLeft] = useState<number>(0);
    const [completed, setCompleted] = useState(false);
    const [closeListPopupOpen, setCloseListPopupOpen] = useState<boolean>(false);

    const router = useRouter();

    /**
     * Load all the data
     */
    const load = () => {
        loadSupermarkets();
    };

    /**
     * Loads the supermarket list
     */
    const loadLocationList = async () => {
        if (!chosenSupermarket) return;

        const { items } = await new SupermarketAPI().getLocationList(chosenSupermarket);
        setSupermarketList(items);

        // Calculate how many articles are left to buy
        let itemsLeft = 0;
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
        item.ticked = !item.ticked;

        // Save the item
        await new SupermarketAPI().tickLocationItem(item as LocationListItem, chosenSupermarket!, item.ticked);

        // Reload the list 
        loadLocationList();
    };

    /**
     * Load the available supermarkets
     */
    const loadSupermarkets = async () => {
        const { supermarkets } = await new SupermarketAPI().getSupermarkets();
        setSupermarkets(supermarkets);
    };

    /**
     * Closes the list even if not completed
     */
    const closeList = async () => {
        if (!chosenSupermarket) return;

        // Close the list
        await new SupermarketAPI().closeLocationList(chosenSupermarket.id!);

        // Leave
        router.push('/');
    };

    useEffect(() => { load(); }, []);
    useEffect(() => { loadLocationList(); }, [chosenSupermarket]);

    return (
        <GenericHomeScreen 
            title={`Shopping`} 
            back={true} 
            rightButton={chosenSupermarket != null && supermarketList && supermarketList.length > 0 && 
                <TotoIconButton image={<Image src="/images/close.svg" alt="Close" width={16} height={16} />} onPress={() => { setCloseListPopupOpen(true); }} />
            } 
        >
            <div className="shopping-screen">
                {!chosenSupermarket && (
                    <div className="header">
                        <div className="horizontal vertical-center extend">
                            <div className="icon-container">
                                <Image src="/images/cart.svg" alt="Cart" width={20} height={20} />
                            </div>
                            <div className="location">
                                <div className="name">Pick a location</div>
                            </div>
                        </div>
                    </div>
                )}
                {!chosenSupermarket && supermarkets &&
                    <SupermarketsPicker items={supermarkets} onSelectItem={(sup) => { setChosenSupermarket(sup); }} />
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
                        <TotoButton label="Close" onPress={() => { router.push('/'); }} />
                    </div>
                }
                <TotoPopup isOpen={closeListPopupOpen} onClose={() => { setCloseListPopupOpen(false); }}>
                    <div className="confirm-popup">
                        <div>
                            <p>Are you sure you want to close the list?</p>
                            <p className="small">All ticked items will be archived.<br />The others will remain in the main list.</p>
                        </div>
                        <div className="buttons-container">
                            <TotoButton label="Cancel" size="s" type="secondary" onPress={() => { setCloseListPopupOpen(false); }} />
                            <div style={{ flex: 1 }}></div>
                            <TotoButton label="Close it" size="s" onPress={closeList} />
                        </div>
                    </div>
                </TotoPopup>
            </div>
        </GenericHomeScreen>
    );
}

function SupermarketsPicker(props: { items: Supermarket[], onSelectItem: (item: Supermarket) => void }) {
    return (
        <div className="supermarkets">
            {
                props.items.map((item, index) => {
                    return (
                        <ListItemWidget 
                            description={item.name} 
                            key={`supermarket-${index}`} 
                            style="plain" 
                            ticked={false} 
                            onPress={() => { props.onSelectItem(item); }} 
                        />
                    );
                })
            }
        </div>
    );
}
