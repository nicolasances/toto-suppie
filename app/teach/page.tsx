"use client";

import { SpeechBubble } from "@/app/components/generic/SpeechBubble";
import { ListItemWidget } from "@/app/components/list/ListItemWidget";
import { MonkeyLevel } from "@/app/components/teach/MonkeyLevel";
import { GenericHomeScreen } from "@/app/components/GenericScreen";
import './TeachScreen.css';

export default function TeachScreen() {
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
    );
}
