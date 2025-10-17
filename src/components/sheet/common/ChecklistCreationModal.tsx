import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChecklistCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    sprintName: string;
    titleRevisionNumber: string;
    testExecutorAssigneeId: string;
    goalDateToFinish: number;
    description?: string;
  }) => Promise<void>;
  selectedCount: number;
  sheetId: Id<"sheets">;
}

export function ChecklistCreationModal({
  isOpen,
  onClose,
  onSubmit,
  selectedCount,
  sheetId,
}: ChecklistCreationModalProps) {
  const [sprintName, setSprintName] = useState("");
  const [titleRevisionNumber, setTitleRevisionNumber] = useState("");
  const [executorId, setExecutorId] = useState("");
  const [goalDate, setGoalDate] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch users with access to this sheet for executor selection
  const usersWithAccess = useQuery(api.myFunctions.getUsersWithAccess, {
    sheetId,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sprintName.trim() || !titleRevisionNumber.trim() || !executorId || !goalDate) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        sprintName: sprintName.trim(),
        titleRevisionNumber: titleRevisionNumber.trim(),
        testExecutorAssigneeId: executorId,
        goalDateToFinish: new Date(goalDate).getTime(),
        description: description.trim() || undefined,
      });
      
      // Reset form
      setSprintName("");
      setTitleRevisionNumber("");
      setExecutorId("");
      setGoalDate("");
      setDescription("");
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Test Execution Checklist</DialogTitle>
          <DialogDescription>
            Create a sprint checklist from {selectedCount} approved test case(s).
            This creates an immutable snapshot for execution tracking.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sprintName">
              Sprint Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="sprintName"
              placeholder="e.g., Sprint 24 - User Authentication"
              value={sprintName}
              onChange={(e) => setSprintName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="revisionNumber">
              Title Revision Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="revisionNumber"
              placeholder="e.g., v1.0, v2.1-hotfix"
              value={titleRevisionNumber}
              onChange={(e) => setTitleRevisionNumber(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="executor">
              Test Executor <span className="text-red-500">*</span>
            </Label>
            <Select value={executorId} onValueChange={setExecutorId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select executor" />
              </SelectTrigger>
              <SelectContent>
                {usersWithAccess?.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goalDate">
              Goal Completion Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="goalDate"
              type="date"
              value={goalDate}
              onChange={(e) => setGoalDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Sprint goals, testing notes, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Checklist"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}