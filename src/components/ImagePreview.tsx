"use client";

import React, { useEffect, useState } from "react";
import { X, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePrivacyProtection } from "@/hooks/useWindowFocus";

interface ImagePreviewProps {
    src: string;
    onClose: () => void;
}

export function ImagePreview({ src, onClose }: ImagePreviewProps) {
    const { isWindowFocused } = usePrivacyProtection();
    const [isHolding, setIsHolding] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
            // Any key press hides and closes
            setIsHolding(false);
        };

        document.addEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [onClose]);

    // Auto-close preview when window loses focus
    useEffect(() => {
        if (!isWindowFocused) {
            onClose();
        }
    }, [isWindowFocused, onClose]);

    const handleMouseDown = () => {
        if (isWindowFocused) {
            setIsHolding(true);
        }
    };

    const handleMouseUp = () => {
        setIsHolding(false);
        onClose(); // Close when released
    };

    const isVisible = isHolding && isWindowFocused;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20 hover:scale-110 z-20"
            >
                <X size={20} />
            </button>

            <div
                className="relative max-h-[90vh] max-w-[90vw]"
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleMouseDown}
                onTouchEnd={handleMouseUp}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Hold to reveal overlay */}
                {!isVisible && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg cursor-pointer select-none">
                        <div className="flex items-center gap-2 text-white/70 text-sm pointer-events-none">
                            <Eye size={18} />
                            <span>Hold to reveal</span>
                        </div>
                    </div>
                )}

                <img
                    src={src}
                    alt="Preview"
                    className={cn(
                        "max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl transition-all duration-0",
                        isVisible ? "" : "blur-3xl scale-95"
                    )}
                    draggable="false"
                />
            </div>
        </div>
    );
}
