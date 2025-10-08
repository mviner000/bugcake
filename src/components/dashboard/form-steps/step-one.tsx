// src/components/dashboard/form-steps/step-one.tsx

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronRight } from "lucide-react"
import { FormData } from "../multi-step-form"

const stepOneSchema = z.object({
  sheetName: z.string().min(1, "Sheet name is required"),
  templateType: z.enum(["functionality", "altTextAriaLabel"], {
    message: "Please select a template type",
  }),
})

type StepOneData = z.infer<typeof stepOneSchema>

interface StepOneProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  nextStep: () => void
}

export function StepOne({ formData, updateFormData, nextStep }: StepOneProps) {
  const form = useForm<StepOneData>({
    resolver: zodResolver(stepOneSchema),
    defaultValues: {
      sheetName: formData.sheetName,
      templateType: formData.templateType,
    },
  })

  const onSubmit = (data: StepOneData) => {
    updateFormData(data)
    nextStep()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="sheetName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sheet Name</FormLabel>
              <Input placeholder="Enter sheet name" {...field} />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="templateType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select template type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="functionality">Functionality</SelectItem>
                  <SelectItem value="altTextAriaLabel">AltTextAriaLabel</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </form>
    </Form>
  )
}