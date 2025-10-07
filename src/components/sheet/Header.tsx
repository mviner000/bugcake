// components/sheet/Header.tsx

import { useState } from "react";
import {
  ArrowLeft,
  Star,
  Share,
  Folder,
  Menu,
  Undo,
  Redo,
  Printer as Print,
  Paintbrush,
  Forward as FormatBold,
  Italic,
  Underline,
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight,
  MoreHorizontal,
  Percent,
  DollarSign,
  Hash,
} from "lucide-react";
import { ShareModal } from "./share-modal";
import { Id } from "convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import ActivityApprovalsSheet from "./right-side/ActivityApprovalsSheet";
import AltTextAriaLabelDetailsModal from "./alttextarialabel/AltTextAriaLabelDetailsModal";
import FunctionalityTestCasesDetailsModal from "./functionality/FunctionalityTestCaseDetailsModal";

// 💡 NEW: Define the possible types for strong typing
type SheetType = "altTextAriaLabel" | "functionality";

interface HeaderProps {
  sheetName?: string;
  onBack: () => void;
  // 💡 NEW PROP: Add the sheetType to the component's props
  sheetType: SheetType;
}

// 💡 UPDATED: Destructure the new sheetType prop
export function Header({ sheetName, onBack, sheetId, sheetType }: HeaderProps & { sheetId: string }) {
  
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  // Ensure we use the correct type from the Convex model
  const normalizedSheetId = sheetId as Id<"sheets">;

  return (
    <>
      <ShareModal 
        open={isShareModalOpen} 
        onOpenChange={setIsShareModalOpen} 
        fileName={sheetName} 
        sheetId={normalizedSheetId}
      />
      <header className="border-b border-gray-200">
      <div className="px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Menu className="w-6 h-6 text-gray-600 cursor-pointer" />
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
              <div className="w-5 h-5 bg-white rounded-sm"></div>
            </div>
            <span className="text-xl text-gray-700 font-normal">
              {sheetName}
            </span>
            <div className="px-2 py-1 bg-green-600 text-white text-xs rounded font-medium">
              XLSX
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-gray-400 cursor-pointer hover:text-yellow-500" />
            <Folder className="w-5 h-5 text-gray-400 cursor-pointer" />
            <Share className="w-5 h-5 text-gray-400 cursor-pointer" />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {/* 💡 DYNAMIC RENDERING: Replace the two unconditionally rendered modals 
            with a single block of conditional logic based on 'sheetType'.
          */}
          {sheetType === "altTextAriaLabel" && (
            <AltTextAriaLabelDetailsModal sheetId={sheetId} />
          )}
          {sheetType === "functionality" && (
            <FunctionalityTestCasesDetailsModal sheetId={sheetId} />
          )}
          {/* The existing modals did not have a sheetId prop in your original code,
             but I've added it here as it's typically required. 
             If they truly don't need it, remove the prop.
             I've added it to the ActivityApprovalsSheet for safety.
          */}
          <ActivityApprovalsSheet sheetId={sheetId as any} />
          <Button onClick={() => setIsShareModalOpen(true)} size="sm" className="bg-blue-700 text-white hover:bg-blue-70">
            <Share className="w-4 h-4" />
            <span>Share</span>
          </Button>
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-medium text-sm cursor-pointer">
            A
          </div>
        </div>
      </div>
      <div className="px-4 py-1 border-b border-gray-200">
        <div className="flex items-center space-x-6 text-sm">
          <span className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded text-gray-700">
            File
          </span>
          <span className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded text-gray-700">
            Edit
          </span>
          <span className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded text-gray-700">
            View
          </span>
          <span className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded text-gray-700">
            Insert
          </span>
          <span className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded text-gray-700">
            Format
          </span>
          <span className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded text-gray-700">
            Data
          </span>
          <span className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded text-gray-700">
            Tools
          </span>
          <span className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded text-gray-700">
            Help
          </span>
        </div>
      </div>
      <div className="px-4 py-2 border-b border-gray-200">
        <div className="flex items-center space-x-1">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          <button className="p-2 hover:bg-gray-100 rounded">
            <Undo className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded">
            <Redo className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded">
            <Print className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded">
            <Paintbrush className="w-4 h-4 text-gray-600" />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          <select className="px-2 py-1 text-sm border border-gray-300 rounded">
            <option>100%</option>
          </select>
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          <button className="p-1 hover:bg-gray-100 rounded">
            <DollarSign className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded">
            <Percent className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded">
            <Hash className="w-4 h-4 text-gray-600" />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          <select className="px-2 py-1 text-sm border border-gray-300 rounded">
            <option>Calibri</option>
          </select>
          <select className="px-2 py-1 text-sm border border-gray-300 rounded w-16">
            <option>11</option>
          </select>
          <button className="p-1 hover:bg-gray-100 rounded">
            <FormatBold className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded">
            <Italic className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded">
            <Underline className="w-4 h-4 text-gray-600" />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          <button className="p-1 hover:bg-gray-100 rounded">
            <AlignLeft className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded">
            <AlignCenter className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded">
            <AlignRight className="w-4 h-4 text-gray-600" />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          <button className="p-1 hover:bg-gray-100 rounded">
            <Link className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded">
            <MoreHorizontal className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
      </header>
    </>
  );
}