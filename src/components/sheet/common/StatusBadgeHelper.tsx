// src/utils/statusBadgeHelper.tsx

import { Badge } from "@/components/ui/mod/Badge";

type FunctionalityStatus = "Passed" | "Failed" | "Not Run" | "Blocked" | "Not Available";
type AltTextStatus = "Passed" | "Failed" | "Not Run" | "Blocked" | "Not Available";
type SEImplementationStatus = "Not yet" | "Ongoing" | "Done" | "Has Concerns" | "To Update" | "Outdated" | "Not Available";

interface StatusConfig {
  variant: "gray" | "red" | "yellow" | "green" | "blue" | "indigo" | "purple" | "pink";
  label: string;
}

const testingStatusConfig: Record<FunctionalityStatus | AltTextStatus, StatusConfig> = {
  "Passed": { variant: "green", label: "Passed" },
  "Failed": { variant: "red", label: "Failed" },
  "Not Run": { variant: "gray", label: "Not Run" },
  "Blocked": { variant: "yellow", label: "Blocked" },
  "Not Available": { variant: "indigo", label: "Not Available" },
};

const seImplementationConfig: Record<SEImplementationStatus, StatusConfig> = {
  "Not yet": { variant: "gray", label: "Not yet" },
  "Ongoing": { variant: "blue", label: "Ongoing" },
  "Done": { variant: "green", label: "Done" },
  "Has Concerns": { variant: "yellow", label: "Has Concerns" },
  "To Update": { variant: "purple", label: "To Update" },
  "Outdated": { variant: "red", label: "Outdated" },
  "Not Available": { variant: "indigo", label: "Not Available" },
};

export const TestingStatusBadge = ({ status }: { status: FunctionalityStatus | AltTextStatus }) => {
  const config = testingStatusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export const SEImplementationBadge = ({ status }: { status: SEImplementationStatus }) => {
  const config = seImplementationConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
};