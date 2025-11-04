// src/components/common/share/GenericAccessHeader.tsx

import { ReactNode } from "react"
import { Mail, Link } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

/**
 * Configuration for action buttons
 */
export interface ActionButton {
  icon: ReactNode;
  onClick: () => void;
  ariaLabel?: string;
}

/**
 * Props for the generic access header
 */
interface GenericAccessHeaderProps {
  /** Current active tab */
  activeTab: "all" | "requests";
  
  /** Callback when tab changes */
  onTabChange: (tab: "all" | "requests") => void;
  
  /** Callback when copy link button is clicked */
  onCopyLink: () => void;
  
  /** Optional callback when email button is clicked */
  onSendEmail?: () => void;
  
  /** Number of pending requests for badge */
  pendingRequestsCount: number;
  
  /** Whether to show the tabs - useful for permission-based visibility */
  showTabs?: boolean;
  
  /** Visual variant */
  variant?: "sheet" | "checklist";
  
  /** Custom header title */
  title?: string;
  
  /** Custom action buttons (overrides default copy/email buttons) */
  customActionButtons?: ActionButton[];
  
  /** Custom wrapper class name */
  wrapperClassName?: string;
  
  /** Custom tab labels */
  tabLabels?: {
    all: string;
    requests: string;
  };
}

/**
 * Generic reusable component for access management header with tabs.
 * Supports two visual variants and can be customized extensively.
 */
export function GenericAccessHeader({
  activeTab,
  onTabChange,
  onCopyLink,
  onSendEmail,
  pendingRequestsCount,
  showTabs = true,
  variant = "sheet",
  title = "People with access",
  customActionButtons,
  wrapperClassName,
  tabLabels = { all: "All", requests: "Requests" },
}: GenericAccessHeaderProps) {
  
  // Default action buttons
  const defaultActionButtons: ActionButton[] = [
    {
      icon: <Link className={variant === "sheet" ? "h-4 w-4" : "w-5 h-5"} />,
      onClick: onCopyLink,
      ariaLabel: "Copy link to clipboard",
    },
  ]

  if (onSendEmail) {
    defaultActionButtons.push({
      icon: <Mail className={variant === "sheet" ? "h-4 w-4" : "w-5 h-5"} />,
      onClick: onSendEmail,
      ariaLabel: "Send email invitation",
    })
  }

  const actionButtons = customActionButtons || defaultActionButtons

  // Render action buttons based on variant
  const renderActionButtons = () => {
    if (variant === "sheet") {
      return (
        <div className="flex gap-2">
          {actionButtons.map((button, index) => (
            <Button
              key={index}
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={button.onClick}
              aria-label={button.ariaLabel}
            >
              {button.icon}
            </Button>
          ))}
        </div>
      )
    } else {
      return (
        <div className="flex items-center gap-3">
          {actionButtons.map((button, index) => (
            <button
              key={index}
              className="text-gray-600 hover:text-gray-800 transition-colors"
              onClick={button.onClick}
              aria-label={button.ariaLabel}
            >
              {button.icon}
            </button>
          ))}
        </div>
      )
    }
  }

  // Render tabs based on variant
  const renderTabs = () => {
    if (!showTabs) return null

    if (variant === "sheet") {
      return (
        <Tabs 
          value={activeTab} 
          onValueChange={(value) => onTabChange(value as "all" | "requests")} 
          className="w-full"
        >
          <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b rounded-none">
            <TabsTrigger
              value="all"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              aria-label="View all members"
            >
              {tabLabels.all}
            </TabsTrigger>
            <TabsTrigger
              value="requests"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              aria-label={`View pending requests${pendingRequestsCount > 0 ? ` (${pendingRequestsCount})` : ''}`}
            >
              {tabLabels.requests}
              {pendingRequestsCount > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                  {pendingRequestsCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )
    } else {
      return (
        <div className="grid grid-cols-2 border rounded-lg overflow-hidden" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === "all"}
            aria-label="View all members"
            onClick={() => onTabChange("all")}
            className={`py-2 text-sm font-medium transition-colors ${
              activeTab === "all"
                ? "bg-white border-b-2 border-black"
                : "bg-gray-50 text-gray-600"
            }`}
          >
            {tabLabels.all}
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "requests"}
            aria-label={`View pending requests${pendingRequestsCount > 0 ? ` (${pendingRequestsCount})` : ''}`}
            onClick={() => onTabChange("requests")}
            className={`py-2 text-sm font-medium relative transition-colors ${
              activeTab === "requests"
                ? "bg-white border-b-2 border-black"
                : "bg-gray-50 text-gray-600"
            }`}
          >
            {tabLabels.requests}
            {pendingRequestsCount > 0 && (
              <span className="absolute top-1 right-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">
                {pendingRequestsCount}
              </span>
            )}
          </button>
        </div>
      )
    }
  }

  // Apply wrapper styling based on variant
  const baseWrapperClass = variant === "sheet" ? "space-y-4" : "px-5 pt-2"
  const wrapperClass = wrapperClassName || baseWrapperClass

  const titleClass = variant === "sheet" 
    ? "text-sm font-medium" 
    : "text-sm font-semibold"

  const headerSpacing = variant === "sheet" ? "" : "mb-3"

  return (
    <div className={wrapperClass}>
      <div className={`flex items-center justify-between ${headerSpacing}`}>
        <h3 className={titleClass}>{title}</h3>
        {renderActionButtons()}
      </div>

      {renderTabs()}
    </div>
  )
}