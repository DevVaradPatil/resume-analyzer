'use client';

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import {
  FileText,
  ArrowRight,
  Edit3,
  CheckCircle,
  Star,
  TrendingUp,
  Sparkles,
} from "lucide-react";

const HeroSection = () => {
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const pulseAnimation = {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse",
      },
    },
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-white to-blue-50 py-16 sm:py-24">
      <motion.div
        className="max-w-6xl mx-auto px-4 sm:px-6"
        initial="hidden"
        animate="visible"
        variants={staggerChildren}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <motion.div className="text-left max-w-xl" variants={fadeIn}>
            <motion.div
              className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full text-blue-700 text-sm font-medium mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Sparkles size={16} />
              <span>AI-Powered Resume Enhancement</span>
            </motion.div>

            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-800 mb-6 leading-tight"
              variants={fadeIn}
            >
              Elevate Your <span className="text-blue-600">Resume</span> with AI
              Analysis
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl text-slate-600 mb-8 leading-relaxed"
              variants={fadeIn}
            >
              Transform your job application process with precision AI analysis.
              Get personalized insights, close skill gaps, and stand out to
              recruiters with an optimized resume that gets results.
            </motion.p>

            <motion.div
              className="flex flex-wrap items-center gap-4"
              variants={fadeIn}
            >
              <SignedIn>
                <Link
                  href="/resume-analysis"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-300 flex items-center gap-2 shadow-lg shadow-blue-200"
                >
                  Start Analysis
                  <ArrowRight size={18} />
                </Link>
                <Link
                  href="/section-improvement"
                  className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-800 rounded-xl font-medium transition-all duration-300 border border-slate-200 flex items-center gap-2"
                >
                  Improve Sections
                  <Edit3 size={18} />
                </Link>
              </SignedIn>
              <SignedOut>
                <Link
                  href="/sign-up"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-300 flex items-center gap-2 shadow-lg shadow-blue-200"
                >
                  Get Started Free
                  <ArrowRight size={18} />
                </Link>
                <Link
                  href="/sign-in"
                  className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-800 rounded-xl font-medium transition-all duration-300 border border-slate-200 flex items-center gap-2"
                >
                  Sign In
                </Link>
              </SignedOut>
            </motion.div>

            <motion.div
              className="flex items-center gap-2 mt-8 text-slate-600"
              variants={fadeIn}
            >
              <motion.div
                className="flex -space-x-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                {[
                  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1160&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=928&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                  "https://plus.unsplash.com/premium_photo-1731499365752-cf90a04e0836?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                  "https://plus.unsplash.com/premium_photo-1731617144678-781ad264740a?q=80&w=830&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                ].map((imgUrl, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-white overflow-hidden"
                  >
                    <img
                      src={imgUrl}
                      alt={`User ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </motion.div>
              <span className="text-sm">
                Join 5,000+ professionals who improved their careers
              </span>
            </motion.div>
          </motion.div>

          {/* Resume Visualization */}
          <motion.div
            className="relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {/* Main Resume Document */}
            <motion.div
              className="relative z-10"
              variants={pulseAnimation}
              animate="animate"
              initial="initial"
            >
              <motion.div
                className="w-72 md:w-96 bg-white rounded-xl shadow-2xl overflow-hidden"
                initial={{ y: 0 }}
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
                whileHover={{
                  scale: 1.03,
                  boxShadow:
                    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
              >
                {/* Resume content */}
                <div className="relative">
                  <img
                    src="/assets/resume_sample.png"
                    alt="Resume sample"
                    className="w-full object-contain"
                  />

                  {/* Analysis UI overlay elements */}
                  <motion.div
                    className="absolute top-[30%] left-4 w-[70%] h-6 border-2 border-blue-500 rounded-md bg-blue-500/30"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                  />

                  <motion.div
                    className="absolute top-[45%] right-4 w-[40%] h-6 border-2 border-emerald-500 rounded-md bg-emerald-500/30"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 2.5 }}
                  />

                  <motion.div
                    className="absolute top-[60%] left-4 w-[60%] h-6 border-2 border-purple-500 rounded-md bg-purple-500/30"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 4 }}
                  />

                  {/* Full scanning effect overlay */}
                  <motion.div
                    className="absolute inset-0 bg-blue-400/20"
                    initial={{ opacity: 0, top: 0 }}
                    animate={{
                      opacity: [0, 0.3, 0],
                      top: ["0%", "100%", "0%"],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      repeatType: "loop",
                    }}
                  />
                </div>
              </motion.div>

              {/* Analysis score card - Bottom Right */}
              <motion.div
                className="absolute -bottom-12 -right-6 w-28 h-28 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-3 flex flex-col items-center justify-center shadow-lg shadow-blue-500/30 text-white"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-xs uppercase tracking-wider opacity-80">
                  Match Score
                </div>
                <motion.div
                  className="text-3xl font-bold"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: [0.8, 1.1, 1] }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                >
                  92%
                </motion.div>
                <div className="text-xs mt-1">Overall Rating</div>
              </motion.div>

              <motion.div
                className="absolute top-6 -left-12 w-28 h-28 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-3 flex flex-col items-center justify-center shadow-lg shadow-purple-500/30 text-white z-20"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-xs uppercase tracking-wider opacity-80">
                  Job Match
                </div>
                <motion.div
                  className="text-3xl font-bold flex items-center"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: [0.8, 1.1, 1] }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                >
                  A<span className="text-sm font-normal">+</span>
                </motion.div>
                <div className="text-xs mt-1">Perfect Fit</div>
              </motion.div>

              {/* Scanning effect */}
              <motion.div
                className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-400"
                animate={{
                  y: [0, 350, 0],
                  opacity: [0.8, 0.6, 0.8],
                  boxShadow: [
                    "0 0 10px 2px rgba(59, 130, 246, 0.3)",
                    "0 0 15px 3px rgba(59, 130, 246, 0.4)",
                    "0 0 10px 2px rgba(59, 130, 246, 0.3)",
                  ],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "loop",
                }}
              />

              {/* Subtle scan lines */}
              <div
                className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/5 to-transparent pointer-events-none mix-blend-overlay"
                style={{
                  backgroundSize: "100% 8px",
                  backgroundImage:
                    "linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
                }}
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Decorative background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute top-20 right-40 w-20 h-20 bg-blue-400 rounded-full opacity-20 blur-xl"
          animate={{
            y: [0, 30, 0],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "mirror",
          }}
        />
        <motion.div
          className="absolute bottom-40 left-1/4 w-40 h-40 bg-purple-400 rounded-full opacity-20 blur-xl"
          animate={{
            y: [0, -30, 0],
            x: [0, -20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "mirror",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-10 w-16 h-16 bg-emerald-400 rounded-full opacity-20 blur-xl"
          animate={{
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            repeatType: "mirror",
          }}
        />
      </div>
    </section>
  );
};

export default HeroSection;