"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap } from "lucide-react";
import { redirector } from "@/actions/redirector";

export default function LoadingAnimation() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      redirector();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* --- Spinner Section --- */}
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 mb-8">
            {/* Outer Ring (Golden Yellow) */}
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-secondary/30 border-t-secondary"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, ease: "linear", repeat: Infinity }}
            />

            {/* Inner Ring (Primary Red) */}
            <motion.div
              className="absolute inset-2 rounded-full border-4 border-transparent border-b-primary"
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
            />

            {/* Central Icon (Breathing Effect) */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center text-primary"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <GraduationCap className="w-8 h-8 sm:w-12 sm:h-12" strokeWidth={1.5} />
            </motion.div>
          </div>

          {/* --- Text Section --- */}
          <div className="text-center space-y-2 px-4">
            <motion.h1
              className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              AASTU <span className="text-primary">Exit Portal</span>
            </motion.h1>

            <motion.div
              className="flex items-center justify-center gap-2 text-sm sm:text-base font-medium text-muted-foreground"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              Powered by SAAS Founders Club
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
