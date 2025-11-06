// src/hooks/useResponsiveDetail.ts

import { useState } from "react";

export function useResponsiveDetail() {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showDetailOnMobile, setShowDetailOnMobile] = useState(false);

  const handleItemSelect = (itemId: string) => {
    setSelectedItemId(itemId);
    setShowDetailOnMobile(true);
  };

  const handleBackToList = () => {
    setShowDetailOnMobile(false);
  };

  return {
    selectedItemId,
    setSelectedItemId,
    showDetailOnMobile,
    handleItemSelect,
    handleBackToList,
  };
}