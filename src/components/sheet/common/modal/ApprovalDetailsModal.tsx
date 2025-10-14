import { useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation } from "convex/react";
import { Id } from "convex/_generated/dataModel";
import { api } from "../../../../../convex/_generated/api";
import {
  X,
  User,
  MoreHorizontal,
  Share2,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DetailsModal } from "@/components/ui/mod/DetailsModal";
import { MetadataField } from "@/components/ui/mod/ModalHelpers";
import { ApprovalButtons } from "../ApprovalButtons";
import { ApprovalBadgeButton } from "../ApprovalBadgeButton";

// --- Props Interface ---
interface ApprovalDetailsModalProps {
  sheetId: string;
  modalTitle: string;
  creationTimeField: string; // The key for the creation timestamp, e.g., "_creationTime" or "createdAt"
  useTestCasesQuery: any; // The Convex query hook for fetching test cases
  approveMutation: any; // The Convex mutation for approval
  declineMutation: any; // The Convex mutation for declining
  requestRevisionMutation: any; // The Convex mutation for requesting revision
  renderSidebarItem: (item: any, index: number) => ReactNode; // Function to render the content of each sidebar card
  renderDetailsView: (item: any) => ReactNode; // Function to render the main details view (left column)
}

// --- Helper (remains inside as it's used by the component's internal logic) ---
export function getStatusVariant(
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
    case "Needs revision":
      return "secondary";
    case "Declined":
      return "outline";
    default:
      return "outline";
  }
}

