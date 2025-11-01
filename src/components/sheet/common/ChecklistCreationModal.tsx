// src/components/sheet/common/ChecklistCreationModal.tsx

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
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ChecklistCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    sprintName: string;
    titleRevisionNumber: string;
    testExecutorAssigneeIds: string[];
    goalDateToFinish: number;
    description?: string;
    environment: "development" | "testing" | "production"; // ✅ NEW: Add environment
  }) => Promise<void>;
  selectedCount: number;
  sheetId: Id<"sheets">;
  testCaseType: "functionality" | "altTextAriaLabel";
}

export function ChecklistCreationModal({
  isOpen,
  onClose,
  onSubmit,
  selectedCount,
  sheetId,
  testCaseType,
}: ChecklistCreationModalProps) {
  const [sprintName, setSprintName] = useState("");
  const [titleRevisionNumber, setTitleRevisionNumber] = useState("");
  const [executorIds, setExecutorIds] = useState<string[]>([]);
  const [goalDate, setGoalDate] = useState("");
  const [description, setDescription] = useState("");
  const [environment, setEnvironment] = useState<"development" | "testing" | "production">("testing"); // ✅ NEW: Default to "testing"
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch users with access to this sheet for executor selection
  const usersWithAccess = useQuery(api.myFunctions.getUsersWithAccess, {
    sheetId,
  });

  const handleAddExecutor = (userId: string) => {
    if (!executorIds.includes(userId)) {
      setExecutorIds([...executorIds, userId]);
    }
  };

  const handleRemoveExecutor = (userId: string) => {
    setExecutorIds(executorIds.filter(id => id !== userId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sprintName.trim() || !titleRevisionNumber.trim() || executorIds.length === 0 || !goalDate || !environment) {
      alert("Please fill in all required fields and select at least one executor");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        sprintName: sprintName.trim(),
        titleRevisionNumber: titleRevisionNumber.trim(),
        testExecutorAssigneeIds: executorIds,
        goalDateToFinish: new Date(goalDate).getTime(),
        description: description.trim() || undefined,
        environment: environment, // ✅ NEW: Pass environment
      });
      
      // Reset form
      setSprintName("");
      setTitleRevisionNumber("");
      setExecutorIds([]);
      setGoalDate("");
      setDescription("");
      setEnvironment("testing"); // ✅ NEW: Reset to default
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get available users (not yet selected)
  const availableUsers = usersWithAccess?.filter(
    user => !executorIds.includes(user.id)
  ) || [];

  // Get selected users info
  const selectedUsers = executorIds.map(id => 
    usersWithAccess?.find(user => user.id === id)
  ).filter(Boolean);

  // Format test case type for display
  const testCaseTypeLabel = testCaseType === "functionality" 
    ? "Functionality" 
    : "Alt Text / Aria Label";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center">
              Create Test Execution Checklist
              <Badge variant="secondary" className="ml-1 bg-blue-500 text-white dark:bg-blue-600">
                {testCaseTypeLabel || "No type"}
              </Badge>
            </div>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Create a sprint checklist from {selectedCount} approved test case(s).
            This creates an immutable snapshot for execution tracking.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="revisionNumber">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="revisionNumber"
              placeholder="e.g., Smoke Testing v1.0"
              value={titleRevisionNumber}
              onChange={(e) => setTitleRevisionNumber(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sprintName">
              Sprint Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="sprintName"
              placeholder="e.g., Sprint Ares"
              value={sprintName}
              onChange={(e) => setSprintName(e.target.value)}
              required
            />
          </div>

          {/* ✅ NEW: Environment Selector */}
          <div className="space-y-2">
            <Label htmlFor="environment">
              Environment <span className="text-red-500">*</span>
            </Label>
            <select
              id="environment"
              className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-950"
              value={environment}
              onChange={(e) => setEnvironment(e.target.value as "development" | "testing" | "production")}
              required
            >
              <option value="development">Development</option>
              <option value="testing">Testing</option>
              <option value="production">Production</option>
            </select>
            <p className="text-xs text-gray-500">
              Select the environment where these tests will be executed
            </p>
          </div>

          <div className="space-y-3">
            <Label>
              Test Executors <span className="text-red-500">*</span> 
              {executorIds.length === 0 && (
                <p className="text-xs text-red-500">
                  Please select at least one test executor
                </p>
              )}
            </Label>
            
            {/* Selected Executors Display */}
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2 p-2 border rounded-md bg-gray-50 dark:bg-gray-900">
                {selectedUsers.map((user) => (
                  <div
                    key={user?.id}
                    className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-md text-sm"
                  >
                    <span>{user?.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveExecutor(user?.id || "")}
                      className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Executor Selection Dropdown */}
            <select
              className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-950"
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  handleAddExecutor(e.target.value);
                  e.target.value = ""; // Reset selection
                }
              }}
              disabled={availableUsers.length === 0}
            >
              <option value="">
                {availableUsers.length === 0 
                  ? "All users selected" 
                  : "Select an executor to add..."}
              </option>
              {availableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
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
              placeholder="Bugcake Production v1.8.2"
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