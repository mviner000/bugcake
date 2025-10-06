// src/components/sheet/right-side/Approvals.tsx

import { useState, useMemo } from "react";
import { MoreVertical, Loader2, CheckCircle, XCircle } from "lucide-react";
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
import { ApprovalFilterType, mockApprovalData } from "./types";

export function Approvals() {
  const [selectedApprovalFilter, setSelectedApprovalFilter] = useState<ApprovalFilterType>("all");
  
  const filteredApprovalData = useMemo(() => {
    if (selectedApprovalFilter === "all") return mockApprovalData;
    
    return mockApprovalData.map(group => ({
      ...group,
      entries: group.entries.filter(entry => 
        entry.action.toLowerCase() === selectedApprovalFilter
      )
    })).filter(group => group.entries.length > 0);
  }, [selectedApprovalFilter]);

  const isLoading = false;
  const hasApprovals = filteredApprovalData.length > 0;

  return (
    <TabsContent value="approvals" className="flex-1 flex flex-col m-0 p-4 space-y-3">
      {/* Filter Select */}
      <Select 
        value={selectedApprovalFilter} 
        onValueChange={(value) => setSelectedApprovalFilter(value as ApprovalFilterType)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select filter" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All approvals</SelectItem>
          <SelectItem value="approved">Approved only</SelectItem>
          <SelectItem value="declined">Declined only</SelectItem>
        </SelectContent>
      </Select>

      {/* Content */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !hasApprovals ? (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] px-6 text-center">
            <CheckCircle className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-sm mb-1">No approvals yet</p>
            <p className="text-gray-400 text-xs">
              Approval decisions will appear here
            </p>
          </div>
        ) : (
          <div className="py-2">
            {filteredApprovalData.map((group) => (
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
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          {entry.action === "Approved" ? (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          ) : (
                            <XCircle className="w-3 h-3 text-red-500" />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {entry.userName}
                          </span>
                          <span className={`text-xs font-medium ${
                            entry.action === "Approved" 
                              ? "text-green-600" 
                              : "text-red-600"
                          }`}>
                            {entry.action}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-foreground mt-1">
                          {entry.testCaseTitle}
                        </p>
                        {entry.reason && (
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            "{entry.reason}"
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
                          <DropdownMenuItem>View test case</DropdownMenuItem>
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
