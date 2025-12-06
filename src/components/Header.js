'use client';

import React from "react";
import { ArrowLeft, LogOut, User, FileText, BarChart3 } from "lucide-react";
import Link from "next/link";
import { useUser, useClerk, SignedIn, SignedOut } from "@clerk/nextjs";

const Header = ({ 
  title = "ResumeInsight", 
  subtitle, 
  icon: Icon, 
  iconColor = "text-blue-600",
  backTo = "/",
  compact = false,
  showUserMenu = true
}) => {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  const handleSignOut = () => {
    signOut({ redirectUrl: '/' });
  };

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
          
          {/* User Menu / Auth */}
          {showUserMenu && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <SignedIn>
                <div className="relative group">
                  <button className="flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-slate-100/60 transition-all duration-200">
                    {user?.imageUrl ? (
                      <img 
                        src={user.imageUrl} 
                        alt={user.firstName || 'User'} 
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-slate-200"
                      />
                    ) : (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <User size={14} className="text-blue-600" />
                      </div>
                    )}
                    <span className="hidden md:block text-sm font-medium text-slate-700 max-w-[100px] truncate">
                      {user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 'User'}
                    </span>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-sm font-medium text-slate-800 truncate">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {user?.emailAddresses?.[0]?.emailAddress}
                        </p>
                      </div>
                      
                      <Link
                        href="/resume-analysis"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <FileText size={14} />
                        Resume Analysis
                      </Link>
                      
                      <Link
                        href="/analytics"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <BarChart3 size={14} />
                        Analytics
                      </Link>
                      
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                      >
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </SignedIn>
              
              <SignedOut>
                <Link
                  href="/sign-in"
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
              </SignedOut>
            </div>
          )}
          
          {/* Empty spacer when no user menu */}
          {!showUserMenu && <div className="w-10 sm:w-16 flex-shrink-0"></div>}
        </div>
      </div>
    </header>
  );
};

export default Header;