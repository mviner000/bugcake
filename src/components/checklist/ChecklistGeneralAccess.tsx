// src/components/checklist/ChecklistGeneralAccess.tsx

import { Lock, Link, Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

interface ChecklistGeneralAccessProps {
  generalAccess: "restricted" | "anyone_with_link" | "public";
  onAccessChange: (value: "restricted" | "anyone_with_link" | "public") => void;
  canManageMembers: boolean;
}

export function ChecklistGeneralAccess({
  generalAccess,
  onAccessChange,
  canManageMembers,
}: ChecklistGeneralAccessProps) {
  const getAccessLevelLabel = (level: "restricted" | "anyone_with_link" | "public"): string => {
    switch (level) {
      case "restricted":
        return "Restricted";
      case "anyone_with_link":
        return "Anyone with the link";
      case "public":
        return "Public";
      default:
        return "Restricted";
    }
  };

  return (
    <div className="px-5 py-3 border-t">
      <h3 className="text-sm font-medium mb-3">General access</h3>
      
      <Select 
        value={generalAccess} 
        onValueChange={(value) => onAccessChange(value as "restricted" | "anyone_with_link" | "public")}
        disabled={!canManageMembers}
      >
        <SelectTrigger className="w-full h-11">
          <div className="flex items-center gap-3">
            {generalAccess === "restricted" && <Lock className="h-4 w-4 flex-shrink-0" />}
            {generalAccess === "anyone_with_link" && <Link className="h-4 w-4 flex-shrink-0" />}
            {generalAccess === "public" && <Globe className="h-4 w-4 flex-shrink-0" />}
            <span className="text-sm">{getAccessLevelLabel(generalAccess)}</span>
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="restricted">
            <div className="flex items-start gap-3 py-1">
              <Lock className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Restricted</p>
                <p className="text-xs text-muted-foreground">
                  Only people with access can open with the link
                </p>
              </div>
            </div>
          </SelectItem>
          <SelectItem value="anyone_with_link">
            <div className="flex items-start gap-3 py-1">
              <Link className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Anyone with the link</p>
                <p className="text-xs text-muted-foreground">
                  Anyone with the link can access
                </p>
              </div>
            </div>
          </SelectItem>
          <SelectItem value="public">
            <div className="flex items-start gap-3 py-1">
              <Globe className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Public</p>
                <p className="text-xs text-muted-foreground">
                  Anyone on the internet can find and access
                </p>
              </div>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}