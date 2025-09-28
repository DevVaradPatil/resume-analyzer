'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Linkedin, LinkedinIcon } from 'lucide-react';

export default function Footer() {
  return (
    <motion.footer
      className="bg-slate-900 text-white py-4 sm:py-6 mt-auto"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      viewport={{ once: true }}
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-6">
        <div className="flex flex-col items-center gap-2 sm:gap-3">
          {/* Main Title */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-center">
            <div className="p-1 sm:p-1.5 bg-blue-900 rounded-md flex-shrink-0">
              <FileText className="text-blue-400" size={14} />
            </div>
            <div className="font-semibold text-xs sm:text-sm text-center leading-tight">
              <span className="hidden sm:inline">Resume Analyzer - AI-Powered Resume Enhancement | ResumeInsight</span>
              <span className="sm:hidden">ResumeInsight - AI Resume Analyzer</span>
            </div>
          </div>
          
          {/* Developer Info & Links */}
          <div className="flex flex-col items-center justify-center gap-1 sm:gap-2 text-xs sm:text-xs text-slate-400">
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              <span className="text-xs">Developed by</span>
              <a 
                href="https://www.linkedin.com/in/varad-patil-web-dev/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <p className="text-xs">Varad Patil</p>
                <div className='mb-0.5'>
                  <LinkedinIcon size={10} className="sm:w-3 sm:h-3" />
                </div>
              </a>
            </div>
            
            <div className="text-xs text-center">
              © {new Date().getFullYear()} ResumeInsight. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}