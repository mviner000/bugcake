// src/components/icons/FunctionalityIcon.tsx

import React from "react";

type IconProps = React.SVGProps<SVGSVGElement>;

export const FunctionalityIcon: React.FC<IconProps> = (props) => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect x="4" y="4" width="40" height="40" rx="6" fill="#059669" />
    <circle cx="24" cy="24" r="8" fill="none" stroke="white" strokeWidth="2" />
    <circle cx="24" cy="16" r="2" fill="white" />
    <circle cx="24" cy="32" r="2" fill="white" />
    <circle cx="16" cy="24" r="2" fill="white" />
    <circle cx="32" cy="24" r="2" fill="white" />
    <circle cx="18.3" cy="18.3" r="1.5" fill="white" />
    <circle cx="29.7" cy="29.7" r="1.5" fill="white" />
    <circle cx="29.7" cy="18.3" r="1.5" fill="white" />
    <circle cx="18.3" cy="29.7" r="1.5" fill="white" />
    <text x="24" y="28" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">
      FN
    </text>
  </svg>
);