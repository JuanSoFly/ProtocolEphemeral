"use client";

import React, { useState, useEffect, useRef } from "react";
import { Palette } from "lucide-react";

interface Theme {
    name: string;
    background: string;
    foreground: string;
    muted: string;
    mutedForeground: string;
    accent1: string;
    accent2: string;
    preview: string[];
}

const themes: Theme[] = [
    {
        name: "Midnight",
        background: "oklch(0.12 0 286)",
        foreground: "oklch(0.98 0 0)",
        muted: "oklch(0.25 0 286)",
        mutedForeground: "oklch(0.7 0 0)",
        accent1: "oklch(0.6 0.2 340)",
        accent2: "oklch(0.7 0.15 200)",
        preview: ["#1a1a2e", "#e0e0e0", "#d946ef"],
    },
    {
        name: "Emerald",
        background: "oklch(0.13 0.02 160)",
        foreground: "oklch(0.95 0.02 160)",
        muted: "oklch(0.25 0.03 160)",
        mutedForeground: "oklch(0.65 0.05 160)",
        accent1: "oklch(0.65 0.2 160)",
        accent2: "oklch(0.75 0.15 120)",
        preview: ["#0d1f1c", "#e0f2ec", "#10b981"],
    },
    {
        name: "Crimson",
        background: "oklch(0.12 0.02 20)",
        foreground: "oklch(0.95 0.01 20)",
        muted: "oklch(0.25 0.04 20)",
        mutedForeground: "oklch(0.65 0.06 20)",
        accent1: "oklch(0.6 0.22 25)",
        accent2: "oklch(0.7 0.18 40)",
        preview: ["#1f0d0d", "#f2e0e0", "#ef4444"],
    },
    {
        name: "Cyber",
        background: "oklch(0.1 0.02 280)",
        foreground: "oklch(0.9 0.1 180)",
        muted: "oklch(0.2 0.05 280)",
        mutedForeground: "oklch(0.6 0.08 180)",
        accent1: "oklch(0.7 0.25 180)",
        accent2: "oklch(0.65 0.25 320)",
        preview: ["#0f0a1a", "#00ffcc", "#ff00ff"],
    },
    {
        name: "Ocean",
        background: "oklch(0.12 0.03 240)",
        foreground: "oklch(0.95 0.02 220)",
        muted: "oklch(0.25 0.05 240)",
        mutedForeground: "oklch(0.65 0.08 220)",
        accent1: "oklch(0.65 0.18 220)",
        accent2: "oklch(0.7 0.15 180)",
        preview: ["#0a1628", "#e0f0ff", "#3b82f6"],
    },
    {
        name: "Sunset",
        background: "oklch(0.12 0.02 40)",
        foreground: "oklch(0.95 0.03 60)",
        muted: "oklch(0.25 0.05 40)",
        mutedForeground: "oklch(0.65 0.08 50)",
        accent1: "oklch(0.7 0.2 40)",
        accent2: "oklch(0.65 0.2 350)",
        preview: ["#1a140a", "#fff0e0", "#f97316"],
    },
];

export function ThemeChanger() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentTheme, setCurrentTheme] = useState<string>("Midnight");
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Load saved theme from localStorage
        const saved = localStorage.getItem("protocol-theme");
        if (saved) {
            const theme = themes.find((t) => t.name === saved);
            if (theme) {
                applyTheme(theme);
                setCurrentTheme(saved);
            }
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const applyTheme = (theme: Theme) => {
        const root = document.documentElement;
        root.style.setProperty("--color-background", theme.background);
        root.style.setProperty("--color-foreground", theme.foreground);
        root.style.setProperty("--color-muted", theme.muted);
        root.style.setProperty("--color-muted-foreground", theme.mutedForeground);
        root.style.setProperty("--color-acc-1", theme.accent1);
        root.style.setProperty("--color-acc-2", theme.accent2);
    };

    const handleThemeChange = (theme: Theme) => {
        applyTheme(theme);
        setCurrentTheme(theme.name);
        localStorage.setItem("protocol-theme", theme.name);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium transition-all hover:bg-white/10 hover:scale-105"
                aria-label="Change theme"
            >
                <Palette size={14} className="text-acc-1" />
                <span className="hidden sm:inline">{currentTheme}</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-white/10 bg-background/95 p-2 shadow-xl backdrop-blur-xl animate-fade-in z-50">
                    <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Select Theme
                    </div>
                    {themes.map((theme) => (
                        <button
                            key={theme.name}
                            onClick={() => handleThemeChange(theme)}
                            className={`flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-white/10 ${currentTheme === theme.name ? "bg-white/5" : ""
                                }`}
                        >
                            <div className="flex gap-0.5">
                                {theme.preview.map((color, i) => (
                                    <div
                                        key={i}
                                        className="h-4 w-4 rounded-full border border-white/20"
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                            <span className="font-medium">{theme.name}</span>
                            {currentTheme === theme.name && (
                                <span className="ml-auto text-acc-1">✓</span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
