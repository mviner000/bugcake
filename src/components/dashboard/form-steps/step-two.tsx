// src/components/dashboard/form-steps/step-two.tsx

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react"
import { FormData } from "../multi-step-form"

const stepTwoSchema = z.object({
  modules: z
    .array(z.object({ value: z.string().min(1, "Module name is required") }))
    .min(1, "At least one module is required"),
})

type StepTwoData = z.infer<typeof stepTwoSchema>

interface StepTwoProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  nextStep: () => void
  prevStep: () => void
}

export function StepTwo({ formData, updateFormData, nextStep, prevStep }: StepTwoProps) {
  const form = useForm<StepTwoData>({
    resolver: zodResolver(stepTwoSchema),
    defaultValues: {
      modules: formData.modules.length > 0 ? formData.modules.map((m) => ({ value: m })) : [{ value: "" }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "modules",
  })

  const onSubmit = (data: StepTwoData) => {
    const modules = data.modules.map((m) => m.value).filter((m) => m.trim() !== "")
    updateFormData({ modules })
    nextStep()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <FormLabel className="text-base">Modules</FormLabel>
          <p className="text-sm text-muted-foreground mb-4">
            Add the modules for your template
          </p>
          
          {fields.map((field, index) => (
            <FormField
              key={field.id}
              control={form.control}
              name={`modules.${index}.value`}
              render={({ field }) => (
                <FormItem className={index > 0 ? "mt-4" : ""}>
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder={`Module ${index + 1}`}
                      {...field}
                    />
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => remove(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ value: "" })}
            className="w-full mt-4"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Module
          </Button>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={prevStep} type="button">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button type="submit">
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </form>
    </Form>
  )
}