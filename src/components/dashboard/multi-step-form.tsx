// src/components/dashboard/multi-step-form.tsx

import { useState } from "react"
import { StepOne } from "./form-steps/step-one"
import { StepTwo } from "./form-steps/step-two"
import { StepThree } from "./form-steps/step-three"
import { useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { useNavigate } from "react-router-dom"

export type TemplateType = "functionality" | "altTextAriaLabel"

export interface FormData {
  sheetName: string
  templateType: TemplateType
  modules: string[]
}

export function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    sheetName: "",
    templateType: "functionality",
    modules: [],
  })
  
  const createSheetWithModules = useMutation(api.myFunctions.createSheetWithModules)
  const navigate = useNavigate()

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 3))
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1))
  const goToStep = (step: number) => setCurrentStep(step)

  const handleFinalSubmit = async () => {
    try {
      // ✅ SIMPLIFIED: Pass all modules directly to the unified mutation
      const sheetId = await createSheetWithModules({
        name: formData.sheetName,
        type: "sheet",
        testCaseType: formData.templateType,
        shared: false,
        isPublic: false,
        requestable: false,
        modules: formData.modules, // ✅ Pass all modules at once
      })
      
      alert("✅ Template created successfully!")
      console.log("Form submitted:", formData)
      console.log("Sheet ID:", sheetId)
      
      // Redirect to the newly created sheet page
      navigate(`/sheet/${sheetId}`)
      
    } catch (error) {
      console.error("Failed to create sheet:", error)
      alert("❌ Failed to create template. Please try again.")
    }
  }

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`h-2 w-8 rounded-full ${
                currentStep >= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-muted-foreground">
          Step {currentStep} of 3
        </span>
      </div>

      {/* Step content */}
      {currentStep === 1 && (
        <StepOne 
          formData={formData} 
          updateFormData={updateFormData} 
          nextStep={nextStep} 
        />
      )}
      {currentStep === 2 && (
        <StepTwo
          formData={formData}
          updateFormData={updateFormData}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      )}
      {currentStep === 3 && (
        <StepThree 
          formData={formData} 
          prevStep={prevStep}
          goToStep={goToStep}
          onSubmit={handleFinalSubmit}
        />
      )}
    </div>
  )
}