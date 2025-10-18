// src/components/icons/ResponsiveIcon.tsx

import React from "react";

type IconProps = React.SVGProps<SVGSVGElement>;

export const ResponsiveIcon: React.FC<IconProps> = (props) => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect x="4" y="4" width="40" height="40" rx="6" fill="#374151" />
    {/* Desktop */}
    <rect x="10" y="12" width="16" height="10" rx="1" fill="#f97316" opacity="0.9" />
    <rect x="10" y="23" width="16" height="1" rx="0.5" fill="#f97316" opacity="0.9" />
    {/* Tablet */}
    <rect x="28" y="10" width="8" height="12" rx="1" fill="#f97316" opacity="0.7" />
    <circle cx="32" cy="20" r="0.5" fill="#374151" />
    {/* Mobile */}
    <rect x="38" y="14" width="4" height="8" rx="1" fill="#f97316" opacity="0.5" />
    <circle cx="40" cy="20" r="0.3" fill="#374151" />
    <text x="24" y="36" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">
      RESPONSIVE
    </text>
  </svg>
);