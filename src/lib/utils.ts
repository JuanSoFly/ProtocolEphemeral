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

export async function compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx?.drawImage(img, 0, 0, width, height);
                // Compress to JPEG with 0.7 quality to save space
                resolve(canvas.toDataURL("image/jpeg", 0.7));
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
}
