import React from 'react';

export const LoadingSigning = () => (
  <div className="relative size-32 p-4">
    <div className="absolute inset-0 animate-ping rounded-full bg-purple-500/20" />
    <div className="absolute inset-0 animate-pulse rounded-full bg-purple-500/10" />
    <svg
      className="relative size-full animate-pulse text-purple-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
    </svg>
  </div>
);
