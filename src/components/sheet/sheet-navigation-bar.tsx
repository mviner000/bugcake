import { useState } from "react"
import { Menu, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const navigationItems = [
  { id: "open", label: "Open" },
  { id: "waiting_for_qa_lead_approval", label: "Waiting for QA Lead Approval" },
  { id: "needs_revision", label: "Needs Revision" },
  { id: "in_progress", label: "In Progress" },
  { id: "approved", label: "Approved" },
  { id: "declined", label: "Declined" },
  { id: "reopen", label: "Reopen" },
  { id: "wont_do", label: "Won't Do" },
]

export function SheetNavigationBar() {
  const [activeItem, setActiveItem] = useState("open")

  return (
    <nav className="border-t border-gray-200 bg-background mt-2">
      <div className="flex items-center gap-2 py-1">
        {/* Mobile Hamburger Menu - Opens Downward */}
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
                  onClick={() => setActiveItem(item.id)}
                  className={cn(
                    "rounded-none flex items-center gap-2 px-4 py-2 text-left text-sm hover:bg-accent transition-colors",
                    activeItem === item.id && "bg-accent",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center flex-1 overflow-x-auto">
          {navigationItems.map((item) => (
            <div
              key={item.id}
              className="group flex"
            >
              <Button
                variant="ghost"
                className={cn(
                  "rounded-none text-sm whitespace-nowrap transition-colors",
                  activeItem === item.id ? "bg-accent" : "group-hover:bg-accent"
                )}
                onClick={() => {
                  setActiveItem(item.id)
                  alert(`${item.label} clicked`)
                }}
              >
                {item.label}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                      "rounded-none w-8 px-0 transition-colors",
                      activeItem === item.id ? "bg-accent" : "group-hover:bg-accent"
                    )}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem>View</DropdownMenuItem>
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem>Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </div>
    </nav>
  )
}