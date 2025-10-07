// src/components/sheet/alttextarialabel/AltTextAriaLabelDetailsModal.tsx

import { useState } from "react";
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
  Link,
  ChevronDown
} from "lucide-react";

// --- Dummy Data ---
const DUMMY_TEST_CASES = [
  {
    id: "TC_001",
    workflowStatus: "Open",
    persona: "Admin",
    module: "User Management",
    subModule: "User Profile",
    pageSection: "Profile Header",
    wireframeLink: "https://figma.com/design/user-profile",
    imagesIcons: "https://placehold.co/150x150",
    altTextAriaLabel: "User avatar placeholder",
    remarks:
      "1. Ensure proper contrast ratio\n2. Test with screen readers\n3. Verify keyboard navigation",
    seImplementation: "Done",
    actualResults:
      "1. Alt text properly announced\n2. ARIA labels correctly set\n3. Focus indicators visible",
    testingStatus: "Passed",
    notes:
      "1. All accessibility checks passed\n2. Works well with NVDA and JAWS\n3. Mobile testing completed",
    jiraUserStory: "US-1234",
    createdBy: "John Doe",
    executedBy: "Jane Smith",
    createdAt: "2025-10-01"
  },
  {
    id: "TC_002",
    workflowStatus: "In Progress",
    persona: "User",
    module: "Dashboard",
    subModule: "Analytics Widget",
    pageSection: "Chart Section",
    wireframeLink: "https://figma.com/design/dashboard-analytics",
    imagesIcons: "https://placehold.co/150x150",
    altTextAriaLabel: "Analytics bar chart placeholder",
    remarks:
      "1. Complex data visualization\n2. Multiple interactive elements\n3. Requires detailed descriptions",
    seImplementation: "Ongoing",
    actualResults:
      "1. Chart description needs improvement\n2. Download button accessible\n3. Filter controls working",
    testingStatus: "Failed",
    notes:
      "1. Chart needs more descriptive alt text\n2. Consider adding data table alternative\n3. Retest after fixes",
    jiraUserStory: "US-2345",
    createdBy: "Jane Smith",
    executedBy: "Mike Johnson",
    createdAt: "2025-10-02"
  },
  {
    id: "TC_003",
    workflowStatus: "Open",
    persona: "Super Admin",
    module: "Settings",
    subModule: "System Configuration",
    pageSection: "Security Settings",
    wireframeLink: "https://figma.com/design/security-settings",
    imagesIcons: "https://placehold.co/150x150",
    altTextAriaLabel: "Security lock icon placeholder",
    remarks:
      "1. Critical security features\n2. Must be fully accessible\n3. Clear warning messages needed",
    seImplementation: "Not yet",
    actualResults: "",
    testingStatus: "Not Run",
    notes:
      "1. Pending implementation\n2. High priority for next sprint\n3. Coordinate with security team",
    jiraUserStory: "US-3456",
    createdBy: "Mike Johnson",
    executedBy: "N/A",
    createdAt: "2025-10-03"
  },
  {
    id: "TC_004",
    workflowStatus: "Approved",
    persona: "Employee",
    module: "Time Tracking",
    subModule: "Timesheet Entry",
    pageSection: "Time Entry Form",
    wireframeLink: "https://figma.com/design/timesheet",
    imagesIcons: "https://placehold.co/150x150",
    altTextAriaLabel: "Clock icon for time tracking",
    remarks:
      "1. Form validation required\n2. Error messages must be accessible\n3. Success confirmation needed",
    seImplementation: "Done",
    actualResults:
      "1. All form fields properly labeled\n2. Error messages announced correctly\n3. Success message accessible",
    testingStatus: "Passed",
    notes:
      "1. Excellent accessibility implementation\n2. No issues found during testing\n3. Ready for production",
    jiraUserStory: "US-4567",
    createdBy: "Sarah Williams",
    executedBy: "David Brown",
    createdAt: "2025-10-04"
  },
  {
    id: "TC_005",
    workflowStatus: "In Review",
    persona: "Manager",
    module: "Reports",
    subModule: "Team Performance",
    pageSection: "Performance Metrics",
    wireframeLink:
      "https://figma.com/design/team-performance-metrics-and-other-long-links",
    imagesIcons: "https://placehold.co/150x150",
    altTextAriaLabel: "Team performance graph placeholder",
    remarks:
      "1. Data-heavy interface\n2. Multiple chart types\n3. Export functionality critical",
    seImplementation: "Has Concerns",
    actualResults:
      "1. Graph description too generic\n2. Export button works well\n3. Print preview accessible",
    testingStatus: "Blocked",
    notes:
      "1. Waiting for design clarification\n2. Graph alt text needs stakeholder input\n3. On hold until next review",
    jiraUserStory: "US-5678",
    createdBy: "David Brown",
    executedBy: "Sarah Williams",
    createdAt: "2025-10-05"
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

// --- Main Component ---
export default function AltTextAriaLabelDetailsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState<
    (typeof DUMMY_TEST_CASES)[0] | null
  >(DUMMY_TEST_CASES[0]);

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        <ListChecks className="w-4 h-4 mr-2" />
        View AltTextAriaLabelDetailsModal Test Cases Details
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
                          {testCase.module}
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
                      {selectedTestCase.subModule}
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
                              {selectedTestCase.subModule} /{" "}
                              {selectedTestCase.pageSection}
                            </div>
                          </div>
                        </ContentSection>

                        <ContentSection title="Persona">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Layers3 className="w-4 h-4 mt-0.5 self-start flex-shrink-0" />
                            <div>
                              {selectedTestCase.persona}
                            </div>
                          </div>
                        </ContentSection>

                        {/* Status badges in one line */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-muted-foreground">Status Overview</h4>
                          <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-muted-foreground">TESTING STATUS:</span>
                              <Badge variant={getStatusVariant(selectedTestCase.testingStatus)}>
                                {selectedTestCase.testingStatus}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-muted-foreground">SE IMPLEMENTATION:</span>
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
                              <h5 className="font-semibold mb-2">
                                Images/Icons
                              </h5>
                              <img
                                src={selectedTestCase.imagesIcons}
                                alt={selectedTestCase.altTextAriaLabel}
                                className="rounded-md border object-cover w-full h-32"
                              />
                            </div>
                            <div>
                              <h5 className="font-semibold mb-2">
                                Alt Text/Aria Label
                              </h5>
                              <p className="whitespace-pre-wrap text-muted-foreground">
                                {selectedTestCase.altTextAriaLabel}
                              </p>
                            </div>
                          </div>
                        </ContentSection>

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

                        {selectedTestCase.actualResults && (
                          <ContentSection title="Actual Results">
                            <p className="whitespace-pre-wrap text-muted-foreground">
                              {selectedTestCase.actualResults}
                            </p>
                          </ContentSection>
                        )}

                        <ContentSection title="Notes">
                          <p className="whitespace-pre-wrap text-muted-foreground">
                            {selectedTestCase.notes}
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