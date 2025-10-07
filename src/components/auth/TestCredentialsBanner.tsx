// src/components/auth/TestCredentialsBanner.tsx
"use client"

import { useState } from "react"
import copy from "copy-to-clipboard"
import { AlertCircle, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TestCredentialsBanner() {
  const [copied, setCopied] = useState(false)
  const testEmail = "test-bugcake@example.com"

  const handleCopy = () => {
    copy(testEmail)
    setCopied(true)
    alert('password: "123456789"')
    setTimeout(() => setCopied(false), 2000) // reset after 2s
  }

  return (
    <div className="mb-6 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-400 rounded-lg p-6 shadow-lg animate-pulse-subtle">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 bg-amber-400 rounded-full p-2">
          <AlertCircle className="w-6 h-6 text-amber-900" />
        </div>

        <div className="flex-1">
          <p className="text-base font-bold text-amber-900 mb-2">🧪 Testing this app?</p>
          <p className="text-sm text-amber-800 mb-3">
            Use these test credentials to log in:
          </p>

          <div className="flex items-center justify-between bg-white border-2 border-amber-300 rounded-md p-3 shadow-sm">
            <code className="text-sm font-mono font-semibold text-amber-900">
              {testEmail}
            </code>
            <Button
              type="button"
              onClick={handleCopy}
              variant="ghost"
              size="sm"
              className="text-amber-800 hover:text-amber-900 hover:bg-amber-100"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-1 text-green-600" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}