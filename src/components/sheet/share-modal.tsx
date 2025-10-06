// components/sheet/share-modal.tsx
// components/sheet/share-modal.tsx
import { useState } from "react"
import { Copy, Lock, Mail, LinkIcon, Check, X, Globe } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Id } from "../../../convex/_generated/dataModel"

interface ShareModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fileName?: string
  sheetId: Id<"sheets">
}

export function ShareModal({
  open,
  onOpenChange,
  fileName = "PROD | IPP | Regression Testing [09-19-2025].xlsx",
  sheetId,
}: ShareModalProps) {
  const usersWithAccess = useQuery(api.myFunctions.getUsersWithAccess, { sheetId })
  const sheet = useQuery(api.myFunctions.getSheetById, { id: sheetId })
  const addUserAccess = useMutation(api.myFunctions.addUserAccessToSheet)
  const removeUserAccess = useMutation(api.myFunctions.removeUserAccessFromSheet)
  const updateUserRole = useMutation(api.myFunctions.updatePermission)
  const updateAccessLevel = useMutation(api.myFunctions.updateSheetAccessLevel)

  const [searchValue, setSearchValue] = useState("")
  const [isCopied, setIsCopied] = useState(false)
  const [isAddingUser, setIsAddingUser] = useState(false)

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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
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
                  value="guests"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Guests
                </TabsTrigger>
                <TabsTrigger
                  value="members"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Members
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

              <TabsContent value="guests" className="mt-4">
                <p className="text-sm text-muted-foreground">No guests</p>
              </TabsContent>

              <TabsContent value="members" className="mt-4">
                <p className="text-sm text-muted-foreground">No members</p>
              </TabsContent>
            </Tabs>
          </div>

          {/* General access section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">General access</h3>
            
            <RadioGroup value={currentAccessLevel} onValueChange={(value) => handleAccessLevelChange(value as "restricted" | "anyoneWithLink" | "public")}>
              {/* Restricted Option */}
              <div className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50" onClick={() => handleAccessLevelChange("restricted")}>
                <Lock className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Restricted</p>
                      <p className="text-xs text-muted-foreground">
                        Only people with access can open with the link
                      </p>
                    </div>
                    <RadioGroupItem value="restricted" />
                  </div>
                </div>
              </div>

              {/* Anyone with Link Option */}
              <div className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50" onClick={() => handleAccessLevelChange("anyoneWithLink")}>
                <LinkIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Anyone with the link</p>
                      <p className="text-xs text-muted-foreground">
                        Anyone with the link can access
                      </p>
                    </div>
                    <RadioGroupItem value="anyoneWithLink" />
                  </div>
                </div>
              </div>

              {/* Public Option */}
              <div className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50" onClick={() => handleAccessLevelChange("public")}>
                <Globe className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Public</p>
                      <p className="text-xs text-muted-foreground">
                        Anyone on the internet can find and access
                      </p>
                    </div>
                    <RadioGroupItem value="public" />
                  </div>
                </div>
              </div>
            </RadioGroup>
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