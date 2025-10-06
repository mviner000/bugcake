// src/components/sheet/right-side/types.ts

export type FilterType = "all" | "updates" | "creates";
export type ApprovalFilterType = "all" | "approved" | "declined";

export interface ActivityEntry {
  id: string;
  timestamp: string;
  isCurrent: boolean;
  userName: string;
  action: string;
}

export interface ActivityGroup {
  month: string;
  entries: ActivityEntry[];
}

export interface ApprovalEntry {
  id: string;
  timestamp: string;
  userName: string;
  action: "Approved" | "Declined";
  testCaseTitle: string;
  reason?: string;
}

export interface ApprovalGroup {
  month: string;
  entries: ApprovalEntry[];
}

// Mock Data for Approvals (keeping this for now)
export const mockApprovalData: ApprovalGroup[] = [
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