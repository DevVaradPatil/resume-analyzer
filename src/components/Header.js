'use client';

import React from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const Header = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  iconColor = "text-blue-600",
  backTo = "/",
  compact = false 
}) => {
  return (
    <header className="bg-white/95 backdrop-blur-lg border-b border-slate-200/60 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className={`flex items-center justify-between ${compact ? 'py-3' : 'py-4'}`}>
          {/* Back Button */}
          <Link
            href={backTo}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-all duration-200 hover:bg-slate-100/60 px-3 py-2 rounded-lg group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
            <span className="font-medium text-sm">Back</span>
          </Link>
          
          {/* Title Section */}
          <div className="flex-1 text-center px-8">
            <div className="flex items-center justify-center gap-3">
              {Icon && (
                <div className="flex items-center justify-center">
                  <Icon className={`${iconColor} drop-shadow-sm`} size={compact ? 20 : 22} />
                </div>
              )}
              <h1 className={`font-bold text-slate-800 tracking-tight ${compact ? 'text-lg sm:text-md' : 'text-md sm:text-xl'}`}>
                <span className="hidden sm:inline">{title}</span>
                <span className="sm:hidden">{title.split(' ')[0]}</span>
              </h1>
            </div>
            {subtitle && (
              <p className={`text-slate-600/80 mt-1 ${compact ? 'text-xs' : 'text-xs sm:text-sm'} max-w-xl mx-auto`}>
                {subtitle}
              </p>
            )}
          </div>
          
          {/* Spacer for balance */}
          <div className="w-16"></div>
        </div>
      </div>
    </header>
  );
};

export default Header;