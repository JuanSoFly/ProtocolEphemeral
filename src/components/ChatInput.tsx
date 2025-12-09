"use client";

import React, { useState, useRef, useEffect } from "react";
import { SendHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
    onSendMessage: (text: string) => void;
    disabled?: boolean;
}

const MAX_CHARS = 500;

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
    const [value, setValue] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!value.trim() || disabled) return;

        onSendMessage(value.trim());
        setValue("");


        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newVal = e.target.value;
        if (newVal.length <= MAX_CHARS) {
            setValue(newVal);


            e.target.style.height = "auto";
            e.target.style.height = `${e.target.scrollHeight}px`;
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className={cn(
                "relative flex items-end gap-2 rounded-2xl bg-stone-900/50 p-2 backdrop-blur-md border border-white/5 transition-all focus-within:border-white/20",
                disabled && "opacity-50 cursor-not-allowed"
            )}
        >
            <textarea
                ref={textareaRef}
                rows={1}
                disabled={disabled}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="max-h-32 min-h-[44px] w-full resize-none bg-transparent px-4 py-3 text-sm text-stone-200 placeholder:text-stone-500 focus:outline-none"
                style={{ scrollbarWidth: 'none' }}
            />

            <button
                type="submit"
                disabled={!value.trim() || disabled}
                className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all",
                    value.trim() && !disabled
                        ? "bg-white text-black hover:bg-stone-200 hover:scale-105 active:scale-95"
                        : "bg-white/5 text-stone-600 cursor-not-allowed"
                )}
            >
                <SendHorizontal size={18} />
            </button>

            {/* Character count */}
            <div className={cn(
                "absolute -top-6 right-2 text-[10px] text-stone-500 transition-opacity",
                value.length > 0 ? "opacity-100" : "opacity-0"
            )}>
                {value.length}/{MAX_CHARS}
            </div>
        </form>
    );
}
