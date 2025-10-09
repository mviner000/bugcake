// old src/components/sheet/alttextarialabel/AltTextAriaLabelDetailsModal.tsx

import { useState, useEffect } from "react";
import { api } from "../../../../convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { Id } from "convex/_generated/dataModel";
import {
  ListChecks,
  X,
  User,
  Layers3,
  MoreHorizontal,
  Share2,
  Link,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DetailsModal } from "@/components/ui/mod/DetailsModal";
import { ContentSection, MetadataField } from "@/components/ui/mod/ModalHelpers";

interface AltTextAriaLabelDetailsModalProps {
  sheetId: string;
}

// --- Helper ---
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
    case "Needs revision":
      return "secondary";
    case "Declined":
      return "outline";
    default:
      return "outline";
  }
}

// --- Main Component ---
export default function AltTextAriaLabelDetailsModal({
  sheetId,
}: AltTextAriaLabelDetailsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState<any | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const approveTestCase = useMutation(
    api.myFunctions.updateAltTextAriaLabelWorkflowStatusToApproved
  );
  const declineTestCase = useMutation(
    api.myFunctions.updateAltTextAriaLabelWorkflowStatusToDeclined
  );
  const requestRevision = useMutation(
    api.myFunctions.updateAltTextAriaLabelWorkflowStatusToNeedsRevision
  );

  const normalizedSheetId = sheetId as Id<"sheets">;

  const usersWithAccess = useQuery(api.myFunctions.getUsersWithAccess, {
    sheetId: normalizedSheetId,
  });

  const testCasesData = useQuery(
    api.myFunctions.getAltTextAriaLabelTestCasesByWorkflowStatus,
    {
      sheetId,
      status: "Waiting for QA Lead Approval",
    }
  );
  const testCases = testCasesData?.testCases || [];

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
      await approveTestCase({
        testCaseId: selectedTestCase._id,
      });
      alert('the test case is updated to "Approved"');
      setShowDetails(false);
    } catch (error) {
      console.error("Failed to approve test case:", error);
      alert("Error: Could not update test case status.");
    }
  };

  const handleDeclineClick = async () => {
    if (!selectedTestCase) return;
    try {
      await declineTestCase({
        testCaseId: selectedTestCase._id,
      });
      alert("the test case is updated");
      setShowDetails(false);
    } catch (error) {
      console.error("Failed to decline test case:", error);
      alert("Error: Could not update test case status to Declined.");
    }
  };

  const handleRequestRevisionClick = async () => {
    if (!selectedTestCase) return;
    try {
      await requestRevision({
        testCaseId: selectedTestCase._id,
      });
      alert('the test case is updated to "Needs revision"');
      setShowDetails(false);
    } catch (error) {
      console.error("Failed to request revision for test case:", error);
      alert("Error: Could not update test case status to Needs revision.");
    }
  };

  useEffect(() => {
    if (testCases.length > 0 && !selectedTestCase) {
      setSelectedTestCase(testCases[0]);
    }
  }, [testCases, selectedTestCase]);

  const currentUser = usersWithAccess?.find((u) => u.isCurrentUser);
  const isQALeadOrOwner =
    currentUser?.role === "qa_lead" || currentUser?.role === "owner";

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpen}
        className="relative"
        disabled={!testCases || testCases.length === 0}
      >
        <ListChecks className="w-4 h-4 mr-2" />
        {isQALeadOrOwner
          ? "Please approve this now"
          : "Need Approval for QA Lead/Owner"}
        {testCases.length > 0 && (
          <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold text-white bg-red-500 rounded-full">
            {testCases.length}
          </span>
        )}
      </Button>

      <DetailsModal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="w-[92vw] h-[90vh] flex flex-col">
          <div className="flex items-center justify-between px-6 py-3 border-b">
            <h2 className="text-lg font-semibold">
              Alt Text & Aria Label Details
            </h2>
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
            <div
              className={`w-full lg:w-72 border-r bg-muted/20 ${
                showDetails ? "hidden" : "block"
              } lg:block`}
            >
              <ScrollArea className="h-full p-4">
                {!testCases || testCases.length === 0 ? (
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
                        <CardHeader className="p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-primary">
                              TC_{String(index + 1).padStart(3, "0")}
                            </span>
                            <Badge
                              variant={getStatusVariant(
                                testCase.workflowStatus
                              )}
                            >
                              {testCase.workflowStatus}
                            </Badge>
                          </div>
                          <CardTitle className="text-sm font-medium mb-1">
                            {testCase.pageSection || "Unnamed Section"}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {testCase.moduleName} {/* ✅ Changed from testCase.module */}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Created by: {testCase.createdByName || "N/A"}
                          </p>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

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
                        {selectedTestCase._creationTime
                          ? new Date(
                              selectedTestCase._creationTime
                            ).toLocaleDateString()
                          : ""}
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
                      {selectedTestCase.pageSection}
                    </h3>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2 space-y-8">
                        <ContentSection title="Module Hierarchy">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Layers3 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <div>
                              {selectedTestCase.moduleName} /{" "}
                              {selectedTestCase.subModule} /{" "}
                              {selectedTestCase.pageSection}
                            </div>
                          </div>
                        </ContentSection>

                        <ContentSection title="Persona">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <div>{selectedTestCase.persona}</div>
                          </div>
                        </ContentSection>

                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-muted-foreground">
                            Status Overview
                          </h4>
                          <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-muted-foreground">
                                TESTING STATUS:
                              </span>
                              <Badge
                                variant={getStatusVariant(
                                  selectedTestCase.testingStatus
                                )}
                              >
                                {selectedTestCase.testingStatus}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-muted-foreground">
                                SE IMPLEMENTATION:
                              </span>
                              <Badge
                                variant={getStatusVariant(
                                  selectedTestCase.seImplementation
                                )}
                              >
                                {selectedTestCase.seImplementation}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <ContentSection title="Remarks">
                          <p className="whitespace-pre-wrap text-muted-foreground">
                            {selectedTestCase.remarks}
                          </p>
                        </ContentSection>

                        <ContentSection title="Images, Icons & Alt Text">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                            <div>
                              <h5 className="font-semibold mb-2">
                                Images/Icons
                              </h5>
                              {selectedTestCase.imagesIcons ? (
                                <img
                                  src={selectedTestCase.imagesIcons}
                                  alt={selectedTestCase.altTextAriaLabel}
                                  className="rounded-md border object-cover w-full h-32"
                                />
                              ) : (
                                <p className="text-xs text-muted-foreground italic">
                                  No image provided
                                </p>
                              )}
                            </div>
                            <div>
                              <h5 className="font-semibold mb-2">
                                Alt Text / Aria Label
                              </h5>
                              <p className="whitespace-pre-wrap text-muted-foreground">
                                {selectedTestCase.altTextAriaLabel}
                              </p>
                            </div>
                          </div>
                        </ContentSection>

                        {selectedTestCase.wireframeLink && (
                          <ContentSection title="Wireframe">
                            <a
                              href={selectedTestCase.wireframeLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-primary hover:underline"
                            >
                              <Link className="w-4 h-4" />
                              <span className="break-all">
                                {selectedTestCase.wireframeLink}
                              </span>
                            </a>
                          </ContentSection>
                        )}

                        {selectedTestCase.actualResults && (
                          <ContentSection title="Actual Results">
                            <p className="whitespace-pre-wrap text-muted-foreground">
                              {selectedTestCase.actualResults}
                            </p>
                          </ContentSection>
                        )}

                        {selectedTestCase.notes && (
                          <ContentSection title="Notes">
                            <p className="whitespace-pre-wrap text-muted-foreground">
                              {selectedTestCase.notes}
                            </p>
                          </ContentSection>
                        )}
                      </div>

                      <div className="lg:col-span-1 space-y-6">
                        {isQALeadOrOwner && (
                          <div className="space-y-2">
                            <Button
                              className="w-full bg-green-600 hover:bg-green-700 text-white"
                              onClick={handleApproveClick}
                              disabled={
                                selectedTestCase.workflowStatus === "Approved"
                              }
                            >
                              Approved
                            </Button>

                            <Button
                              variant="secondary"
                              className="w-full"
                              onClick={handleRequestRevisionClick}
                              disabled={
                                selectedTestCase.workflowStatus ===
                                "Needs revision"
                              }
                            >
                              Need Revision
                            </Button>

                            <Button
                              variant="destructive"
                              className="w-full"
                              onClick={handleDeclineClick}
                              disabled={
                                selectedTestCase.workflowStatus === "Declined"
                              }
                            >
                              Decline
                            </Button>
                          </div>
                        )}

                        <Button className="w-full justify-between">
                          {selectedTestCase.workflowStatus}
                          <ChevronDown className="w-4 h-4" />
                        </Button>

                        <div className="p-4 border rounded-lg space-y-4">
                          <h4 className="text-base font-semibold">Details</h4>
                          <MetadataField label="Created By">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />{" "}
                              {selectedTestCase.createdByName || "N/A"}
                            </div>
                          </MetadataField>
                          <MetadataField label="Executed By">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />{" "}
                              {selectedTestCase.executedByName || "N/A"}
                            </div>
                          </MetadataField>
                          <MetadataField label="Created At">
                            <p>
                              {selectedTestCase._creationTime
                                ? new Date(
                                    selectedTestCase._creationTime
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
