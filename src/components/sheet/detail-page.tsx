// src/sheet/detail-page.tsx

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useNavigate, useParams } from "react-router-dom";

// Component imports
import { isAltTextTestCase, isFunctionalityTestCase } from "@/utils/typeGuards";
import { AltTextAriaLabelTable } from "./AltTextAriaLabelTable";
import { FunctionalityTestCasesTable } from "./FunctionalityTestCasesTable";
import { Header } from "./Header";

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

  if (queryResult === null) {
    return <div className="p-4 text-center">Sheet not found.</div>;
  }

  const { sheet, testCaseType, testCases } = queryResult;

  const renderTable = () => {
    // Add null check for sheetId
    if (!sheetId) {
      return <div className="p-4 text-center">Invalid sheet ID.</div>;
    }

    if (testCaseType === "functionality") {
      const functionalityTestCases = testCases.filter(isFunctionalityTestCase);
      return (
        <FunctionalityTestCasesTable 
          testCases={functionalityTestCases}
          sheetId={sheetId}  // Pass sheetId here
        />
      );
    } else if (testCaseType === "altTextAriaLabel") {
      const altTextTestCases = testCases.filter(isAltTextTestCase);
      return <AltTextAriaLabelTable testCases={altTextTestCases} />;
    }
    return (
      <div className="p-4 text-center">
        No test case type specified for this sheet.
      </div>
    );
  };

  return (
    <div className="bg-white min-h-screen font-sans">
      <Header sheetName={sheet?.name} onBack={onBack} />
      <main className="flex-1 bg-white p-4">{renderTable()}</main>
    </div>
  );
}