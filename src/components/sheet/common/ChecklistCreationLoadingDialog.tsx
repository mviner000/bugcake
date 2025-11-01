// src/components/sheet/common/ChecklistCreationLoadingDialog.tsx

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface ChecklistCreationLoadingDialogProps {
  isOpen: boolean;
}

export function ChecklistCreationLoadingDialog({
  isOpen,
}: ChecklistCreationLoadingDialogProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setProgress(0);
      
      // Simulate progress from 0 to 95% (leave 5% for completion)
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          // Gradually slow down as we approach 95%
          const increment = prev < 60 ? 2 : prev < 80 ? 1 : 0.5;
          return Math.min(prev + increment, 95);
        });
      }, 100);

      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [isOpen]);

  return (
    <>
      {/* ✅ Full-screen dark overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          style={{ 
            animation: 'fadeIn 0.2s ease-in-out'
          }}
        />
      )}
      
      {/* ✅ Centered loading dialog */}
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent 
          className="sm:max-w-[500px] z-[101] border-2 shadow-2xl"
          // ✅ Prevent closing via Escape key or clicking outside
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          showCloseButton={false}
        >
          <div className="flex flex-col items-center justify-center py-12 px-6">
            {/* ✅ Animated spinner with glow effect */}
            <div className="relative mb-8">
              <Loader2 className="h-20 w-20 animate-spin text-primary" />
              <div className="absolute inset-0 h-20 w-20 animate-ping opacity-20">
                <Loader2 className="h-20 w-20 text-primary" />
              </div>
            </div>
            
            {/* ✅ Title */}
            <h2 className="text-3xl font-bold mb-3 text-center">
              Creating Checklist
            </h2>
            
            {/* ✅ Description */}
            <p className="text-center text-muted-foreground mb-6 text-lg">
              Please wait while we create your test execution checklist...
            </p>
            
            {/* ✅ Progress bar with percentage */}
            <div className="w-full max-w-sm mb-3">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* ✅ Percentage display */}
            <p className="text-sm font-semibold text-primary mb-6">
              {Math.round(progress)}%
            </p>
            
            {/* ✅ Additional info with icon */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <svg 
                className="h-4 w-4 animate-pulse" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <p className="text-center">
                This may take a few moments depending on the number of test cases
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ✅ Add fadeIn animation via style tag */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}