"use client";

import React, { useEffect, useState } from "react";
import { cn, generateGradient } from "@/lib/utils";
import { ImagePreview } from "./ImagePreview";
import { usePrivacyProtection } from "@/hooks/useWindowFocus";
import { Eye } from "lucide-react";

interface EphemeralMessageProps {
    id: string;
    content: string;
    type?: 'text' | 'image';
    sender: string;
    isMe: boolean;
    timestamp: number;
    onExpire?: (id: string) => void;
}

const MESSAGE_TTL = 300000; // 5 minutes
const FADE_DURATION = 1000; // 1s start fading before expiry

export function EphemeralMessage({
    id,
    content,
    type = 'text',
    sender,
    isMe,
    timestamp,
    onExpire,
}: EphemeralMessageProps) {
    const [fading, setFading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(MESSAGE_TTL);
    const [showPreview, setShowPreview] = useState(false);
    const { isVisible, startHolding, stopHolding, isWindowFocused } = usePrivacyProtection();

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

    const handleImageClick = () => {
        if (isVisible && isWindowFocused) {
            setShowPreview(true);
        }
    };

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
                    <span className="ml-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        {sender}
                    </span>
                )}

                <div
                    className={cn(
                        "w-fit rounded-2xl p-2 shadow-md backdrop-blur-sm overflow-hidden relative",
                        isMe
                            ? "bg-acc-1/20 text-foreground rounded-tr-sm"
                            : "bg-muted/60 text-foreground rounded-tl-sm border border-white/10",
                        type === 'text' && "px-4"
                    )}
                >
                    {/* Privacy overlay - hold to reveal (images only) */}
                    {type === 'image' && !isVisible && (
                        <div
                            className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm cursor-pointer rounded-2xl select-none"
                            onMouseDown={startHolding}
                            onMouseUp={stopHolding}
                            onMouseLeave={stopHolding}
                            onTouchStart={startHolding}
                            onTouchEnd={stopHolding}
                        >
                            <div className="flex items-center gap-2 text-white/70 text-xs pointer-events-none">
                                <Eye size={14} />
                                <span>Hold to reveal</span>
                            </div>
                        </div>
                    )}

                    {/* Content area */}
                    {type === 'image' ? (
                        <div
                            onMouseDown={startHolding}
                            onMouseUp={stopHolding}
                            onMouseLeave={stopHolding}
                            onTouchStart={startHolding}
                            onTouchEnd={stopHolding}
                        >
                            <img
                                src={content}
                                alt="Ephemeral"
                                className={cn(
                                    "max-w-full rounded-lg max-h-64 object-cover transition-all duration-0",
                                    isVisible ? "" : "blur-3xl scale-95"
                                )}
                                draggable="false"
                            />
                        </div>
                    ) : (
                        <div className="break-words leading-relaxed">{content}</div>
                    )}

                    <div className="mt-1 h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white/20 transition-all duration-100 ease-linear"
                            style={{ width: `${(timeLeft / MESSAGE_TTL) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Side expand button for images */}
                {type === 'image' && (
                    <button
                        onClick={() => setShowPreview(true)}
                        className="self-center p-1.5 rounded-md bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-all border border-white/5"
                        title="Expand image"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <polyline points="9 21 3 21 3 15"></polyline>
                            <line x1="21" y1="3" x2="14" y2="10"></line>
                            <line x1="3" y1="21" x2="10" y2="14"></line>
                        </svg>
                    </button>
                )}
            </div>

            {showPreview && (
                <ImagePreview src={content} onClose={() => setShowPreview(false)} />
            )}
        </div>
    );
}
