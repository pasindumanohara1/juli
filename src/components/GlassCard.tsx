
import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'light' | 'dark';
  hover?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className, 
  variant = 'default',
  hover = true 
}) => {
  const baseClasses = "rounded-3xl border shadow-lg transition-all duration-300";
  
  const variantClasses = {
    default: "glass",
    light: "glass-light",
    dark: "glass-dark"
  };

  const hoverClasses = hover ? "liquid-hover" : "";

  return (
    <div className={cn(
      baseClasses,
      variantClasses[variant],
      hoverClasses,
      className
    )}>
      {children}
    </div>
  );
};

export default GlassCard;
