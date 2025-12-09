"use client";

import React, { useEffect, useState } from "react";
import { cn, generateGradient } from "@/lib/utils";

interface EphemeralMessageProps {
    id: string;
    text: string;
    sender: string;
    isMe: boolean;
    timestamp: number;
    onExpire?: (id: string) => void;
}

const MESSAGE_TTL = 300000; // 5 minutes
const FADE_DURATION = 1000; // 1s start fading before expiry

export function EphemeralMessage({
    id,
    text,
    sender,
    isMe,
    timestamp,
    onExpire,
}: EphemeralMessageProps) {
    const [fading, setFading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(MESSAGE_TTL);

    useEffect(() => {
        const age = Date.now() - timestamp;
        const initialDelay = Math.max(0, MESSAGE_TTL - age - FADE_DURATION);
        const expireDelay = Math.max(0, MESSAGE_TTL - age);

        const fadeTimer = setTimeout(() => {
            setFading(true);
        }, initialDelay);

        const expireTimer = setTimeout(() => {
            onExpire?.(id);
        }, expireDelay);

        const interval = setInterval(() => {
            const newAge = Date.now() - timestamp;
            setTimeLeft(Math.max(0, MESSAGE_TTL - newAge));
        }, 100);

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(expireTimer);
            clearInterval(interval);
        };
    }, [id, timestamp, onExpire]);

    return (
        <div
            className={cn(
                "flex w-full gap-3 transition-opacity duration-1000",
                isMe ? "flex-row-reverse" : "flex-row",
                fading ? "opacity-0" : "opacity-100"
            )}
        >
            <div
                className="h-8 w-8 shrink-0 rounded-full shadow-lg"
                style={{ background: generateGradient(sender) }}
                title={sender}
            />

            <div className={cn("flex flex-col gap-1 max-w-[70%]", isMe && "items-end")}>
                {!isMe && (
                    <span className="ml-1 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                        {sender}
                    </span>
                )}

                <div
                    className={cn(
                        "w-fit rounded-2xl px-4 py-2 text-sm shadow-md backdrop-blur-sm",
                        isMe
                            ? "bg-stone-100/10 text-stone-100 rounded-tr-sm"
                            : "bg-black/40 text-stone-200 rounded-tl-sm border border-stone-800"
                    )}
                >
                    <div className="break-words leading-relaxed">{text}</div>

                    <div className="mt-1 h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white/20 transition-all duration-100 ease-linear"
                            style={{ width: `${(timeLeft / MESSAGE_TTL) * 100}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
