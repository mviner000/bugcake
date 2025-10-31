// src/components/sheet/access-request.tsx

import { useMutation } from "convex/react"
import { useParams } from "react-router-dom"
import { api } from "../../../convex/_generated/api"
import { AccessRequest } from "@/components/shared/access-request"

/**
 * Sheet-specific wrapper for the reusable AccessRequest component.
 * Maintains backward compatibility with existing sheet access flow.
 */
export function SheetAccessRequest() {
  const { sheetId } = useParams()
  
  // Mutation to request access to a sheet
  const requestAccess = useMutation(api.myFunctions.requestSheetAccess)

  if (!sheetId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Invalid Sheet</h2>
          <p className="text-gray-600 mb-6">
            No sheet ID was provided.
          </p>
        </div>
      </div>
    )
  }

  return (
    <AccessRequest
      config={{
        resourceId: sheetId,
        resourceType: "sheet",
        requestMutation: requestAccess,
        pageTitle: "You need access",
        pageDescription: "Request access, or switch to an account with access.",
        successMessage: "Request sent",
        successDescription: "The owner has been notified of your access request. You'll receive an email once it's been reviewed.",
      }}
    />
  )
}

// Export as default for backward compatibility
export default SheetAccessRequest

// Also export with the original name for existing imports
export { SheetAccessRequest as AccessRequest }