"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";

export default function Footer() {
  return (
    <motion.footer
      className="bg-slate-900 text-white py-6 sm:py-8 mt-auto"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      viewport={{ once: true }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Mobile: Stacked Layout */}
        <div className="flex flex-col gap-4 md:hidden">
          {/* Brand */}
          <div className="flex items-center justify-center gap-2">
            <div className="p-1.5 bg-blue-900 rounded-md flex-shrink-0">
              <FileText className="text-blue-400" size={16} />
            </div>
            <div className="font-semibold text-base">
              ResumeInsight
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-2 text-center text-sm text-slate-400">
            <div className="flex justify-center gap-4">
              <a href="/privacy-policy" className="hover:text-blue-400 transition-colors">
                Privacy Policy
              </a>
              <a href="/terms-of-service" className="hover:text-blue-400 transition-colors">
                Terms of Service
              </a>
            </div>
          </div>

          {/* Developer & Copyright */}
          <div className="flex flex-col gap-1 text-center text-xs text-slate-400">
            <div>
              <a
                href="https://www.linkedin.com/in/varad-patil-web-dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                By Varad Patil
              </a>
            </div>
            <div>
              © {new Date().getFullYear()} ResumeInsight
            </div>
          </div>
        </div>

        {/* Desktop: Horizontal Layout */}
        <div className="hidden md:flex items-center justify-center gap-6 lg:gap-8">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-900 rounded-md flex-shrink-0">
              <FileText className="text-blue-400" size={16} />
            </div>
            <div className="font-semibold text-base">
              ResumeInsight
            </div>
          </div>

          {/* Links */}
          <div className="text-sm text-slate-400 flex gap-4">
            <a href="/privacy-policy" className="hover:text-blue-400 transition-colors">
              Privacy Policy
            </a>
            <a href="/terms-of-service" className="hover:text-blue-400 transition-colors">
              Terms of Service
            </a>
          </div>

          {/* Developer */}
          <div className="text-sm text-slate-400">
            <a
              href="https://www.linkedin.com/in/varad-patil-web-dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              By Varad Patil
            </a>
          </div>

          {/* Copyright */}
          <div className="text-sm text-slate-400">
            © {new Date().getFullYear()} ResumeInsight
          </div>
        </div>
      </div>
    </motion.footer>
  );
}