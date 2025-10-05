// src/components/sheet/common/ActivityApprovalsSheet.tsx

import { useState, useMemo } from "react";
import { Clock, MoreVertical, Loader2, CheckCircle, XCircle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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

// Types
type FilterType = "all" | "updates" | "creates";
type ApprovalFilterType = "all" | "approved" | "declined";

interface ActivityEntry {
  id: string;
  timestamp: string;
  isCurrent: boolean;
  userName: string;
  action: string;
}

interface ActivityGroup {
  month: string;
  entries: ActivityEntry[];
}

interface ApprovalEntry {
  id: string;
  timestamp: string;
  userName: string;
  action: "Approved" | "Declined";
  testCaseTitle: string;
  reason?: string;
}

interface ApprovalGroup {
  month: string;
  entries: ApprovalEntry[];
}

// Mock Data for Activity
const mockActivityData: ActivityGroup[] = [
  {
    month: "October 2025",
    entries: [
      {
        id: "1",
        timestamp: "02:30 PM",
        isCurrent: true,
        userName: "John Doe",
        action: 'Created test case: "Login functionality validation"',
      },
      {
        id: "2",
        timestamp: "11:45 AM",
        isCurrent: false,
        userName: "Jane Smith",
        action: 'Updated test case: "Payment gateway integration"',
      },
      {
        id: "3",
        timestamp: "09:15 AM",
        isCurrent: false,
        userName: "Mike Johnson",
        action: 'Created test case: "User registration flow"',
      },
    ],
  },
  {
    month: "September 2025",
    entries: [
      {
        id: "4",
        timestamp: "04:20 PM",
        isCurrent: false,
        userName: "Sarah Williams",
        action: 'Updated test case: "Dashboard analytics display"',
      },
      {
        id: "5",
        timestamp: "01:30 PM",
        isCurrent: false,
        userName: "Tom Brown",
        action: 'Created test case: "Email notification system"',
      },
    ],
  },
];

// Mock Data for Approvals
const mockApprovalData: ApprovalGroup[] = [
  {
    month: "October 2025",
    entries: [
      {
        id: "a1",
        timestamp: "03:45 PM",
        userName: "Sarah Williams",
        action: "Approved",
        testCaseTitle: "Login functionality validation",
        reason: "Test case meets all requirements",
      },
      {
        id: "a2",
        timestamp: "01:20 PM",
        userName: "Mike Johnson",
        action: "Declined",
        testCaseTitle: "Payment gateway integration",
        reason: "Missing edge case scenarios",
      },
      {
        id: "a3",
        timestamp: "10:30 AM",
        userName: "John Doe",
        action: "Approved",
        testCaseTitle: "User registration flow",
      },
    ],
  },
  {
    month: "September 2025",
    entries: [
      {
        id: "a4",
        timestamp: "05:15 PM",
        userName: "Jane Smith",
        action: "Approved",
        testCaseTitle: "Dashboard analytics display",
        reason: "Comprehensive test coverage",
      },
      {
        id: "a5",
        timestamp: "02:45 PM",
        userName: "Tom Brown",
        action: "Declined",
        testCaseTitle: "Email notification system",
        reason: "Requires additional test steps",
      },
    ],
  },
];

export default function ActivityApprovalsSheet() {
  const [selectedActivityFilter, setSelectedActivityFilter] = useState<FilterType>("all");
  const [selectedApprovalFilter, setSelectedApprovalFilter] = useState<ApprovalFilterType>("all");
  const [activeTab, setActiveTab] = useState("activity");

  // Filter approval data based on selected filter
  const filteredApprovalData = useMemo(() => {
    if (selectedApprovalFilter === "all") return mockApprovalData;
    
    return mockApprovalData.map(group => ({
      ...group,
      entries: group.entries.filter(entry => 
        entry.action.toLowerCase() === selectedApprovalFilter
      )
    })).filter(group => group.entries.length > 0);
  }, [selectedApprovalFilter]);

  const isLoading = false; // For demo purposes
  const hasActivity = mockActivityData.length > 0;
  const hasApprovals = filteredApprovalData.length > 0;

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

            {/* Activity History Tab */}
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
                    {mockActivityData.map((group) => (
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

            {/* Approvals Tab */}
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
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}