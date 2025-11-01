// src/components/checklist/ChecklistPeopleAccessHeader.tsx

import { Link, Mail } from "lucide-react";

interface ChecklistPeopleAccessHeaderProps {
  activeTab: "all" | "requests";
  onTabChange: (tab: "all" | "requests") => void;
  onCopyLink: () => void;
  canManageMembers: boolean;
  pendingRequestsCount: number;
}

export function ChecklistPeopleAccessHeader({
  activeTab,
  onTabChange,
  onCopyLink,
  canManageMembers,
  pendingRequestsCount,
}: ChecklistPeopleAccessHeaderProps) {
  return (
    <div className="px-5 pt-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">People with access</h3>
        <div className="flex items-center gap-3">
          <button 
            className="text-gray-600 hover:text-gray-800"
            onClick={onCopyLink}
          >
            <Link className="w-5 h-5" />
          </button>
          <button className="text-gray-600 hover:text-gray-800">
            <Mail className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs - Only show if user can manage members */}
      {canManageMembers && (
        <div className="grid grid-cols-2 border rounded-lg overflow-hidden">
          <button
            onClick={() => onTabChange("all")}
            className={`py-2 text-sm font-medium ${
              activeTab === "all"
                ? "bg-white border-b-2 border-black"
                : "bg-gray-50 text-gray-600"
            }`}
          >
            All
          </button>
          <button
            onClick={() => onTabChange("requests")}
            className={`py-2 text-sm font-medium relative ${
              activeTab === "requests"
                ? "bg-white border-b-2 border-black"
                : "bg-gray-50 text-gray-600"
            }`}
          >
            Requests
            {pendingRequestsCount > 0 && (
              <span className="absolute top-1 right-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">
                {pendingRequestsCount}
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}