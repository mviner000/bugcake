// src/components/shared/access-request.tsx

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, CheckCircle2 } from "lucide-react"

// Define the role types
type RequestableRole = "viewer" | "qa_lead" | "qa_tester";

// Generic access request configuration
interface AccessRequestConfig {
  resourceId: string; // The ID of the resource (sheet, checklist, etc.)
  resourceType: "sheet" | "checklist" | string; // Type of resource
  requestMutation: any; // The Convex mutation to call
  availableRoles?: Array<{
    value: RequestableRole;
    label: string;
  }>;
  successMessage?: string;
  successDescription?: string;
  pageTitle?: string;
  pageDescription?: string;
  learnMoreUrl?: string;
}

interface AccessRequestProps {
  config: AccessRequestConfig;
}

const DEFAULT_ROLES = [
  { value: "viewer" as RequestableRole, label: "Viewer" },
  { value: "qa_tester" as RequestableRole, label: "QA Tester" },
  { value: "qa_lead" as RequestableRole, label: "QA Lead" },
];

export function AccessRequest({ config }: AccessRequestProps) {
  const {
    resourceId,
    resourceType,
    requestMutation,
    availableRoles = DEFAULT_ROLES,
    successMessage = "Request sent",
    successDescription = "The owner has been notified of your access request. You'll receive an email once it's been reviewed.",
    pageTitle = "You need access",
    pageDescription = "Request access, or switch to an account with access.",
    learnMoreUrl = "#",
  } = config;

  const [accessLevel, setAccessLevel] = useState<RequestableRole>(availableRoles[0].value)
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Fetch the current user's profile dynamically
  const userProfile = useQuery(api.myFunctions.getMyProfile)
  
  // Extract email with fallback
  const userEmail = userProfile?.email || "Loading..."

  const handleRequestAccess = async () => {
    if (!resourceId) {
      setSubmitError(`Invalid ${resourceType} ID`)
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Build the request payload dynamically based on resource type
      const payload: any = {
        accessLevel,
        message: message.trim() || undefined,
      }

      // Add the appropriate ID field based on resource type
      if (resourceType === "sheet") {
        payload.sheetId = resourceId
      } else if (resourceType === "checklist") {
        payload.checklistId = resourceId
      } else {
        // Generic fallback: use resourceId field
        payload.resourceId = resourceId
        payload.resourceType = resourceType
      }

      await requestMutation(payload)
      
      setSubmitSuccess(true)
      setMessage("") // Clear the message field
    } catch (error: any) {
      setSubmitError(error.message || "Failed to submit access request")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Success state
  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-[500px] flex flex-col items-center gap-6">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>

          {/* Success Message */}
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-[32px] font-normal text-[#202124] leading-tight">
              {successMessage}
            </h1>
            <p className="text-[14px] text-[#5f6368]">
              {successDescription}
            </p>
          </div>

          {/* Back to Dashboard Button */}
          <Button
            onClick={() => window.location.href = "/"}
            className="bg-[#1a73e8] hover:bg-[#1765cc] text-white font-medium text-[14px] px-6 py-2 h-auto rounded-full"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-width-[1200px] flex items-center justify-center gap-16">
        {/* Left side - Form */}
        <div className="flex flex-col gap-6 max-w-[500px]">
          {/* BugCake Header */}
          <div className="flex items-center gap-2">
            <img src="/bugcake-favicon.ico" alt="bugcake logo" />
            <span className="text-[#5f6368] text-2xl font-normal">BugCake</span>
          </div>

          {/* Heading */}
          <div className="flex flex-col gap-2">
            <h1 className="text-[32px] font-normal text-[#202124] leading-tight">{pageTitle}</h1>
            <p className="text-[14px] text-[#5f6368]">
              {pageDescription}{" "}
              <a href={learnMoreUrl} className="text-[#1a73e8] hover:underline">
                Learn more
              </a>
            </p>
          </div>

          {/* Radio Group */}
          <RadioGroup value={accessLevel} onValueChange={(value) => setAccessLevel(value as RequestableRole)}>
            {availableRoles.map((role) => (
              <div key={role.value} className="flex items-center space-x-3 py-2">
                <RadioGroupItem value={role.value} id={role.value} />
                <Label htmlFor={role.value} className="text-[14px] text-[#202124] font-normal cursor-pointer">
                  {role.label}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {/* Message Textarea */}
          <Textarea
            placeholder="Message (optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[100px] resize-none text-[14px] border-[#dadce0] focus:border-[#1a73e8] focus:ring-[#1a73e8]"
            disabled={isSubmitting}
          />

          {/* Error Message */}
          {submitError && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-3">
              {submitError}
            </div>
          )}

          {/* Request Access Button */}
          <Button 
            onClick={handleRequestAccess}
            disabled={isSubmitting}
            className="bg-[#1a73e8] hover:bg-[#1765cc] text-white font-medium text-[14px] px-6 py-2 h-auto rounded-full w-fit disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : "Request access"}
          </Button>

          {/* Signed in as */}
          <div className="flex flex-col items-center gap-3 mt-8">
            <span className="text-[14px] text-[#5f6368]">{"You're signed in as"}</span>
            <div className="flex items-center gap-2 border border-[#dadce0] rounded-full px-3 py-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-[#1a73e8] text-white text-xs">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <span className="text-[14px] text-[#202124]">{userEmail}</span>
            </div>
          </div>
        </div>

        {/* Right side - Illustration */}
        <div className="hidden lg:block">
          <img src="/declined-bee.png" className="h-[240px]" alt="Declined bee" />
        </div>
      </div>
    </div>
  )
}