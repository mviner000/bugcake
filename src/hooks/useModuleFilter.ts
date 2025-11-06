// src/hooks/useModuleFilter.ts

import { useState, useMemo } from "react";

export function useModuleFilter<T extends { module?: string }>(items?: T[]) {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  const uniqueModules = useMemo(() => {
    if (!items) return [];
    const modules = new Set(items.map(item => item.module).filter((m): m is string => Boolean(m)));
    return Array.from(modules).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    if (!selectedModule || !items) return items;
    return items.filter(item => item.module === selectedModule);
  }, [items, selectedModule]);

  return {
    selectedModule,
    setSelectedModule,
    uniqueModules,
    filteredItems,
  };
}