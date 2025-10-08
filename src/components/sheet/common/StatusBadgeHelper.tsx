// src/utils/statusBadgeHelper.tsx

import { Badge } from "@/components/ui/mod/Badge";

// -------------------------------
// Type Definitions
// -------------------------------

export type FunctionalityStatus =
  | "Passed"
  | "Failed"
  | "Not Run"
  | "Blocked"
  | "Not Available";

export type AltTextStatus =
  | "Passed"
  | "Failed"
  | "Not Run"
  | "Blocked"
  | "Not Available";

interface StatusConfig {
  variant:
    | "gray"
    | "red"
    | "yellow"
    | "green"
    | "blue"
    | "indigo"
    | "purple"
    | "pink";
  label: string;
}

// -------------------------------
// Config Maps
// -------------------------------

const testingStatusConfig: Record<
  FunctionalityStatus | AltTextStatus,
  StatusConfig
> = {
  Passed: { variant: "green", label: "Passed" },
  Failed: { variant: "red", label: "Failed" },
  "Not Run": { variant: "gray", label: "Not Run" },
  Blocked: { variant: "yellow", label: "Blocked" },
  "Not Available": { variant: "indigo", label: "Not Available" },
};

// -------------------------------
// Badge Components
// -------------------------------

export const TestingStatusBadge = ({
  status,
}: {
  status: FunctionalityStatus | AltTextStatus;
}) => {
  const config = testingStatusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
};
