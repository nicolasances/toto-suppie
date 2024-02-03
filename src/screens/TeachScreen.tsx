import { SpeechBubble } from "../comp/generic/SpeechBubble";
import { ListItem } from "../comp/list/ListItem";
import { MonkeyLevel } from "../comp/teach/MonkeyLevel";
import { GenericHomeScreen } from "./GenericScreen";
import './TeachScreen.css'

export function TeachScreen() {

    return (
        <GenericHomeScreen title="Teach me!" back={true}>
            <div className="teach-screen">
                <MonkeyLevel />
                <div className="bubble-container">
                    <SpeechBubble text="Which ones of these items is picked up first in Super Brugsen?" textColor="var(--color-dark-primary)" />
                </div>
                <div className="choice-container">
                    <ListItem description="Broccoli" ticked={false} />
                    <ListItem description="Milk" ticked={false} />
                </div>
            </div>
        </GenericHomeScreen>
    )
}

