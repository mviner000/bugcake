// src/components/sheet/detail-page.tsx
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useNavigate, useParams } from "react-router-dom";

import { isAltTextTestCase, isFunctionalityTestCase } from "@/utils/typeGuards";
import { AltTextAriaLabelTable } from "./alttextarialabel/AltTextAriaLabelTable";
import { FunctionalityTestCasesTable } from "./functionality/FunctionalityTestCasesTable";
import { Header } from "./Header";
import { AccessRequest } from "./access-request";

// 💡 FIX 1: Explicitly define the SheetType here to resolve the type error when 
// passing testCaseType to the Header component.
type SheetType = "altTextAriaLabel" | "functionality";

export function DetailPage() {
  const navigate = useNavigate();
  const { sheetId } = useParams();

  const queryResult = useQuery(
    api.myFunctions.getTestCasesForSheet,
    sheetId ? { sheetId } : "skip",
  );

  const onBack = () => {
    void navigate("/");
  };

  if (queryResult === undefined) {
    return <div className="p-4 text-center">Loading sheet...</div>;
  }

  // ✅ Check if the result indicates access denied
  if (queryResult && typeof queryResult === 'object' && 'accessDenied' in queryResult) {
    // Show sign-in prompt for unauthenticated users
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
    
    // Show access request for authenticated users without permission
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

  const renderTable = () => {
    if (!sheetId) {
      return <div className="p-4 text-center">Invalid sheet ID.</div>;
    }

    if (testCaseType === "functionality") {
      const functionalityTestCases = testCases.filter(isFunctionalityTestCase);
      return (
        <FunctionalityTestCasesTable 
          testCases={functionalityTestCases}
          sheetId={sheetId}
        />
      );
    } else if (testCaseType === "altTextAriaLabel") {
      const altTextTestCases = testCases.filter(isAltTextTestCase);
      return (
        <AltTextAriaLabelTable
          testCases={altTextTestCases}
          sheetId={sheetId}
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
          sheetType={testCaseType as SheetType} // ✅ FIX 2: Use a type assertion to match the required prop type
      />
      <main className="flex-1 bg-white p-4">{renderTable()}</main>
    </div>
  );
}