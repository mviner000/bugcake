// src/components/checklist/ChecklistStatusButtonGroup.tsx

import { Button } from "@/components/ui/button";
import { Id } from "../../../convex/_generated/dataModel";

interface ChecklistStatusButtonGroupProps {
  currentStatus: string;
  onStatusChange: (itemId: Id<"checklistItems">, status: string) => void;
  itemId: Id<"checklistItems">;
  getStatusButtonColor: (status: string) => string;
}

export function ChecklistStatusButtonGroup({ 
  currentStatus, 
  onStatusChange, 
  itemId,
  getStatusButtonColor 
}: ChecklistStatusButtonGroupProps) {
  return (
    <div className="flex gap-1 md:gap-2 lg:inline-flex lg:rounded-md lg:shadow-sm lg:flex-shrink-0" role="group">
      <Button
        variant={currentStatus === "Passed" ? "default" : "outline"}
        size="sm"
        onClick={() => onStatusChange(itemId, "Passed")}
        className={`flex-1 text-xs md:text-sm lg:flex-initial lg:rounded-r-none lg:border-r-0 ${
          currentStatus === "Passed" ? getStatusButtonColor("Passed") : ""
        }`}
      >
        Passed
      </Button>
      <Button
        variant={currentStatus === "Failed" ? "default" : "outline"}
        size="sm"
        onClick={() => onStatusChange(itemId, "Failed")}
        className={`flex-1 text-xs md:text-sm lg:flex-initial lg:rounded-none lg:border-r-0 ${
          currentStatus === "Failed" ? getStatusButtonColor("Failed") : ""
        }`}
      >
        Failed
      </Button>
      <Button
        variant={currentStatus === "Blocked" ? "default" : "outline"}
        size="sm"
        onClick={() => onStatusChange(itemId, "Blocked")}
        className={`flex-1 text-xs md:text-sm lg:flex-initial lg:rounded-none lg:border-r-0 ${
          currentStatus === "Blocked" ? getStatusButtonColor("Blocked") : ""
        }`}
      >
        Blocked
      </Button>
      <Button
        variant={currentStatus === "Not Run" ? "default" : "outline"}
        size="sm"
        onClick={() => onStatusChange(itemId, "Not Run")}
        className={`flex-1 text-xs md:text-sm lg:flex-initial lg:rounded-none lg:border-r-0 ${
          currentStatus === "Not Run" ? getStatusButtonColor("Not Run") : ""
        }`}
      >
        Not Run
      </Button>
      <Button
        variant={currentStatus === "Skipped" ? "default" : "outline"}
        size="sm"
        onClick={() => onStatusChange(itemId, "Skipped")}
        className={`flex-1 text-xs md:text-sm lg:flex-initial lg:rounded-l-none ${
          currentStatus === "Skipped" ? getStatusButtonColor("Skipped") : ""
        }`}
      >
        Skipped
      </Button>
    </div>
  );
}