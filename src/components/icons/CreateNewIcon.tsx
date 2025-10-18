// src/components/icons/CreateNewIcon.tsx

import React from "react";

// Define props to accept standard SVG attributes like className
type IconProps = React.SVGProps<SVGSVGElement>;

export const CreateNewIcon: React.FC<IconProps> = (props) => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props} // Spread any additional props
  >
    <rect x="6" y="8" width="36" height="32" rx="4" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" />
    <rect x="10" y="12" width="28" height="2" rx="1" fill="#9ca3af" />
    <rect x="10" y="16" width="20" height="2" rx="1" fill="#d1d5db" />
    <rect x="10" y="20" width="24" height="2" rx="1" fill="#d1d5db" />
    <circle cx="32" cy="32" r="10" fill="#10b981" />
    <path d="M28 32h8M32 28v8" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);