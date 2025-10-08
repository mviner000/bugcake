// src/components/dashboard/form-steps/step-three.tsx

import { Button } from "@/components/ui/button"
import { ChevronLeft, Check, Edit } from "lucide-react"
import { FormData } from "../multi-step-form"
import { Badge } from "@/components/ui/badge"

interface StepThreeProps {
  formData: FormData
  prevStep: () => void
  goToStep: (step: number) => void
  onSubmit: () => void
}

export function StepThree({ formData, prevStep, goToStep, onSubmit }: StepThreeProps) {
  const handleSubmit = () => {
    onSubmit()
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* Sheet Name Section */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex-1">
            <h3 className="font-medium text-sm text-muted-foreground">Sheet Name</h3>
            <p className="mt-1">{formData.sheetName}</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => goToStep(1)} 
            className="h-8 w-8"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>

        {/* Template Type Section */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex-1">
            <h3 className="font-medium text-sm text-muted-foreground">Template Type</h3>
            <p className="mt-1 capitalize">{formData.templateType}</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => goToStep(1)} 
            className="h-8 w-8"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>

        {/* Modules Section */}
        <div className="flex items-start justify-between p-4 border rounded-lg">
          <div className="flex-1">
            <h3 className="font-medium text-sm text-muted-foreground">
              Modules ({formData.modules.length})
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.modules.map((module, index) => (
                <Badge key={index} variant="secondary">
                  {module}
                </Badge>
              ))}
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => goToStep(2)} 
            className="h-8 w-8"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleSubmit}>
          <Check className="h-4 w-4 mr-2" />
          Submit
        </Button>
      </div>
    </div>
  )
}