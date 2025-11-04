// components/sheet/share-dialog/SheetPeopleAccessHeader.tsx

import { GenericAccessHeader } from "@/components/common/share/GenericAccessHeader"

interface SheetPeopleAccessHeaderProps {
  activeTab: "all" | "requests"
  onTabChange: (tab: "all" | "requests") => void
  onCopyLink: () => void
  onSendEmail: () => void
  pendingRequestsCount: number
  showTabs?: boolean // NEW: Optional prop to hide tabs
}

export function SheetPeopleAccessHeader({
  activeTab,
  onTabChange,
  onCopyLink,
  onSendEmail,
  pendingRequestsCount,
  showTabs = true, // NEW: Default to true for backwards compatibility
}: SheetPeopleAccessHeaderProps) {
  return (
    <GenericAccessHeader
      activeTab={activeTab}
      onTabChange={onTabChange}
      onCopyLink={onCopyLink}
      onSendEmail={onSendEmail}
      pendingRequestsCount={pendingRequestsCount}
      variant="sheet"
      showTabs={showTabs} // NEW: Pass through showTabs prop
    />
  )
}