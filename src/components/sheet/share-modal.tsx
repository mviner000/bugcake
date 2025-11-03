// components/sheet/share-modal.tsx

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Id } from "../../../convex/_generated/dataModel"
import { toast } from "sonner"
import { ShareModalHeader } from "./share-dialog/ShareModalHeader"
import { SheetAddMemberInput } from "./share-dialog/SheetAddMemberInput"
import { SheetGeneralAccess } from "./share-dialog/SheetGeneralAccess"
import { PeopleWithAccessSection } from "./share-dialog/PeopleWithAccessSection"
import { ActionButtonsSection } from "./share-dialog/ActionButtonsSection"

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

  const [isAddingUser, setIsAddingUser] = useState(false)

  // ✅ UPDATED: Now uses toast instead of alert
  const handleAddUser = async (email: string, role: "viewer" | "qa_lead" | "qa_tester") => {
    setIsAddingUser(true)
    try {
      await addUserAccess({
        sheetId,
        userEmail: email,
        role: role,
      })
      
      // Get a user-friendly role label
      let roleLabel = "Viewer"
      if (role === "qa_lead") roleLabel = "QA Lead"
      if (role === "qa_tester") roleLabel = "QA Tester"
      
      // ✅ Show success toast with user email and role
      toast.success(`${email} has been added as ${roleLabel}`)
    } catch (error: any) {
      // ✅ Show error toast instead of alert
      toast.error(error.message || "Failed to add user")
    } finally {
      setIsAddingUser(false)
    }
  }

  // ✅ UPDATED: Now uses toast instead of alert
  const handleRoleChange = async (userId: Id<"users">, newRole: "viewer" | "qa_lead" | "qa_tester") => {
    try {
      await updateUserRole({
        sheetId,
        targetUserId: userId,
        role: newRole,
      })
      
      // Get a user-friendly role label
      let roleLabel = "Viewer"
      if (newRole === "qa_lead") roleLabel = "QA Lead"
      if (newRole === "qa_tester") roleLabel = "QA Tester"
      
      // ✅ Show success toast
      toast.success(`Role updated to ${roleLabel}`)
    } catch (error: any) {
      // ✅ Show error toast instead of alert
      toast.error(error.message || "Failed to update role")
    }
  }

  // ✅ UPDATED: Now uses toast instead of alert
  const handleRemoveUser = async (userId: Id<"users">) => {
    try {
      await removeUserAccess({
        sheetId,
        targetUserId: userId,
      })
      // ✅ Show success toast
      toast.success("User removed from sheet")
    } catch (error: any) {
      // ✅ Show error toast instead of alert
      toast.error(error.message || "Failed to remove user")
    }
  }

  const handleAccessLevelChange = async (newLevel: "restricted" | "anyoneWithLink" | "public") => {
    try {
      await updateAccessLevel({
        sheetId: sheetId,
        accessLevel: newLevel
      })
      
      // Get a user-friendly label for the success message
      let levelLabel = "Restricted"
      if (newLevel === "anyoneWithLink") levelLabel = "Anyone with the link"
      if (newLevel === "public") levelLabel = "Public"

      // Show success toast
      toast.success(`General access updated to "${levelLabel}"`)

    } catch (error: any) {
      // Show error toast
      toast.error(error.message || "Failed to update access level")
    }
  }

  // ✅ UPDATED: Now uses toast instead of alert
  const handleApproveRequest = async (permissionId: Id<"permissions">, requestedRole: string) => {
    try {
      // Map select value back to role format
      let actualRole: "viewer" | "qa_lead" | "qa_tester" = "viewer"
      if (requestedRole === "editor") actualRole = "qa_lead"
      if (requestedRole === "commenter") actualRole = "qa_tester"
      
      await approveRequest({
        permissionId,
        finalRole: actualRole,
      })
      
      // ✅ Show success toast
      toast.success("Access request approved")
    } catch (error: any) {
      // ✅ Show error toast instead of alert
      toast.error(error.message || "Failed to approve request")
    }
  }

  // ✅ UPDATED: Now uses toast instead of alert
  const handleDeclineRequest = async (permissionId: Id<"permissions">) => {
    try {
      await declineRequest({ permissionId })
      // ✅ Show success toast
      toast.success("Access request declined")
    } catch (error: any) {
      // ✅ Show error toast instead of alert
      toast.error(error.message || "Failed to decline request")
    }
  }

  const currentAccessLevel = sheet?.accessLevel || "restricted"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px] p-0 gap-0">
        <ShareModalHeader fileName={fileName} usersWithAccess={usersWithAccess} />

        <div className="px-6 pb-6 space-y-6">
          {/* Search Input with Role Selector */}
          <SheetAddMemberInput onAddUser={handleAddUser} isAddingUser={isAddingUser} />

          {/* People with access section */}
          <PeopleWithAccessSection
            usersWithAccess={usersWithAccess}
            pendingRequests={pendingRequests}
            onRoleChange={handleRoleChange}
            onRemoveUser={handleRemoveUser}
            onApproveRequest={handleApproveRequest}
            onDeclineRequest={handleDeclineRequest}
          />

          {/* General access section */}
          <SheetGeneralAccess
            currentAccessLevel={currentAccessLevel}
            onAccessLevelChange={handleAccessLevelChange}
          />

          {/* Action buttons */}
          <ActionButtonsSection onClose={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}