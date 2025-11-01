// components/sheet/AddPeopleSection.tsx

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AddPeopleSectionProps {
  onAddUser: (email: string, role: "viewer" | "qa_lead" | "qa_tester") => Promise<void>
  isAddingUser: boolean
}

export function AddPeopleSection({ onAddUser, isAddingUser }: AddPeopleSectionProps) {
  const [searchValue, setSearchValue] = useState("")
  const [selectedRole, setSelectedRole] = useState<"viewer" | "qa_lead" | "qa_tester">("viewer")

  const handleAddUser = async () => {
    if (!searchValue.trim()) {
      alert("Please enter an email address")
      return
    }
    
    await onAddUser(searchValue.trim(), selectedRole)
    setSearchValue("")
  }

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Add people by email"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className="h-9 flex-1"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleAddUser()
          }
        }}
      />
      
      {/* Role Selector Dropdown */}
      <Select value={selectedRole} onValueChange={(value: "viewer" | "qa_lead" | "qa_tester") => setSelectedRole(value)}>
        <SelectTrigger className="w-[140px] h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="viewer">Viewer</SelectItem>
          <SelectItem value="qa_tester">QA Tester</SelectItem>
          <SelectItem value="qa_lead">QA Lead</SelectItem>
        </SelectContent>
      </Select>

      <Button 
        onClick={handleAddUser} 
        disabled={isAddingUser || !searchValue.trim()}
        className="h-9"
      >
        {isAddingUser ? "Adding..." : "Add"}
      </Button>
    </div>
  )
}