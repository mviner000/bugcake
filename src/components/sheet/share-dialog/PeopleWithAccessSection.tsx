// components/sheet/share-dialog/PeopleWithAccessSection.tsx

import { useState, useEffect } from "react"
import { Mail, LinkIcon, X, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Id } from "../../../../convex/_generated/dataModel"
import { OverlayScrollbarsComponent } from "overlayscrollbars-react"
import "overlayscrollbars/overlayscrollbars.css"

interface User {
  id: Id<"users">
  name: string
  email: string
  role: string
  avatarUrl?: string | null
  isCurrentUser: boolean
}

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

interface PeopleWithAccessSectionProps {
  usersWithAccess: User[] | undefined
  pendingRequests: AccessRequest[] | undefined
  onRoleChange: (userId: Id<"users">, newRole: "viewer" | "qa_lead" | "qa_tester") => void
  onRemoveUser: (userId: Id<"users">) => void
  onApproveRequest: (permissionId: Id<"permissions">, requestedRole: string) => void
  onDeclineRequest: (permissionId: Id<"permissions">) => void
}

export function PeopleWithAccessSection({
  usersWithAccess,
  pendingRequests,
  onRoleChange,
  onRemoveUser,
  onApproveRequest,
  onDeclineRequest,
}: PeopleWithAccessSectionProps) {
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null)
  const [requestRoles, setRequestRoles] = useState<Record<string, string>>({})
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set())

  // Auto-initialize requestRoles with the requested role for each pending request
  useEffect(() => {
    if (pendingRequests && pendingRequests.length > 0) {
      const initialRoles: Record<string, string> = {}
      pendingRequests.forEach((request) => {
        const mappedRole = mapRequestedRoleToSelectValue(request.requestedRole)
        initialRoles[request.id] = mappedRole
      })
      setRequestRoles(initialRoles)
    }
  }, [pendingRequests])

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">People with access</h3>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Mail className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b rounded-none">
          <TabsTrigger
            value="all"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            All
          </TabsTrigger>
          <TabsTrigger
            value="requests"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Requests
            {pendingRequests && pendingRequests.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                {pendingRequests.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4 space-y-3">
          {usersWithAccess === undefined ? (
            <p className="text-sm text-muted-foreground">Loading users...</p>
          ) : usersWithAccess.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users have access yet</p>
          ) : (
            usersWithAccess.map((person) => (
              <div key={person.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    {person.avatarUrl ? (
                      <AvatarImage src={person.avatarUrl || "/placeholder.svg"} alt={person.name} />
                    ) : null}
                    <AvatarFallback className="bg-muted">
                      {getInitials(person.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {person.name}
                      {person.isCurrentUser && <span className="text-muted-foreground font-normal"> (you)</span>}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{person.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select 
                    defaultValue={person.role}
                    onValueChange={(value) => onRoleChange(person.id, value as "viewer" | "qa_lead" | "qa_tester")}
                  >
                    <SelectTrigger className="w-[110px] h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="qa_tester">QA Tester</SelectItem>
                      <SelectItem value="qa_lead">QA Lead</SelectItem>
                    </SelectContent>
                  </Select>
                  {!person.isCurrentUser && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => onRemoveUser(person.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="requests" className="mt-4">
          {pendingRequests === undefined ? (
            <p className="text-sm text-muted-foreground">Loading requests...</p>
          ) : pendingRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No pending access requests</p>
            </div>
          ) : (
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
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}