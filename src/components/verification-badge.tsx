import { CheckCircle2, ShieldQuestion } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { VerificationStatus } from "@/lib/supabase/types";

export function VerificationBadge({ status }: { status: VerificationStatus }) {
    if (status === "verified") {
        return (
            <Badge variant="success">
                <CheckCircle2 className="h-3 w-3" />
                ID verified
            </Badge>
        );
    }
    return (
        <Badge variant="outline">
            <ShieldQuestion className="h-3 w-3" />
            Not verified
        </Badge>
    );
}
