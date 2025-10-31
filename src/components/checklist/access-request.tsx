// src/components/checklist/access-request.tsx

import { useMutation } from "convex/react"
import { useParams } from "react-router-dom"
import { api } from "../../../convex/_generated/api"
import { AccessRequest } from "@/components/shared/access-request"

/**
 * Checklist-specific wrapper for the reusable AccessRequest component.
 * Example of how to use the generic component for checklists.
 */
export function ChecklistAccessRequest() {
  const { checklistId } = useParams()
  
  // Mutation to request access to a checklist
  // NOTE: You'll need to create this mutation in your Convex backend
  const requestAccess = useMutation(api.myFunctions.requestChecklistAccess)

  if (!checklistId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Invalid Checklist</h2>
          <p className="text-gray-600 mb-6">
            No checklist ID was provided.
          </p>
        </div>
      </div>
    )
  }

  return (
    <AccessRequest
      config={{
        resourceId: checklistId,
        resourceType: "checklist",
        requestMutation: requestAccess,
        pageTitle: "You need access",
        pageDescription: "Request access to this checklist, or switch to an account with access.",
        successMessage: "Request sent",
        successDescription: "The checklist owner has been notified of your access request. You'll receive an email once it's been reviewed.",
        // Optional: customize available roles for checklists
        availableRoles: [
          { value: "viewer", label: "Viewer" },
          { value: "qa_tester", label: "Contributor" },
          { value: "qa_lead", label: "Admin" },
        ],
      }}
    />
  )
}

export default ChecklistAccessRequest