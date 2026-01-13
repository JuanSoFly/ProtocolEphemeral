"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import PartySocket from "partysocket";
import { Toaster, toast } from "sonner";
import { Lock, Share2, AlertTriangle, Terminal } from "lucide-react";

import { ChatInput } from "@/components/ChatInput";
import { EphemeralMessage } from "@/components/EphemeralMessage";
import { StatusIndicator } from "@/components/StatusIndicator";
import { ThemeChanger } from "@/components/ThemeChanger";
import { generateIdentity } from "@/lib/utils";
import { generateKey, exportKey, importKey, encryptMessage, decryptMessage } from "@/lib/crypto";

interface Message {
  id: string;
  content: string;
  type: 'text' | 'image';
  sender: string;
  timestamp: number;
}

// "Blind relay" message shape
interface Packet {
  iv: string;
  ciphertext: string;
  sender: string;
}

export default function Home() {
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [peerCount, setPeerCount] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [identity, setIdentity] = useState("");
  const [key, setKey] = useState<CryptoKey | null>(null);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 25000);
    return () => clearTimeout(timer);
  }, []);

  const socketRef = useRef<PartySocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const shouldAutoScroll = useRef(true);

  // 1. Setup
  useEffect(() => {
    setIdentity(generateIdentity());

    const init = async () => {
      let hash = window.location.hash.slice(1);
      const urlParams = new URLSearchParams(window.location.search);
      let room = urlParams.get("room");

      // Setup Room
      if (!room) {
        room = Math.random().toString(36).substring(2, 10);
        urlParams.set("room", room);
      }

      let cryptoKey: CryptoKey;
      if (!hash) {
        cryptoKey = await generateKey();
        hash = await exportKey(cryptoKey);
        const newUrl = `${window.location.pathname}?${urlParams.toString()}#${hash}`;
        window.history.replaceState(null, "", newUrl);
      } else {
        try {
          cryptoKey = await importKey(hash);
        } catch (e) {
          console.error("Invalid key", e);
          toast.error("Invalid Encryption Key. Chat will be unreadable.");
          return;
        }
      }
      setKey(cryptoKey);

      // PartyKit connection
      const host =
        process.env.NEXT_PUBLIC_PARTYKIT_HOST ||
        (window.location.hostname === "localhost" ? "127.0.0.1:1999" : window.location.host);

      const ws = new PartySocket({
        host: host,
        room: room,
      });

      ws.addEventListener("open", () => setStatus("connected"));
      ws.addEventListener("close", () => setStatus("disconnected"));
      ws.addEventListener("message", async (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "presence") {
          setPeerCount(data.count);
          return;
        }

        // Decrypt
        const packet = data as Packet;

        const decryptedPayload = await decryptMessage(packet.iv, packet.ciphertext, cryptoKey);

        if (decryptedPayload !== "[Decryption Error]") {
          let content = decryptedPayload;
          let type: 'text' | 'image' = 'text';

          try {
            // Try to parse as JSON structure { type, content }
            const parsed = JSON.parse(decryptedPayload);
            if (parsed.type && (parsed.type === 'text' || parsed.type === 'image')) {
              content = parsed.content;
              type = parsed.type;
            }
          } catch (e) {
            // Not JSON, treat as legacy text message
          }

          const newMessage: Message = {
            id: Math.random().toString(36),
            content,
            type,
            sender: packet.sender,
            timestamp: Date.now(),
          };

          setMessages((prev) => [...prev, newMessage]);
        }
      });

      socketRef.current = ws;

      return () => {
        ws.close();
      };
    };

    init();
  }, []); // Run once on mount

  // 2. Send
  const handleSendMessage = async (content: string, type: 'text' | 'image') => {
    if (!socketRef.current || !key) return;

    try {
      const payload = JSON.stringify({ type, content });
      const { iv, ciphertext } = await encryptMessage(payload, key);
      const packet: Packet = {
        iv,
        ciphertext,
        sender: identity,
      };

      // Send as pure string
      socketRef.current.send(JSON.stringify(packet));


      const newMessage: Message = {
        id: Math.random().toString(36),
        content,
        type,
        sender: identity,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, newMessage]);
    } catch (e) {
      console.error(e);
      toast.error("Failed to encrypt message");
    }
  };

  // 3. Auto-scroll
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;


    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    shouldAutoScroll.current = isAtBottom;
  };

  useEffect(() => {
    if (shouldAutoScroll.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // 4. Utils
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard. Share safely.");
  };

  const handleExpire = useCallback((id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  }, []);

  return (
    <main className="flex h-screen w-full flex-col bg-stone-950 text-stone-200 selection:bg-acc-1 selection:text-white">
      <Toaster theme="dark" position="top-center" />


      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/5 bg-stone-950/80 px-4 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <Lock className="text-emerald-500" size={16} />
          <span className="font-mono text-sm font-bold tracking-tight text-stone-400">
            PROTOCOL <span className="text-stone-100">EPHEMERAL</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <StatusIndicator status={status} peerCount={peerCount} />
          <ThemeChanger />
          <button
            onClick={copyLink}
            className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white/10"
          >
            <Share2 size={14} />
            <span className="hidden sm:inline">Invite</span>
          </button>
        </div>
      </header>


      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth"
      >
        <div className="mx-auto flex max-w-2xl flex-col gap-6">

          {showIntro && (
            <div className="mb-8 rounded-lg border border-blue-900/30 bg-blue-950/10 p-4 text-xs text-blue-200 animate-fade-in">
              <div className="flex items-center gap-2 font-bold text-blue-300 mb-1">
                <span className="text-lg">➤</span>
                Welcome to Protocol Ephemeral
              </div>
              Your messages are end-to-end encrypted and transient.
              History is cleared on reload. Share the URL with a friend to start chatting anonymously.
            </div>
          )}

          {messages.length === 0 && status === "connected" && (
            <div className="flex flex-col items-center justify-center py-20 opacity-20">
              <Terminal size={48} />
              <p className="mt-4 font-mono text-sm">CHANNEL OPEN. WAITING FOR SIGNAL.</p>
            </div>
          )}

          {messages.map((msg) => (
            <EphemeralMessage
              key={msg.id}
              id={msg.id}
              content={msg.content}
              type={msg.type}
              sender={msg.sender}
              timestamp={msg.timestamp}
              isMe={msg.sender === identity}
              onExpire={handleExpire}
            />
          ))}

          <div ref={bottomRef} className="h-4" />
        </div>
      </div>


      <footer className="shrink-0 p-4 pb-6 safe-area-pb">
        <div className="mx-auto max-w-2xl">
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={status !== "connected"}
          />
          <div className="mt-2 text-center text-[10px] text-stone-600 font-mono">
            ID: {identity} • IV: FRESH PER MESSAGE • STORAGE: NULL
          </div>
        </div>
      </footer>
    </main>
  );
}
