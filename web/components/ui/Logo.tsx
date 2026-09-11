import React from "react";

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 28, className = "" }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      className={`shrink-0 ${className}`}
    >
      <rect width="32" height="32" rx="6" fill="#141414" stroke="#292929" />
      <circle cx="16" cy="16" r="4" fill="#F5F5F5" />
      <path
        d="M10 16C10 12.6863 12.6863 10 16 10C19.3137 10 22 12.6863 22 16"
        stroke="#A1A1A1"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M6 16C6 10.4772 10.4772 6 16 6C21.5228 6 26 10.4772 26 16"
        stroke="#707070"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
