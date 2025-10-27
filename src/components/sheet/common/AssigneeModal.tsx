// src/components/sheet/common/AssigneeModal.tsx

import { useState } from "react"
import { Mail, LinkIcon, ChevronDown, ChevronUp } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { OverlayScrollbarsComponent } from "overlayscrollbars-react"
import "overlayscrollbars/overlayscrollbars.css"
import { AssigneeRoleDisplay } from "./AssigneeRoleDisplay"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// 💡 NEW CONVEX IMPORTS
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { Id } from "convex/_generated/dataModel"

// Define proper types
type UserRole = "owner" | "viewer" | "qa_lead" | "qa_tester"

interface User {
  // Relaxed type to handle both fetched Id and potentially string keys from old code
  id: Id<"users"> | string | any 
  name: string
  email: string
  role: UserRole
  avatarUrl: string | null | undefined
  isCurrentUser: boolean
}

interface AssigneeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  moduleName?: string
  sheetId: Id<"sheets">
  moduleId: Id<"modules">
}

export function AssigneeModal({
  open,
  onOpenChange,
  moduleName = "Module Name",
  sheetId,
  moduleId, 
}: AssigneeModalProps) {

  // ✅ FIX: Use a Convex query to fetch the real list of users with access
  const usersWithAccessQuery = useQuery(api.myFunctions.getUsersWithModuleAccess, {
    moduleId: moduleId, 
  })
  // Coalesce undefined (loading) to an empty array for rendering logic
  const usersWithAccess = usersWithAccessQuery || []
  
  const pendingRequestsQuery = useQuery(api.myFunctions.getPendingModuleAccessRequests, {
    sheetId,
  })
  const pendingRequests = pendingRequestsQuery || []

  const approveRequestMutation = useMutation(api.myFunctions.approveModuleAccessRequest)
  const declineRequestMutation = useMutation(api.myFunctions.declineModuleAccessRequest)

  const [searchValue, setSearchValue] = useState("")
  const [selectedRole, setSelectedRole] = useState<"viewer" | "qa_lead" | "qa_tester">("qa_tester")
  const [isAddingUser, setIsAddingUser] = useState(false)
  const [expandedRequestId, setExpandedRequestId] = useState<Id<"moduleAccessRequests"> | null>(null)
  const [processingRequests, setProcessingRequests] = useState<Set<Id<"moduleAccessRequests">>>(new Set())

  const handleAddUser = async () => {
    if (!searchValue.trim()) {
      alert("Please enter an email address")
      return
    }

    setIsAddingUser(true)

    // ⚠️ TODO: Implement Convex mutation to add user access here.
    setTimeout(() => {
      
      setSearchValue("")
      setIsAddingUser(false)
      alert(`User added successfully as ${selectedRole}! (Please implement the backend mutation.)`)
    }, 500)
  }

  const handleRemoveUser = async (userId: any) => {
    const user = (usersWithAccess as User[]).find((u) => u.id === userId)
    if (!user) return

    if (!confirm(`Are you sure you want to remove user: "${user.name}" from ${moduleName}`)) {
        return

    }

    // ⚠️ TODO: Implement Convex mutation to remove user access here.
    alert("User removed. (Please implement the backend mutation.)")

  }

  const handleApproveRequest = async (requestId: Id<"moduleAccessRequests">) => {
    setProcessingRequests((prev) => new Set(prev).add(requestId))

    try {
      await approveRequestMutation({ requestId })
      alert("Request approved successfully! User granted QA Tester access to the module.")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred"
      alert("Failed to approve request: " + message)
    } finally {
      setProcessingRequests((prev) => {
        const newSet = new Set(prev)
        newSet.delete(requestId)
        return newSet
      })
      if (expandedRequestId === requestId) {
        setExpandedRequestId(null)
      }
    }
  }

  const handleDeclineRequest = async (requestId: Id<"moduleAccessRequests">) => {
    if (!confirm("Are you sure you want to decline this access request?")) {
      return
    }

    setProcessingRequests((prev) => new Set(prev).add(requestId))

    try {
      await declineRequestMutation({ requestId })
      alert("Request declined successfully!")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred"
      alert("Failed to decline request: " + message)
    } finally {
      setProcessingRequests((prev) => {
        const newSet = new Set(prev)
        newSet.delete(requestId)
        return newSet
      })
      if (expandedRequestId === requestId) {
        setExpandedRequestId(null)
      }
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

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)

    if (seconds < 60) return "just now"
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`
    return `${Math.floor(seconds / 604800)} weeks ago`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px] p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 space-y-0">
          <div className="flex items-start justify-between w-full">
            <div>
              <DialogTitle className="text-xl font-normal">Assign &quot;{moduleName}&quot;</DialogTitle>
  
              <AssigneeRoleDisplay usersWithAccess={usersWithAccess as User[]} />
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-6">
          {/* Search Input with Role Selector */}
          <div className="flex gap-2">
            <Input
              placeholder="Add people by email"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="h-9 flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddUser()
                }
              }}
            />
            
            {/* Role Selector Dropdown */}
            <Select value={selectedRole} onValueChange={(value: "viewer" | "qa_lead" | "qa_tester") => setSelectedRole(value)}>
              <SelectTrigger className="h-9 w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="qa_tester">QA Tester</SelectItem>
                <SelectItem value="qa_lead">QA Lead</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleAddUser} disabled={isAddingUser || !searchValue.trim()} className="h-9">
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
                  {/* Use the fetched data for count */}
                  {pendingRequests.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                      {pendingRequests.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4 space-y-3">
                {/* 💡 Check for loading state first */}
                {usersWithAccessQuery === undefined ? (
                  <p className="text-sm text-muted-foreground">Loading users...</p>
                ) : usersWithAccess.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No users have access yet</p>
                ) : (
                  // ✅ FIX: Explicitly cast and type the map parameter to fix 'implicitly has an any type'
                  (usersWithAccess as User[]).map((person: User) => (
                    <div key={person.id} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          {person.avatarUrl ? (
                            <AvatarImage src={person.avatarUrl || "/placeholder.svg"} alt={person.name} />
                          ) : null}
                          <AvatarFallback className="bg-muted">{getInitials(person.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {person.name}
                            {person.isCurrentUser && <span className="text-muted-foreground font-normal"> (you)</span>}
                           <Badge className="ml-1" variant="outline">{person.role}</Badge>
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{person.email}</p>
                        </div>
                      </div>
                        <div className="flex items-center gap-2">
                            {!person.isCurrentUser && (
                                <Button 
                                variant="remove" 
                                size="sm"
                                onClick={() => handleRemoveUser(person.id)}
                            >
                                Remove
                                </Button>
                            )}
                        </div>
                    </div>
                  ))
                )}
              </TabsContent>

            
              <TabsContent value="requests" className="mt-4">
                {/* 💡 Check for loading state first */}
                {pendingRequestsQuery === undefined ? ( 
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
                      {/* Use data from Convex */}
                      {pendingRequests.map((request) => {
                        const requestId = request._id as Id<"moduleAccessRequests">
                        const isProcessing = processingRequests.has(requestId)

                      
                        return (
                          <div key={requestId} className="rounded-lg border bg-muted/30 overflow-hidden">
                            <div className="flex items-center justify-between gap-3 p-3">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <Avatar className="h-10 w-10 flex-shrink-0">
                                  {/* Use requesterImage */}
  
                                  {request.requesterImage ? (
                                    <AvatarImage src={request.requesterImage || "/placeholder.svg"} alt={request.requesterName} />
                                  ) : null}
                                  {/* Use requesterName */}
                                  <AvatarFallback className="bg-muted">{getInitials(request.requesterName)}</AvatarFallback>
                                </Avatar>
        
                                <div className="flex-1 min-w-0">
                                  {/* Use requesterName */}
                                  <p className="text-sm font-medium truncate">{request.requesterName}</p>
                                  {/* Use requesterEmail */}
                                  <p className="text-xs text-muted-foreground truncate">{request.requesterEmail}</p>
        
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {/* Use _creationTime */}
                                    Requested {getTimeAgo(request._creationTime)} 
                                  </p>
                                </div>
                              
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="default"
                                  size="sm"
                                  className="h-9"
                                  onClick={() =>
                                    setExpandedRequestId(expandedRequestId === requestId ? null : requestId)
                                  }
                                  disabled={isProcessing}
                                >
                                  {expandedRequestId === requestId ? (
                                    <>
                                      Hide Details
                                      <ChevronUp className="h-4 w-4 ml-1" />
                                    </>
                                  ) : (
                                    <>
                                      Show Details
                                      <ChevronDown className="h-4 w-4 ml-1" />
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                            {expandedRequestId === requestId && (
                              <div className="px-3 pb-3 pt-0 border-t mt-3 space-y-4">
                                  <div className="space-y-1">
                                      <p className="text-sm font-medium">Requested Access Level</p>
                                      <Badge variant="outline" className="text-base py-1 px-2">
                                          {/* FIX: Hardcode to "QA_TESTER" based on the approval button */}
                                          {"QA_TESTER".replace("_", " ").toUpperCase()} 
                                      </Badge>
                                  </div>

                                  {/* FIX: Use 'request.message' instead of 'request.requestMessage' */}
                                  {request.message && (
                                      <div className="space-y-1">
                                          <p className="text-sm font-medium">Message</p>
                                          <p className="text-sm text-muted-foreground italic">
                                              {request.message}
                                          </p>
                                      </div>
                                  )}
                                  
                                  <div className="flex justify-end gap-2">
                                      <Button 
                                          variant="remove" 
                                          size="sm" 
                                          onClick={() => handleDeclineRequest(requestId)}
                                          disabled={isProcessing}
                                      >
                                          {isProcessing && !expandedRequestId ? "Processing..." : "Decline"}
                                      </Button>
                                      <Button 
                                          variant="default" 
                                          size="sm" 
                                          onClick={() => handleApproveRequest(requestId)}
                                          disabled={isProcessing}
                                      >
                                          {isProcessing && expandedRequestId === requestId ? "Processing..." : "Approve as QA Tester"}
                                      </Button>
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
          {/* Action buttons */}
          <div className="flex justify-end pt-2">
                      
            <Button onClick={() => onOpenChange(false)}>Done</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}