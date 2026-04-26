"use client";

import { useEffect } from "react";
import { GenericHomeScreen } from "@/app/components/GenericScreen";
import { useHeader } from "@/context/HeaderContext";
import { MaskedSvgIcon, useAgentVoiceInteraction, AgentConversationView, VoiceAgentDock, GaleBrokerAPI } from "toto-react";
import { totoAPI } from "@/api/TotoApiInstance";
import { SuppieAgent } from "@/api/SupermarketAgent";

export default function AgentScreen() {

    const { setConfig } = useHeader();

    useEffect(() => {
        setConfig({
            title: "Agent",
            backButton: { enabled: true },
        });
    }, [setConfig]);

    const sendMessage = async (text: string): Promise<string> => {
        const { conversationId } = await new SuppieAgent().postMessage(text);
        return conversationId;
    };

    const { state, messages, toggleRecording, stream } = useAgentVoiceInteraction({ sendMessage, galeBrokerAPI: new GaleBrokerAPI(totoAPI) });

    return (
        <GenericHomeScreen>
            <div className="flex flex-col flex-1 overflow-hidden pb-28">

                {/* Top: Agent icon */}
                <div className="flex justify-center pt-8 mb-4 shrink-0">
                    <MaskedSvgIcon src="/images/agent.svg" alt="Agent" size="w-16 h-16" color="bg-cyan-800" />
                </div>

                {/* Center: Conversation */}
                <AgentConversationView messages={messages} isProcessing={state === 'agentProcessing'} />

            </div>

            <VoiceAgentDock state={state} stream={stream} onToggleRecording={toggleRecording} />
        </GenericHomeScreen>
    );
}

