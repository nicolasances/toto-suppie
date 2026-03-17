"use client";

import { useEffect } from "react";
import { GenericHomeScreen } from "@/app/components/GenericScreen";
import { useHeader } from "@/context/HeaderContext";

export default function AgentScreen() {

    const { setConfig } = useHeader();

    useEffect(() => {
        setConfig({
            title: "Agent",
            backButton: { enabled: true },
        });
    }, [setConfig]);

    return (
        <GenericHomeScreen>
            <div>
                Hello
            </div>
        </GenericHomeScreen>
    );
}
