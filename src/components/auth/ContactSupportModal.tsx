// src/components/auth/ContactSupportModal.tsx

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "convex/react"; // Import useMutation
import { api } from "../../../convex/_generated/api"; // Import your API

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// Form validation schema (no changes needed here)
const formSchema = z.object({
  subject: z.string().min(1, "Subject is required").max(200, "Subject must be less than 200 characters"),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000, "Message must be less than 2000 characters"),
});

type FormValues = z.infer<typeof formSchema>;

type ContactSupportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
};

export function ContactSupportModal({ isOpen, onClose, userEmail }: ContactSupportModalProps) {
  // Set up the mutation hook
  const sendSupportMessage = useMutation(api.myFunctions.sendSupportMessage);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      // Call the Convex mutation instead of the console.log
      await sendSupportMessage({
        subject: values.subject,
        message: values.message,
      });

      // Show success message
      alert("Your message has been sent to support!");

      // Reset form and close modal
      form.reset();
      onClose();
    } catch (error) {
      console.error("Error sending support request:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const messageLength = form.watch("message")?.length || 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Contact Support</DialogTitle>
          <DialogDescription>
            We'll get back to you at:{" "}
            <span className="font-medium text-foreground">{userEmail || "your email"}</span>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Subject Field */}
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Subject <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Brief description of your issue"
                      {...field}
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Message Field */}
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Message <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please provide details about your issue..."
                      className="resize-none min-h-[150px]"
                      {...field}
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    {messageLength} / 2000 characters
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}