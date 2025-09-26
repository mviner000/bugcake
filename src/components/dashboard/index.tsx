// src/Dashboard.tsx

import React from "react"; // Needed for useState
import {
  MoreVertical as MoreVert,
  LucideView as GridView,
  Shirt as Sort,
  Folder,
  UsersIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
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
      
      <div className="bg-gray-50 min-h-screen font-sans">

        {/* Main Content */}
        <main className="p-6">
          {/* Template Gallery */}
          <section className="mb-8">
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
              {/* Blank sheet card - Add onClick to open the modal */}
              <div 
                className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setIsModalOpen(true)}
              >
                <div className="w-16 h-16 mb-3 flex items-center justify-center">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 bg-red-500 rounded-full opacity-80"></div>
                    <div className="absolute top-1 left-1 right-1 bottom-1 bg-yellow-400 rounded-full opacity-80"></div>
                    <div className="absolute top-2 left-2 right-2 bottom-2 bg-green-500 rounded-full opacity-80"></div>
                    <div className="absolute top-3 left-3 right-3 bottom-3 bg-blue-500 rounded-full opacity-80"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white text-xl font-light">+</span>
                    </div>
                  </div>
                </div>
                <span className="text-sm text-gray-700 text-center">
                  New sheet
                </span>
              </div>

              {/* Functionality card */}
              <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow">
                <div className="w-16 h-16 mb-3 bg-green-600 rounded flex items-center justify-center">
                  <div className="w-10 h-10 bg-white rounded-sm flex flex-col justify-center p-1">
                    <div className="h-1 bg-gray-300 rounded mb-1"></div>
                    <div className="h-1 bg-gray-300 rounded mb-1"></div>
                    <div className="h-1 bg-gray-300 rounded"></div>
                  </div>
                </div>
                <span className="text-sm text-gray-700 text-center">
                  Functionality
                </span>
              </div>

              {/* Usability card */}
              <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow">
                <div className="w-16 h-16 mb-3 bg-white border border-gray-300 rounded flex items-center justify-center">
                  <div className="w-10 h-10 flex flex-col justify-center p-1">
                    <div className="h-1 bg-gray-400 rounded mb-1"></div>
                    <div className="h-1 bg-gray-300 rounded mb-1"></div>
                    <div className="h-1 bg-gray-300 rounded mb-1"></div>
                    <div className="h-1 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <span className="text-sm text-gray-700 text-center">
                  Usability
                </span>
              </div>

              {/* Responsive card */}
              <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow">
                <div className="w-16 h-16 mb-3 bg-slate-700 rounded flex items-center justify-center">
                  <div className="w-10 h-8 flex items-end justify-center space-x-1">
                    <div className="w-2 h-3 bg-orange-400 rounded-sm"></div>
                    <div className="w-2 h-5 bg-orange-400 rounded-sm"></div>
                    <div className="w-2 h-2 bg-orange-400 rounded-sm"></div>
                  </div>
                </div>
                <span className="text-sm text-gray-700 text-center">
                  Responsive
                </span>
              </div>

              {/* Compatibility card */}
              <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow">
                <div className="w-16 h-16 mb-3 bg-blue-600 rounded flex items-center justify-center">
                  <div className="w-10 h-10 bg-white rounded-sm flex flex-col justify-center p-1">
                    <div className="text-xs text-blue-600 font-medium">ABC</div>
                    <div className="text-xs text-gray-400">$123</div>
                  </div>
                </div>
                <span className="text-sm text-gray-700 text-center">
                  Compatibility
                </span>
              </div>

              {/* Accessibility card */}
              <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow">
                <div className="w-16 h-16 mb-3 bg-teal-800 rounded flex items-center justify-center">
                  <div className="w-10 h-10 grid grid-cols-7 gap-px p-1">
                    {Array.from({ length: 28 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-1 h-1 bg-teal-300 rounded-full"
                      ></div>
                    ))}
                  </div>
                </div>
                <span className="text-sm text-gray-700 text-center">
                  Accessibility
                </span>
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