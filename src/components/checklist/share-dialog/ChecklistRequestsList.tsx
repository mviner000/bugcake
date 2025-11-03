// src/components/checklist/share-dialog/ChecklistRequestsList.tsx

import { GenericAccessRequestList, GenericAccessRequest } from "@/components/common/share/GenericAccessRequestList"

interface PendingRequest {
  id: string;
  name: string;
  email: string;
  requestedRole: "qa_tester" | "qa_lead" | "viewer";
  requestMessage?: string;
  requestedAt: number;
}

interface ChecklistRequestsListProps {
  pendingRequests: PendingRequest[] | undefined;
  expandedRequests: Record<string, boolean>;
  selectedRequestRoles: Record<string, "qa_tester" | "qa_lead" | "viewer">;
  onToggleExpand: (requestId: string) => void;
  onSelectRole: (requestId: string, role: "qa_tester" | "qa_lead" | "viewer") => void;
  onApproveRequest: (requestId: string, finalRole: "qa_tester" | "qa_lead" | "viewer") => void;
  onDeclineRequest: (requestId: string) => void;
}

export function ChecklistRequestsList({
  pendingRequests,
  onApproveRequest,
  onDeclineRequest,
}: ChecklistRequestsListProps) {
  
  // Convert PendingRequest[] to GenericAccessRequest[]
  const genericRequests: GenericAccessRequest[] | undefined = pendingRequests?.map(request => ({
    id: request.id,
    name: request.name,
    email: request.email,
    requestedRole: request.requestedRole,
    requestMessage: request.requestMessage,
    requestedAt: request.requestedAt,
  }))

  // Custom time formatter to match original format
  const formatTimeAgo = (timestamp: number) => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  // Wrapper function for approve to match expected signature
  const handleApprove = (requestId: string, selectedRole: string) => {
    onApproveRequest(requestId, selectedRole as "qa_tester" | "qa_lead" | "viewer")
  }

  return (
    <GenericAccessRequestList
      pendingRequests={genericRequests}
      roleOptions={[
        { value: "viewer", label: "Viewer" },
        { value: "qa_tester", label: "QA Tester" },
        { value: "qa_lead", label: "QA Lead" },
      ]}
      onApproveRequest={handleApprove}
      onDeclineRequest={onDeclineRequest}
      formatTimeAgo={formatTimeAgo}
      loadingText="Loading requests..."
      emptyStateText="No pending access requests"
      variant="checklist"
    />
  )
}