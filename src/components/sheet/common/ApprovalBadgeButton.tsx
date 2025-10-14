// src/components/sheet/common/ApprovalBadgeButton.tsx

import { Button } from "@/components/ui/button";
import { ListChecks } from "lucide-react";

interface ApprovalBadgeButtonProps {
  /** Number of test cases awaiting approval */
  count: number;
  /** Whether the current user is QA Lead or Owner */
  isQALeadOrOwner: boolean;
  /** Callback when button is clicked */
  onClick: () => void;
  /** Optional: Hide button when count is 0 (default: true) */
  hideWhenEmpty?: boolean;
}

export function ApprovalBadgeButton({
  count,
  isQALeadOrOwner,
  onClick,
  hideWhenEmpty = true,
}: ApprovalBadgeButtonProps) {
  // Hide button if count is 0 and hideWhenEmpty is true
  if (hideWhenEmpty && count === 0) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="relative"
    >
      <ListChecks className="w-4 h-4 mr-2" />
      {isQALeadOrOwner
        ? "Please approve this now"
        : "Need Approval for QA Lead/Owner"}
      <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold text-white bg-red-500 rounded-full">
        {count}
      </span>
    </Button>
  );
}