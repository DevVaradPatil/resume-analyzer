'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  Target,
  Edit3,
  BarChart3,
  ArrowRight,
  Zap,
  CheckCircle,
  Users,
  Star,
  Rocket,
  Sparkles,
  TrendingUp,
  GitCompare,
} from "lucide-react";
import HeroSection from "../components/HeroSection";

export default function HomePage() {
  // State to store random values for background animations
  const [backgroundElements, setBackgroundElements] = useState([]);
  const [isClient, setIsClient] = useState(false);

  // Generate random values on client side only
  useEffect(() => {
    setIsClient(true);
    const elements = [...Array(5)].map((_, i) => ({
      id: i,
      width: Math.random() * 300 + 100,
      height: Math.random() * 300 + 100,
      left: Math.random() * 100,
      top: Math.random() * 100,
      animateX: Math.random() * 50 - 25,
      animateY: Math.random() * 50 - 25,
      duration: 8 + Math.random() * 5,
    }));
    setBackgroundElements(elements);
  }, []);

  const features = [
    {
      icon: Target,
      title: "Resume & Job Match Analysis",
      description:
        "Upload your resume and job description to get an AI-powered compatibility score with detailed insights.",
      path: "/resume-analysis",
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600",
      features: [
        "Match Score Calculation",
        "Skill Gap Analysis",
        "Keyword Optimization",
        "ATS Compatibility",
      ],
    },
    {
      icon: BarChart3,
      title: "Resume Analytics",
      description:
        "Get detailed analytics about your resume structure, readability, and overall quality.",
      path: "/analytics",
      color: "bg-emerald-500",
      hoverColor: "hover:bg-emerald-600",
      features: [
        "Quality Metrics",
        "Structure Analysis",
        "Content Scoring",
        "Industry Benchmarks",
      ],
    },
    {
      icon: Edit3,
      title: "Section Enhancement",
      description:
        "Improve specific sections of your resume with AI-powered suggestions and enhanced content.",
      path: "/section-improvement",
      color: "bg-purple-500",
      hoverColor: "hover:bg-purple-600",
      features: [
        "Section Optimization",
        "Content Enhancement",
        "Action Verb Suggestions",
        "Impact Metrics",
      ],
    },
    // {
    //   icon: GitCompare,
    //   title: "Resume Comparison",
    //   description:
    //     "Compare multiple versions of your resume to see which one performs better with AI insights.",
    //   path: "/resume-comparison",
    //   color: "bg-pink-500",
    //   hoverColor: "hover:bg-pink-600",
    //   features: [
    //     "Side-by-Side Comparison",
    //     "Performance Metrics",
    //     "Improvement Suggestions",
    //     "Version Tracking",
    //   ],
    //   comingSoon: true,
    // }
  ];

  const stats = [
    { label: "Resumes Analyzed", value: "10,000+", icon: FileText },
    { label: "Success Rate", value: "92%", icon: CheckCircle },
    { label: "Average Score Improvement", value: "+35%", icon: BarChart3 },
    { label: "Happy Users", value: "5,000+", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <HeroSection />

      {/* Stats Section */}
      <motion.section
        className="py-16 bg-gradient-to-b from-white to-blue-50 relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-slate-800 mb-2">
              Trusted by Job Seekers
            </h2>
            <p className="text-slate-600 text-lg">
              Our AI has helped thousands of professionals land their dream jobs
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 text-center hover:shadow-xl transition-shadow duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                viewport={{ once: true }}
              >
                <motion.div
                  className="w-14 h-14 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center"
                  whileHover={{ rotate: 10 }}
                >
                  <stat.icon className="text-blue-600" size={28} />
                </motion.div>
                <motion.div
                  className="text-3xl font-bold text-slate-800 mb-1"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  viewport={{ once: true }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-sm text-slate-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
          <svg
            className="absolute top-0 left-0 w-full h-auto opacity-10"
            viewBox="0 0 1200 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M 0 50 Q 300 150 600 50 Q 900 -50 1200 50 L 1200 200 L 0 200 Z"
              fill="#3b82f6"
            />
          </svg>
          <svg
            className="absolute bottom-0 left-0 w-full h-auto opacity-10"
            viewBox="0 0 1200 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M 0 150 Q 300 50 600 150 Q 900 250 1200 150 L 1200 200 L 0 200 Z"
              fill="#10b981"
            />
          </svg>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        className="py-24 relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm font-medium mb-4"
              whileHover={{ scale: 1.05 }}
            >
              <Rocket size={16} />
              <span>Powerful Analysis Tools</span>
            </motion.div>

            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              Choose Your Resume Enhancement Path
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Our AI-powered tools provide targeted analysis to help you stand
              out in the job market
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="group relative h-full"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
              >
                <div className="bg-white rounded-3xl border-2 border-slate-100 p-8 shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col relative overflow-hidden z-10">
                  {/* Gradient background accent */}
                  <div
                    className={`absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-20 blur-2xl transition-all duration-300 group-hover:scale-150 z-0 ${
                      index === 0
                        ? "bg-blue-400"
                        : index === 1
                        ? "bg-emerald-400"
                        : "bg-purple-400"
                    }`}
                  ></div>

                  {feature.comingSoon && (
                    <motion.div
                      className="absolute top-6 right-6 bg-orange-100 text-orange-600 px-4 py-1.5 rounded-full text-sm font-medium"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      Coming Soon
                    </motion.div>
                  )}

                  <motion.div
                    className={`p-5 ${feature.color} rounded-2xl flex-shrink-0 mb-6 shadow-lg inline-flex w-min relative overflow-hidden transition-all duration-300 group-hover:rotate-6 group-hover:scale-110`}
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{
                      transform: "perspective(1000px)",
                      transformStyle: "preserve-3d",
                    }}
                  >
                    <feature.icon className="text-white" size={30} />
                    <motion.div
                      className="absolute inset-0 bg-white opacity-20"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 1.5 }}
                    />
                  </motion.div>

                  <h3 className="text-2xl font-bold text-slate-800 mb-4 leading-tight z-10">
                    {feature.title}
                  </h3>

                  <p className="text-slate-600 mb-8 leading-relaxed flex-grow text-lg z-10">
                    {feature.description}
                  </p>

                  <div className="space-y-3 mb-8 z-10">
                    {feature.features.map((item, idx) => (
                      <motion.div
                        key={idx}
                        className="flex items-center gap-3 text-slate-700"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + idx * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <CheckCircle
                          size={18}
                          className={`${
                            index === 0
                              ? "text-blue-500"
                              : index === 1
                              ? "text-emerald-500"
                              : "text-purple-500"
                          } flex-shrink-0`}
                        />
                        <span>{item}</span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-auto z-10">
                    {feature.comingSoon ? (
                      <motion.button
                        disabled
                        className="w-full bg-slate-100 text-slate-400 px-6 py-4 rounded-xl font-medium cursor-not-allowed border border-slate-200"
                        whileHover={{ scale: 0.98 }}
                      >
                        Coming Soon
                      </motion.button>
                    ) : (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Link
                          href={feature.path}
                          className={`w-full ${feature.color} ${feature.hoverColor} text-white px-6 py-4 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center gap-2 group-hover:gap-4 shadow-lg`}
                        >
                          Get Started
                          <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{
                              repeat: Infinity,
                              duration: 1.5,
                              repeatType: "loop",
                            }}
                          >
                            <ArrowRight size={18} />
                          </motion.div>
                        </Link>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 -z-10 w-1/3 h-full opacity-20">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 400 400"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="100" cy="100" r="80" fill="#3b82f6" />
            <circle cx="300" cy="300" r="120" fill="#10b981" />
            <circle cx="250" cy="150" r="50" fill="#8b5cf6" />
          </svg>
        </div>

        <motion.div
          className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-blue-50/50 to-transparent -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        ></motion.div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section
        className="py-24 bg-gradient-to-br from-slate-900 to-blue-900 text-white relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <motion.div
          className="absolute inset-0 opacity-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.1 }}
          viewport={{ once: true }}
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <pattern
                id="grid"
                width="10"
                height="10"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 10 0 L 0 0 0 10"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </motion.div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-blue-200 text-sm font-medium backdrop-blur-sm mb-4"
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles size={16} />
              <span>Simple Three-Step Process</span>
            </motion.div>

            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Our streamlined process makes it easy to get professional resume
              analysis and improvement suggestions in minutes
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-12 relative">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-24 left-1/2 transform -translate-x-1/2 w-[80%] h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500"></div>

            {/* Step 1 */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 min-h-[350px] flex flex-col shadow-xl">
                <motion.div
                  className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-600/30"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                >
                  <FileText className="text-white" size={28} />
                </motion.div>

                <motion.div
                  className="absolute -top-3 -right-3 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  1
                </motion.div>

                <h3 className="text-2xl font-bold text-white mb-4 text-center">
                  Upload Your Resume
                </h3>
                <p className="text-blue-100 text-center leading-relaxed flex-grow">
                  Upload your resume in PDF format and provide the job
                  description you're targeting for a personalized analysis.
                </p>

                <motion.div
                  className="mt-6 pt-6 border-t border-white/10 flex justify-center"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  viewport={{ once: true }}
                >
                  <ArrowRight className="text-blue-300" size={20} />
                </motion.div>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 min-h-[350px] flex flex-col shadow-xl">
                <motion.div
                  className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-600/30"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                >
                  <Zap className="text-white" size={28} />
                </motion.div>

                <motion.div
                  className="absolute -top-3 -right-3 w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  viewport={{ once: true }}
                >
                  2
                </motion.div>

                <h3 className="text-2xl font-bold text-white mb-4 text-center">
                  AI Analysis
                </h3>
                <p className="text-blue-100 text-center leading-relaxed flex-grow">
                  Our advanced AI analyzes your resume's structure, content,
                  keywords, and compatibility with the job requirements.
                </p>

                <motion.div
                  className="mt-6 pt-6 border-t border-white/10 flex justify-center"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  viewport={{ once: true }}
                >
                  <ArrowRight className="text-blue-300" size={20} />
                </motion.div>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 min-h-[350px] flex flex-col shadow-xl">
                <motion.div
                  className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-600/30"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                >
                  <TrendingUp className="text-white" size={28} />
                </motion.div>

                <motion.div
                  className="absolute -top-3 -right-3 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  viewport={{ once: true }}
                >
                  3
                </motion.div>

                <h3 className="text-2xl font-bold text-white mb-4 text-center">
                  Get Detailed Insights
                </h3>
                <p className="text-blue-100 text-center leading-relaxed flex-grow">
                  Receive personalized feedback, improvement suggestions, and
                  specific recommendations to enhance your resume.
                </p>

                <motion.div
                  className="mt-6 pt-6 border-t border-white/10 flex justify-center"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  viewport={{ once: true }}
                >
                  <CheckCircle className="text-emerald-300" size={20} />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Floating elements */}
        <motion.div
          className="absolute top-20 right-20 w-20 h-20 rounded-full bg-blue-500 opacity-20 blur-xl"
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        ></motion.div>

        <motion.div
          className="absolute bottom-20 left-20 w-32 h-32 rounded-full bg-purple-500 opacity-20 blur-xl"
          animate={{
            y: [0, 30, 0],
            x: [0, -20, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        ></motion.div>
      </motion.section>

      {/* CTA Section */}
      <section className="py-20 sm:py-24 relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 -z-10"></div>

        {/* Animated patterns */}
        <motion.div className="absolute inset-0 -z-5">
          <motion.div
            className="absolute top-0 left-0 w-full h-full"
            initial={{ opacity: 0.1 }}
            animate={{ opacity: 0.2 }}
            transition={{ duration: 1 }}
          >
            {isClient && backgroundElements.map((element) => (
              <motion.div
                key={element.id}
                className="absolute rounded-full bg-white blur-3xl"
                style={{
                  width: element.width,
                  height: element.height,
                  left: `${element.left}%`,
                  top: `${element.top}%`,
                }}
                animate={{
                  x: [0, element.animateX],
                  y: [0, element.animateY],
                  opacity: [0.2, 0.3, 0.2],
                }}
                transition={{
                  duration: element.duration,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="bg-white/10 backdrop-blur-sm rounded-3xl p-10 sm:p-16 shadow-2xl border border-white/10"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              <div className="text-center md:text-left">
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-white text-sm font-medium mb-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  <Star size={14} />
                  <span>4.9/5 Average Rating</span>
                </motion.div>

                <motion.h2
                  className="text-3xl sm:text-4xl font-bold text-white mb-4"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  Ready to Land Your <br className="hidden sm:block" />
                  <span className="bg-gradient-to-r from-yellow-200 to-yellow-400 bg-clip-text text-transparent">
                    Dream Job?
                  </span>
                </motion.h2>

                <motion.p
                  className="text-lg sm:text-xl text-blue-100 max-w-xl"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  viewport={{ once: true }}
                >
                  Join thousands of professionals who've transformed their
                  careers with our AI-powered resume analysis.
                </motion.p>
              </div>

              <motion.div
                className="flex-shrink-0 mx-auto md:mx-0"
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6 }}
                viewport={{ once: true }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/resume-analysis"
                    className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-5 rounded-xl font-bold text-lg shadow-lg shadow-blue-900/30 flex items-center gap-3 transition-all duration-300"
                  >
                    Start Free Analysis
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      <ArrowRight size={20} />
                    </motion.div>
                  </Link>
                </motion.div>

                <motion.p
                  className="text-blue-100 text-sm mt-3 text-center opacity-80"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 0.8 }}
                  transition={{ delay: 0.8 }}
                  viewport={{ once: true }}
                >
                  No credit card required • 100% free
                </motion.p>
              </motion.div>
            </div>

            <motion.div
              className="mt-12 pt-8 border-t border-white/20 grid grid-cols-2 sm:grid-cols-4 gap-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              viewport={{ once: true }}
            >
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">
                  10K+
                </div>
                <div className="text-blue-100 text-sm">Resumes Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">
                  92%
                </div>
                <div className="text-blue-100 text-sm">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">
                  35%
                </div>
                <div className="text-blue-100 text-sm">Score Improvement</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">
                  5K+
                </div>
                <div className="text-blue-100 text-sm">Happy Users</div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <motion.footer
        className="bg-slate-900 text-white py-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-900 rounded-lg">
                <FileText className="text-blue-400" size={24} />
              </div>
              <div className="font-bold text-xl">Resume Analyzer</div>
            </div>

            <div className="text-slate-400 text-sm">
              © {new Date().getFullYear()} Resume Analyzer. All rights reserved.
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
