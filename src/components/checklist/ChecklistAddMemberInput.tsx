import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChecklistAddMemberInputProps {
  newMemberEmail: string;
  newMemberRole: "qa_tester" | "qa_lead" | "viewer";
  onEmailChange: (email: string) => void;
  onRoleChange: (role: "qa_tester" | "qa_lead" | "viewer") => void;
  onAddMember: () => void;
  canManageMembers: boolean;
}

export function ChecklistAddMemberInput({
  newMemberEmail,
  newMemberRole,
  onEmailChange,
  onRoleChange,
  onAddMember,
  canManageMembers,
}: ChecklistAddMemberInputProps) {
  if (!canManageMembers) {
    return null;
  }

  return (
    <div className="px-5">
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="Add people by email"
          value={newMemberEmail}
          onChange={(e) => onEmailChange(e.target.value)}
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter") onAddMember();
          }}
        />
        <Select value={newMemberRole} onValueChange={(v: any) => onRoleChange(v)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="viewer">Viewer</SelectItem>
            <SelectItem value="qa_tester">QA Tester</SelectItem>
            <SelectItem value="qa_lead">QA Lead</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={onAddMember} disabled={!newMemberEmail.trim()}>
          Add
        </Button>
      </div>
    </div>
  );
}