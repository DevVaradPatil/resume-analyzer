"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";

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
        <div className="flex items-center md:items-center justify-center gap-2 sm:gap-3">
          {/* Left: Title */}
          <div className="flex items-center gap-2 text-center">
            <div className="p-1 bg-blue-900 rounded-md flex-shrink-0">
              <FileText className="text-blue-400" size={14} />
            </div>
            <div className="font-semibold text-sm leading-tight">
              ResumeInsight
            </div>
          </div>

          {/* Center: Developer (short) */}
          <div className="text-xs text-slate-400 md:text-sm flex gap-4">
            <a href="/privacy-policy" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
            <a href="/terms-of-service" className="hover:text-blue-400 transition-colors">Terms of Service</a>
          </div>

          {/* Center: Developer (short) */}
          <div className="text-xs text-slate-400 md:text-sm">
            <a
              href="https://www.linkedin.com/in/varad-patil-web-dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              By Varad Patil
            </a>
          </div>

          {/* Right: Short copyright */}
          <div className="text-xs text-slate-400 md:text-sm">
            © {new Date().getFullYear()} ResumeInsight
          </div>
        </div>
      </div>
    </motion.footer>
  );
}