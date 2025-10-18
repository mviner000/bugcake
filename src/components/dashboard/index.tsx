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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"; // 👈 New Shadcn Tabs import
import { CreateNewSheetModal } from "./CreateNewSheetModal";

// ✅ Import your new icon components
import {
  AccessibilityIcon,
  CompatibilityIcon,
  CreateNewIcon,
  FunctionalityIcon,
  ResponsiveIcon,
  UsabilityIcon,
} from "@/components/icons";

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

// Define a type for the new dummy Checklist data
type Checklist = {
  _id: string;
  _creationTime: number;
  name: string;
  type: string; // 'checklist'
  owner: string;
  last_opened_at: number;
  created_at: number;
  updated_at: number;
  shared: boolean;
  templateType: "usability" | "accessibility" | "security"; // New field for checklist
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
  modules: string[]; // ✅ UPDATED: Array of module names
}

// Dummy data for recent checklists
const DUMMY_CHECKLISTS: Checklist[] = [
  {
    _id: "chk1",
    _creationTime: Date.now() - 5 * 60 * 1000, // 5 minutes ago (Today)
    name: "Homepage Redesign Check",
    type: "checklist",
    owner: "user1",
    last_opened_at: Date.now() - 5 * 60 * 1000,
    created_at: Date.now() - 12 * 60 * 1000,
    updated_at: Date.now() - 5 * 60 * 1000,
    shared: true,
    templateType: "usability",
    ownerName: "Alice QA",
    isOwnedByMe: false,
    hasPermissions: true,
    permissions: [{ status: "accepted", userEmail: "bob@example.com", level: "viewer" }],
  },
  {
    _id: "chk2",
    _creationTime: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago (Previous 30 days)
    name: "WCAG 2.1 Compliance Audit",
    type: "checklist",
    owner: "user2",
    last_opened_at: Date.now() - 3 * 24 * 60 * 60 * 1000,
    created_at: Date.now() - 5 * 24 * 60 * 60 * 1000,
    updated_at: Date.now() - 3 * 24 * 60 * 60 * 1000,
    shared: false,
    templateType: "accessibility",
    ownerName: "me",
    isOwnedByMe: true,
    hasPermissions: false,
  },
  {
    _id: "chk3",
    _creationTime: Date.now() - 40 * 24 * 60 * 60 * 1000, // 40 days ago (Earlier)
    name: "API Security Review Checklist v1",
    type: "checklist",
    owner: "user3",
    last_opened_at: Date.now() - 40 * 24 * 60 * 60 * 1000,
    created_at: Date.now() - 50 * 24 * 60 * 60 * 1000,
    updated_at: Date.now() - 40 * 24 * 60 * 60 * 1000,
    shared: true,
    templateType: "security",
    ownerName: "Charlie Dev",
    isOwnedByMe: false,
    hasPermissions: true,
    permissions: [{ status: "accepted", userEmail: "dave@example.com", level: "editor" }],
  },
];


