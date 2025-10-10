// src/components/sheet/common/RequestForModuleAccessModal.tsx

import { useState } from "react"
import { Send, Lock } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// 💡 New Imports for Convex functionality
import { useMutation } from "convex/react" 
import { Id } from "convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";

interface RequestForModuleAccessModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  moduleName?: string
  // 💡 Required IDs for the backend request
  moduleId: string 
  sheetId: string
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export function RequestForModuleAccessModal({
  open,
  onOpenChange,
  moduleName = "moduleName",
  moduleId, 
  sheetId,
}: RequestForModuleAccessModalProps) {
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [requestSent, setRequestSent] = useState(false)
  
  // 💡 Initialize the mutation hook
  const sendRequest = useMutation(api.myFunctions.requestModuleAccess)

  // Dummy current user data (Replace with a real hook like useConvexAuth or your user state)
  const currentUser = {
    name: "John Doe",
    email: "john.doe@company.com",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  }

  const handleSendRequest = async () => {
    // Basic validation to ensure we have the IDs
    if (!moduleId || !sheetId) {
        console.error("Missing moduleId or sheetId for request.")
        return
    }
    
    setIsSending(true)

    try {
      // 💡 Call the actual backend mutation
      // We cast the string IDs to the required Convex Id type
      const result = await sendRequest({
        moduleId: moduleId as Id<"modules">, 
        sheetId: sheetId as Id<"sheets">,     
        message, 
      })

      if (result && result.success === false) {
        // Handle case where the backend prevents the request (e.g., duplicate pending request)
        alert(result.message || "A request could not be submitted.")
        setIsSending(false)
        return
      }
      
      // On successful insert
      setRequestSent(true)
      
    } catch (error) {
      // Handle network errors or server exceptions
      console.error("Failed to send module access request:", error)
      alert("Failed to send request. Please try again.")
    } finally {
      setIsSending(false)

      // Auto close after showing success message
      if (requestSent) {
          setTimeout(() => {
            onOpenChange(false)
            // Reset state after modal closes
            setTimeout(() => {
              setRequestSent(false)
              setMessage("")
            }, 300)
          }, 2000)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="space-y-4">
          <div className="flex items-center space-x-2">
            <Lock className="h-6 w-6 text-yellow-500" />
            <DialogTitle className="text-xl">Request Access</DialogTitle>
          </div>
          <p className="text-sm text-gray-500">
            You do not have access to the **{moduleName}** module.
          </p>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
            <Avatar className="h-9 w-9">
              <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
              <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-none truncate">
                {currentUser.name}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {currentUser.email}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium leading-none">
              Message (Optional)
            </label>
            <Textarea
              id="message"
              placeholder="E.g., I need access for QA testing on a new feature."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isSending || requestSent}
              className="resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          {requestSent ? (
            <div className="flex items-center text-green-600 font-semibold">
              <Send className="h-4 w-4 mr-2" />
              Request Sent!
            </div>
          ) : (
            <Button 
              onClick={handleSendRequest} 
              disabled={isSending} 
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSending ? (
                <>Sending...</>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Request
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}