'use client';

import React from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const Header = ({ 
  title = "ResumeInsight", 
  subtitle, 
  icon: Icon, 
  iconColor = "text-blue-600",
  backTo = "/",
  compact = false 
}) => {
  return (
    <header className="bg-white/95 backdrop-blur-lg border-b border-slate-200/60 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-3 sm:px-6">
        <div className={`flex items-center justify-between ${compact ? 'py-2 sm:py-3' : 'py-3 sm:py-4'}`}>
          {/* Back Button */}
          <Link
            href={backTo}
            className="flex items-center gap-1 sm:gap-2 text-slate-600 hover:text-slate-800 transition-all duration-200 hover:bg-slate-100/60 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg group flex-shrink-0"
          >
            <ArrowLeft size={14} className="sm:w-4 sm:h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
            <span className="font-medium text-xs sm:text-sm">Back</span>
          </Link>
          
          {/* Title Section */}
          <div className="flex-1 text-center px-2 sm:px-8 min-w-0">
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              {Icon && (
                <div className="flex items-center justify-center flex-shrink-0">
                  <Icon className={`${iconColor} drop-shadow-sm`} size={compact ? 18 : 20} />
                </div>
              )}
              <h1 className={`font-bold text-slate-800 tracking-tight ${compact ? 'text-xs sm:text-lg' : 'text-xs sm:text-xl'}`}>
                {title}
              </h1>
            </div>
            {subtitle && (
              <p className={`text-slate-600/80 mt-1 hidden sm:block ${compact ? 'text-xs' : 'text-xs sm:text-sm'} max-w-xl mx-auto`}>
                {subtitle}
              </p>
            )}
          </div>
          
          {/* Spacer for balance */}
          <div className="w-10 sm:w-16 flex-shrink-0"></div>
        </div>
      </div>
    </header>
  );
};

export default Header;