// src/components/sheet/common/RequestForModuleAccessModal.tsx

import { useState } from "react"
import { Send, Lock } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface RequestForModuleAccessModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  moduleName?: string
  sheetId?: string
}

export function RequestForModuleAccessModal({
  open,
  onOpenChange,
  moduleName = "moduleName",
}: RequestForModuleAccessModalProps) {
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [requestSent, setRequestSent] = useState(false)

  // Dummy current user data
  const currentUser = {
    name: "John Doe",
    email: "john.doe@company.com",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  }

  const handleSendRequest = async () => {
    setIsSending(true)

    // Simulate API delay
    setTimeout(() => {
      setRequestSent(true)
      setIsSending(false)

      // Auto close after showing success
      setTimeout(() => {
        onOpenChange(false)
        // Reset state after modal closes
        setTimeout(() => {
          setRequestSent(false)
          setMessage("")
        }, 300)
      }, 2000)
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px] p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 space-y-0">
          <div className="flex items-start justify-between w-full">
            <div>
              <DialogTitle className="text-xl font-normal">Request access to &quot;{moduleName}&quot;</DialogTitle>
              <p className="text-xs text-muted-foreground mt-1">Your request will be sent to the sheet owner</p>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-6">
          {!requestSent ? (
            <>
              {/* Current User Info */}
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                <Avatar className="h-10 w-10 flex-shrink-0">
                  {currentUser.avatarUrl ? (
                    <AvatarImage src={currentUser.avatarUrl || "/placeholder.svg"} alt={currentUser.name} />
                  ) : null}
                  <AvatarFallback className="bg-muted">{getInitials(currentUser.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{currentUser.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
                </div>
              </div>

              {/* Access Status */}
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                <Lock className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">You don&apos;t have access</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This module is restricted. Request access from the owner to edit.
                  </p>
                </div>
              </div>

              {/* Message Input */}
              <div className="space-y-3">
                <div>
                  <label htmlFor="message" className="text-sm font-medium">
                    Message <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add a note to help the owner understand why you need access
                  </p>
                </div>
                <Textarea
                  id="message"
                  placeholder="I would like to access this module because..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[120px] resize-none"
                  disabled={isSending}
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-2">
                <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSending}>
                  Cancel
                </Button>
                <Button onClick={handleSendRequest} disabled={isSending}>
                  {isSending ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Request
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            // Success State
            <div className="py-8 text-center space-y-4">
              <div className="flex justify-center">
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <Send className="h-6 w-6 text-green-600 dark:text-green-500" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Request sent successfully!</p>
                <p className="text-xs text-muted-foreground mt-1">
                  You&apos;ll be notified when the owner responds to your request
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
