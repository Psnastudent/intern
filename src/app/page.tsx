"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BarChart3, CheckCircle2, Shield, Zap, Search } from "lucide-react";

export default function Home() {
  const scrollToHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen pt-20 pb-16 px-4">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-40 bg-white/70 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-accent text-white shadow-sm">
              <Zap className="w-4 h-4" />
            </div>
            <span className="font-semibold text-lg text-foreground tracking-tight">
              SpendPilot
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={scrollToHowItWorks}
              className="text-sm font-medium text-gray-600 hover:text-accent transition-colors"
            >
              How it works
            </button>
            <Link
              href="/audit"
              className="btn-primary text-sm py-2 px-4 shadow-accent/20"
            >
              Free Audit
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="w-full max-w-4xl mx-auto text-center mt-12 relative z-10 flex-1 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-8 border border-accent/10">
            <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse"></span>
            <span className="text-xs font-medium text-accent">
              Audit your AI subscriptions in minutes
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
            Stop overpaying for <br />
            <span className="text-accent relative inline-block">
              AI Tools
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-accent/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
            Many teams pay for multiple AI tools that do the exact same thing. 
            SpendPilot analyzes your stack and helps you consolidate overlapping subscriptions so you only pay for what you actually need.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Link
              href="/audit"
              className="btn-primary w-full sm:w-auto text-lg py-4 px-8 shadow-accent/20"
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              Start Free Audit
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
          
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mt-6 px-4 py-2 bg-gray-50/50 rounded-full border border-gray-100">
            <Shield className="w-4 h-4 text-accent" />
            No credit card required. Completely free to use.
          </div>
        </motion.div>
      </main>

      {/* How It Works Section */}
      <section id="how-it-works" className="w-full max-w-5xl mx-auto mt-32 mb-20 relative z-10 pt-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            How SpendPilot Works
          </h2>
          <p className="text-lg text-gray-600 font-medium max-w-2xl mx-auto">
            A simple, three-step process to optimize your AI expenses and stop wasting money.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="glass-panel p-8 rounded-3xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 text-9xl font-black text-gray-50 opacity-50 group-hover:scale-110 transition-transform duration-500">
              1
            </div>
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-6">
                <Search className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-3">List Your Stack</h3>
              <p className="text-gray-600 leading-relaxed font-medium">
                Tell us which AI tools your team uses (like ChatGPT, GitHub Copilot, Midjourney) and how many seats you pay for.
              </p>
            </div>
          </motion.div>

          {/* Step 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="glass-panel p-8 rounded-3xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 text-9xl font-black text-gray-50 opacity-50 group-hover:scale-110 transition-transform duration-500">
              2
            </div>
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Instant Analysis</h3>
              <p className="text-gray-600 leading-relaxed font-medium">
                Our engine instantly calculates your total monthly spend and scans for overlapping features between your tools.
              </p>
            </div>
          </motion.div>

          {/* Step 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="glass-panel p-8 rounded-3xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 text-9xl font-black text-gray-50 opacity-50 group-hover:scale-110 transition-transform duration-500">
              3
            </div>
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-6">
                <CheckCircle2 className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Discover Savings</h3>
              <p className="text-gray-600 leading-relaxed font-medium">
                Get a clear report highlighting exactly which tools you can downgrade or cancel to save money without losing capability.
              </p>
            </div>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-16 flex justify-center"
        >
          <Link
            href="/audit"
            className="btn-primary text-lg py-4 px-8 shadow-accent/20"
          >
            Try it now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
