// src/components/checklist/share-dialog/ChecklistPeopleAccessHeader.tsx

import { GenericPeopleAccessHeader } from "@/components/common/share/GenericPeopleAccessHeader"

interface ChecklistPeopleAccessHeaderProps {
  activeTab: "all" | "requests"
  onTabChange: (tab: "all" | "requests") => void
  onCopyLink: () => void
  canManageMembers: boolean
  pendingRequestsCount: number
  onSendEmail?: () => void
}

/**
 * Checklist-specific header that uses the generic component.
 * Conditionally shows tabs based on user permissions.
 */
export function ChecklistPeopleAccessHeader({
  activeTab,
  onTabChange,
  onCopyLink,
  canManageMembers,
  pendingRequestsCount,
  onSendEmail,
}: ChecklistPeopleAccessHeaderProps) {
  return (
    <GenericPeopleAccessHeader
      activeTab={activeTab}
      onTabChange={onTabChange}
      onCopyLink={onCopyLink}
      onSendEmail={onSendEmail}
      pendingRequestsCount={pendingRequestsCount}
      variant="checklist"
      showTabs={canManageMembers}
    />
  )
}