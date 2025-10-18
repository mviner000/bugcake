import React from "react";

type IconProps = React.SVGProps<SVGSVGElement>;

export const AccessibilityIcon: React.FC<IconProps> = (props) => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect x="4" y="4" width="40" height="40" rx="6" fill="#2563EB" />
    <circle cx="24" cy="16" r="3" fill="white" />
    <path
      d="M16 22h16M20 22v14M28 22v14M22 32h4"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <text
      x="24"
      y="42"
      textAnchor="middle"
      fill="white"
      fontSize="8"
      fontWeight="bold"
    >
      AC
    </text>
  </svg>
);
