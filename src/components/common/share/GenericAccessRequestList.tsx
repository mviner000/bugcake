// components/common/share/GenericAccessRequestList.tsx

import { useState, ReactNode } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

/**
 * Defines a role option for the dropdown
 */
export interface RoleOption {
  value: string;
  label: string;
}

/**
 * Generic access request data structure
 */
export interface GenericAccessRequest {
  id: string;
  name: string;
  email: string;
  requestedRole: string;
  requestMessage?: string;
  requestedAt: number;
  avatarUrl?: string | null;
}

/**
 * Props for the generic access request list
 */
interface GenericAccessRequestListProps {
  /** Array of pending requests or undefined while loading */
  pendingRequests: GenericAccessRequest[] | undefined;
  
  /** Available role options for the dropdown */
  roleOptions: RoleOption[];
  
  /** Callback when approve button is clicked */
  onApproveRequest: (requestId: string, selectedRole: string) => Promise<void> | void;
  
  /** Callback when decline button is clicked */
  onDeclineRequest: (requestId: string) => Promise<void> | void;
  
  /** Optional custom avatar renderer */
  renderAvatar?: (request: GenericAccessRequest) => ReactNode;
  
  /** Optional function to map requested role to select value */
  mapRequestedRoleToSelectValue?: (requestedRole: string) => string;
  
  /** Whether to show confirmation dialog before declining */
  showDeclineConfirmation?: boolean;
  
  /** Custom decline confirmation message */
  declineConfirmationMessage?: string;
  
  /** Loading text */
  loadingText?: string;
  
  /** Empty state text */
  emptyStateText?: string;
  
  /** Custom time formatter */
  formatTimeAgo?: (timestamp: number) => string;
  
  /** Whether to use scrollable container */
  scrollable?: boolean;
  
  /** Max height for scrollable container */
  maxHeight?: string;
  
  /** Custom styling variant */
  variant?: "sheet" | "checklist";
  
  /** Custom wrapper class name */
  wrapperClassName?: string;
  
  /** Custom request card class name */
  requestCardClassName?: string;
}

/**
 * Generic reusable component for displaying and managing access requests.
 * Supports two visual variants and can be customized extensively.
 */
