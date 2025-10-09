// components/sheet/sheet-navigation-bar.tsx

import { Menu, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

// Match the workflowStatusEnum from schema
export type WorkflowStatus = 
  | "Open"
  | "Waiting for QA Lead Approval"
  | "Needs revision"
  | "In Progress"
  | "Approved"
  | "Declined"
  | "Reopen"
  | "Won't Do";

interface SheetNavigationBarProps {
  activeStatus: WorkflowStatus;
  onStatusChange: (status: WorkflowStatus) => void;
  statusCounts?: Partial<Record<WorkflowStatus, number>>;
}

const navigationItems: { id: WorkflowStatus; label: string }[] = [
  { id: "Open", label: "Open" },
  { id: "Waiting for QA Lead Approval", label: "Waiting for QA Lead Approval" },
  { id: "Needs revision", label: "Needs Revision" },
  { id: "In Progress", label: "In Progress" },
  { id: "Approved", label: "Approved" },
  { id: "Declined", label: "Declined" },
  { id: "Reopen", label: "Reopen" },
  { id: "Won't Do", label: "Won't Do" },
]

export function SheetNavigationBar({ 
  activeStatus, 
  onStatusChange,
  statusCounts 
}: SheetNavigationBarProps) {
  return (
    <nav className="border-t border-gray-200 bg-background mt-2">
      <div className="flex items-center gap-2 py-1">
        {/* Mobile Hamburger Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="top" className="w-full">
            <div className="flex flex-col gap-2 py-4">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onStatusChange(item.id)}
                  className={cn(
                    "rounded-none flex items-center justify-between gap-2 px-4 py-2 text-left text-sm hover:bg-accent transition-colors",
                    activeStatus === item.id && "bg-accent font-medium",
                  )}
                >
                  <span>{item.label}</span>
                  {statusCounts && statusCounts[item.id] !== undefined && statusCounts[item.id]! > 0 && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                      {statusCounts[item.id]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center flex-1 overflow-x-auto">
          {navigationItems.map((item) => (
            <div key={item.id} className="group flex">
              <Button
                variant="ghost"
                className={cn(
                  "rounded-none text-sm whitespace-nowrap transition-colors relative",
                  activeStatus === item.id ? "bg-accent font-medium" : "group-hover:bg-accent"
                )}
                onClick={() => onStatusChange(item.id)}
              >
                {item.label}
                {statusCounts && statusCounts[item.id] !== undefined && statusCounts[item.id]! > 0 && (
                  <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                    {statusCounts[item.id]}
                  </span>
                )}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                      "rounded-none w-8 px-0 transition-colors",
                      activeStatus === item.id ? "bg-accent" : "group-hover:bg-accent"
                    )}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => onStatusChange(item.id)}>
                    View {item.label}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </div>
    </nav>
  )
}