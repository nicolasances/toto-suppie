import { useEffect, useState } from "react";
import { SupermarketAPI } from "../api/SupermarketAPI";
import { SpeechBubble } from "../comp/generic/SpeechBubble";
import { ListItemWidget } from "../comp/list/ListItemWidget";
import { MonkeyLevel } from "../comp/teach/MonkeyLevel";
import { GenericHomeScreen } from "./GenericScreen";
import './TeachScreen.css'
import { Supermarket } from "../model/Supermarket";
import { TotoButton } from "../comp/generic/TotoButton";

export function TeachScreen() {

    const [supermarkets, setSupermarkets] = useState<Supermarket[]>([])
    const [item1, setItem1] = useState("")
    const [item2, setItem2] = useState("")
    const [supermarket, setSupermarket] = useState<Supermarket>()

    const load = () => {
        loadSupermarkets();
    }

    /**
     * Loads the supermarkets
     */
    const loadSupermarkets = async () => {

        const { supermarkets } = await new SupermarketAPI().getSupermarkets()

        setSupermarkets(supermarkets);
    }

    /**
     * Loads the next game round
     */
    const loadNextRound = async () => {

        // Randomly pick a supermarket
        pickSupermarket()

        // Randomly pick two items to sort
        const round = await new SupermarketAPI().nextSortRound()

        setItem1(round.item1)
        setItem2(round.item2)

    }

    /**
     * Randomly pick a supermarket
     */
    const pickSupermarket = () => {

        // Ramdomly pick a Supermarket
        const randomIndex = Math.floor(Math.random() * supermarkets.length);

        setSupermarket(supermarkets[randomIndex])
    }

    /**
     * Saves the labeled training example
     * 
     * @param label the user choice: before means that the first item (item1) comes before item2
     */
    const saveTrainingExample = async (label: "before" | "after") => {

        await new SupermarketAPI().saveTrainingExample({
            item1: item1,
            item2: item2,
            label: label,
            supermarketId: supermarket!.id!
        })

        loadNextRound();

    }

    useEffect(load, [])
    useEffect(() => { loadNextRound() }, [supermarkets])

    return (
        <GenericHomeScreen title="Teach me!" back={true}>
            <div className="teach-screen">
                <MonkeyLevel />
                <div className="bubble-container">
                    <SpeechBubble text={<span>Which ones of these items is picked up first in <span className="big">{supermarket?.name}</span>?</span>} textColor="var(--color-dark-primary)" />
                </div>
                <div className="choice-container">
                    <ListItemWidget description={item1} tickable={false} ticked={false} onPress={() => { saveTrainingExample("before") }} />
                    <ListItemWidget description={item2} tickable={false} ticked={false} onPress={() => { saveTrainingExample("after") }} />
                    <div style={{ margin: "24px 12px" }}><TotoButton label="Not sure" onPress={loadNextRound} /></div>
                </div>
            </div>
        </GenericHomeScreen>
    )
}

