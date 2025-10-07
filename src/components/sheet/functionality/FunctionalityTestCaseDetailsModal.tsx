// src/components/sheet/functionality/FunctionalityTestCasesDetailsModal.tsx

import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DetailsModal } from "@/components/ui/mod/DetailsModal";
import { ContentSection, MetadataField } from "@/components/ui/mod/ModalHelpers";
import {
  ListChecks,
  X,
  User,
  Layers3,
  MoreHorizontal,
  Share2,
  ChevronDown
} from "lucide-react";
import { useQuery } from "convex/react";
import { Id } from "convex/_generated/dataModel";

interface FunctionalityTestCasesDetailsModalProps {
  sheetId: string;
}

// --- Dummy Data ---
const DUMMY_TEST_CASES = [
  {
    id: "TC_001",
    workflowStatus: "Open",
    level: "High",
    scenario: "Happy Path",
    module: "User Management",
    subModule: "User Registration",
    title: "User should successfully register with valid credentials",
    preConditions: "1. Application is deployed\n2. Database is accessible\n3. No network issues",
    steps: "1. Navigate to registration page\n2. Enter valid email\n3. Enter strong password\n4. Click register button",
    expectedResults: "1. User account created successfully\n2. Confirmation email sent\n3. User redirected to login page",
    status: "Not Run",
    executedBy: "John Doe",
    jiraUserStory: "US-1234",
    createdBy: "Jane Smith",
    createdAt: "2025-10-01"
  },
  {
    id: "TC_002",
    workflowStatus: "In Progress",
    level: "High",
    scenario: "Unhappy Path",
    module: "User Management",
    subModule: "User Registration",
    title: "User should see error when entering invalid email",
    preConditions: "1. User is on registration page\n2. System is responsive",
    steps: "1. Enter invalid email format\n2. Enter valid password\n3. Click register button",
    expectedResults: "1. Error message displayed\n2. Form not submitted\n3. User remains on page",
    status: "Not Run",
    executedBy: "Jane Smith",
    jiraUserStory: "US-1234",
    createdBy: "John Doe",
    createdAt: "2025-10-02"
  },
  {
    id: "TC_003",
    workflowStatus: "Approved",
    level: "Medium",
    scenario: "Happy Path",
    module: "Dashboard",
    subModule: "Analytics",
    title: "Dashboard should load and display all widgets",
    preConditions: "1. User is logged in\n2. User has analytics permissions\n3. Data is available in database",
    steps: "1. Navigate to dashboard\n2. Wait for page to load\n3. Verify all widgets are visible",
    expectedResults: "1. Dashboard loads within 3 seconds\n2. All widgets display correctly\n3. Data is up to date",
    status: "Not Run",
    executedBy: "Mike Johnson",
    jiraUserStory: "US-2345",
    createdBy: "Sarah Williams",
    createdAt: "2025-09-28"
  },
  {
    id: "TC_004",
    workflowStatus: "Open",
    level: "Low",
    scenario: "Happy Path",
    module: "Reports",
    subModule: "Report Generation",
    title: "User should generate and download report successfully",
    preConditions: "1. User is logged in\n2. Report data exists\n3. File storage is available",
    steps: "1. Navigate to reports section\n2. Select report type\n3. Apply filters if needed\n4. Click generate\n5. Download report",
    expectedResults: "1. Report generated within 5 seconds\n2. File downloaded successfully\n3. File format is correct",
    status: "Not Run",
    executedBy: "N/A",
    jiraUserStory: "US-3456",
    createdBy: "David Brown",
    createdAt: "2025-10-03"
  },
  {
    id: "TC_005",
    workflowStatus: "In Review",
    level: "High",
    scenario: "Unhappy Path",
    module: "Payment",
    subModule: "Checkout",
    title: "System should handle payment failure gracefully",
    preConditions: "1. User has items in cart\n2. Payment gateway is configured\n3. Network connection available",
    steps: "1. Proceed to checkout\n2. Enter payment details\n3. Simulate payment failure\n4. Submit payment",
    expectedResults: "1. Error message displayed\n2. Transaction not processed\n3. Cart items retained",
    status: "Not Run",
    executedBy: "Sarah Williams",
    jiraUserStory: "US-4567",
    createdBy: "Mike Johnson",
    createdAt: "2025-10-04"
  }
];

// --- Badge Helper ---
function getStatusVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "Passed":
    case "Done":
    case "Approved":
      return "default";
    case "Failed":
    case "Blocked":
      return "destructive";
    case "In Progress":
    case "Ongoing":
    case "In Review":
    case "Has Concerns":
      return "secondary";
    default:
      return "outline";
  }
}

function getLevelVariant(level: string): "default" | "secondary" | "destructive" | "outline" {
  switch (level) {
    case "High":
      return "destructive";
    case "Medium":
      return "secondary";
    case "Low":
      return "default";
    default:
      return "outline";
  }
}

