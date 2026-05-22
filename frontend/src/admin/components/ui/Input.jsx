import React from 'react';
import { cn } from './Card';

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md border border-[#d4cfc5] bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#8b8175] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#8b8175] disabled:cursor-not-allowed disabled:opacity-50 text-[#1a1a1a]",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