// --- Main Generic Component ---
export default function ApprovalDetailsModal({
  sheetId,
  modalTitle,
  creationTimeField,
  useTestCasesQuery,
  approveMutation,
  declineMutation,
  requestRevisionMutation,
  renderSidebarItem,
  renderDetailsView,
}: ApprovalDetailsModalProps) {
  // --- STATE MANAGEMENT (Shared) ---
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState<any | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // --- CONVEX HOOKS (Made Generic via Props) ---
  const approveTestCase = useMutation(approveMutation);
  const declineTestCase = useMutation(declineMutation);
  const requestRevision = useMutation(requestRevisionMutation);

  const normalizedSheetId = sheetId as Id<"sheets">;
  const usersWithAccess = useQuery(api.myFunctions.getUsersWithAccess, {
    sheetId: normalizedSheetId,
  });

  const testCasesData = useQuery(useTestCasesQuery, {
    sheetId,
    status: "Waiting for QA Lead Approval",
  });
  const testCases = testCasesData?.testCases || [];

  // --- EVENT HANDLERS (Shared) ---
  const handleOpen = () => {
    setIsOpen(true);
    setShowDetails(false);
    if (testCases.length > 0 && !selectedTestCase) {
      setSelectedTestCase(testCases[0]);
    }
  };

  const handleApproveClick = async () => {
    if (!selectedTestCase) return;
    try {
      await approveTestCase({ testCaseId: selectedTestCase._id });
      alert('The test case status has been updated to "Approved".');
      setShowDetails(false);
    } catch (error) {
      console.error("Failed to approve test case:", error);
      alert("Error: Could not update test case status.");
    }
  };

  const handleDeclineClick = async () => {
    if (!selectedTestCase) return;
    try {
      await declineTestCase({ testCaseId: selectedTestCase._id });
      alert('The test case status has been updated to "Declined".');
      setShowDetails(false);
    } catch (error) {
      console.error("Failed to decline test case:", error);
      alert("Error: Could not update test case status.");
    }
  };

  const handleRequestRevisionClick = async () => {
    if (!selectedTestCase) return;
    try {
      await requestRevision({ testCaseId: selectedTestCase._id });
      alert('The test case status has been updated to "Needs revision".');
      setShowDetails(false);
    } catch (error) {
      console.error("Failed to request revision for test case:", error);
      alert("Error: Could not update test case status.");
    }
  };

  // --- EFFECT (Shared) ---
  useEffect(() => {
    if (testCases.length > 0 && !selectedTestCase) {
      setSelectedTestCase(testCases[0]);
    }
  }, [testCases, selectedTestCase]);

  // --- ROLE-BASED LOGIC (Shared) ---
  const currentUser = usersWithAccess?.find((u) => u.isCurrentUser);
  const isQALeadOrOwner =
    currentUser?.role === "qa_lead" || currentUser?.role === "owner";

  // --- JSX STRUCTURE (Shared with configurable slots) ---
  return (
    <>
      <ApprovalBadgeButton
        count={testCases.length}
        isQALeadOrOwner={isQALeadOrOwner}
        onClick={handleOpen}
      />

      <DetailsModal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="w-[92vw] h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3 border-b">
            <h2 className="text-lg font-semibold">{modalTitle}</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="rounded-full flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div
              className={`w-full lg:w-72 border-r bg-muted/20 ${
                showDetails ? "hidden" : "block"
              } lg:block`}
            >
              <ScrollArea className="h-full p-4">
                {testCases.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                    No test cases awaiting approval
                  </div>
                ) : (
                  <div className="space-y-2">
                    {testCases.map((testCase: any, index: number) => (
                      <Card
                        key={testCase._id}
                        className={`cursor-pointer transition-colors hover:bg-accent ${
                          selectedTestCase?._id === testCase._id
                            ? "bg-accent border-primary"
                            : ""
                        }`}
                        onClick={() => {
                          setSelectedTestCase(testCase);
                          setShowDetails(true);
                        }}
                      >
                        {/* RENDER PROP for sidebar item content */}
                        {renderSidebarItem(testCase, index)}
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Main Content */}
            <div
              className={`flex-1 min-w-0 ${
                showDetails ? "block" : "hidden"
              } lg:block`}
            >
              <ScrollArea className="h-full">
                {selectedTestCase ? (
                  <div className="p-8">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDetails(false)}
                      className="mb-4 lg:hidden"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Back to list
                    </Button>

                    <div className="flex items-center justify-between mb-6">
                      <p className="text-sm text-muted-foreground">
                        Created{" "}
                        {selectedTestCase[creationTimeField]
                          ? new Date(
                              selectedTestCase[creationTimeField]
                            ).toLocaleDateString()
                          : "N/A"}
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

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* RENDER PROP for main details view */}
                      {renderDetailsView(selectedTestCase)}

                      {/* Right Column (Shared) */}
                      <div className="lg:col-span-1 space-y-6">
                        {isQALeadOrOwner && (
                          <ApprovalButtons
                            onApprove={handleApproveClick}
                            onRequestRevision={handleRequestRevisionClick}
                            onDecline={handleDeclineClick}
                            workflowStatus={selectedTestCase.workflowStatus}
                          />
                        )}

                        <Button className="w-full justify-between">
                          {selectedTestCase.workflowStatus}
                          <ChevronDown className="w-4 h-4" />
                        </Button>

                        <div className="p-4 border rounded-lg space-y-4">
                          <h4 className="text-base font-semibold">Details</h4>
                          <MetadataField label="Created By">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              {selectedTestCase.createdByName || "N/A"}
                            </div>
                          </MetadataField>
                          <MetadataField label="Executed By">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              {selectedTestCase.executedByName || "N/A"}
                            </div>
                          </MetadataField>
                          <MetadataField label="Created At">
                            <p>
                              {selectedTestCase[creationTimeField]
                                ? new Date(
                                    selectedTestCase[creationTimeField]
                                  ).toLocaleString()
                                : "N/A"}
                            </p>
                          </MetadataField>
                          {selectedTestCase.jiraUserStory && (
                            <MetadataField label="Jira User Story">
                              <p className="text-primary font-medium">
                                {selectedTestCase.jiraUserStory}
                              </p>
                            </MetadataField>
                          )}
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