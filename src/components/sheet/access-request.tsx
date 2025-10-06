// src/components/sheet/access-request.tsx

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, CheckCircle2 } from "lucide-react"
import { useParams } from "react-router-dom"

export function AccessRequest() {
  const { sheetId } = useParams()
  const [accessLevel, setAccessLevel] = useState<"viewer" | "commenter" | "editor">("editor")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Fetch the current user's profile dynamically
  const userProfile = useQuery(api.myFunctions.getMyProfile)
  
  // Mutation to request access
  const requestAccess = useMutation(api.myFunctions.requestSheetAccess)

  // Extract email with fallback
  const userEmail = userProfile?.email || "Loading..."

  const handleRequestAccess = async () => {
    if (!sheetId) {
      setSubmitError("Invalid sheet ID")
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      await requestAccess({
        sheetId,
        accessLevel,
        message: message.trim() || undefined,
      })
      
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
              Request sent
            </h1>
            <p className="text-[14px] text-[#5f6368]">
              The owner has been notified of your access request. You'll receive an email once it's been reviewed.
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
            <h1 className="text-[32px] font-normal text-[#202124] leading-tight">You need access</h1>
            <p className="text-[14px] text-[#5f6368]">
              Request access, or switch to an account with access.{" "}
              <a href="#" className="text-[#1a73e8] hover:underline">
                Learn more
              </a>
            </p>
          </div>

          {/* Radio Group */}
          <RadioGroup value={accessLevel} onValueChange={(value) => setAccessLevel(value as typeof accessLevel)}>
            <div className="flex items-center space-x-3 py-2">
              <RadioGroupItem value="viewer" id="viewer" />
              <Label htmlFor="viewer" className="text-[14px] text-[#202124] font-normal cursor-pointer">
                Viewer
              </Label>
            </div>
            <div className="flex items-center space-x-3 py-2">
              <RadioGroupItem value="commenter" id="commenter" />
              <Label htmlFor="commenter" className="text-[14px] text-[#202124] font-normal cursor-pointer">
                Commenter
              </Label>
            </div>
            <div className="flex items-center space-x-3 py-2">
              <RadioGroupItem value="editor" id="editor" />
              <Label htmlFor="editor" className="text-[14px] text-[#202124] font-normal cursor-pointer">
                Editor
              </Label>
            </div>
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