"use client";

import React, { useState, useRef, useEffect } from "react";
import { SendHorizontal, Image as ImageIcon, X } from "lucide-react";
import { cn, compressImage } from "@/lib/utils";

interface ChatInputProps {
    onSendMessage: (content: string, type: 'text' | 'image') => void;
    disabled?: boolean;
}

const MAX_CHARS = 500;

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
    const [value, setValue] = useState("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (disabled) return;

        if (imagePreview) {
            onSendMessage(imagePreview, 'image');
            setImagePreview(null);
            setValue("");
        } else if (value.trim()) {
            onSendMessage(value.trim(), 'text');
            setValue("");
        }

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

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const compressed = await compressImage(file);
                setImagePreview(compressed);
            } catch (error) {
                console.error("Failed to process image", error);
            }
        }
        // Reset input so validation triggers if same file selected again
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <form
            onSubmit={handleSubmit}
            className={cn(
                "relative flex flex-col gap-2 rounded-2xl bg-muted/50 p-2 backdrop-blur-md border border-white/5 transition-all focus-within:border-white/20",
                disabled && "opacity-50 cursor-not-allowed"
            )}
        >
            {imagePreview && (
                <div className="relative mx-2 mt-2 w-fit">
                    <img src={imagePreview} alt="Preview" className="h-32 rounded-lg border border-white/10 object-cover" draggable="false" />
                    <button
                        type="button"
                        onClick={() => setImagePreview(null)}
                        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    >
                        <X size={14} />
                    </button>
                </div>
            )}

            <div className="flex items-end gap-2">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled || !!imagePreview}
                    className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all hover:bg-white/5 text-muted-foreground hover:text-foreground",
                        (disabled || !!imagePreview) && "opacity-50 cursor-not-allowed"
                    )}
                >
                    <ImageIcon size={20} />
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageSelect}
                />

                <textarea
                    ref={textareaRef}
                    rows={1}
                    disabled={disabled || !!imagePreview}
                    value={value}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder={imagePreview ? "Image attached" : "Type a message..."}
                    className="max-h-32 min-h-[44px] w-full resize-none bg-transparent px-2 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                    style={{ scrollbarWidth: 'none' }}
                />

                <button
                    type="submit"
                    disabled={(!value.trim() && !imagePreview) || disabled}
                    className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all",
                        (value.trim() || imagePreview) && !disabled
                            ? "bg-acc-1 text-white hover:brightness-110 hover:scale-105 active:scale-95"
                            : "bg-white/5 text-muted-foreground cursor-not-allowed"
                    )}
                >
                    <SendHorizontal size={18} />
                </button>
            </div>

            {/* Character count */}
            {!imagePreview && (
                <div className={cn(
                    "absolute -top-6 right-2 text-[10px] text-muted-foreground transition-opacity",
                    value.length > 0 ? "opacity-100" : "opacity-0"
                )}>
                    {value.length}/{MAX_CHARS}
                </div>
            )}
        </form>
    );
}
