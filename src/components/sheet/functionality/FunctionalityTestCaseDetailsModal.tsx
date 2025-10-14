//  src/components/sheet/functionality/FunctionalityTestCaseDetailsModal.tsx

import { api } from "../../../../convex/_generated/api";
import { Layers3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { ContentSection } from "@/components/ui/mod/ModalHelpers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ApprovalDetailsModal, {
  getStatusVariant,
} from "../common/modal/ApprovalDetailsModal";
import StatusHistoryTimeline from "../common/StatusHistoryTimeline";

interface FunctionalityTestCasesDetailsModalProps {
  sheetId: string;
}

// --- Helper specific to this modal ---
function getLevelVariant(
  level: string
): "default" | "secondary" | "destructive" | "outline" {
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

// --- 1. Render Function for the Sidebar Card ---
const renderSidebarItem = (testCase: any, index: number) => (
  <CardHeader className="p-3">
    <div className="flex items-center gap-2 mb-1">
      <span className="text-xs font-semibold text-primary">
        TC_{String(index + 1).padStart(3, "0")}
      </span>
    </div>
    <CardTitle className="text-sm font-medium mb-1">{testCase.title}</CardTitle>
    <p className="text-xs text-muted-foreground line-clamp-1">
      {testCase.moduleName}
    </p>
    <p className="text-xs text-muted-foreground mt-1">
      Created by: {testCase.createdByName}
    </p>
  </CardHeader>
);

// --- 2. Render Function for the Main Details View ---
const renderDetailsView = (selectedTestCase: any) => (
  <div className="lg:col-span-2 space-y-8">
    <h3 className="text-2xl font-bold mb-1">{selectedTestCase.title}</h3>

    <Tabs defaultValue="details" className="w-full">
      <TabsList className="w-full grid grid-cols-2">
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="history">Status History</TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="space-y-8 mt-6">
        <ContentSection title="Module Hierarchy">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Layers3 className="w-4 h-4 mt-0.5 self-start flex-shrink-0" />
            <div>
              {selectedTestCase.moduleName}
              {selectedTestCase.subModule && ` / ${selectedTestCase.subModule}`}
            </div>
          </div>
        </ContentSection>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground">
            Test Characteristics
          </h4>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground">
                LEVEL:
              </span>
              <Badge variant={getLevelVariant(selectedTestCase.level)}>
                {selectedTestCase.level}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground">
                SCENARIO:
              </span>
              <Badge variant="outline">{selectedTestCase.scenario}</Badge>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground">
            Status Overview
          </h4>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground">
                TESTING STATUS:
              </span>
              <Badge variant={getStatusVariant(selectedTestCase.status)}>
                {selectedTestCase.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground">
                WORKFLOW STATUS:
              </span>
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
      </TabsContent>

      <TabsContent value="history" className="mt-6">
        <StatusHistoryTimeline />
      </TabsContent>
    </Tabs>
  </div>
);

// --- 3. The Refactored Component ---
export default function FunctionalityTestCasesDetailsModal({
  sheetId,
}: FunctionalityTestCasesDetailsModalProps) {
  return (
    <ApprovalDetailsModal
      sheetId={sheetId}
      modalTitle="Functionality Test Cases"
      creationTimeField="createdAt"
      useTestCasesQuery={
        api.myFunctions.getFunctionalityTestCasesByWorkflowStatus
      }
      approveMutation={api.myFunctions.updateFunctionalityWorkflowStatusToApproved}
      declineMutation={api.myFunctions.updateFunctionalityWorkflowStatusToDeclined}
      requestRevisionMutation={
        api.myFunctions.updateFunctionalityWorkflowStatusToNeedsRevision
      }
      renderSidebarItem={renderSidebarItem}
      renderDetailsView={renderDetailsView}
    />
  );
}