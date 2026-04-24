"use client";

import { useEffect, useRef } from "react";

export interface AgentConversationViewProps {
    messages: string[];
    isProcessing: boolean;
}

export function AgentConversationView({ messages, isProcessing }: AgentConversationViewProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isProcessing]);

    return (
        <div className="flex flex-col flex-1 overflow-y-auto items-center px-4">
            <div className="flex flex-col gap-3 w-full max-w-lg">

                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`text-lg px-4 py-2 rounded-3xl opacity-90 ${i === messages.length - 1 ? 'text-cyan-900' : 'text-cyan-700'}`}
                    >
                        {msg}
                    </div>
                ))}

                {isProcessing && (
                    <div className="flex justify-center pt-4">
                        <WaitingIndicator />
                    </div>
                )}

                <div ref={messagesEndRef} />

            </div>
        </div>
    );
}

function WaitingIndicator() {
    return (
        <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
                <span
                    key={i}
                    className="block w-2 h-2 rounded-full bg-cyan-400"
                    style={{
                        animation: "bounce 1.2s infinite ease-in-out",
                        animationDelay: `${i * 0.2}s`,
                    }}
                />
            ))}
            <style>{`
                @keyframes bounce {
                    0%, 80%, 100% { transform: translateY(0); }
                    40%            { transform: translateY(-8px); }
                }
            `}</style>
        </div>
    );
}
