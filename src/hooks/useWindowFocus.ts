"use client";

import { useEffect, useState, useCallback } from "react";

/**
 * Hook for privacy protection using hold-to-reveal approach.
 * Content is only visible while user is actively holding down.
 * This prevents screenshots because:
 * - Content is blurred by default
 * - User must hold to reveal (can't hold and press PrintScreen simultaneously)
 * - Releasing hides content immediately
 */
export function usePrivacyProtection() {
    const [isHolding, setIsHolding] = useState(false);
    const [isWindowFocused, setIsWindowFocused] = useState(true);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setIsHolding(false);
                setIsWindowFocused(false);
            } else {
                setIsWindowFocused(true);
            }
        };

        const handleBlur = () => {
            setIsHolding(false);
            setIsWindowFocused(false);
        };

        const handleFocus = () => {
            setIsWindowFocused(true);
        };

        // Prevent right-click
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            setIsHolding(false);
        };

        // Any key press hides content (to prevent PrintScreen)
        const handleKeyDown = () => {
            setIsHolding(false);
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("blur", handleBlur);
        window.addEventListener("focus", handleFocus);
        document.addEventListener("contextmenu", handleContextMenu);
        document.addEventListener("keydown", handleKeyDown, true);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("blur", handleBlur);
            window.removeEventListener("focus", handleFocus);
            document.removeEventListener("contextmenu", handleContextMenu);
            document.removeEventListener("keydown", handleKeyDown, true);
        };
    }, []);

    const startHolding = useCallback(() => {
        if (isWindowFocused) {
            setIsHolding(true);
        }
    }, [isWindowFocused]);

    const stopHolding = useCallback(() => {
        setIsHolding(false);
    }, []);

    // Content is only visible when holding AND window is focused
    const isVisible = isHolding && isWindowFocused;

    return { isVisible, startHolding, stopHolding, isWindowFocused };
}
