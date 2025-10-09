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
import { Doc } from "convex/_generated/dataModel"; // Import Doc type

type SheetType = "altTextAriaLabel" | "functionality";
export function DetailPage() {
  const navigate = useNavigate();
  const { sheetId } = useParams(); 
// State for managing the active workflow status filter
  const [activeWorkflowStatus, setActiveWorkflowStatus] = useState<WorkflowStatus>("Open"); 
  const queryResult = useQuery(
    api.myFunctions.getTestCasesForSheet,
    sheetId ? { sheetId } : "skip", 
  );
// =======================================================
// NEW: Fetch all modules for the current sheet using the new API
// =======================================================
  const modules = useQuery(
    api.myFunctions.getModulesForSheet, // This is the new query
    sheetId ? { sheetId: sheetId as Doc<"sheets">["_id"] } : "skip",
  ) as Doc<"modules">[] | undefined; 

  const onBack = () => { 
    void navigate("/");
  };
  
  // Wait for both queries to load
  // IMPORTANT: The `sheetId` must be cast to `Doc<"sheets">["_id"]` for the new query
  if (queryResult === undefined || modules === undefined) { 
    return <div className="p-4 text-center">Loading sheet...</div>; 
  }

  // Check if the result indicates access denied 
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

  // Handle null case (sheet not found) 
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
// Filter test cases based on the active workflow status
  const filteredTestCases = testCases.filter(
    (tc: any) => tc.workflowStatus === activeWorkflowStatus 
  );
  
  const renderTable = () => { 
    if (!sheetId) {
      return <div className="p-4 text-center">Invalid sheet ID.</div>; 
    }

    if (testCaseType === "functionality") {
      const functionalityTestCases = filteredTestCases.filter(isFunctionalityTestCase); 
      return (
        <FunctionalityTestCasesTable 
          testCases={functionalityTestCases}
          sheetId={sheetId}
          activeWorkflowStatus={activeWorkflowStatus}
          onWorkflowStatusChange={setActiveWorkflowStatus}
          modules={modules || []} // Pass modules
        />
      );
    } else if (testCaseType === "altTextAriaLabel") {
      const altTextTestCases = filteredTestCases.filter(isAltTextTestCase); 
      return (
        <AltTextAriaLabelTable
          testCases={altTextTestCases}
          sheetId={sheetId}
          activeWorkflowStatus={activeWorkflowStatus}
          onWorkflowStatusChange={setActiveWorkflowStatus}
          modules={modules || []} // Pass modules
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