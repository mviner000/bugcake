import { Button } from "@/components/ui/button";

interface ApprovalButtonsProps {
  onApprove: () => void;
  onRequestRevision: () => void;
  onDecline: () => void;
  workflowStatus: string;
  disabled?: boolean;
}

export function ApprovalButtons({
  onApprove,
  onRequestRevision,
  onDecline,
  workflowStatus,
  disabled = false,
}: ApprovalButtonsProps) {
  return (
    <div className="space-y-2">
      <Button
        className="w-full bg-green-600 hover:bg-green-700 text-white"
        onClick={onApprove}
        disabled={disabled || workflowStatus === "Approved"}
      >
        Approved
      </Button>

      <Button
        variant="secondary"
        className="w-full"
        onClick={onRequestRevision}
        disabled={disabled || workflowStatus === "Needs revision"}
      >
        Need Revision
      </Button>

      <Button
        variant="destructive"
        className="w-full"
        onClick={onDecline}
        disabled={disabled || workflowStatus === "Declined"}
      >
        Decline
      </Button>
    </div>
  );
}