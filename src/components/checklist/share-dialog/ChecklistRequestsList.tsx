// src/components/checklist/share-dialog/ChecklistRequestsList.tsx

import { User, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PendingRequest {
  id: string;
  name: string;
  email: string;
  requestedRole: "qa_tester" | "qa_lead" | "viewer";
  requestMessage?: string;
  requestedAt: number;
}

interface ChecklistRequestsListProps {
  pendingRequests: PendingRequest[] | undefined;
  expandedRequests: Record<string, boolean>;
  selectedRequestRoles: Record<string, "qa_tester" | "qa_lead" | "viewer">;
  onToggleExpand: (requestId: string) => void;
  onSelectRole: (requestId: string, role: "qa_tester" | "qa_lead" | "viewer") => void;
  onApproveRequest: (requestId: string, finalRole: "qa_tester" | "qa_lead" | "viewer") => void;
  onDeclineRequest: (requestId: string) => void;
}

export function ChecklistRequestsList({
  pendingRequests,
  expandedRequests,
  selectedRequestRoles,
  onToggleExpand,
  onSelectRole,
  onApproveRequest,
  onDeclineRequest,
}: ChecklistRequestsListProps) {
  const formatTimeAgo = (timestamp: number) => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="space-y-4">
      {!pendingRequests || pendingRequests.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <User className="h-12 w-12 mx-auto mb-2 text-gray-400" />
          <p className="text-sm font-medium">No pending requests</p>
          <p className="text-xs mt-1">Access requests will appear here</p>
        </div>
      ) : (
        pendingRequests.map((request) => (
          <div key={request.id} className="border rounded-lg overflow-hidden bg-white">
            <div className="p-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium">
                    {request.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{request.name}</p>
                    <p className="text-xs text-gray-500">{request.email}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Requested {formatTimeAgo(request.requestedAt)}
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onToggleExpand(request.id)}
                  className="flex items-center gap-1 text-xs h-8 px-3"
                >
                  {expandedRequests[request.id] ? "Hide Details" : "View Details"}
                  {expandedRequests[request.id] ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </Button>
              </div>

              {expandedRequests[request.id] && (
                <div className="space-y-3 pt-3 border-t">
                  <div>
                    <p className="text-xs text-gray-600 mb-1 font-medium">Requested Role</p>
                    <p className="text-sm font-medium uppercase tracking-wide">
                      {request.requestedRole.replace('_', ' ')}
                    </p>
                  </div>

                  {request.requestMessage && 
                   request.requestMessage.trim() !== "" && 
                   request.requestMessage.toLowerCase() !== "no message provided" && 
                   request.requestMessage.toLowerCase() !== "no message" && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1 font-medium">Message</p>
                      <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded border">
                        {request.requestMessage}
                      </p>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Select
                      value={selectedRequestRoles[request.id] || request.requestedRole}
                      onValueChange={(v: any) => onSelectRole(request.id, v)}
                    >
                      <SelectTrigger className="w-full h-9 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="qa_tester">QA Tester</SelectItem>
                        <SelectItem value="qa_lead">QA Lead</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() =>
                        onApproveRequest(
                          request.id,
                          selectedRequestRoles[request.id] || request.requestedRole as any
                        )
                      }
                      className="flex-1 bg-black hover:bg-gray-800 h-9"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => onDeclineRequest(request.id)}
                      variant="outline"
                      className="flex-1 h-9"
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}