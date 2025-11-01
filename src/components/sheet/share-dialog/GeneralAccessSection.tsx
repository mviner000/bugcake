// components/sheet/GeneralAccessSection.tsx

import { Lock, LinkIcon, Globe } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"

interface GeneralAccessSectionProps {
  currentAccessLevel: string
  onAccessLevelChange: (level: "restricted" | "anyoneWithLink" | "public") => void
}

export function GeneralAccessSection({
  currentAccessLevel,
  onAccessLevelChange,
}: GeneralAccessSectionProps) {
  const getAccessLevelLabel = (level: string) => {
    switch (level) {
      case "restricted":
        return "Restricted"
      case "anyoneWithLink":
        return "Anyone with the link"
      case "public":
        return "Public"
      default:
        return "Restricted"
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">General access</h3>
      
      <Select value={currentAccessLevel} onValueChange={(value) => onAccessLevelChange(value as "restricted" | "anyoneWithLink" | "public")}>
        <SelectTrigger className="w-full h-11">
          <div className="flex items-center gap-3">
            {currentAccessLevel === "restricted" && <Lock className="h-4 w-4 flex-shrink-0" />}
            {currentAccessLevel === "anyoneWithLink" && <LinkIcon className="h-4 w-4 flex-shrink-0" />}
            {currentAccessLevel === "public" && <Globe className="h-4 w-4 flex-shrink-0" />}
            <span className="text-sm">{getAccessLevelLabel(currentAccessLevel)}</span>
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
          <SelectItem value="anyoneWithLink">
            <div className="flex items-start gap-3 py-1">
              <LinkIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
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
  )
}