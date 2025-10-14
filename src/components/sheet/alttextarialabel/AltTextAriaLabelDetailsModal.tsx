// src/components/sheet/alttextarialabel/AltTextAriaLabelDetailsModal.tsx

import { api } from "../../../../convex/_generated/api";
import { User, Layers3, Link } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { ContentSection } from "@/components/ui/mod/ModalHelpers";
import ApprovalDetailsModal, {
  getStatusVariant,
} from "../common/ApprovalDetailsModal";

interface AltTextAriaLabelDetailsModalProps {
  sheetId: string;
}

// --- 1. Render Function for the Sidebar Card ---
// This function defines how each item in the sidebar list looks.
const renderSidebarItem = (testCase: any, index: number) => (
  <CardHeader className="p-3">
    <div className="flex items-center gap-2 mb-1">
      <span className="text-xs font-semibold text-primary">
        TC_{String(index + 1).padStart(3, "0")}
      </span>
      <Badge variant={getStatusVariant(testCase.workflowStatus)}>
        {testCase.workflowStatus}
      </Badge>
    </div>
    <CardTitle className="text-sm font-medium mb-1">
      {testCase.pageSection || "Unnamed Section"}
    </CardTitle>
    <p className="text-xs text-muted-foreground line-clamp-1">
      {testCase.moduleName}
    </p>
    <p className="text-xs text-muted-foreground mt-1">
      Created by: {testCase.createdByName || "N/A"}
    </p>
  </CardHeader>
);

// --- 2. Render Function for the Main Details View ---
// This function defines the main content area when a test case is selected.
const renderDetailsView = (selectedTestCase: any) => (
  <div className="lg:col-span-2 space-y-8">
    <h3 className="text-2xl font-bold -mb-2">
      {selectedTestCase.pageSection}
    </h3>

    <ContentSection title="Module Hierarchy">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Layers3 className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <div>
          {selectedTestCase.moduleName} / {selectedTestCase.subModule} /{" "}
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
          <Badge variant={getStatusVariant(selectedTestCase.testingStatus)}>
            {selectedTestCase.testingStatus}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground">
            SE IMPLEMENTATION:
          </span>
          <Badge variant={getStatusVariant(selectedTestCase.seImplementation)}>
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
          <h5 className="font-semibold mb-2">Images/Icons</h5>
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
          <h5 className="font-semibold mb-2">Alt Text / Aria Label</h5>
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
          <span className="break-all">{selectedTestCase.wireframeLink}</span>
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
);

// --- 3. The Refactored Component ---
// This now acts as a simple wrapper, providing the specific configuration
// to the generic ApprovalDetailsModal component.
export default function AltTextAriaLabelDetailsModal({
  sheetId,
}: AltTextAriaLabelDetailsModalProps) {
  return (
    <ApprovalDetailsModal
      sheetId={sheetId}
      modalTitle="Alt Text & Aria Label Details"
      creationTimeField="_creationTime"
      useTestCasesQuery={
        api.myFunctions.getAltTextAriaLabelTestCasesByWorkflowStatus
      }
      approveMutation={
        api.myFunctions.updateAltTextAriaLabelWorkflowStatusToApproved
      }
      declineMutation={
        api.myFunctions.updateAltTextAriaLabelWorkflowStatusToDeclined
      }
      requestRevisionMutation={
        api.myFunctions.updateAltTextAriaLabelWorkflowStatusToNeedsRevision
      }
      renderSidebarItem={renderSidebarItem}
      renderDetailsView={renderDetailsView}
    />
  );
}