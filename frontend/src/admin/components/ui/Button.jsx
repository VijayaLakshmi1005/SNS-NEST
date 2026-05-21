import React from 'react';
import { Slot } from '@radix-ui/react-slot'; // Assuming they might use it, but we'll conditionally use standard elements
import { cn } from './Card'; // reuse utility

const Button = React.forwardRef(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    // Luxury Beige Theme Variants
    const variants = {
      default: "bg-[#1a1a1a] text-[#fbfbf9] hover:bg-[#333333] shadow-sm",
      outline: "border border-[#d4cfc5] bg-transparent hover:bg-[#f5f5f0] text-[#1a1a1a]",
      ghost: "hover:bg-[#f5f5f0] text-[#333333]",
      secondary: "bg-[#e6e6df] text-[#1a1a1a] hover:bg-[#d4cfc5]",
      danger: "bg-red-900 text-white hover:bg-red-800",
    };
    
    const sizes = {
      default: "h-9 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-11 rounded-md px-8",
      icon: "h-9 w-9",
    };

    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#8b8175] disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
