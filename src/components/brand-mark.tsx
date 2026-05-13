import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
    return (
        <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
            <Image
                src="/Q-uillsLogo-removebg-preview.png"
                alt=""
                width={48}
                height={48}
                className="h-10 w-10 object-contain sm:h-12 sm:w-12"
                priority
            />
            <span className="text-lg sm:text-xl">
                <span className="text-gold-600">Q</span>
                <span className="text-ink-900 dark:text-cream-50">-uills</span>
            </span>
        </span>
    );
}
