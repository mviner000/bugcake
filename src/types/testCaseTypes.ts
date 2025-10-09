// src/types/testCaseTypes.ts
import { ComponentType } from "react";
import { Id } from "convex/_generated/dataModel";

/**
 * Workflow Status Types
 */
export type WorkflowStatus =
  | "Open"
  | "Waiting for QA Lead Approval"
  | "Needs revision"
  | "In Progress"
  | "Approved"
  | "Declined"
  | "Reopen"
  | "Won't Do";

/**
 * Testing Status Types
 */
export type TestingStatus =
  | "Passed"
  | "Failed"
  | "Not Run"
  | "Blocked"
  | "Not Available";

/**
 * SE Implementation Status Types
 */
export type SEImplementationStatus =
  | "Not yet"
  | "Ongoing"
  | "Done"
  | "Has Concerns"
  | "To Update"
  | "Outdated"
  | "Not Available";

/**
 * Persona Types
 */
export type Persona =
  | "Super Admin"
  | "Admin"
  | "User"
  | "Employee"
  | "Reporting Manager"
  | "Manager";

/**
 * Test Case Level Types
 */
export type TestCaseLevel = "High" | "Low";

/**
 * Test Case Scenario Types
 */
export type TestCaseScenario = "Happy Path" | "Unhappy Path";

/**
 * Base Test Case Interface
 * Contains common properties shared by all test case types
 */
export interface BaseTestCase {
  _id: string;
  module: Id<"modules">;
  moduleName: string;
  workflowStatus: WorkflowStatus;
  sequenceNumber: number;
  rowHeight?: number;
  createdAt: number;
  createdByName: string;
  executedByName: string;
}

/**
 * Cell Renderer Props
 * Props passed to custom cell renderer components
 */
export interface CellRendererProps {
  value: any;
  testCase: any;
  columnKey: string;
}

/**
 * Table Column Configuration
 * Defines the structure and behavior of table columns
 */
export interface TableColumn {
  key: string;
  label: string;
  width: number;
  renderer?: ComponentType<CellRendererProps>;
}

/**
 * New Functionality Test Case Interface
 * For creating new functionality test cases
 */
export interface NewFunctionalityTestCase {
  title: string;
  level: TestCaseLevel;
  scenario: TestCaseScenario;
  module: string;
  subModule: string;
  preConditions: string;
  steps: string;
  expectedResults: string;
  status: TestingStatus;
  jiraUserStory: string;
}

/**
 * New Alt Text/Aria Label Test Case Interface
 * For creating new alt text/aria label test cases
 */
export interface NewAltTextAriaLabelTestCase {
  persona: Persona;
  module: string;
  subModule: string;
  pageSection: string;
  wireframeLink: string;
  imagesIcons: string;
  remarks: string;
  altTextAriaLabel: string;
  seImplementation: SEImplementationStatus;
  actualResults: string;
  testingStatus: TestingStatus;
  notes: string;
  jiraUserStory: string;
}

/**
 * Grouped Test Cases
 * Test cases grouped by module ID
 */
export interface GroupedTestCases<T> {
  [moduleId: string]: T[];
}

/**
 * Module Checkbox State
 * State of checkboxes at the module level
 */
export interface ModuleCheckboxState {
  isChecked: boolean;
  isIndeterminate: boolean;
}

/**
 * Status Counts
 * Count of test cases per workflow status
 */
export type StatusCounts = Partial<Record<WorkflowStatus, number>>;

/**
 * Batch Update Result
 * Result of batch updating workflow status
 */
export interface BatchUpdateResult {
  summary: {
    successful: number;
    failed: number;
  };
}

/**
 * Color Configuration
 * Background and text colors for UI elements
 */
export interface ColorConfig {
  bgColor: string;
  textColor: string;
}