export function Dashboard() {
  const sheets = useQuery(api.myFunctions.listSheets) as Sheet[] | undefined;
  const navigate = useNavigate();

  // State to control the modal
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Get the Convex mutation to create a new sheet with multiple modules
  const createSheet = useMutation(api.myFunctions.createSheetWithModules);

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

  const handleFileClick = (sheetId: string, type: "sheet" | "checklist") => {
    // Assuming sheets navigate to /sheet/:id, and checklists navigate to /checklist/:id
    const path = type === "sheet" ? `/sheet/${sheetId}` : `/checklist/${sheetId}`;
    void navigate(path);
  };

  // Function to handle the form submission from the modal
  const handleCreateSheet = async (data: NewSheetFormData) => {
    try {
      const newSheetId = await createSheet({
        name: data.name,
        type: data.type,
        testCaseType: data.testCaseType,
        shared: false,
        modules: data.modules, // ✅ Now passing array of module names
      });
      void navigate(`/sheet/${newSheetId}`);
    } catch (error) {
      console.error("Failed to create new sheet:", error);
    }
  };

  // 👈 New render function for Checklists
  const renderChecklistList = (
    checklistList: Checklist[] | undefined,
    isFirstSection = false,
  ) => {
    if (!checklistList || checklistList.length === 0) {
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
        {checklistList.map((file, index) => (
          <div
            key={file._id}
            className={`p-4 hover:bg-gray-50 cursor-pointer ${
              index < checklistList.length - 1 ? "border-b border-gray-100" : ""
            }`}
            onClick={() => handleFileClick(file._id, "checklist")} // 👈 Pass type
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center"> {/* 👈 Changed color for distinction */}
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
                  {file.templateType} {/* 👈 Using templateType */}
                </span>
                <MoreVert className="w-4 h-4 text-gray-400 cursor-pointer" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };


  // Original render function for Sheets
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
            className={`p-4 hover:bg-gray-50 cursor-pointer ${
              index < sheetList.length - 1 ? "border-b border-gray-100" : ""
            }`}
            onClick={() => handleFileClick(file._id, "sheet")} // 👈 Pass type
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

  // 👈 Filter DUMMY_CHECKLISTS by time periods
  const checklistToday = DUMMY_CHECKLISTS?.filter((checklist) => {
    const now = new Date();
    const checklistDate = new Date(checklist.last_opened_at || checklist._creationTime);
    return now.toDateString() === checklistDate.toDateString();
  });

  const checklistPrevious30Days = DUMMY_CHECKLISTS?.filter((checklist) => {
    const now = new Date();
    const checklistDate = new Date(checklist.last_opened_at || checklist._creationTime);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return (
      checklistDate < new Date(now.toDateString()) && checklistDate >= thirtyDaysAgo
    );
  });

  const checklistEarlier = DUMMY_CHECKLISTS?.filter((checklist) => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const checklistDate = new Date(checklist.last_opened_at || checklist._creationTime);
    return checklistDate < thirtyDaysAgo;
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
            {/* ✅ REPLACEMENT */}
            <CreateNewIcon />
          </div>
          <span className="text-sm text-gray-700 text-center">
            Create New Checklist
          </span>
        </div>
      </Link>

      <div className="bg-gray-50 min-h-screen font-sans">
        {/* Main Content */}
        <main className="p-6">
          {/* Template Gallery Large Device*/}
          <section className="mb-8 hidden md:block">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-normal text-gray-800">
                Start a new test case sheet
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
                  {/* ✅ REPLACEMENT */}
                  <CreateNewIcon />
                </div>
                <span className="text-sm text-gray-700 text-center">
                  Create New
                </span>
              </div>

              <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow">
                <div className="w-16 h-16 mb-3 flex items-center justify-center">
                  {/* ✅ REPLACEMENT */}
                  <FunctionalityIcon />
                </div>
                <span className="text-sm text-gray-700 text-center">
                  Functionality
                </span>
              </div>

              <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow">
                <div className="w-16 h-16 mb-3 flex items-center justify-center">
                  {/* ✅ REPLACEMENT */}
                  <UsabilityIcon />
                </div>
                <span className="text-sm text-gray-700 text-center">
                  Usability
                </span>
              </div>

              <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow">
                <div className="w-16 h-16 mb-3 flex items-center justify-center">
                  {/* ✅ REPLACEMENT */}
                  <ResponsiveIcon />
                </div>
                <span className="text-sm text-gray-700 text-center">
                  Responsive
                </span>
              </div>

              <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow">
                <div className="w-16 h-16 mb-3 flex items-center justify-center">
                  {/* ✅ REPLACEMENT */}
                  <CompatibilityIcon />
                </div>
                <span className="text-sm text-gray-700 text-center">
                  Compatibility
                </span>
              </div>

              <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow">
                <div className="w-16 h-16 mb-3 flex items-center justify-center">
                  {/* ✅ REPLACEMENT */}
                  <AccessibilityIcon />
                </div>
                <span className="text-sm text-gray-700 text-center">
                  Accessibility
                </span>
              </div>
            </div>
          </section>

          {/* Recent Sheets/Checklists Section with Tabs */}
          <section>
            <Tabs defaultValue="sheets" className="w-full"> {/* 👈 Shadcn Tabs */}
              <TabsList className="grid w-[400px] grid-cols-2 mb-6">
                <TabsTrigger value="sheets">Recent Sheets</TabsTrigger>
                <TabsTrigger value="checklists">Recent Checklists</TabsTrigger>
              </TabsList>
              
              {/* Sheets Tab Content */}
              <TabsContent value="sheets">
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
              </TabsContent>

              {/* Checklist Tab Content */}
              <TabsContent value="checklists">
                {DUMMY_CHECKLISTS.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-500 mb-4">No checklists found</div>
                    <div className="text-sm text-gray-400">
                      Create your first checklists to get started
                    </div>
                  </div>
                ) : (
                  <>
                    {checklistToday && checklistToday.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-normal text-gray-800 mb-4">
                          Today
                        </h3>
                        {renderChecklistList(checklistToday, true)}
                      </div>
                    )}

                    {checklistPrevious30Days && checklistPrevious30Days.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-normal text-gray-800 mb-4">
                          Previous 30 days
                        </h3>
                        {renderChecklistList(checklistPrevious30Days)}
                      </div>
                    )}

                    {checklistEarlier && checklistEarlier.length > 0 && (
                      <div>
                        <h3 className="text-lg font-normal text-gray-800 mb-4">
                          Earlier
                        </h3>
                        {renderChecklistList(checklistEarlier)}
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>
          </section>
        </main>
      </div>
    </TooltipProvider>
  );
}