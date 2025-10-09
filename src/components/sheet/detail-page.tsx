// src/components/sheet/detail-page.tsx

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useNavigate, useParams } from "react-router-dom"; 

import { isAltTextTestCase, isFunctionalityTestCase } from "@/utils/typeGuards";
import { AltTextAriaLabelTable } from "./alttextarialabel/AltTextAriaLabelTable";
import { FunctionalityTestCasesTable } from "./functionality/FunctionalityTestCasesTable"; 
import { Header } from "./Header";
import { AccessRequest } from "./access-request";
import { WorkflowStatus } from "./common/WorkflowStatusBadge"; 
import { Doc } from "convex/_generated/dataModel";

type SheetType = "altTextAriaLabel" | "functionality";

// ✅ NEW: Define proper types for test cases with extended properties
type FunctionalityTestCaseWithDetails = Doc<"functionalityTestCases"> & {
  createdByName: string;
  executedByName: string;
  sequenceNumber: number;
  rowHeight?: number;
  createdAt: number;
  workflowStatus: WorkflowStatus;
  moduleName: string;
};

type AltTextTestCaseWithDetails = Doc<"altTextAriaLabelTestCases"> & {
  createdByName: string;
  executedByName: string;
  sequenceNumber: number;
  rowHeight?: number;
  createdAt: number;
  workflowStatus: WorkflowStatus;
  moduleName: string;
};

export function DetailPage() {
  const navigate = useNavigate();
  const { sheetId } = useParams(); 

  const [activeWorkflowStatus, setActiveWorkflowStatus] = useState<WorkflowStatus>("Open"); 
  
  const queryResult = useQuery(
    api.myFunctions.getTestCasesForSheet,
    sheetId ? { sheetId } : "skip", 
  );

  const modules = useQuery(
    api.myFunctions.getModulesForSheet,
    sheetId ? { sheetId: sheetId as Doc<"sheets">["_id"] } : "skip",
  ) as Doc<"modules">[] | undefined; 

  const onBack = () => { 
    void navigate("/");
  };
  
  if (queryResult === undefined || modules === undefined) { 
    return <div className="p-4 text-center">Loading sheet...</div>; 
  }

  if (queryResult && typeof queryResult === 'object' && 'accessDenied' in queryResult) {
    if (queryResult.requiresAuth) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Sign in required</h2>
            <p className="text-gray-600 mb-6">
              You need to sign in to access this sheet. 
            </p>
            <button
              onClick={() => navigate("/signin")}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Sign in 
            </button>
          </div>
        </div>
      );
    }
    
    return <AccessRequest />; 
  }

  if (queryResult === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Sheet not found</h2>
          <p className="text-gray-600 mb-6">
            The sheet you're looking for doesn't exist or has been deleted. 
          </p>
          <button
            onClick={onBack}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Go back to dashboard
          </button>
        </div>
      </div>
    );
  }

  const { sheet, testCaseType, testCases } = queryResult; 

  // ✅ FIX: Properly type the filtered test cases
  const filteredTestCases = testCases.filter(
    (tc: FunctionalityTestCaseWithDetails | AltTextTestCaseWithDetails) => 
      tc.workflowStatus === activeWorkflowStatus 
  );
  
  const renderTable = () => { 
    if (!sheetId) {
      return <div className="p-4 text-center">Invalid sheet ID.</div>; 
    }

    if (testCaseType === "functionality") {
      // ✅ Type assertion with proper type
      const functionalityTestCases = filteredTestCases.filter(
        isFunctionalityTestCase
      ) as FunctionalityTestCaseWithDetails[];
      
      return (
        <FunctionalityTestCasesTable 
          testCases={functionalityTestCases}
          sheetId={sheetId}
          activeWorkflowStatus={activeWorkflowStatus}
          onWorkflowStatusChange={setActiveWorkflowStatus}
          modules={modules || []}
        />
      );
    } else if (testCaseType === "altTextAriaLabel") {
      // ✅ Type assertion with proper type
      const altTextTestCases = filteredTestCases.filter(
        isAltTextTestCase
      ) as AltTextTestCaseWithDetails[];
      
      return (
        <AltTextAriaLabelTable
          testCases={altTextTestCases}
          sheetId={sheetId}
          activeWorkflowStatus={activeWorkflowStatus}
          onWorkflowStatusChange={setActiveWorkflowStatus}
          modules={modules || []}
        />
      );
    }
    
    return ( 
      <div className="p-4 text-center">
        No test case type specified for this sheet.
      </div>
    );
  };

  return ( 
    <div className="bg-white min-h-screen font-sans">
      <Header 
          sheetName={sheet?.name} 
          onBack={onBack} 
          sheetId={sheetId!} 
          sheetType={testCaseType as SheetType}
      />
      <main className="flex-1 bg-white p-4">{renderTable()}</main>
    </div>
  );
}