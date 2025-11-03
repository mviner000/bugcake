import { Mail, LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SheetPeopleAccessHeaderProps {
  activeTab: "all" | "requests"
  onTabChange: (tab: "all" | "requests") => void
  onCopyLink: () => void
  onSendEmail: () => void
  pendingRequestsCount: number
}

export function SheetPeopleAccessHeader({
  activeTab,
  onTabChange,
  onCopyLink,
  onSendEmail,
  pendingRequestsCount,
}: SheetPeopleAccessHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">People with access</h3>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={onCopyLink}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={onSendEmail}
          >
            <Mail className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as "all" | "requests")} className="w-full">
        <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b rounded-none">
          <TabsTrigger
            value="all"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            All
          </TabsTrigger>
          <TabsTrigger
            value="requests"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Requests
            {pendingRequestsCount > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                {pendingRequestsCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}