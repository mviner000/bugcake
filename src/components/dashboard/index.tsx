// src/Dashboard.tsx

import React from "react"; // Needed for useState
import {
  MoreVertical as MoreVert,
  LucideView as GridView,
  Shirt as Sort,
  Folder,
  UsersIcon,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
// Use both useQuery and useMutation
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CreateNewSheetModal } from "./CreateNewSheetModal";
// Import the new modal component


// Define a type for the data returned by listSheets for better type safety
type Sheet = {
    _id: string;
    _creationTime: number;
    name: string;
    type: string;
    owner: string;
    last_opened_at: number;
    created_at: number;
    updated_at: number;
    shared: boolean;
    isPublic?: boolean;
    requestable?: boolean;
    testCaseType?: "functionality" | "altTextAriaLabel";
    // Properties that might be joined/added in the Convex query
    ownerName: string;
    isOwnedByMe: boolean;
    hasPermissions: boolean;
    permissions?: { status: string; userEmail: string; level: string }[];
};

// Define the shape of the form data for the mutation
interface NewSheetFormData {
  name: string;
  type: "sheet" | "doc" | "pdf" | "folder" | "other";
  testCaseType: "functionality" | "altTextAriaLabel";
}


export function Dashboard() {
  const sheets = useQuery(api.myFunctions.listSheets) as Sheet[] | undefined;
  const navigate = useNavigate();
  
  // State to control the modal
  const [isModalOpen, setIsModalOpen] = React.useState(false); 

  // Get the Convex mutation to create a new sheet
  const createSheet = useMutation(api.myFunctions.createSheet); 

  if (sheets === undefined) {
    return (
      <div className="bg-gray-50 min-h-screen font-sans p-6 text-center">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  // Helper function to format date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);

    if (diffInDays < 1) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInDays <= 30) {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  const handleFileClick = (sheetId: string) => {
    void navigate(`/sheet/${sheetId}`);
  };
  
  // Function to handle the form submission from the modal
  const handleCreateSheet = async (data: NewSheetFormData) => {
    try {
      // Call the Convex mutation. The backend will handle the 'owner' (logged-in user)
      // and timestamps (created_at, updated_at, last_opened_at).
      const newSheetId = await createSheet({
        name: data.name,
        type: data.type,
        testCaseType: data.testCaseType,
        shared: false, // Defaulting shared to false on creation
      });
      // Navigate to the newly created sheet
      void navigate(`/sheet/${newSheetId}`); 
    } catch (error) {
      console.error("Failed to create new sheet:", error);
      // In a real app, you'd show a toast notification here
    }
  };


  const renderSheetList = (
    sheetList: Sheet[] | undefined,
    isFirstSection = false,
  ) => {
    if (!sheetList || sheetList.length === 0) {
      return null;
    }

    return (
      <div className="bg-white rounded-lg border border-gray-200">
        {isFirstSection && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Owned by anyone</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Last opened by me</span>
              <div className="flex items-center space-x-1 ml-4">
                <GridView className="w-4 h-4 cursor-pointer" />
                <Sort className="w-4 h-4 cursor-pointer" />
                <Folder className="w-4 h-4 cursor-pointer" />
              </div>
            </div>
          </div>
        )}
        {sheetList.map((file, index) => (
          <div
            key={file._id}
            className={`p-4 hover:bg-gray-50 cursor-pointer ${index < sheetList.length - 1 ? "border-b border-gray-100" : ""}`}
            onClick={() => handleFileClick(file._id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-sm"></div>
                </div>
                <span className="text-sm text-gray-800">{file.name}</span>
                {file.hasPermissions && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <UsersIcon className="w-4 h-4 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      {file.permissions && file.permissions.length > 0 ? (
                        <div>
                          <p className="font-bold mb-1">Shared with:</p>
                          {file.permissions
                            .filter((p) => p.status === "pending")
                            .map((p, pIndex) => (
                              <div
                                key={pIndex}
                                className="flex items-center space-x-2"
                              >
                                <span>{p.userEmail}</span>
                                <span className="text-muted-foreground capitalize">
                                  ({p.level})
                                </span>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="font-bold">No one has access yet.</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              <div className="flex items-center space-x-8">
                <span className="text-sm text-gray-600">
                  {file.isOwnedByMe ? "me" : file.ownerName}
                </span>
                <span className="text-sm text-gray-600">
                  {formatDate(file.last_opened_at || file._creationTime)}
                </span>
                <span className="text-sm text-gray-600 capitalize">
                  {file.testCaseType || "General"}
                </span>
                <MoreVert className="w-4 h-4 text-gray-400 cursor-pointer" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Filter sheets by time periods
  const today = sheets?.filter((sheet) => {
    const now = new Date();
    const sheetDate = new Date(sheet.last_opened_at || sheet._creationTime);
    return now.toDateString() === sheetDate.toDateString();
  });

  const previous30Days = sheets?.filter((sheet) => {
    const now = new Date();
    const sheetDate = new Date(sheet.last_opened_at || sheet._creationTime);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return (
      sheetDate < new Date(now.toDateString()) && sheetDate >= thirtyDaysAgo
    );
  });

  const earlier = sheets?.filter((sheet) => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sheetDate = new Date(sheet.last_opened_at || sheet._creationTime);
    return sheetDate < thirtyDaysAgo;
  });

  return (
    <TooltipProvider>
      {/* The new modal component */}
      <CreateNewSheetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateSheet}
      />

      {/* single create button */}
      <Link to="/create-template" className="block md:hidden">
        <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow">
          <div className="w-16 h-16 mb-3 flex items-center justify-center">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="6" y="8" width="36" height="32" rx="4" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" />
              <rect x="10" y="12" width="28" height="2" rx="1" fill="#9ca3af" />
              <rect x="10" y="16" width="20" height="2" rx="1" fill="#d1d5db" />
              <rect x="10" y="20" width="24" height="2" rx="1" fill="#d1d5db" />
              <circle cx="32" cy="32" r="10" fill="#10b981" />
              <path d="M28 32h8M32 28v8" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-sm text-gray-700 text-center">Create New Checklist</span>
        </div>
      </Link>
      
      <div className="bg-gray-50 min-h-screen font-sans">

        {/* Main Content */}
        <main className="p-6">
          {/* Template Gallery Large Device*/}
          <section className="mb-8 hidden md:block">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-normal text-gray-800">
                Start a new checklist
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-blue-600 hover:underline cursor-pointer text-sm">
                  Template gallery
                </span>
                <MoreVert className="w-5 h-5 text-gray-500 cursor-pointer" />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div
                className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setIsModalOpen(true)}
              >
                <div className="w-16 h-16 mb-3 flex items-center justify-center">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="6" y="8" width="36" height="32" rx="4" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" />
                    <rect x="10" y="12" width="28" height="2" rx="1" fill="#9ca3af" />
                    <rect x="10" y="16" width="20" height="2" rx="1" fill="#d1d5db" />
                    <rect x="10" y="20" width="24" height="2" rx="1" fill="#d1d5db" />
                    <circle cx="32" cy="32" r="10" fill="#10b981" />
                    <path d="M28 32h8M32 28v8" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="text-sm text-gray-700 text-center">Create New</span>
              </div>

              <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow">
                <div className="w-16 h-16 mb-3 flex items-center justify-center">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="4" y="4" width="40" height="40" rx="6" fill="#059669" />
                    <circle cx="24" cy="24" r="8" fill="none" stroke="white" strokeWidth="2" />
                    <circle cx="24" cy="16" r="2" fill="white" />
                    <circle cx="24" cy="32" r="2" fill="white" />
                    <circle cx="16" cy="24" r="2" fill="white" />
                    <circle cx="32" cy="24" r="2" fill="white" />
                    <circle cx="18.3" cy="18.3" r="1.5" fill="white" />
                    <circle cx="29.7" cy="29.7" r="1.5" fill="white" />
                    <circle cx="29.7" cy="18.3" r="1.5" fill="white" />
                    <circle cx="18.3" cy="29.7" r="1.5" fill="white" />
                    <text x="24" y="28" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">
                      FN
                    </text>
                  </svg>
                </div>
                <span className="text-sm text-gray-700 text-center">Functionality</span>
              </div>

              <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow">
                <div className="w-16 h-16 mb-3 flex items-center justify-center">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="4" y="4" width="40" height="40" rx="6" fill="white" stroke="#d1d5db" strokeWidth="2" />
                    <circle cx="18" cy="16" r="4" fill="#6b7280" />
                    <path d="M12 28c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="#6b7280" strokeWidth="2" fill="none" />
                    <rect x="28" y="12" width="12" height="2" rx="1" fill="#9ca3af" />
                    <rect x="28" y="16" width="8" height="2" rx="1" fill="#d1d5db" />
                    <rect x="28" y="20" width="10" height="2" rx="1" fill="#d1d5db" />
                    <path
                      d="M32 32l2-2 4 4"
                      stroke="#10b981"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-sm text-gray-700 text-center">Usability</span>
              </div>

              <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow">
                <div className="w-16 h-16 mb-3 flex items-center justify-center">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="4" y="4" width="40" height="40" rx="6" fill="#374151" />
                    {/* Desktop */}
                    <rect x="10" y="12" width="16" height="10" rx="1" fill="#f97316" opacity="0.9" />
                    <rect x="10" y="23" width="16" height="1" rx="0.5" fill="#f97316" opacity="0.9" />
                    {/* Tablet */}
                    <rect x="28" y="10" width="8" height="12" rx="1" fill="#f97316" opacity="0.7" />
                    <circle cx="32" cy="20" r="0.5" fill="#374151" />
                    {/* Mobile */}
                    <rect x="38" y="14" width="4" height="8" rx="1" fill="#f97316" opacity="0.5" />
                    <circle cx="40" cy="20" r="0.3" fill="#374151" />
                    <text x="24" y="36" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">
                      RESPONSIVE
                    </text>
                  </svg>
                </div>
                <span className="text-sm text-gray-700 text-center">Responsive</span>
              </div>

              <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow">
                <div className="w-16 h-16 mb-3 flex items-center justify-center">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="4" y="4" width="40" height="40" rx="6" fill="#2563eb" />
                    {/* Browser window */}
                    <rect x="8" y="10" width="32" height="24" rx="2" fill="white" />
                    <rect x="8" y="10" width="32" height="4" rx="2" fill="#e5e7eb" />
                    <circle cx="12" cy="12" r="1" fill="#ef4444" />
                    <circle cx="16" cy="12" r="1" fill="#f59e0b" />
                    <circle cx="20" cy="12" r="1" fill="#10b981" />
                    {/* Content */}
                    <rect x="12" y="18" width="8" height="2" rx="1" fill="#3b82f6" />
                    <rect x="12" y="22" width="12" height="1" rx="0.5" fill="#6b7280" />
                    <rect x="12" y="25" width="10" height="1" rx="0.5" fill="#6b7280" />
                    {/* Checkmark */}
                    <path
                      d="M28 20l2 2 4-4"
                      stroke="#10b981"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <text x="24" y="42" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">
                      COMPAT
                    </text>
                  </svg>
                </div>
                <span className="text-sm text-gray-700 text-center">Compatibility</span>
              </div>

              <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow">
                <div className="w-16 h-16 mb-3 flex items-center justify-center">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="4" y="4" width="40" height="40" rx="6" fill="#0f766e" />
                    {/* Accessibility person icon */}
                    <circle cx="24" cy="14" r="3" fill="white" />
                    <path
                      d="M24 18v12M18 22l6-2 6 2M20 30l4 6M28 30l-4 6"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Screen reader lines */}
                    <path d="M8 8l4 4M40 8l-4 4" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" />
                    <path d="M8 40l4-4M40 40l-4-4" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" />
                    <text x="24" y="42" textAnchor="middle" fill="white" fontSize="5" fontWeight="bold">
                      A11Y
                    </text>
                  </svg>
                </div>
                <span className="text-sm text-gray-700 text-center">Accessibility</span>
              </div>
            </div>
          </section>

          {/* Recent Sheets Section */}
          <section>
            {!sheets || sheets.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">No sheets found</div>
                <div className="text-sm text-gray-400">
                  Create your first sheets to get started
                </div>
              </div>
            ) : (
              <>
                {today && today.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-normal text-gray-800 mb-4">
                      Today
                    </h3>
                    {renderSheetList(today, true)}
                  </div>
                )}

                {previous30Days && previous30Days.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-normal text-gray-800 mb-4">
                      Previous 30 days
                    </h3>
                    {renderSheetList(previous30Days)}
                  </div>
                )}

                {earlier && earlier.length > 0 && (
                  <div>
                    <h3 className="text-lg font-normal text-gray-800 mb-4">
                      Earlier
                    </h3>
                    {renderSheetList(earlier)}
                  </div>
                )}
              </>
            )}
          </section>
        </main>
      </div>
    </TooltipProvider>
  );
}