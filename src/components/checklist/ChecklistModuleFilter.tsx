// src/components/checklist/ChecklistModuleFilter.tsx

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChecklistModuleFilterProps {
  modules: string[];
  selectedModule: string | null;
  onModuleSelect: (module: string | null) => void;
  totalCount: number;
  filteredCount: number;
}

export function ChecklistModuleFilter({ 
  modules, 
  selectedModule, 
  onModuleSelect,
  totalCount,
  filteredCount
}: ChecklistModuleFilterProps) {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll position to show/hide arrows
  const updateScrollButtons = () => {
    const container = document.getElementById('module-filter-container');
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 1
      );
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('module-filter-container');
    if (container) {
      const scrollAmount = 200;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative bg-white border-b border-gray-200">
      <div className="flex items-center px-6 py-4">
        {/* Left scroll button */}
        {canScrollLeft && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll('left')}
            className="absolute left-2 z-10 h-8 w-8 rounded-full bg-white shadow-md hover:bg-gray-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Filter buttons container */}
        <div 
          id="module-filter-container"
          className="flex items-center gap-2 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onScroll={updateScrollButtons}
        >
          {/* All button */}
          <Button
            variant={selectedModule === null ? "default" : "outline"}
            size="sm"
            onClick={() => onModuleSelect(null)}
            className="flex-shrink-0 rounded-full"
          >
            All ({totalCount})
          </Button>

          {/* Module buttons */}
          {modules.map((module) => (
            <Button
              key={module}
              variant={selectedModule === module ? "default" : "outline"}
              size="sm"
              onClick={() => onModuleSelect(module)}
              className="flex-shrink-0 rounded-full"
            >
              {module}
            </Button>
          ))}
        </div>

        {/* Right scroll button */}
        {canScrollRight && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll('right')}
            className="absolute right-2 z-10 h-8 w-8 rounded-full bg-white shadow-md hover:bg-gray-50"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Active filter indicator */}
      {selectedModule && (
        <div className="px-6 pb-2 flex items-center justify-between text-xs">
          <span className="text-gray-600">
            Showing <span className="font-semibold">{filteredCount}</span> test cases for: <span className="font-semibold">{selectedModule}</span>
          </span>
          <Button
            variant="link"
            size="sm"
            onClick={() => onModuleSelect(null)}
            className="h-auto p-0 text-xs"
          >
            Clear filter
          </Button>
        </div>
      )}
    </div>
  );
}