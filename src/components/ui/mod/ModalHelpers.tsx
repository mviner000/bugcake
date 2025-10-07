// src/components/ui/ModalHelpers.tsx

import { type ReactNode } from "react";

export const ContentSection = ({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}) => (
  <div className="space-y-2">
    <h4 className="text-sm font-semibold text-muted-foreground">{title}</h4>
    <div className="text-sm">{children}</div>
  </div>
);

export const MetadataField = ({
  label,
  children
}: {
  label: string;
  children: ReactNode;
}) => (
  <div>
    <h5 className="text-xs font-bold text-muted-foreground mb-1.5">
      {label.toUpperCase()}
    </h5>
    <div className="text-sm">{children}</div>
  </div>
);