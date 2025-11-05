// src/components/sheet/share-dialog/SheetPeopleAccessHeader.tsx

import { GenericPeopleAccessHeader } from "@/components/common/share/GenericPeopleAccessHeader"

interface SheetPeopleAccessHeaderProps {
  activeTab: "all" | "requests"
  onTabChange: (tab: "all" | "requests") => void
  onCopyLink: () => void
  onSendEmail: () => void
  pendingRequestsCount: number
  showTabs?: boolean
}

/**
 * Sheet-specific header that uses the generic component.
 * Optionally hides tabs based on showTabs prop.
 */
export function SheetPeopleAccessHeader({
  activeTab,
  onTabChange,
  onCopyLink,
  onSendEmail,
  pendingRequestsCount,
  showTabs = true,
}: SheetPeopleAccessHeaderProps) {
  return (
    <GenericPeopleAccessHeader
      activeTab={activeTab}
      onTabChange={onTabChange}
      onCopyLink={onCopyLink}
      onSendEmail={onSendEmail}
      pendingRequestsCount={pendingRequestsCount}
      showTabs={showTabs}
    />
  )
}