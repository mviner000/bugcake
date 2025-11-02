// src/components/common/share/GenericGeneralAccessSection.tsx

import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import React from "react"

/**
 * Defines the shape for a single access level option.
 */
export interface AccessLevelOption {
  value: string;
  label: string;
  description: string;
  /**
   * The icon component to render (e.g., Lock, Link, Globe)
   */
  icon: React.ComponentType<{ className: string }>;
}

/**
 * Props for the new generic, reusable component.
 */
interface GenericGeneralAccessSectionProps {
  /** The currently selected value (e.g., "restricted", "anyoneWithLink") */
  currentValue: string;
  
  /** Callback function when the value changes */
  onValueChange: (value: string) => void;
  
  /** An array of access level definitions */
  accessLevels: AccessLevelOption[];
  
  /** Whether the select dropdown is disabled */
  disabled?: boolean;
  
  /** Optional class name for the outer wrapper div */
  wrapperClassName?: string;
}

/**
 * This is the new, reusable component that contains all the UI logic.
 * It is "dumb" and receives all its data and behavior via props.
 */
export function GenericGeneralAccessSection({
  currentValue,
  onValueChange,
  accessLevels,
  disabled = false,
  wrapperClassName = "space-y-3" // Default style
}: GenericGeneralAccessSectionProps) {
  
  // Find the currently selected option to display its icon and label in the trigger
  const currentOption =
    accessLevels.find(level => level.value === currentValue) || accessLevels[0];

  return (
    <div className={wrapperClassName}>
      <h3 className="text-sm font-medium">General access</h3>
      
      <Select 
        value={currentValue} 
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full h-11">
          <div className="flex items-center gap-3">
            {/* Render the icon dynamically */}
            <currentOption.icon className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">{currentOption.label}</span>
          </div>
        </SelectTrigger>
        <SelectContent>
          {/* Map over the provided options to create the dropdown items */}
          {accessLevels.map((level) => (
            <SelectItem key={level.value} value={level.value}>
              <div className="flex items-start gap-3 py-1">
                <level.icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{level.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {level.description}
                  </p>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}