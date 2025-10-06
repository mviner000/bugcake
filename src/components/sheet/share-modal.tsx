import { useState } from "react"
import { Copy, Lock, Mail, LinkIcon } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Person {
  id: string
  name: string
  email: string
  role: string
  avatarUrl?: string
  avatarColor?: string
  isCurrentUser?: boolean
}

const dummyPeople: Person[] = [
  {
    id: "1",
    name: "Melvin Nogoy",
    email: "melvin.nogoy@mph-intl.com",
    role: "Editor",
    avatarUrl: "/professional-man.jpg",
    isCurrentUser: true,
  },
  {
    id: "2",
    name: "Armie Bargado",
    email: "armie.bargado@mph-intl.com",
    role: "Editor",
    avatarUrl: "/professional-woman-diverse.png",
  },
  {
    id: "3",
    name: "Carl Sabile",
    email: "carl.sabile@mph-intl.com",
    role: "Editor",
    avatarColor: "bg-orange-500",
  },
  {
    id: "4",
    name: "Charissa Arellano",
    email: "charissa.arellano@mph-intl.com",
    role: "Editor",
    avatarUrl: "/professional-woman-2.png",
  },
  {
    id: "5",
    name: "Dave Guardian",
    email: "dave.guardian@mph-intl.com",
    role: "Editor",
    avatarColor: "bg-purple-500",
  },
  {
    id: "6",
    name: "Diana Rivera",
    email: "diana.rivera@mph-intl.com",
    role: "Editor",
    avatarColor: "bg-amber-700",
  },
]

interface ShareModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fileName?: string
}

export function ShareModal({
  open,
  onOpenChange,
  fileName = "PROD | IPP | Regression Testing [09-19-2025].xlsx",
}: ShareModalProps) {
  const [searchValue, setSearchValue] = useState("")

  const handleCopyLink = () => {
    // Copy link logic here
    console.log("Link copied!")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

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
          <Input
            placeholder="Add people, groups, spaces, and calendar events"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="h-12"
          />

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
                {dummyPeople.map((person) => (
                  <div key={person.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        {person.avatarUrl ? (
                          <AvatarImage src={person.avatarUrl || "/placeholder.svg"} alt={person.name} />
                        ) : null}
                        <AvatarFallback className={person.avatarColor || "bg-muted"}>
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
                    <Select defaultValue={person.role.toLowerCase()}>
                      <SelectTrigger className="w-[110px] h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="owner">Owner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
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
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Lock className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <Select defaultValue="restricted">
                  <SelectTrigger className="w-[140px] h-8 mb-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="restricted">Restricted</SelectItem>
                    <SelectItem value="anyone">Anyone with link</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Only people with access can open with the link</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" onClick={handleCopyLink}>
              <Copy className="h-4 w-4 mr-2" />
              Copy link
            </Button>
            <Button onClick={() => onOpenChange(false)}>Done</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
