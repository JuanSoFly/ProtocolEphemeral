"use client";

import React, { useEffect, useState } from "react";
import { EyeOff } from "lucide-react";

export function PrivacyShield() {
    const [secure, setSecure] = useState(true);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setSecure(false);
            } else {
                // Add a small delay before clearing the shield to prevent flicker
                // and discourage rapid switching
                setTimeout(() => setSecure(true), 100);
            }
        };

        const handleBlur = () => setSecure(false);
        const handleFocus = () => setSecure(true);

        const handleKeyDown = (e: KeyboardEvent) => {
            // Heuristic for screenshot keys: PrintScreen, or Cmd/Ctrl + Shift + 3/4/S
            if (
                e.key === "PrintScreen" ||
                (e.metaKey && e.shiftKey && (e.key === "3" || e.key === "4" || e.key === "s")) ||
                (e.ctrlKey && e.key === "p")
            ) {
                navigator.clipboard.writeText(" ");
                setSecure(false);
                // Alerting stops screenshot but is annoying.
            }
        };

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };


        if (document.hidden || !document.hasFocus()) {
            setSecure(false);
        }

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("blur", handleBlur);
        window.addEventListener("focus", handleFocus);
        window.addEventListener("keydown", handleKeyDown);
        document.addEventListener("contextmenu", handleContextMenu);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("blur", handleBlur);
            window.removeEventListener("focus", handleFocus);
            window.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("contextmenu", handleContextMenu);
        };
    }, []);

    if (secure) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xl animate-blur-in">
            <div className="flex flex-col items-center gap-4 text-white">
                <EyeOff size={64} className="opacity-50" />
                <h2 className="text-2xl font-bold tracking-widest uppercase">
                    Protocol Protected
                </h2>
                <p className="text-sm opacity-50 font-mono">
                    Focus lost. Content obscured.
                </p>
            </div>
        </div>
    );
}
