// src/components/checklist/share-dialog/ChecklistMembersDialogFooter.tsx

import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChecklistMembersDialogFooterProps {
  isCopied: boolean;
  onCopyLink: () => void;
  onClose: () => void;
}

export function ChecklistMembersDialogFooter({
  isCopied,
  onCopyLink,
  onClose,
}: ChecklistMembersDialogFooterProps) {
  return (
    <div className="px-5 py-4 border-t flex items-center justify-between">
      <Button variant="outline" onClick={onCopyLink} disabled={isCopied}>
        {isCopied ? (
          <Check className="h-4 w-4 mr-2 text-green-600" />
        ) : (
          <Copy className="h-4 w-4 mr-2" />
        )}
        {isCopied ? "Copied!" : "Copy link"}
      </Button>
      <Button onClick={onClose}>
        Done
      </Button>
    </div>
  );
}