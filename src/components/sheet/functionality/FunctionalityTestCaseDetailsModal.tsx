// src/components/sheet/functionality/FunctionalityTestCaseDetailsModal.tsx

import { useState, useEffect } from "react";
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
import { useQuery, useMutation } from "convex/react"; 
import { Id } from "convex/_generated/dataModel";

interface FunctionalityTestCasesDetailsModalProps {
  sheetId: string;
}

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
    case "Needs revision":
      return "secondary";
    case "Declined":
        return "outline";
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
  const [selectedTestCase, setSelectedTestCase] = useState<any | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Initialize mutation hooks
  const approveTestCase = useMutation(api.myFunctions.updateFunctionalityWorkflowStatusToApproved);
  const declineTestCase = useMutation(api.myFunctions.updateFunctionalityWorkflowStatusToDeclined);
  const needsRevisionTestCase = useMutation(api.myFunctions.updateFunctionalityWorkflowStatusToNeedsRevision);

  const normalizedSheetId = sheetId as Id<"sheets">;
  
  // Fetch users with access to determine role
  const usersWithAccess = useQuery(api.myFunctions.getUsersWithAccess, {
    sheetId: normalizedSheetId,
  });

  // Fetch test cases awaiting approval
  const testCasesData = useQuery(
    api.myFunctions.getFunctionalityTestCasesByWorkflowStatus,
    { 
      sheetId,
      status: "Waiting for QA Lead Approval"
    }
  );

  const testCases = testCasesData?.testCases || [];
  
  // Set the first test case as selected when modal opens and data loads
  const handleOpen = () => {
    setIsOpen(true);
    setShowDetails(false);
    if (testCases.length > 0 && !selectedTestCase) {
      setSelectedTestCase(testCases[0]);
    }
  };

  // Handler to call the Convex mutation for Approval
  const handleApproveClick = async () => {
    if (!selectedTestCase) return;

    try {
      await approveTestCase({
        testCaseId: selectedTestCase._id,
      });

      alert('the test case is updated to "Approved"');
      setShowDetails(false); // NEW: Auto back to list

    } catch (error) {
      console.error("Failed to approve functionality test case:", error);
      alert("Error: Could not update functionality test case status.");
    }
  };

  // Handler to call the Convex mutation for Decline
  const handleDeclineClick = async () => {
    if (!selectedTestCase) return;

    try {
      await declineTestCase({
        testCaseId: selectedTestCase._id,
      });

      alert('the test case is updated to "Declined"');
      setShowDetails(false); // NEW: Auto back to list

    } catch (error) {
      console.error("Failed to decline functionality test case:", error);
      alert("Error: Could not update functionality test case status to Declined.");
    }
  };

  // Handler to call the Convex mutation for Needs Revision
  const handleNeedsRevisionClick = async () => {
    if (!selectedTestCase) return;

    try {
      await needsRevisionTestCase({
        testCaseId: selectedTestCase._id,
      });

      alert('the test case is updated to "Needs revision"');
      setShowDetails(false); // NEW: Auto back to list

    } catch (error) {
      console.error("Failed to set functionality test case to Needs revision:", error);
      alert("Error: Could not update functionality test case status to Needs revision.");
    }
  };

  // Update selected test case when test cases change
  useEffect(() => {
    if (testCases.length > 0 && !selectedTestCase) {
      setSelectedTestCase(testCases[0]);
    }
  }, [testCases, selectedTestCase]);

  // Determine current user's role
  const currentUser = usersWithAccess?.find((u) => u.isCurrentUser);
  const isQALeadOrOwner = currentUser?.role === "qa_lead" || currentUser?.role === "owner";

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleOpen} 
        className="relative"
        disabled={testCases.length === 0}
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
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3 border-b">
            <h2 className="text-lg font-semibold">Test Cases Awaiting Approval</h2>
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
            <div className={`w-full lg:w-72 border-r bg-muted/20 ${showDetails ? 'hidden' : 'block'} lg:block`}>
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
                        <CardHeader className="p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-primary">
                              TC_{String(index + 1).padStart(3, '0')}
                            </span>
                          </div>
                          <CardTitle className="text-sm font-medium mb-1">
                            {testCase.title}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {testCase.moduleName}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Created by: {testCase.createdByName}
                          </p>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Main Content */}
            <div className={`flex-1 min-w-0 ${showDetails ? 'block' : 'hidden'} lg:block`}>
              <ScrollArea className="h-full">
                {selectedTestCase ? (
                  <div className="p-8">
                    {/* Back button for mobile */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDetails(false)}
                      className="mb-4 lg:hidden"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Back to list
                    </Button>

                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <p className="text-sm text-muted-foreground">
                        Created {new Date(selectedTestCase.createdAt).toLocaleDateString()}
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
                              {selectedTestCase.moduleName}
                              {selectedTestCase.subModule && ` / ${selectedTestCase.subModule}`}
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
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-muted-foreground">WORKFLOW STATUS:</span>
                              <Badge variant={getStatusVariant(selectedTestCase.workflowStatus)}>
                                {selectedTestCase.workflowStatus}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {selectedTestCase.preConditions && (
                          <ContentSection title="Pre Conditions">
                            <p className="whitespace-pre-wrap text-muted-foreground">
                              {selectedTestCase.preConditions}
                            </p>
                          </ContentSection>
                        )}

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
                        {/* The Action Buttons (Approve, Needs Revision, Decline) */}
                        {isQALeadOrOwner && (
                          <div className="space-y-2">
                            <Button
                              className="w-full bg-green-600 hover:bg-green-700 text-white"
                              onClick={handleApproveClick}
                              disabled={selectedTestCase.workflowStatus === "Approved"}
                            >
                              Approved
                            </Button>
                            
                            <Button
                                variant="secondary"
                                className="w-full"
                                onClick={handleNeedsRevisionClick}
                                disabled={selectedTestCase.workflowStatus === "Needs revision"}
                            >
                                Needs Revision
                            </Button>

                            <Button
                                variant="destructive"
                                className="w-full"
                                onClick={handleDeclineClick}
                                disabled={selectedTestCase.workflowStatus === "Declined"}
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
                              <User className="w-4 h-4 text-muted-foreground" />
                              {selectedTestCase.createdByName}
                            </div>
                          </MetadataField>
                          <MetadataField label="Executed By">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              {selectedTestCase.executedByName}
                            </div>
                          </MetadataField>
                          <MetadataField label="Created At">
                            <p>{new Date(selectedTestCase.createdAt).toLocaleString()}</p>
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
                      {testCases.length === 0 
                        ? "No test cases awaiting approval"
                        : "Select a test case to view details"}
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