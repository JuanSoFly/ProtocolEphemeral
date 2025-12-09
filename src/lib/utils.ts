import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { uniqueNamesGenerator, adjectives, animals } from "unique-names-generator";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function generateIdentity() {
    return uniqueNamesGenerator({
        dictionaries: [adjectives, animals],
        separator: " ",
        style: "capital",
    });
}

export function generateGradient(username: string) {

    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }

    const c1 = `hsl(${hash % 360}, 70%, 50%)`;
    const c2 = `hsl(${(hash + 180) % 360}, 70%, 50%)`;

    return `linear-gradient(135deg, ${c1}, ${c2})`;
}
