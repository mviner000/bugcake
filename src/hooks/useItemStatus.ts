// src/hooks/useItemStatus.ts

import { useState } from "react";

export function useItemStatus() {
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    itemId: string;
    newStatus: string;
  } | null>(null);
  const [actualResults, setActualResults] = useState<string>("");

  const initiateStatusChange = (itemId: string, newStatus: string) => {
    setPendingStatusChange({ itemId, newStatus });
    setActualResults("");
  };

  const cancelStatusChange = () => {
    setPendingStatusChange(null);
    setActualResults("");
  };

  return {
    pendingStatusChange,
    actualResults,
    setActualResults,
    initiateStatusChange,
    cancelStatusChange,
  };
}