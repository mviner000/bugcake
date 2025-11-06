// src/components/checklist/ChecklistStatusConfirmationDialog.tsx

import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ChecklistStatusConfirmationDialogProps {
  isOpen: boolean;
  newStatus: string | null;
  actualResults: string;
  onActualResultsChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ChecklistStatusConfirmationDialog({
  isOpen,
  newStatus,
  actualResults,
  onActualResultsChange,
  onConfirm,
  onCancel,
}: ChecklistStatusConfirmationDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Confirm Status Change
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to change the test case status to{" "}
            <span className="font-semibold text-gray-900">
              {newStatus}
            </span>
            ? This action will be recorded in the test execution history.
          </AlertDialogDescription>

          {newStatus === "Failed" && (
            <div className="pt-4 space-y-2">
              <Label htmlFor="actual-results" className="font-semibold text-gray-800">
                Actual Results (Required for Failed)
              </Label>
              <Textarea
                id="actual-results"
                placeholder="Describe what actually happened..."
                value={actualResults}
                onChange={(e) => onActualResultsChange(e.target.value)}
                className="min-h-[100px] bg-white"
              />
            </div>
          )}

        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            disabled={newStatus === "Failed" && !actualResults.trim()}
          >
            Confirm Change
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}