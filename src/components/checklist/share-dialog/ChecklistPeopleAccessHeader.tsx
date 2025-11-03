// src/components/checklist/share-dialog/ChecklistPeopleAccessHeader.tsx

import { GenericAccessHeader } from "@/components/common/share/GenericAccessHeader"

interface ChecklistPeopleAccessHeaderProps {
  activeTab: "all" | "requests"
  onTabChange: (tab: "all" | "requests") => void
  onCopyLink: () => void
  canManageMembers: boolean
  pendingRequestsCount: number
  onSendEmail?: () => void // Made optional since it wasn't being used in original
}

export function ChecklistPeopleAccessHeader({
  activeTab,
  onTabChange,
  onCopyLink,
  canManageMembers,
  pendingRequestsCount,
  onSendEmail,
}: ChecklistPeopleAccessHeaderProps) {
  return (
    <GenericAccessHeader
      activeTab={activeTab}
      onTabChange={onTabChange}
      onCopyLink={onCopyLink}
      onSendEmail={onSendEmail}
      pendingRequestsCount={pendingRequestsCount}
      variant="checklist"
      showTabs={canManageMembers} // Only show tabs if user can manage members
    />
  )
}