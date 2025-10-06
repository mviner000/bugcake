// src/sheet/detail-page.tsx
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useNavigate, useParams } from "react-router-dom";

import { isAltTextTestCase, isFunctionalityTestCase } from "@/utils/typeGuards";
import { AltTextAriaLabelTable } from "./AltTextAriaLabelTable";
import { FunctionalityTestCasesTable } from "./FunctionalityTestCasesTable";
import { Header } from "./Header";
import { AccessRequest } from "./access-request";

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
    return <AccessRequest />;
  }

  // Handle null case (sheet not found)
  if (queryResult === null) {
    return <AccessRequest />;
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
      <Header sheetName={sheet?.name} onBack={onBack} sheetId={sheetId!} />
      <main className="flex-1 bg-white p-4">{renderTable()}</main>
    </div>
  );
}