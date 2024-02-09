import { useEffect, useState } from "react";
import { SupermarketListItem } from "../model/SupermarketListItem";
import { GenericHomeScreen } from "./GenericScreen";
import { SupermarketList } from "../comp/list/SupermarketList";
import { Supermarket } from "../model/Supermarket";
import { ListItem } from "../comp/list/ListItem";
import './ShopScreen.css'

export function ShopScreen() {

    const [supermarketList, setSupermarketList] = useState<SupermarketListItem[]>([]);
    const [supermarkets, setSupermarkets] = useState<Supermarket[]>([]);
    const [chosenSupermarket, setChosenSupermarket] = useState<Supermarket | null>(null);

    /**
     * Load all the data
    */
    const load = () => {
        loadSupermarketList()
        loadSupermarkets()
    }

    /**
     * Loads the supermarket list
     */
    const loadSupermarketList = () => {
        setSupermarketList([
            { name: "Let Mælk", ticked: false },
            { name: "Cheese Caro", ticked: true },
            { name: "Bread N", ticked: false },
            { name: "Bacon i tern", ticked: false },
        ]);
    };

    /**
     * Load the availble supermarkets
     */
    const loadSupermarkets = () => {
        setSupermarkets([
            { name: "Super Brugsen", location: "Solrød Strand" },
            { name: "Føtex", location: "Fisketorvet" },
            { name: "Lidl", location: "Solrød Strand" },
        ])

    }

    useEffect(load, [])

    return (
        <GenericHomeScreen title={`Shopping (${chosenSupermarket ? chosenSupermarket.name : "where?"})`} back={true}>
            <div className="shopping-screen">
                {!chosenSupermarket &&
                    <SupermarketsPicker items={supermarkets} onSelectItem={(sup) => { setChosenSupermarket(sup) }} />
                }
                {
                    chosenSupermarket &&
                    <SupermarketList
                        items={supermarketList}
                    />
                }
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
                        <ListItem description={item.name} key={Math.random()} style="plain" ticked={false} onPress={() => { props.onSelectItem(item) }} />
                    )
                })
            }
        </div>
    )

}