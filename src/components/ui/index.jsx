import React from 'react';
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const Button = React.forwardRef(({ className, variant = "primary", size = "md", ...props }, ref) => {
  const variants = {
    primary: "bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/20",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border-2 border-primary/10 bg-background hover:border-primary/30 hover:bg-primary/5 text-primary",
    ghost: "hover:bg-primary/5 text-muted-foreground hover:text-primary",
    link: "text-primary underline-offset-4 hover:underline",
  }
  const sizes = {
    sm: "h-9 px-3 rounded-xl text-xs",
    md: "h-11 px-6 rounded-2xl font-bold tracking-tight",
    lg: "h-14 px-10 rounded-[1.5rem] text-base font-extrabold",
    icon: "h-11 w-11 px-0 rounded-2xl",
  }
  
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap transition-all active:scale-95 duration-300 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    />
  )
})

export const Card = ({ className, ...props }) => (
  <div className={cn("rounded-[2rem] border-none bg-white/80 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-black/5", className)} {...props} />
)

export const Badge = ({ className, variant = "default", ...props }) => {
  const variants = {
    default: "border-transparent bg-primary text-primary-foreground",
    secondary: "border-transparent bg-secondary text-secondary-foreground",
    destructive: "border-transparent bg-destructive text-destructive-foreground",
    outline: "text-foreground bg-white/50",
    on_track: "border-transparent bg-green-500/10 text-green-700 font-black",
    at_risk: "border-transparent bg-orange-500/10 text-orange-700 font-black",
    delayed: "border-transparent bg-red-500/10 text-red-700 font-black",
    done: "border-transparent bg-indigo-500/10 text-indigo-700 font-black",
  }
  return (
    <div className={cn("inline-flex items-center rounded-full border px-3 py-0.5 text-[10px] uppercase tracking-wider font-extrabold transition-all", variants[variant] || variants.default, className)} {...props} />
  )
}

export const Input = React.forwardRef(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn("flex h-12 w-full rounded-2xl border-2 border-primary/5 bg-white/60 px-4 py-2 text-sm ring-offset-background transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/30 disabled:cursor-not-allowed disabled:opacity-50", className)}
    ref={ref}
    {...props}
  />
))
