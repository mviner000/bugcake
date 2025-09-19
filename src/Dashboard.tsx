// src/Dashboard.tsx

import {
  Search,
  Menu,
  MoreVertical as MoreVert,
  LucideView as GridView,
  Shirt as Sort,
  Folder,
  UsersIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Dashboard() {
  const sheets = useQuery(api.myFunctions.listSheets);
  const navigate = useNavigate();

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

  const renderSheetList = (
    sheetList: typeof sheets,
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
      <div className="bg-gray-50 min-h-screen font-sans">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Menu className="w-6 h-6 text-gray-600 cursor-pointer" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                  <div className="w-5 h-5 bg-white rounded-sm"></div>
                </div>
                <span className="text-xl text-gray-700 font-normal">
                  Sheets
                </span>
              </div>
            </div>

            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg border-0 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-medium text-sm cursor-pointer">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {/* Template Gallery */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-normal text-gray-800">
                Start a new spreadsheet
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-blue-600 hover:underline cursor-pointer text-sm">
                  Template gallery
                </span>
                <MoreVert className="w-5 h-5 text-gray-500 cursor-pointer" />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Blank spreadsheet card */}
              <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow">
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
                  Blank spreadsheet
                </span>
              </div>

              {/* To-do list card */}
              <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow">
                <div className="w-16 h-16 mb-3 bg-green-600 rounded flex items-center justify-center">
                  <div className="w-10 h-10 bg-white rounded-sm flex flex-col justify-center p-1">
                    <div className="h-1 bg-gray-300 rounded mb-1"></div>
                    <div className="h-1 bg-gray-300 rounded mb-1"></div>
                    <div className="h-1 bg-gray-300 rounded"></div>
                  </div>
                </div>
                <span className="text-sm text-gray-700 text-center">
                  To-do list
                </span>
              </div>

              {/* Annual budget card */}
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
                  Annual budget
                </span>
              </div>

              {/* Monthly budget card */}
              <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow">
                <div className="w-16 h-16 mb-3 bg-slate-700 rounded flex items-center justify-center">
                  <div className="w-10 h-8 flex items-end justify-center space-x-1">
                    <div className="w-2 h-3 bg-orange-400 rounded-sm"></div>
                    <div className="w-2 h-5 bg-orange-400 rounded-sm"></div>
                    <div className="w-2 h-2 bg-orange-400 rounded-sm"></div>
                  </div>
                </div>
                <span className="text-sm text-gray-700 text-center">
                  Monthly budget
                </span>
              </div>

              {/* Google Finance Investment card */}
              <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow">
                <div className="w-16 h-16 mb-3 bg-blue-600 rounded flex items-center justify-center">
                  <div className="w-10 h-10 bg-white rounded-sm flex flex-col justify-center p-1">
                    <div className="text-xs text-blue-600 font-medium">ABC</div>
                    <div className="text-xs text-gray-400">$123</div>
                  </div>
                </div>
                <span className="text-sm text-gray-700 text-center">
                  Google Finance Invest...
                </span>
              </div>

              {/* Annual Calendar card */}
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
                  Annual Calendar
                </span>
              </div>
            </div>
          </section>

          {/* Recent Sheets Section */}
          <section>
            {!sheets || sheets.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">No spreadsheets found</div>
                <div className="text-sm text-gray-400">
                  Create your first spreadsheet to get started
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
