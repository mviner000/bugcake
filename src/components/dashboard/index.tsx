// src/index.tsx

import React from "react";
import {
  MoreVertical as MoreVert,
  LucideView as GridView,
  Shirt as Sort,
  Folder,
  UsersIcon,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
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
} from "@/components/ui/tabs";
import { CreateNewSheetModal } from "./CreateNewSheetModal";
import {
  AccessibilityIcon,
  CompatibilityIcon,
  CreateNewIcon,
  FunctionalityIcon,
  ResponsiveIcon,
  UsabilityIcon,
} from "@/components/icons";

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
  ownerName: string;
  isOwnedByMe: boolean;
  hasPermissions: boolean;
  permissions?: { status: string; userEmail: string; level: string }[];
};

type Checklist = {
  _id: string;
  _creationTime: number;
  sheetId: string;
  sprintName: string;
  titleRevisionNumber: string;
  testCaseType: "functionality" | "altTextAriaLabel";
  status: string;
  progress: number;
  testExecutorAssigneeId: string;
  additionalAssignees?: string[];
  dateStarted?: number;
  goalDateToFinish: number;
  dateFinished?: number;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  description?: string;
  sourceTestCaseCount: number;
  includedWorkflowStatuses: string[];
  // Enhanced properties from query
  sheetName?: string;
  creatorName?: string;
  executorName?: string;
  isOwnedByMe?: boolean;
};

interface NewSheetFormData {
  name: string;
  type: "sheet" | "doc" | "pdf" | "folder" | "other";
  testCaseType: "functionality" | "altTextAriaLabel";
  modules: string[];
}

export function Dashboard() {
  const sheets = useQuery(api.myFunctions.listSheets) as Sheet[] | undefined;
  const checklists = useQuery(api.myFunctions.listChecklists) as Checklist[] | undefined;
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const createSheet = useMutation(api.myFunctions.createSheetWithModules);

  if (sheets === undefined || checklists === undefined) {
    return (
      <div className="bg-gray-50 min-h-screen font-sans p-6 text-center">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

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

  const handleFileClick = (id: string, type: "sheet" | "checklist") => {
    const path = type === "sheet" ? `/sheet/${id}` : `/checklist/${id}`;
    void navigate(path);
  };

  const handleCreateSheet = async (data: NewSheetFormData) => {
    try {
      const newSheetId = await createSheet({
        name: data.name,
        type: data.type,
        testCaseType: data.testCaseType,
        shared: false,
        modules: data.modules,
      });
      void navigate(`/sheet/${newSheetId}`);
    } catch (error) {
      console.error("Failed to create new sheet:", error);
    }
  };

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
        {checklistList.map((checklist, index) => (
          <div
            key={checklist._id}
            className={`p-4 hover:bg-gray-50 cursor-pointer ${
              index < checklistList.length - 1 ? "border-b border-gray-100" : ""
            }`}
            onClick={() => handleFileClick(checklist._id, "checklist")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-sm"></div>
                </div>
                <span className="text-sm text-gray-800">
                  {checklist.sprintName} - {checklist.titleRevisionNumber}
                </span>
                {checklist.sheetName && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <UsersIcon className="w-4 h-4 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div>
                        <p className="font-bold mb-1">Checklist Details:</p>
                        <p>Sheet: {checklist.sheetName}</p>
                        <p>Status: {checklist.status}</p>
                        <p>Progress: {checklist.progress}%</p>
                        <p>Test Cases: {checklist.sourceTestCaseCount}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              <div className="flex items-center space-x-8">
                <span className="text-sm text-gray-600">
                  {checklist.isOwnedByMe ? "me" : checklist.creatorName || "Unknown"}
                </span>
                <span className="text-sm text-gray-600">
                  {formatDate(checklist.updatedAt || checklist._creationTime)}
                </span>
                <span className="text-sm text-gray-600 capitalize">
                  {checklist.testCaseType}
                </span>
                <MoreVert className="w-4 h-4 text-gray-400 cursor-pointer" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
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
            className={`p-4 hover:bg-gray-50 cursor-pointer ${
              index < sheetList.length - 1 ? "border-b border-gray-100" : ""
            }`}
            onClick={() => handleFileClick(file._id, "sheet")}
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

  // Filter checklists by time periods
  const checklistToday = checklists?.filter((checklist) => {
    const now = new Date();
    const checklistDate = new Date(checklist.updatedAt || checklist._creationTime);
    return now.toDateString() === checklistDate.toDateString();
  });

  const checklistPrevious30Days = checklists?.filter((checklist) => {
    const now = new Date();
    const checklistDate = new Date(checklist.updatedAt || checklist._creationTime);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return (
      checklistDate < new Date(now.toDateString()) && checklistDate >= thirtyDaysAgo
    );
  });

  const checklistEarlier = checklists?.filter((checklist) => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const checklistDate = new Date(checklist.updatedAt || checklist._creationTime);
    return checklistDate < thirtyDaysAgo;
  });

  return (
    <TooltipProvider>
      <CreateNewSheetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateSheet}
      />

      <Link to="/create-template" className="block md:hidden">
        <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow">
          <div className="w-16 h-16 mb-3 flex items-center justify-center">
            <CreateNewIcon />
          </div>
          <span className="text-sm text-gray-700 text-center">
            Create New Checklist
          </span>
        </div>
      </Link>

      <div className="bg-gray-50 min-h-screen font-sans">
        <main className="p-6">
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
                  <CreateNewIcon />
                </div>
                <span className="text-sm text-gray-700 text-center">
                  Create New
                </span>
              </div>

              <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow">
                <div className="w-16 h-16 mb-3 flex items-center justify-center">
                  <FunctionalityIcon />
                </div>
                <span className="text-sm text-gray-700 text-center">
                  Functionality
                </span>
              </div>

              <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow">
                <div className="w-16 h-16 mb-3 flex items-center justify-center">
                  <UsabilityIcon />
                </div>
                <span className="text-sm text-gray-700 text-center">
                  Usability
                </span>
              </div>

              <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow">
                <div className="w-16 h-16 mb-3 flex items-center justify-center">
                  <ResponsiveIcon />
                </div>
                <span className="text-sm text-gray-700 text-center">
                  Responsive
                </span>
              </div>

              <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow">
                <div className="w-16 h-16 mb-3 flex items-center justify-center">
                  <CompatibilityIcon />
                </div>
                <span className="text-sm text-gray-700 text-center">
                  Compatibility
                </span>
              </div>

              <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow">
                <div className="w-16 h-16 mb-3 flex items-center justify-center">
                  <AccessibilityIcon />
                </div>
                <span className="text-sm text-gray-700 text-center">
                  Accessibility
                </span>
              </div>
            </div>
          </section>

          <section>
            <Tabs defaultValue="sheets" className="w-full">
              <TabsList className="grid w-[400px] grid-cols-2 mb-6">
                <TabsTrigger value="sheets">Recent Sheets</TabsTrigger>
                <TabsTrigger value="checklists">Recent Checklists</TabsTrigger>
              </TabsList>
              
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

              <TabsContent value="checklists">
                {!checklists || checklists.length === 0 ? (
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