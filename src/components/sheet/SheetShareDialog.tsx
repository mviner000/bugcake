// components/sheet/SheetShareDialog.tsx

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Id } from "../../../convex/_generated/dataModel"
import { toast } from "sonner"
import { SheetDialogHeader } from "./share-dialog/SheetDialogHeader"
import { SheetAddMemberInput } from "./share-dialog/SheetAddMemberInput"
import { SheetGeneralAccess } from "./share-dialog/SheetGeneralAccess"
import { SheetMembersList } from "./share-dialog/SheetMembersList"
import { SheetDialogFooter } from "./share-dialog/SheetDialogFooter"
import { SheetPeopleAccessHeader } from "./share-dialog/SheetPeopleAccessHeader"
import { SheetRoleCount } from "./share-dialog/SheetRoleCount"

interface SheetShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fileName?: string
  sheetId: Id<"sheets">
}

export function SheetShareDialog({
  open,
  onOpenChange,
  fileName = "Regression Testing [09-19-2025].xlsx",
  sheetId,
}: SheetShareDialogProps) {
  const usersWithAccess = useQuery(api.myFunctions.getUsersWithAccess, { sheetId })
  const sheet = useQuery(api.myFunctions.getSheetById, { id: sheetId })
  
  const currentUser = usersWithAccess?.find(u => u.isCurrentUser)
  const canManageMembers = currentUser?.role === "qa_lead" || currentUser?.role === "owner"
  
  const pendingRequests = useQuery(
    api.myFunctions.getPendingAccessRequests, 
    canManageMembers ? { sheetId } : "skip"
  )
  
  const addUserAccess = useMutation(api.myFunctions.addUserAccessToSheet)
  const removeUserAccess = useMutation(api.myFunctions.removeUserAccessFromSheet)
  const updateUserRole = useMutation(api.myFunctions.updatePermission)
  const updateAccessLevel = useMutation(api.myFunctions.updateSheetAccessLevel)
  const approveRequest = useMutation(api.myFunctions.approveAccessRequest)
  const declineRequest = useMutation(api.myFunctions.declineAccessRequest)

  const [isAddingUser, setIsAddingUser] = useState(false)
  const [activeTab, setActiveTab] = useState<"all" | "requests">("all")

  const handleAddUser = async (email: string, role: "viewer" | "qa_lead" | "qa_tester") => {
    setIsAddingUser(true)
    try {
      await addUserAccess({
        sheetId,
        userEmail: email,
        role: role,
      })
      
      let roleLabel = "Viewer"
      if (role === "qa_lead") roleLabel = "QA Lead"
      if (role === "qa_tester") roleLabel = "QA Tester"
      
      toast.success(`${email} has been added as ${roleLabel}`)
    } catch (error: any) {
      toast.error(error.message || "Failed to add user")
    } finally {
      setIsAddingUser(false)
    }
  }

  const handleRoleChange = async (userId: Id<"users">, newRole: "viewer" | "qa_lead" | "qa_tester") => {
    try {
      await updateUserRole({
        sheetId,
        targetUserId: userId,
        role: newRole,
      })
      
      let roleLabel = "Viewer"
      if (newRole === "qa_lead") roleLabel = "QA Lead"
      if (newRole === "qa_tester") roleLabel = "QA Tester"
      
      toast.success(`Role updated to ${roleLabel}`)
    } catch (error: any) {
      toast.error(error.message || "Failed to update role")
    }
  }

  const handleRemoveUser = async (userId: Id<"users">) => {
    try {
      await removeUserAccess({
        sheetId,
        targetUserId: userId,
      })
      toast.success("User removed from sheet")
    } catch (error: any) {
      toast.error(error.message || "Failed to remove user")
    }
  }

  const handleAccessLevelChange = async (newLevel: "restricted" | "anyoneWithLink" | "public") => {
    try {
      await updateAccessLevel({
        sheetId: sheetId,
        accessLevel: newLevel
      })
      
      let levelLabel = "Restricted"
      if (newLevel === "anyoneWithLink") levelLabel = "Anyone with the link"
      if (newLevel === "public") levelLabel = "Public"

      toast.success(`General access updated to "${levelLabel}"`)

    } catch (error: any) {
      toast.error(error.message || "Failed to update access level")
    }
  }

  const handleApproveRequest = async (permissionId: Id<"permissions">, requestedRole: string) => {
    try {
      let actualRole: "viewer" | "qa_lead" | "qa_tester" = "viewer"
      if (requestedRole === "editor") actualRole = "qa_lead"
      if (requestedRole === "commenter") actualRole = "qa_tester"
      
      await approveRequest({
        permissionId,
        finalRole: actualRole,
      })
      
      toast.success("Access request approved")
    } catch (error: any) {
      toast.error(error.message || "Failed to approve request")
    }
  }

  const handleDeclineRequest = async (permissionId: Id<"permissions">) => {
    try {
      await declineRequest({ permissionId })
      toast.success("Access request declined")
    } catch (error: any) {
      toast.error(error.message || "Failed to decline request")
    }
  }

  const handleCopyLink = () => {
    const link = `${window.location.origin}/sheet/${sheetId}`
    navigator.clipboard.writeText(link).then(() => {
      toast.success("Link copied to clipboard")
    })
  }

  const handleSendEmail = () => {
    toast.info("Email functionality coming soon")
  }

  const currentAccessLevel = sheet?.accessLevel || "restricted"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px] p-0 gap-0">
        <SheetDialogHeader fileName={fileName} usersWithAccess={usersWithAccess} />

        <div className="px-6 pb-6 space-y-6">
          <SheetAddMemberInput 
            onAddUser={handleAddUser} 
            isAddingUser={isAddingUser}
            canManageMembers={canManageMembers}
          />

          <div>
            <SheetPeopleAccessHeader
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onCopyLink={handleCopyLink}
              onSendEmail={handleSendEmail}
              pendingRequestsCount={pendingRequests?.length || 0}
              showTabs={canManageMembers}
            />

            <SheetRoleCount usersWithAccess={usersWithAccess} />

            <SheetMembersList
              usersWithAccess={usersWithAccess}
              pendingRequests={pendingRequests}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onCopyLink={handleCopyLink}
              onSendEmail={handleSendEmail}
              onRoleChange={handleRoleChange}
              onRemoveUser={handleRemoveUser}
              onApproveRequest={handleApproveRequest}
              onDeclineRequest={handleDeclineRequest}
              canManageMembers={canManageMembers}
            />
          </div>

          <SheetGeneralAccess
            currentAccessLevel={currentAccessLevel}
            onAccessLevelChange={handleAccessLevelChange}
          />

          <SheetDialogFooter 
            onCopyLink={handleCopyLink}
            onClose={() => onOpenChange(false)} 
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}