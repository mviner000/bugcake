// components/sheet/share-modal.tsx

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Id } from "../../../convex/_generated/dataModel"
import { toast } from "sonner"
import { ShareModalHeader } from "./share-dialog/ShareModalHeader"
import { AddPeopleSection } from "./share-dialog/AddPeopleSection"
import { GeneralAccessSection } from "./share-dialog/GeneralAccessSection"
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

  const handleAddUser = async (email: string, role: "viewer" | "qa_lead" | "qa_tester") => {
    setIsAddingUser(true)
    try {
      await addUserAccess({
        sheetId,
        userEmail: email,
        role: role,
      })
      alert(`User added successfully as ${role}!`)
    } catch (error: any) {
      alert(error.message || "Failed to add user")
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
      alert(`People with access role change to "${newRole}" was successful!`)
    } catch (error: any) {
      alert(error.message || "People with access role change failed.")
    }
  }

  const handleRemoveUser = async (userId: Id<"users">) => {
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
      
      // Get a user-friendly label for the success message
      let levelLabel = "Restricted";
      if (newLevel === "anyoneWithLink") levelLabel = "Anyone with the link";
      if (newLevel === "public") levelLabel = "Public";

      // Show success toast
      toast.success(`General access updated to "${levelLabel}"`);

    } catch (error: any) {
      // Show error toast instead of alert
      toast.error(error.message || "Failed to update access level");
    }
  }

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
    } catch (error: any) {
      alert(error.message || "Failed to approve request")
    }
  }

  const handleDeclineRequest = async (permissionId: Id<"permissions">) => {
    try {
      await declineRequest({ permissionId })
    } catch (error: any) {
      alert(error.message || "Failed to decline request")
    }
  }

  const currentAccessLevel = sheet?.accessLevel || "restricted"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px] p-0 gap-0">
        <ShareModalHeader fileName={fileName} usersWithAccess={usersWithAccess} />

        <div className="px-6 pb-6 space-y-6">
          {/* Search Input with Role Selector */}
          <AddPeopleSection onAddUser={handleAddUser} isAddingUser={isAddingUser} />

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
          <GeneralAccessSection
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