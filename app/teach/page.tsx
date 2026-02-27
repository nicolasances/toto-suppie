"use client";

import { SpeechBubble } from "@/app/components/generic/SpeechBubble";
import { ListItemWidget } from "@/app/components/list/ListItemWidget";
import { MonkeyLevel } from "@/app/components/teach/MonkeyLevel";
import { GenericHomeScreen } from "@/app/components/GenericScreen";
import './TeachScreen.css';
import { useHeader } from "@/context/HeaderContext";
import { useEffect } from "react";

export default function TeachScreen() {
    const { setConfig } = useHeader();

    useEffect(() => {
        setConfig({
            title: 'Teach me!',
            backButton: { enabled: true },
        });
    }, [setConfig]);

    return (
        <GenericHomeScreen>
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
