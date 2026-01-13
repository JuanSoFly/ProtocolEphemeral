"use client";

import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
    status: "connecting" | "connected" | "disconnected";
    peerCount: number;
}

export function StatusIndicator({ status, peerCount }: StatusIndicatorProps) {
    return (
        <div className="flex items-center gap-2 rounded-full border border-white/5 bg-background/40 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-md">
            <div
                className={cn(
                    "h-2 w-2 rounded-full",
                    status === "connected" && "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]",
                    status === "connecting" && "bg-amber-500 animate-pulse",
                    status === "disconnected" && "bg-red-500"
                )}
            />
            <span>
                {status === "connected"
                    ? `${peerCount} Peer${peerCount !== 1 ? "s" : ""}`
                    : status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        </div>
    );
}
