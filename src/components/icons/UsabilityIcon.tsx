// src/components/icons/UsabilityIcon.tsx

import React from "react";

type IconProps = React.SVGProps<SVGSVGElement>;

export const UsabilityIcon: React.FC<IconProps> = (props) => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect x="4" y="4" width="40" height="40" rx="6" fill="white" stroke="#d1d5db" strokeWidth="2" />
    <circle cx="18" cy="16" r="4" fill="#6b7280" />
    <path d="M12 28c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="#6b7280" strokeWidth="2" fill="none" />
    <rect x="28" y="12" width="12" height="2" rx="1" fill="#9ca3af" />
    <rect x="28" y="16" width="8" height="2" rx="1" fill="#d1d5db" />
    <rect x="28" y="20" width="10" height="2" rx="1" fill="#d1d5db" />
    <path
      d="M32 32l2-2 4 4"
      stroke="#10b981"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);