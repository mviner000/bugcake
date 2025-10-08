// src/components/sheet/common/SEImplementationBadge.tsx
import { Badge } from "@/components/ui/badge";

export type SEImplementationStatus =
  | "Not yet"
  | "Ongoing"
  | "Done"
  | "Has Concerns"
  | "To Update"
  | "Outdated"
  | "Not Available";

export function SEImplementationBadge({ status }: { status: SEImplementationStatus }) {
  const colorMap: Record<SEImplementationStatus, string> = {
    "Not yet": "bg-gray-400",
    Ongoing: "bg-blue-500",
    Done: "bg-green-500",
    "Has Concerns": "bg-red-500",
    "To Update": "bg-yellow-500",
    Outdated: "bg-purple-500",
    "Not Available": "bg-gray-300",
  };

  return <Badge className={`${colorMap[status]} text-white`}>{status}</Badge>;
}
