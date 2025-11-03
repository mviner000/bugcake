// components/sheet/share-dialog/PeopleWithAccessSection.tsx

import { Mail, LinkIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Id } from "../../../../convex/_generated/dataModel"
import { AccessRequestList } from "./AccessRequestList"

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
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
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
          <AccessRequestList
            pendingRequests={pendingRequests}
            onApproveRequest={onApproveRequest}
            onDeclineRequest={onDeclineRequest}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}