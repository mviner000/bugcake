// src/sheet/Header.tsx

import {
  ArrowLeft,
  Star,
  Share,
  Folder,
  History,
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

interface HeaderProps {
  sheetName?: string;
  onBack: () => void;
}

export function Header({ sheetName, onBack }: HeaderProps) {
  return (
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
          <History className="w-5 h-5 text-gray-400 cursor-pointer" />
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center space-x-2">
            <Share className="w-4 h-4" />
            <span>Share</span>
          </button>
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
  );
}
