import React from 'react';
import { cn } from './Card';

function Badge({ className, variant = "default", ...props }) {
  const variants = {
    default: "border-transparent bg-[#1a1a1a] text-[#fbfbf9]",
    secondary: "border-transparent bg-[#e6e6df] text-[#1a1a1a]",
    outline: "text-[#1a1a1a] border-[#d4cfc5]",
    success: "border-transparent bg-green-900/10 text-green-900 border border-green-900/20",
    warning: "border-transparent bg-amber-900/10 text-amber-900 border border-amber-900/20",
    danger: "border-transparent bg-red-900/10 text-red-900 border border-red-900/20",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#8b8175] focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
