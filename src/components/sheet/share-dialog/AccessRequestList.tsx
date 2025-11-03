// components/sheet/share-dialog/AccessRequestList.tsx

import { Id } from "../../../../convex/_generated/dataModel"
import { GenericAccessRequestList, GenericAccessRequest } from "@/components/common/share/GenericAccessRequestList"

interface AccessRequest {
  id: Id<"permissions">
  userId: Id<"users">
  name: string
  email: string
  avatarUrl?: string | null
  requestedRole: "viewer" | "qa_lead" | "qa_tester"
  requestMessage?: string
  requestedAt: number
}

interface AccessRequestListProps {
  pendingRequests: AccessRequest[] | undefined
  onApproveRequest: (permissionId: Id<"permissions">, requestedRole: string) => void
  onDeclineRequest: (permissionId: Id<"permissions">) => void
}

export function AccessRequestList({
  pendingRequests,
  onApproveRequest,
  onDeclineRequest,
}: AccessRequestListProps) {
  
  // Convert AccessRequest[] to GenericAccessRequest[]
  const genericRequests: GenericAccessRequest[] | undefined = pendingRequests?.map(request => ({
    id: request.id as string,
    name: request.name,
    email: request.email,
    avatarUrl: request.avatarUrl,
    requestedRole: request.requestedRole,
    requestMessage: request.requestMessage,
    requestedAt: request.requestedAt,
  }))

  // Wrapper function to convert back to proper ID type
  const handleApprove = (requestId: string, selectedRole: string) => {
    onApproveRequest(requestId as Id<"permissions">, selectedRole)
  }

  const handleDecline = (requestId: string) => {
    onDeclineRequest(requestId as Id<"permissions">)
  }

  // Helper function to map the requested role to the select dropdown options
  const mapRequestedRoleToSelectValue = (requestedRole: string): string => {
    const role = requestedRole.toLowerCase()
    if (role === "qa_lead") return "editor"
    if (role === "qa_tester") return "commenter"
    if (role === "viewer") return "viewer"
    return "viewer" // default fallback
  }

  return (
    <GenericAccessRequestList
      pendingRequests={genericRequests}
      roleOptions={[
        { value: "viewer", label: "Viewer" },
        { value: "commenter", label: "QA Tester" },
        { value: "editor", label: "QA Lead" },
      ]}
      onApproveRequest={handleApprove}
      onDeclineRequest={handleDecline}
      mapRequestedRoleToSelectValue={mapRequestedRoleToSelectValue}
      showDeclineConfirmation={true}
      declineConfirmationMessage="Are you sure you want to decline this access request?"
      loadingText="Loading requests..."
      emptyStateText="No pending access requests"
      scrollable={true}
      maxHeight="400px"
      variant="sheet"
    />
  )
}