export function GenericAccessRequestList({
  pendingRequests,
  roleOptions,
  onApproveRequest,
  onDeclineRequest,
  renderAvatar,
  mapRequestedRoleToSelectValue,
  showDeclineConfirmation = false,
  declineConfirmationMessage = "Are you sure you want to decline this access request?",
  loadingText = "Loading requests...",
  emptyStateText = "No pending access requests",
  formatTimeAgo,
  scrollable = false,
  maxHeight = "400px",
  variant = "sheet",
  wrapperClassName,
  requestCardClassName,
}: GenericAccessRequestListProps) {
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null)
  const [requestRoles, setRequestRoles] = useState<Record<string, string>>({})
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set())

  // Default time formatter
  const defaultFormatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    
    if (seconds < 60) return "just now"
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`
    return `${Math.floor(seconds / 604800)} weeks ago`
  }

  const getTimeAgo = formatTimeAgo || defaultFormatTimeAgo

  // Default avatar renderer
  const defaultRenderAvatar = (request: GenericAccessRequest) => {
    const getInitials = (name: string) => {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }

    if (variant === "sheet") {
      const { Avatar, AvatarFallback, AvatarImage } = require("@/components/ui/avatar")
      return (
        <Avatar className="h-10 w-10 flex-shrink-0">
          {request.avatarUrl ? (
            <AvatarImage src={request.avatarUrl} alt={request.name} />
          ) : null}
          <AvatarFallback className="bg-muted">
            {getInitials(request.name)}
          </AvatarFallback>
        </Avatar>
      )
    } else {
      return (
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium">
          {request.name.charAt(0).toUpperCase()}
        </div>
      )
    }
  }

  const avatarRenderer = renderAvatar || defaultRenderAvatar

  // Default role mapper (identity function)
  const defaultMapRole = (role: string) => role
  const mapRole = mapRequestedRoleToSelectValue || defaultMapRole

  const handleApproveRequest = async (requestId: string, selectedRole: string) => {
    setProcessingRequests((prev) => new Set(prev).add(requestId))
    
    try {
      await onApproveRequest(requestId, selectedRole)
      
      if (expandedRequestId === requestId) {
        setExpandedRequestId(null)
      }
    } finally {
      setProcessingRequests((prev) => {
        const newSet = new Set(prev)
        newSet.delete(requestId)
        return newSet
      })
    }
  }

  const handleDeclineRequest = async (requestId: string) => {
    if (showDeclineConfirmation) {
      if (!confirm(declineConfirmationMessage)) {
        return
      }
    }

    setProcessingRequests((prev) => new Set(prev).add(requestId))
    
    try {
      await onDeclineRequest(requestId)
      
      if (expandedRequestId === requestId) {
        setExpandedRequestId(null)
      }
    } finally {
      setProcessingRequests((prev) => {
        const newSet = new Set(prev)
        newSet.delete(requestId)
        return newSet
      })
    }
  }

  // Loading state
  if (pendingRequests === undefined) {
    if (variant === "sheet") {
      return <p className="text-sm text-muted-foreground">{loadingText}</p>
    } else {
      return <p className="text-sm text-gray-500">{loadingText}</p>
    }
  }

  // Empty state
  if (pendingRequests.length === 0) {
    if (variant === "sheet") {
      return (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">{emptyStateText}</p>
        </div>
      )
    } else {
      const { User } = require("lucide-react")
      return (
        <div className="text-center py-8 text-gray-500">
          <User className="h-12 w-12 mx-auto mb-2 text-gray-400" />
          <p className="text-sm font-medium">No pending requests</p>
          <p className="text-xs mt-1">Access requests will appear here</p>
        </div>
      )
    }
  }

  // Render list
  const renderList = () => (
    <div className={wrapperClassName || "space-y-3"}>
      {pendingRequests.map((request) => {
        const isProcessing = processingRequests.has(request.id)
        const selectedRole = requestRoles[request.id] || mapRole(request.requestedRole)
        
        // Sheet variant styling
        if (variant === "sheet") {
          return (
            <div key={request.id} className={requestCardClassName || "rounded-lg border bg-muted/30 overflow-hidden"}>
              <div className="flex items-center justify-between gap-3 p-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {avatarRenderer(request)}
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
                        {roleOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="h-9"
                        onClick={() => handleApproveRequest(request.id, selectedRole)}
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
        }
        
        // Checklist variant styling
        return (
          <div key={request.id} className={requestCardClassName || "border rounded-lg overflow-hidden bg-white"}>
            <div className="p-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  {avatarRenderer(request)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{request.name}</p>
                    <p className="text-xs text-gray-500">{request.email}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Requested {getTimeAgo(request.requestedAt)}
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpandedRequestId(expandedRequestId === request.id ? null : request.id)}
                  className="flex items-center gap-1 text-xs h-8 px-3"
                  disabled={isProcessing}
                >
                  {expandedRequestId === request.id ? "Hide Details" : "View Details"}
                  {expandedRequestId === request.id ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </Button>
              </div>

              {expandedRequestId === request.id && (
                <div className="space-y-3 pt-3 border-t">
                  <div>
                    <p className="text-xs text-gray-600 mb-1 font-medium">Requested Role</p>
                    <p className="text-sm font-medium uppercase tracking-wide">
                      {request.requestedRole.replace('_', ' ')}
                    </p>
                  </div>

                  {request.requestMessage && 
                   request.requestMessage.trim() !== "" && 
                   request.requestMessage.toLowerCase() !== "no message provided" && 
                   request.requestMessage.toLowerCase() !== "no message" && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1 font-medium">Message</p>
                      <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded border">
                        {request.requestMessage}
                      </p>
                    </div>
                  )}

                  <div className="space-y-1.5">
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
                      <SelectTrigger className="w-full h-9 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApproveRequest(request.id, selectedRole)}
                      className="flex-1 bg-black hover:bg-gray-800 h-9"
                      disabled={isProcessing}
                    >
                      {isProcessing ? "Processing..." : "Approve"}
                    </Button>
                    <Button
                      onClick={() => handleDeclineRequest(request.id)}
                      variant="outline"
                      className="flex-1 h-9"
                      disabled={isProcessing}
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )

  // Wrap in scrollable container if requested
  if (scrollable && variant === "sheet") {
    const { OverlayScrollbarsComponent } = require("overlayscrollbars-react")
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
        style={{ maxHeight }}
        className="pr-1"
      >
        {renderList()}
      </OverlayScrollbarsComponent>
    )
  }

  return renderList()
}