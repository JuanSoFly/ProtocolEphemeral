
export async function generateKey(): Promise<CryptoKey> {
    return window.crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256,
        },
        true,
        ["encrypt", "decrypt"]
    );
}

export async function exportKey(key: CryptoKey): Promise<string> {
    const exported = await window.crypto.subtle.exportKey("raw", key);
    return Buffer.from(exported).toString("base64");
}

export async function importKey(base64Key: string): Promise<CryptoKey> {
    const customBuffer = Buffer.from(base64Key, "base64");
    return window.crypto.subtle.importKey(
        "raw",
        customBuffer,
        "AES-GCM",
        true,
        ["encrypt", "decrypt"]
    );
}

export async function encryptMessage(text: string, key: CryptoKey) {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(text);

    const ciphertext = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        key,
        encoded
    );

    return {
        iv: Buffer.from(iv).toString("base64"),
        ciphertext: Buffer.from(ciphertext).toString("base64"),
    };
}

export async function decryptMessage(
    ivBase64: string,
    ciphertextBase64: string,
    key: CryptoKey
): Promise<string> {
    try {
        const iv = Buffer.from(ivBase64, "base64");
        const ciphertext = Buffer.from(ciphertextBase64, "base64");

        const decrypted = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv,
            },
            key,
            ciphertext
        );

        return new TextDecoder().decode(decrypted);
    } catch (e) {
        console.error("Decryption failed", e);
        return "[Decryption Error]";
    }
}
