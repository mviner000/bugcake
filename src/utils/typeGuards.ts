// src/utils/typeGuards.ts

import { Doc } from "../../convex/_generated/dataModel";

// Helper function to check if the testCase is a functionality type
export const isFunctionalityTestCase = (
  testCase: any,
): testCase is Doc<"functionalityTestCases"> & {
  createdByName: string;
  executedByName: string;
  sequenceNumber: number;
} => {
  return (testCase as Doc<"functionalityTestCases">).status !== undefined;
};

// Helper function to check if the testCase is an altTextAriaLabel type
export const isAltTextTestCase = (
  testCase: any,
): testCase is Doc<"altTextAriaLabelTestCases"> & {
  createdByName: string;
  executedByName: string;
  sequenceNumber: number;
} => {
  return (
    (testCase as Doc<"altTextAriaLabelTestCases">).altTextAriaLabel !==
    undefined
  );
};