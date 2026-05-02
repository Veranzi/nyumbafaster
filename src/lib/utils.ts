import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** shadcn-style class joiner: combines clsx + tailwind-merge. */
export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}
