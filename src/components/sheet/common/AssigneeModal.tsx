// src/components/sheet/common/AssigneeModal.tsx

import { useState, useEffect } from "react"
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

// Define proper types
type UserRole = "owner" | "viewer" | "qa_lead" | "qa_tester"

interface User {
  id: any
  name: string
  email: string
  role: UserRole
  avatarUrl: string | null
  isCurrentUser: boolean
}

interface AssigneeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  moduleName?: string
}

const DUMMY_USERS: User[] = [
  {
    id: "user1" as any,
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    role: "owner",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    isCurrentUser: true,
  },
  {
    id: "user2" as any,
    name: "Michael Chen",
    email: "michael.chen@company.com",
    role: "qa_lead",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    isCurrentUser: false,
  },
  {
    id: "user3" as any,
    name: "Emily Rodriguez",
    email: "emily.rodriguez@company.com",
    role: "qa_tester",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    isCurrentUser: false,
  },
  {
    id: "user4" as any,
    name: "David Kim",
    email: "david.kim@company.com",
    role: "viewer",
    avatarUrl: null,
    isCurrentUser: false,
  },
]

const DUMMY_PENDING_REQUESTS = [
  {
    id: "req1" as any,
    name: "Jessica Martinez",
    email: "jessica.martinez@company.com",
    requestedRole: "qa_lead",
    requestMessage: "I'd like to contribute to the QA process and help lead testing efforts for this project.",
    requestedAt: Date.now() - 3600000 * 2, // 2 hours ago
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica",
  },
  {
    id: "req2" as any,
    name: "Alex Thompson",
    email: "alex.thompson@company.com",
    requestedRole: "qa_tester",
    requestMessage: "No message provided",
    requestedAt: Date.now() - 86400000, // 1 day ago
    avatarUrl: null,
  },
  {
    id: "req3" as any,
    name: "Priya Patel",
    email: "priya.patel@company.com",
    requestedRole: "viewer",
    requestMessage: "I need access to review the test results for our upcoming release.",
    requestedAt: Date.now() - 3600000 * 5, // 5 hours ago
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
  },
]

export function AssigneeModal({
  open,
  onOpenChange,
  moduleName = "Module Name",
}: AssigneeModalProps) {
  const [usersWithAccess, setUsersWithAccess] = useState<User[]>(DUMMY_USERS)
  const [pendingRequests, setPendingRequests] = useState(DUMMY_PENDING_REQUESTS)

  const [searchValue, setSearchValue] = useState("")
  const [isAddingUser, setIsAddingUser] = useState(false)
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

  const mapRequestedRoleToSelectValue = (requestedRole: string): string => {
    const role = requestedRole.toLowerCase()
    if (role === "qa_lead") return "editor"
    if (role === "qa_tester") return "commenter"
    if (role === "viewer") return "viewer"
    return "viewer"
  }


  const handleAddUser = async () => {
    if (!searchValue.trim()) {
      alert("Please enter an email address")
      return
    }

    setIsAddingUser(true)

    setTimeout(() => {
      const newUser: User = {
        id: `user${Date.now()}` as any,
        name: searchValue
          .split("@")[0]
          .replace(".", " ")
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" "),
        email: searchValue.trim(),
        role: "viewer",
        avatarUrl: null,
        isCurrentUser: false,
      }

      setUsersWithAccess([...usersWithAccess, newUser])
      setSearchValue("")
      setIsAddingUser(false)
      alert("User added successfully!")
    }, 500)
  }

    const handleRemoveUser = async (userId: any) => {
        const user = usersWithAccess.find((u) => u.id === userId)
        if (!user) return
  
        if (!confirm(`Are you sure you want to remove user: "${user.name}" to ${moduleName}`)) {
            return
        }

        setUsersWithAccess((users) => users.filter((user) => user.id !== userId))
    }

  const handleApproveRequest = async (permissionId: any, requestedRole: string) => {
    setProcessingRequests((prev) => new Set(prev).add(permissionId))

    setTimeout(() => {
      const finalRole = requestRoles[permissionId] || mapRequestedRoleToSelectValue(requestedRole)

      let actualRole: UserRole = "viewer"
      if (finalRole === "editor") actualRole = "qa_lead"
      if (finalRole === "commenter") actualRole = "qa_tester"

      const request = pendingRequests.find((r) => r.id === permissionId)
      if (request) {
        const newUser: User = {
          id: `user${Date.now()}` as any,
          name: request.name,
          email: request.email,
          role: actualRole,
          avatarUrl: request.avatarUrl,
          isCurrentUser: false,
        }
        setUsersWithAccess([...usersWithAccess, newUser])
      }

      setPendingRequests((requests) => requests.filter((r) => r.id !== permissionId))

      if (expandedRequestId === permissionId) {
        setExpandedRequestId(null)
      }

      setProcessingRequests((prev) => {
        const newSet = new Set(prev)
        newSet.delete(permissionId)
        return newSet
      })
    }, 500)
  }

  const handleDeclineRequest = async (permissionId: any) => {
    if (!confirm("Are you sure you want to decline this access request?")) {
      return
    }

    setProcessingRequests((prev) => new Set(prev).add(permissionId))

    setTimeout(() => {
      setPendingRequests((requests) => requests.filter((r) => r.id !== permissionId))

      if (expandedRequestId === permissionId) {
        setExpandedRequestId(null)
      }

      setProcessingRequests((prev) => {
        const newSet = new Set(prev)
        newSet.delete(permissionId)
        return newSet
      })
    }, 500)
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
              <AssigneeRoleDisplay usersWithAccess={usersWithAccess} />
            </div>
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
            <Button onClick={handleAddUser} disabled={isAddingUser || !searchValue.trim()} className="h-12">
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

                        return (
                          <div key={request.id} className="rounded-lg border bg-muted/30 overflow-hidden">
                            <div className="flex items-center justify-between gap-3 p-3">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <Avatar className="h-10 w-10 flex-shrink-0">
                                  {request.avatarUrl ? (
                                    <AvatarImage src={request.avatarUrl || "/placeholder.svg"} alt={request.name} />
                                  ) : null}
                                  <AvatarFallback className="bg-muted">{getInitials(request.name)}</AvatarFallback>
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
                                  onClick={() =>
                                    setExpandedRequestId(expandedRequestId === request.id ? null : request.id)
                                  }
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
                                  {request.requestMessage && request.requestMessage !== "No message provided" && (
                                    <div>
                                      <p className="text-xs font-medium text-muted-foreground mb-1">Message</p>
                                      <p className="text-sm text-muted-foreground leading-relaxed">
                                        {request.requestMessage}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center justify-end pt-2">
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
                                      className="h-9 bg-transparent"
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

          {/* Action buttons */}
          <div className="flex justify-end pt-2">
           
            <Button onClick={() => onOpenChange(false)}>Done</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}