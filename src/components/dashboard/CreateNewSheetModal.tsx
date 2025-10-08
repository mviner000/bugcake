// src/components/dashboard/CreateNewSheetModal.tsx

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { Loader2 } from "lucide-react";

// Define the shape of the form data
interface NewSheetFormData {
  name: string;
  type: "sheet" | "doc" | "pdf" | "folder" | "other";
  testCaseType: "functionality" | "altTextAriaLabel";
}

// Define props for the modal
interface CreateNewSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  // This function would be where you call a Convex mutation (e.g., api.sheets.create)
  onSubmit: (data: NewSheetFormData) => Promise<void>; 
}

export function CreateNewSheetModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateNewSheetModalProps) {
  const {
    handleSubmit,
    control,
    register,
    formState: { isSubmitting },
    reset,
  } = useForm<NewSheetFormData>({
    defaultValues: {
      name: "Untitled Sheet", // Good default name
      type: "sheet", // Default to 'sheet'
      testCaseType: "functionality", // Default to a common type
    },
  });

  const handleFormSubmit = async (data: NewSheetFormData) => {
    await onSubmit(data);
    reset(); // Reset form fields after successful submission
    onClose(); // Close the modal
  };

  // Auto-populated fields (read-only in the modal)
  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  // NOTE: The 'Owner' will be set on the backend, but we can show a placeholder or
  // the current user's name on the frontend if you have access to the user context.
  const ownerPlaceholder = "Logged-in User (Auto-identified)"; 

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Sheet 📄</DialogTitle>
          <DialogDescription>
            Configure the properties for your new document.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="grid gap-4 py-4">
          
          {/* Sheet Name Input */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              {...register("name")}
              className="col-span-3"
            />
          </div>
          
          {/* Test Case Type Select */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="testCaseType" className="text-right">
              Template
            </Label>
            <Controller
              name="testCaseType"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger id="testCaseType" className="col-span-3">
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="functionality">
                      Functionality Test
                    </SelectItem>
                    <SelectItem value="altTextAriaLabel">
                      Alt/Aria Accessibility
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* --- Auto-Populated Fields (Read-Only) --- */}
          <div className="grid grid-cols-4 items-center gap-4 border-t pt-4 mt-2">
            <Label className="text-right text-gray-500">
              Created Date
            </Label>
            <Input
              value={currentDate}
              readOnly
              className="col-span-3 bg-gray-50 text-gray-500"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right text-gray-500">
              Owner
            </Label>
            <Input
              value={ownerPlaceholder}
              readOnly
              className="col-span-3 bg-gray-50 text-gray-500"
            />
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Sheet"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}