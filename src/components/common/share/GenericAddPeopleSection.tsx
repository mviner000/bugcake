// src/components/common/share/GenericAddPeopleSection.tsx

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

/**
 * Defines a role option for the dropdown
 */
export interface RoleOption {
  value: string;
  label: string;
}

/**
 * Props for the generic add people section
 */
interface GenericAddPeopleSectionProps {
  /** Callback when user clicks Add button */
  onAddPerson: (email: string, role: string) => Promise<void>;
  
  /** Available role options for the dropdown */
  roleOptions: RoleOption[];
  
  /** Default role to select (should match one of roleOptions values) */
  defaultRole: string;
  
  /** Whether the add operation is in progress */
  isLoading?: boolean;
  
  /** Input placeholder text */
  placeholder?: string;
  
  /** Button text when not loading */
  buttonText?: string;
  
  /** Button text when loading */
  buttonLoadingText?: string;
  
  /** Whether to show this section (for permission-based hiding) */
  visible?: boolean;
  
  /** Optional wrapper class name */
  wrapperClassName?: string;
  
  /** Optional input class name */
  inputClassName?: string;
  
  /** Optional select class name */
  selectClassName?: string;
  
  /** Optional button class name */
  buttonClassName?: string;
}

/**
 * Generic reusable component for adding people with email and role selection.
 * Manages its own internal state for email and role.
 */
export function GenericAddPeopleSection({
  onAddPerson,
  roleOptions,
  defaultRole,
  isLoading = false,
  placeholder = "Add people by email",
  buttonText = "Add",
  buttonLoadingText = "Adding...",
  visible = true,
  wrapperClassName = "",
  inputClassName = "h-9 flex-1",
  selectClassName = "w-[140px] h-9",
  buttonClassName = "h-9",
}: GenericAddPeopleSectionProps) {
  const [email, setEmail] = useState("")
  const [selectedRole, setSelectedRole] = useState(defaultRole)

  // Don't render if not visible (permission check)
  if (!visible) {
    return null;
  }

  const handleAdd = async () => {
    const trimmedEmail = email.trim();
    
    if (!trimmedEmail) {
      return; // Silently return if empty
    }

    // Basic email validation
    if (!trimmedEmail.includes("@")) {
      alert("Please enter a valid email address");
      return;
    }

    try {
      await onAddPerson(trimmedEmail, selectedRole);
      // Clear the input on success
      setEmail("");
      // Optionally reset role to default
      setSelectedRole(defaultRole);
    } catch (error) {
      // Error handling is done by the parent component
      console.error("Failed to add person:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAdd();
    }
  };

  return (
    <div className={wrapperClassName}>
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder={placeholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          className={inputClassName}
          disabled={isLoading}
        />
        
        <Select 
          value={selectedRole} 
          onValueChange={setSelectedRole}
          disabled={isLoading}
        >
          <SelectTrigger className={selectClassName}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {roleOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button 
          onClick={handleAdd} 
          disabled={isLoading || !email.trim()}
          className={buttonClassName}
        >
          {isLoading ? buttonLoadingText : buttonText}
        </Button>
      </div>
    </div>
  );
}