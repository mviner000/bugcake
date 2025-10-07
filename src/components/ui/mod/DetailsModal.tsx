// src/components/ui/mod/DetailsModal.tsx

import { useEffect, type ReactNode } from "react";

interface DetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function DetailsModal({ isOpen, onClose, children }: DetailsModalProps) {
  if (!isOpen) return null;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      <style>{`
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(0, 0, 0, 0.5); z-index: 40; }
        .modal-content { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: white; border-radius: 0.5rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); z-index: 50; overflow: hidden; }
        .dark .modal-content { background-color: hsl(222.2 84% 4.9%); border: 1px solid hsl(217.2 32.6% 17.5%); }
      `}</style>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-content" role="dialog" aria-modal="true">
        {children}
      </div>
    </>
  );
}