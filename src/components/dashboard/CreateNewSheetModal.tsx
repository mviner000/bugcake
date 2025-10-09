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
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { Loader2, Plus, X } from "lucide-react";

// Define the shape of the form data
interface NewSheetFormData {
  name: string;
  type: "sheet" | "doc" | "pdf" | "folder" | "other";
  testCaseType: "functionality" | "altTextAriaLabel";
  modules: { value: string }[]; // ✅ UPDATED: Array of module objects
}

// Define props for the modal
interface CreateNewSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Updated to pass array of module names
  onSubmit: (data: { 
    name: string;
    type: "sheet" | "doc" | "pdf" | "folder" | "other";
    testCaseType: "functionality" | "altTextAriaLabel";
    modules: string[]; // Array of strings
  }) => Promise<void>; 
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
    formState: { isSubmitting, errors },
    reset,
  } = useForm<NewSheetFormData>({
    defaultValues: {
      name: "Untitled Sheet",
      type: "sheet",
      testCaseType: "functionality",
      modules: [{ value: "" }], // ✅ Start with one empty module
    },
  });

  // ✅ NEW: useFieldArray for dynamic module inputs
  const { fields, append, remove } = useFieldArray({
    control,
    name: "modules",
  });

  const handleFormSubmit = async (data: NewSheetFormData) => {
    // ✅ Transform modules array to just strings, filter empty values
    const moduleNames = data.modules
      .map((m) => m.value.trim())
      .filter((m) => m !== "");

    await onSubmit({
      name: data.name,
      type: data.type,
      testCaseType: data.testCaseType,
      modules: moduleNames,
    });
    reset();
    onClose();
  };

  const handleClose = () => {
    reset(); // Reset form when closing
    onClose();
  };

  // Auto-populated fields (read-only in the modal)
  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const ownerPlaceholder = "Logged-in User (Auto-identified)"; 

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
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
            <div className="col-span-3">
              <Input
                id="name"
                {...register("name", { required: "Sheet name is required" })}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>
          </div>
          
          {/* ✅ NEW: Multiple Module Inputs */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">
              Modules
            </Label>
            <div className="col-span-3 space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <Input
                    placeholder={`e.g., User Profile, Dashboard`}
                    {...register(`modules.${index}.value`, {
                      required: index === 0 ? "At least one module is required" : false,
                    })}
                  />
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => remove(index)}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {errors.modules?.[0]?.value && (
                <p className="text-sm text-red-500">
                  {errors.modules[0].value.message}
                </p>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ value: "" })}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Module
              </Button>
            </div>
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
            <Button variant="outline" type="button" onClick={handleClose}>
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