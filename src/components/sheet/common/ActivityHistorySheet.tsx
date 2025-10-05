// src/components/sheet/common/ActivityHistorySheet.tsx

import { useState } from "react";
import { Clock, MoreVertical } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ActivityEntry {
  id: string;
  timestamp: string;
  isCurrent: boolean;
  userName: string;
  action?: string;
}

interface ActivityGroup {
  month: string;
  entries: ActivityEntry[];
}

interface ActivityHistorySheetProps {
  hasActivity: boolean;
  activityData: ActivityGroup[];
}

export function ActivityHistorySheet({ hasActivity, activityData }: ActivityHistorySheetProps) {
  const [selectedFilter, setSelectedFilter] = useState("all");

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
            <SheetTitle className="text-sm font-medium">Activity History</SheetTitle>

            {/* Filter Select */}
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-full mt-3">
                <SelectValue placeholder="Select filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All activity</SelectItem>
                <SelectItem value="updates">Updates only</SelectItem>
                <SelectItem value="creates">Creates only</SelectItem>
              </SelectContent>
            </Select>
          </SheetHeader>

          {/* Content */}
          <ScrollArea className="flex-1">
            {!hasActivity ? (
              // Empty State
              <div className="flex flex-col items-center justify-center h-[calc(100vh-140px)] px-6 text-center">
                <Clock className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500 text-sm mb-1">No activity yet</p>
                <p className="text-gray-400 text-xs">
                  Changes will appear here as you work
                </p>
              </div>
            ) : (
              // Activity List
              <div className="py-2">
                {activityData.map((group) => (
                  <div key={group.month} className="mb-2">
                    {/* Month Header */}
                    <div className="px-4 py-2 text-xs font-medium text-muted-foreground">
                      {group.month}
                    </div>

                    {/* Activity Entries */}
                    {group.entries.map((entry) => (
                      <div
                        key={entry.id}
                        className="px-4 py-3 hover:bg-accent cursor-pointer transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-foreground">
                                {entry.timestamp}
                              </span>

                              {entry.isCurrent && (
                                <span className="text-xs text-muted-foreground">
                                  Current
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-2 h-2 rounded-full bg-teal-500"></div>

                              <span className="text-xs text-muted-foreground">
                                {entry.userName}
                              </span>
                            </div>
                            {entry.action && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {entry.action}
                              </p>
                            )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View details</DropdownMenuItem>
                              <DropdownMenuItem>Restore version</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}