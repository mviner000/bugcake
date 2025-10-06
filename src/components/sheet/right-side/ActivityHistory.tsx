// src/components/sheet/right-side/ActivityHistory.tsx

import { useState, useMemo } from "react";
import { Clock, MoreVertical, Loader2 } from "lucide-react";
import { TabsContent } from "@/components/ui/tabs";
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
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Doc, Id } from "convex/_generated/dataModel";
import { FilterType, ActivityEntry, ActivityGroup } from "./types";

type ActivityLogDoc = Doc<"activityLogs">;

interface ActivityHistoryProps {
  sheetId: Id<"sheets">;
}

/**
 * Transforms flat activity log data into a grouped, displayable structure.
 */
const groupActivitiesByMonth = (logs: ActivityLogDoc[] | undefined): ActivityGroup[] => {
  if (!logs || logs.length === 0) return [];

  const grouped: Record<string, ActivityEntry[]> = {};
  const monthYearFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
  const timeFormatter = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' });

  logs.forEach((log) => {
    const date = new Date(log.timestamp);
    const monthYear = monthYearFormatter.format(date);

    const logDetails = log.details ?? "";
    let actionDetail: string;

    if (log.action === "Created") {
      const match = logDetails.match(/New test case \"(.*?)\" created\./);
      actionDetail = match 
        ? `Created test case: "${match[1]}"` 
        : "Created a new test case.";
    } else {
      actionDetail = logDetails.length > 0 ? logDetails : `${log.action} test case.`;
    }

    const entry: ActivityEntry = {
      id: log._id,
      timestamp: timeFormatter.format(date),
      isCurrent: false,
      userName: log.username,
      action: actionDetail,
    };

    if (!grouped[monthYear]) {
      grouped[monthYear] = [];
    }
    grouped[monthYear].push(entry);
  });

  return Object.keys(grouped).map((month) => ({
    month,
    entries: grouped[month],
  }));
};

export function ActivityHistory({ sheetId }: ActivityHistoryProps) {
  const [selectedActivityFilter, setSelectedActivityFilter] = useState<FilterType>("all");

  // Fetch data from Convex
  const activityLogs = useQuery(api.myFunctions.getActivityLogsForSheet, {
    sheetId,
    filter: selectedActivityFilter
  });

  const activityData = useMemo(() => groupActivitiesByMonth(activityLogs), [activityLogs]);

  const isLoading = activityLogs === undefined;
  const hasActivity = activityData.length > 0;

  return (
    <TabsContent value="activity" className="flex-1 flex flex-col m-0 p-4 space-y-3">
      {/* Filter Select */}
      <Select 
        value={selectedActivityFilter} 
        onValueChange={(value) => setSelectedActivityFilter(value as FilterType)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select filter" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All activity</SelectItem>
          <SelectItem value="updates">Updates only</SelectItem>
          <SelectItem value="creates">Creates only</SelectItem>
        </SelectContent>
      </Select>

      {/* Content */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !hasActivity ? (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] px-6 text-center">
            <Clock className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-sm mb-1">No activity yet</p>
            <p className="text-gray-400 text-xs">
              Changes will appear here as you work
            </p>
          </div>
        ) : (
          <div className="py-2">
            {activityData.map((group) => (
              <div key={group.month} className="mb-2">
                <div className="px-4 py-2 text-xs font-medium text-muted-foreground">
                  {group.month}
                </div>
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
                        <p className="text-xs text-muted-foreground mt-1">
                          {entry.action}
                        </p>
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
    </TabsContent>
  );
}