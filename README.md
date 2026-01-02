# Protocol Ephemeral <O>

> **Zero-Retention. Anonymous. Anti-Forensic.**
> A messaging channel that exists only in RAM and dissolves upon closure.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Security](https://img.shields.io/badge/encryption-AES--GCM-green)
![Privacy](https://img.shields.io/badge/storage-RAM--only-orange)

## [!] Core Philosophy

**Protocol Ephemeral** is built on a single premise: **Trust No Disk.**

- **Relay-And-Forget**: The server blindly broadcasts ciphertext. No persistence (RAM-only, tiny ciphertext buffer at most).
- **Client-Side E2EE**: Keys are generated in-browser and live in the URL fragment (`#`). They never touch the server.
- **Hostile Capture UI**: The interface actively fights surveillance. It blurs on focus loss and blocks screenshot attempts.
- **Ephemeral By Default**: Messages fade after 5 minutes. Reloading the page shreds all history.
- **Stealth Images**: Images are compressed, encrypted, and sent ephemerally. They vanish just like text.

## [+] Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4
- **Realtime Relay**: PartyKit (Cloudflare Durable Objects)
- **Cryptography**: Web Crypto API (AES-GCM 256-bit)
- **UI/UX**: `lucide-react`, `sonner`, custom "Privacy Shield" components

## >> Getting Started

You need two terminals to run the full stack locally.

### 0. Install deps
```bash
corepack enable
pnpm install
```

### 1. Start the Relay Server
This handles the WebSocket connections.

```bash
pnpm exec partykit dev
# Runs on port 1999
```

### 2. Start the Frontend
This serves the application interface.

```bash
pnpm dev
# Runs on port 3000
```

### 3. Initialize a Secure Channel
1. Open `http://localhost:3000`.
2. A unique **Room ID** and **Encryption Key** will be generated automatically.
   - Example: `http://localhost:3000/?room=xy9z8abc#Base64Key...`
3. Share the **entire URL** with a peer securely (e.g., via Signal or encrypted email).
4. Both parties must be online to exchange messages. **No history is saved.**

If you deploy the web app separately from PartyKit, set `NEXT_PUBLIC_PARTYKIT_HOST` to your PartyKit host.

## [#] Security Features

### "Blind" Relay
The PartyKit server receives opaque ciphertext and does not decrypt or inspect it. It simply forwards it to other connected clients.

### Privacy Shield
The application listens for `blur` and `visibilitychange` events. If you switch tabs or click away to your desktop, the interface immediately blurs to prevent over-the-shoulder snooping.

### Anti-Forensics
- `user-select: none` prevents copying text to clipboard (except in the input box).
- Context menus are disabled to strictly limit browser interaction.
- Screenshot key combinations (PrintScreen, Cmd+Shift+3/4/S, etc.) attempt to trigger a clipboard clear and screen blur.

## !! Disclaimer

**DO NOT TRUST THIS CHANNEL FOR WHISTLEBLOWING.**
While we implement strict E2EE and zero-persistence, the browser environment is ultimately hostile. A compromised device, malicious browser extension, or physical surveillance can bypass these protections. Use at your own risk.

---

*Protocol Ephemeral is a concept application for temporary, high-privacy communication.*
