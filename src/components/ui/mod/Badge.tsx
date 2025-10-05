// src/components/ui/mod/Badge.tsx

import React from "react";
import { cn } from "@/lib/utils"; // adjust if you have a utils file for class merging

type BadgeVariant =
  | "gray"
  | "red"
  | "yellow"
  | "green"
  | "blue"
  | "indigo"
  | "purple"
  | "pink";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  gray: "bg-gray-50 text-gray-600 inset-ring inset-ring-gray-500/10",
  red: "bg-red-50 text-red-700 inset-ring inset-ring-red-600/10",
  yellow: "bg-yellow-50 text-yellow-800 inset-ring inset-ring-yellow-600/20",
  green: "bg-green-50 text-green-700 inset-ring inset-ring-green-600/20",
  blue: "bg-blue-50 text-blue-700 inset-ring inset-ring-blue-700/10",
  indigo: "bg-indigo-50 text-indigo-700 inset-ring inset-ring-indigo-700/10",
  purple: "bg-purple-50 text-purple-700 inset-ring inset-ring-purple-700/10",
  pink: "bg-pink-50 text-pink-700 inset-ring inset-ring-pink-700/10",
};

export const Badge: React.FC<BadgeProps> = ({
  variant = "gray",
  className,
  children,
  ...props
}) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
