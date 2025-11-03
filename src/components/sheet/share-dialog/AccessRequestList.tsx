// components/sheet/share-dialog/AccessRequestList.tsx

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Id } from "../../../../convex/_generated/dataModel"
import { OverlayScrollbarsComponent } from "overlayscrollbars-react"
import "overlayscrollbars/overlayscrollbars.css"

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
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null)
  const [requestRoles, setRequestRoles] = useState<Record<string, string>>({})
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set())

  // Helper function to map the requested role to the select dropdown options
  const mapRequestedRoleToSelectValue = (requestedRole: string): string => {
    const role = requestedRole.toLowerCase()
    if (role === "qa_lead") return "editor"
    if (role === "qa_tester") return "commenter"
    if (role === "viewer") return "viewer"
    return "viewer" // default fallback
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    
    if (seconds < 60) return "just now"
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`
    return `${Math.floor(seconds / 604800)} weeks ago`
  }

  const handleApproveRequest = async (permissionId: Id<"permissions">, requestedRole: string) => {
    setProcessingRequests((prev) => new Set(prev).add(permissionId))
    
    try {
      await onApproveRequest(permissionId, requestedRole)
      
      if (expandedRequestId === permissionId) {
        setExpandedRequestId(null)
      }
    } finally {
      setProcessingRequests((prev) => {
        const newSet = new Set(prev)
        newSet.delete(permissionId)
        return newSet
      })
    }
  }

  const handleDeclineRequest = async (permissionId: Id<"permissions">) => {
    if (!confirm("Are you sure you want to decline this access request?")) {
      return
    }

    setProcessingRequests((prev) => new Set(prev).add(permissionId))
    
    try {
      await onDeclineRequest(permissionId)
      
      if (expandedRequestId === permissionId) {
        setExpandedRequestId(null)
      }
    } finally {
      setProcessingRequests((prev) => {
        const newSet = new Set(prev)
        newSet.delete(permissionId)
        return newSet
      })
    }
  }

  if (pendingRequests === undefined) {
    return <p className="text-sm text-muted-foreground">Loading requests...</p>
  }

  if (pendingRequests.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">No pending access requests</p>
      </div>
    )
  }

  return (
    <OverlayScrollbarsComponent
      options={{
        scrollbars: {
          autoHide: "leave",
          autoHideDelay: 800,
          dragScroll: true,
        },
        overflow: {
          x: "hidden",
          y: "scroll",
        },
      }}
      style={{ maxHeight: "400px" }}
      className="space-y-3 pr-1"
    >
      <div className="space-y-3">
        {pendingRequests.map((request) => {
          const isProcessing = processingRequests.has(request.id)
          const selectedRole = requestRoles[request.id] || mapRequestedRoleToSelectValue(request.requestedRole)
          
          return (
            <div key={request.id} className="rounded-lg border bg-muted/30 overflow-hidden">
              <div className="flex items-center justify-between gap-3 p-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    {request.avatarUrl ? (
                      <AvatarImage src={request.avatarUrl} alt={request.name} />
                    ) : null}
                    <AvatarFallback className="bg-muted">
                      {getInitials(request.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{request.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{request.email}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Requested {getTimeAgo(request.requestedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="h-9"
                    onClick={() => setExpandedRequestId(expandedRequestId === request.id ? null : request.id)}
                    disabled={isProcessing}
                  >
                    {expandedRequestId === request.id ? (
                      <>
                        Hide Details
                        <ChevronUp className="h-4 w-4 ml-1" />
                      </>
                    ) : (
                      <>
                        View Details
                        <ChevronDown className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              {expandedRequestId === request.id && (
                <div className="px-3 pb-3 pt-0 border-t mt-3 space-y-4">
                  <div className="pt-3 space-y-3">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Requested Role</p>
                      <p className="text-sm uppercase">
                        {request.requestedRole}
                      </p>
                    </div>
                    
                    {request.requestMessage && request.requestMessage !== "No message provided" && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Message</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {request.requestMessage}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Select 
                      value={selectedRole}
                      onValueChange={(value) => {
                        setRequestRoles((prev) => ({
                          ...prev,
                          [request.id]: value,
                        }))
                      }}
                      disabled={isProcessing}
                    >
                      <SelectTrigger className="w-[130px] h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="commenter">QA Tester</SelectItem>
                        <SelectItem value="editor">QA Lead</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="h-9"
                        onClick={() => handleApproveRequest(request.id, request.requestedRole)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? "Processing..." : "Approve"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9"
                        onClick={() => handleDeclineRequest(request.id)}
                        disabled={isProcessing}
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </OverlayScrollbarsComponent>
  )
}