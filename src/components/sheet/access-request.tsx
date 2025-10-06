// src/components/sheet/access-request.tsx

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User } from "lucide-react"

export function AccessRequest() {
  const [accessLevel, setAccessLevel] = useState("editor")
  const [message, setMessage] = useState("")

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-width-[1200px] flex items-center justify-center gap-16">
        {/* Left side - Form */}
        <div className="flex flex-col gap-6 max-w-[500px]">
          {/* Google Sheets Header */}
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
          <RadioGroup value={accessLevel} onValueChange={setAccessLevel}>
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
          />

          {/* Request Access Button */}
          <Button className="bg-[#1a73e8] hover:bg-[#1765cc] text-white font-medium text-[14px] px-6 py-2 h-auto rounded-full w-fit">
            Request access
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
              <span className="text-[14px] text-[#202124]">melvin.nagoy@mph-intl.com</span>
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
