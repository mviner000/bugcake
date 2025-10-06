// src/components/sheet/right-side/ActivityApprovalsSheet.tsx

import { useState } from "react";
import { Clock } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Id } from "convex/_generated/dataModel";
import { Approvals } from "./Approvals";
import { ActivityHistory } from "./ActivityHistory";

interface ActivityApprovalsSheetProps {
  sheetId: Id<"sheets">;
}

export default function ActivityApprovalsSheet({ sheetId }: ActivityApprovalsSheetProps) {
  const [activeTab, setActiveTab] = useState("activity");

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Clock className="w-4 h-4" />
          Activity
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[400px] p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="text-sm font-medium">Activity & Approvals</SheetTitle>
          </SheetHeader>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="w-full rounded-none border-b">
              <TabsTrigger value="activity" className="flex-1">
                Activity History
              </TabsTrigger>
              <TabsTrigger value="approvals" className="flex-1">
                Approvals
              </TabsTrigger>
            </TabsList>

            <ActivityHistory sheetId={sheetId} />
            <Approvals />
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}