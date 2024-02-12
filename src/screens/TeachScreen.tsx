import { SpeechBubble } from "../comp/generic/SpeechBubble";
import { ListItemWidget } from "../comp/list/ListItemWidget";
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
                    <ListItemWidget description="Broccoli" ticked={false} />
                    <ListItemWidget description="Milk" ticked={false} />
                </div>
            </div>
        </GenericHomeScreen>
    )
}