// --- Main Component ---
export default function FunctionalityTestCasesDetailsModal({ sheetId }: FunctionalityTestCasesDetailsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState<
    (typeof DUMMY_TEST_CASES)[0] | null
  >(DUMMY_TEST_CASES[0]);

  // Ensure we use the correct type from the Convex model
  const normalizedSheetId = sheetId as Id<"sheets">;
  const usersWithAccess = useQuery(api.myFunctions.getUsersWithAccess, {
    sheetId: normalizedSheetId,
  });

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)} className="relative">
        <ListChecks className="w-4 h-4 mr-2" />
        {(() => {
          const currentUser = usersWithAccess?.find((u) => u.isCurrentUser);
          const isQALeadOrOwner = currentUser?.role === "qa_lead" || currentUser?.role === "owner";
          
          return isQALeadOrOwner 
            ? "Please approve this now" 
            : "Need Approval for QA Lead/Owner Approval";
        })()}
        {DUMMY_TEST_CASES.length > 0 && (
          <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold text-white bg-red-500 rounded-full">
            {DUMMY_TEST_CASES.length}
          </span>
        )}
      </Button>

      <DetailsModal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="w-[92vw] h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3 border-b">
            <h2 className="text-lg font-semibold">Test Case Details</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="rounded-full flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-72 border-r bg-muted/20">
              <ScrollArea className="h-full p-4">
                <div className="space-y-2">
                  {DUMMY_TEST_CASES.map((testCase) => (
                    <Card
                      key={testCase.id}
                      className={`cursor-pointer transition-colors hover:bg-accent ${
                        selectedTestCase?.id === testCase.id
                          ? "bg-accent border-primary"
                          : ""
                      }`}
                      onClick={() => setSelectedTestCase(testCase)}
                    >
                      <CardHeader className="p-3">
                        <CardTitle className="text-sm font-medium">
                          {testCase.id}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {testCase.title}
                        </p>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <ScrollArea className="h-full">
                {selectedTestCase ? (
                  <div className="p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <p className="text-sm text-muted-foreground">
                        {selectedTestCase.id}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon">
                          <Share2 className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold mb-6">
                      {selectedTestCase.title}
                    </h3>

                    {/* Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Left */}
                      <div className="lg:col-span-2 space-y-8">
                        {/* Module Hierarchy */}
                        <ContentSection title="Module Hierarchy">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Layers3 className="w-4 h-4 mt-0.5 self-start flex-shrink-0" />
                            <div>
                              {selectedTestCase.module} /{" "}
                              {selectedTestCase.subModule}
                            </div>
                          </div>
                        </ContentSection>

                        {/* Test Case Level and Scenario */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-muted-foreground">Test Characteristics</h4>
                          <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-muted-foreground">LEVEL:</span>
                              <Badge variant={getLevelVariant(selectedTestCase.level)}>
                                {selectedTestCase.level}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-muted-foreground">SCENARIO:</span>
                              <Badge variant="outline">
                                {selectedTestCase.scenario}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Status badges */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-muted-foreground">Status Overview</h4>
                          <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-muted-foreground">TESTING STATUS:</span>
                              <Badge variant={getStatusVariant(selectedTestCase.status)}>
                                {selectedTestCase.status}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <ContentSection title="Pre Conditions">
                          <p className="whitespace-pre-wrap text-muted-foreground">
                            {selectedTestCase.preConditions}
                          </p>
                        </ContentSection>

                        <ContentSection title="Test Steps">
                          <p className="whitespace-pre-wrap text-muted-foreground">
                            {selectedTestCase.steps}
                          </p>
                        </ContentSection>

                        <ContentSection title="Expected Results">
                          <p className="whitespace-pre-wrap text-muted-foreground">
                            {selectedTestCase.expectedResults}
                          </p>
                        </ContentSection>
                      </div>

                      {/* Right */}
                      <div className="lg:col-span-1 space-y-6">
                        <Button className="w-full justify-between">
                          {selectedTestCase.workflowStatus}
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                        <div className="p-4 border rounded-lg space-y-4">
                          <h4 className="text-base font-semibold">Details</h4>
                          <MetadataField label="Created By">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />{" "}
                              {selectedTestCase.createdBy}
                            </div>
                          </MetadataField>
                          <MetadataField label="Executed By">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />{" "}
                              {selectedTestCase.executedBy}
                            </div>
                          </MetadataField>
                          <MetadataField label="Created At">
                            <p>{selectedTestCase.createdAt}</p>
                          </MetadataField>
                          <MetadataField label="Jira User Story">
                            <p className="text-primary font-medium">
                              {selectedTestCase.jiraUserStory}
                            </p>
                          </MetadataField>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">
                      Select a test case to view details
                    </p>
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </div>
      </DetailsModal>
    </>
  );
}