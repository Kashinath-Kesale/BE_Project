import React from 'react';

export const Logo = ({ className = "w-6 h-6", strokeWidth = 2.5 }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M4 4v16h16" />
        <path d="m4 12 5 5" />
        <path d="M12 4h8" />
        <path d="m16 8 4-4" />
    </svg>
);

export default Logo;
