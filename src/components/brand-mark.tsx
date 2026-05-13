import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
    return (
        <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
            <Image
                src="/Q-uillsLogo-removebg-preview.png"
                alt=""
                width={28}
                height={28}
                className="h-7 w-7 object-contain"
                priority
            />
            <span className="text-base">
                <span className="text-gold-600">Q</span>
                <span className="text-ink-900 dark:text-cream-50">-uills</span>
            </span>
        </span>
    );
}
