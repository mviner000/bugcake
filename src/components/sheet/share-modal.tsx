// components/sheet/share-modal.tsx
import { useState } from "react"
import { Copy, Lock, Mail, LinkIcon, Check, X, Globe, ChevronDown, ChevronUp } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Id } from "../../../convex/_generated/dataModel"
import { OverlayScrollbarsComponent } from "overlayscrollbars-react"
import "overlayscrollbars/overlayscrollbars.css"

interface ShareModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fileName?: string
  sheetId: Id<"sheets">
}

export function ShareModal({
  open,
  onOpenChange,
  fileName = "Regression Testing [09-19-2025].xlsx",
  sheetId,
}: ShareModalProps) {
  const usersWithAccess = useQuery(api.myFunctions.getUsersWithAccess, { sheetId })
  const sheet = useQuery(api.myFunctions.getSheetById, { id: sheetId })
  const pendingRequests = useQuery(api.myFunctions.getPendingAccessRequests, { sheetId })
  
  const addUserAccess = useMutation(api.myFunctions.addUserAccessToSheet)
  const removeUserAccess = useMutation(api.myFunctions.removeUserAccessFromSheet)
  const updateUserRole = useMutation(api.myFunctions.updatePermission)
  const updateAccessLevel = useMutation(api.myFunctions.updateSheetAccessLevel)
  const approveRequest = useMutation(api.myFunctions.approveAccessRequest)
  const declineRequest = useMutation(api.myFunctions.declineAccessRequest)

  const [searchValue, setSearchValue] = useState("")
  const [isCopied, setIsCopied] = useState(false)
  const [isAddingUser, setIsAddingUser] = useState(false)
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null)
  const [requestRoles, setRequestRoles] = useState<Record<string, string>>({})
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set())

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    })
  }

  const handleAddUser = async () => {
    if (!searchValue.trim()) {
      alert("Please enter an email address")
      return
    }
    
    setIsAddingUser(true)
    try {
      await addUserAccess({
        sheetId,
        userEmail: searchValue.trim(),
        role: "viewer",
      })
      setSearchValue("")
      alert("User added successfully!")
    } catch (error: any) {
      alert(error.message || "Failed to add user")
    } finally {
      setIsAddingUser(false)
    }
  }

  const handleRoleChange = async (userId: Id<"users">, newRole: "owner" | "editor" | "viewer") => {
    try {
      await updateUserRole({
        sheetId,
        targetUserId: userId,
        role: newRole,
      })
    } catch (error: any) {
      alert(error.message || "Failed to update role")
    }
  }

  const handleRemoveUser = async (userId: Id<"users">) => {
    if (!confirm("Are you sure you want to remove this user's access?")) {
      return
    }

    try {
      await removeUserAccess({
        sheetId,
        targetUserId: userId,
      })
    } catch (error: any) {
      alert(error.message || "Failed to remove user")
    }
  }

  const handleAccessLevelChange = async (newLevel: "restricted" | "anyoneWithLink" | "public") => {
    try {
      await updateAccessLevel({
        sheetId: sheetId,
        accessLevel: newLevel
      })
    } catch (error: any) {
      alert("Failed to update access level: " + error.message)
    }
  }

  const handleApproveRequest = async (permissionId: Id<"permissions">, requestedRole: string) => {
    setProcessingRequests((prev) => new Set(prev).add(permissionId))
    
    try {
      const finalRole = requestRoles[permissionId] || requestedRole.toLowerCase()
      await approveRequest({
        permissionId,
        finalRole: finalRole as "viewer" | "commenter" | "editor",
      })
      
      // Remove from expanded state if approved
      if (expandedRequestId === permissionId) {
        setExpandedRequestId(null)
      }
    } catch (error: any) {
      alert(error.message || "Failed to approve request")
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
      await declineRequest({ permissionId })
      
      // Remove from expanded state if declined
      if (expandedRequestId === permissionId) {
        setExpandedRequestId(null)
      }
    } catch (error: any) {
      alert(error.message || "Failed to decline request")
    } finally {
      setProcessingRequests((prev) => {
        const newSet = new Set(prev)
        newSet.delete(permissionId)
        return newSet
      })
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getAccessLevelLabel = (level: string) => {
    switch (level) {
      case "restricted":
        return "Restricted"
      case "anyoneWithLink":
        return "Anyone with the link"
      case "public":
        return "Public"
      default:
        return "Restricted"
    }
  }

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    
    if (seconds < 60) return "just now"
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`
    return `${Math.floor(seconds / 604800)} weeks ago`
  }

  const currentAccessLevel = sheet?.accessLevel || "restricted"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px] p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 space-y-0">
          <div className="flex items-start justify-between">
            <DialogTitle className="text-xl font-normal pr-8">Share &quot;{fileName}&quot;</DialogTitle>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-6">
          {/* Search Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Add people by email"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="h-12"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddUser()
                }
              }}
            />
            <Button 
              onClick={handleAddUser} 
              disabled={isAddingUser || !searchValue.trim()}
              className="h-12"
            >
              {isAddingUser ? "Adding..." : "Add"}
            </Button>
          </div>

          {/* People with access section */}
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
                          onValueChange={(value) => handleRoleChange(person.id, value as "owner" | "editor" | "viewer")}
                        >
                          <SelectTrigger className="w-[110px] h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="viewer">Viewer</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="owner">Owner</SelectItem>
                          </SelectContent>
                        </Select>
                        {!person.isCurrentUser && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9"
                            onClick={() => handleRemoveUser(person.id)}
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
                        const selectedRole = requestRoles[request.id] || request.requestedRole.toLowerCase()
                        
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
                                    <p className="text-sm capitalize">{request.requestedRole}</p>
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
                                      <SelectItem value="commenter">Commenter</SelectItem>
                                      <SelectItem value="editor">Editor</SelectItem>
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

          {/* General access section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">General access</h3>
            
            <Select value={currentAccessLevel} onValueChange={(value) => handleAccessLevelChange(value as "restricted" | "anyoneWithLink" | "public")}>
              <SelectTrigger className="w-full h-11">
                <div className="flex items-center gap-3">
                  {currentAccessLevel === "restricted" && <Lock className="h-4 w-4 flex-shrink-0" />}
                  {currentAccessLevel === "anyoneWithLink" && <LinkIcon className="h-4 w-4 flex-shrink-0" />}
                  {currentAccessLevel === "public" && <Globe className="h-4 w-4 flex-shrink-0" />}
                  <span className="text-sm">{getAccessLevelLabel(currentAccessLevel)}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="restricted">
                  <div className="flex items-start gap-3 py-1">
                    <Lock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Restricted</p>
                      <p className="text-xs text-muted-foreground">
                        Only people with access can open with the link
                      </p>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="anyoneWithLink">
                  <div className="flex items-start gap-3 py-1">
                    <LinkIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Anyone with the link</p>
                      <p className="text-xs text-muted-foreground">
                        Anyone with the link can access
                      </p>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="public">
                  <div className="flex items-start gap-3 py-1">
                    <Globe className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Public</p>
                      <p className="text-xs text-muted-foreground">
                        Anyone on the internet can find and access
                      </p>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" onClick={handleCopyLink} disabled={isCopied}>
              {isCopied ? (
                <Check className="h-4 w-4 mr-2 text-green-600" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              {isCopied ? "Copied!" : "Copy link"}
            </Button>
            <Button onClick={() => onOpenChange(false)}>Done</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}