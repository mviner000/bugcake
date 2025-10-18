import React from "react";

type IconProps = React.SVGProps<SVGSVGElement>;

export const CompatibilityIcon: React.FC<IconProps> = (props) => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect x="4" y="4" width="40" height="40" rx="6" fill="#D97706" />
    <path
      d="M16 28l8-8 8 8M16 20h16"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="24" cy="24" r="10" stroke="white" strokeWidth="2" />
    <text
      x="24"
      y="42"
      textAnchor="middle"
      fill="white"
      fontSize="8"
      fontWeight="bold"
    >
      CP
    </text>
  </svg>
);
