import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
    return (
        <span className={cn("inline-flex items-center", className)}>
            <Image
                src="/Q-uillsLogo-removebg-preview.png"
                alt="Q-uills"
                width={677}
                height={369}
                className="h-12 w-auto sm:h-14"
                priority
            />
        </span>
    );
}
