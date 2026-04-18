"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useState } from "react";

interface MagicLoadingProps {
  isVisible: boolean;
  message?: string;
}

const Sparkle = () => {
  // Generate random properties ONLY ONCE on mount using a state initializer
  const [config] = useState(() => ({
    delay: Math.random() * 2,
    size: 10 + Math.random() * 10,
    x: `${Math.random() * 100}%`,
    y: `${Math.random() * 100}%`,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, rotate: 0 }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, 1.2, 0],
        rotate: [0, 90, 180],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        delay: config.delay,
        ease: "easeInOut",
      }}
      className="absolute text-(--brand-primary) pointer-events-none"
      style={{ left: config.x, top: config.y }}
    >
      <Sparkles size={config.size} fill="currentColor" className="opacity-70" />
    </motion.div>
  );
};

export const MagicLoading = ({
  isVisible,
  message = "AI is working its magic...",
}: MagicLoadingProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/40 backdrop-blur-md rounded-(--brand-radius) overflow-hidden"
        >
          {/* Pulsing Energy Glow */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0.3 }}
            animate={{
              scale: [0.8, 1.1, 0.8],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute w-64 h-64 bg-(--brand-primary)/10 rounded-full blur-3xl pointer-events-none"
          />

          {/* Sparkles Layer */}
          <div className="absolute inset-0">
            {Array.from({ length: 12 }).map((_, i) => (
              <Sparkle key={i} />
            ))}
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center gap-4">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-16 h-16 bg-background border border-(--brand-primary)/20 rounded-2xl flex items-center justify-center shadow-2xl shadow-(--brand-primary)/10"
            >
              <Sparkles className="text-(--brand-primary) w-8 h-8 animate-pulse" />
            </motion.div>

            <div className="flex flex-col items-center gap-1">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm font-bold bg-linear-to-r from-(--brand-primary) via-purple-500 to-(--brand-primary) bg-size-[200%_auto] bg-clip-text text-transparent animate-shimmer"
              >
                {message}
              </motion.p>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                    className="w-1 h-1 bg-(--brand-primary) rounded-full"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Scanning Line */}
          <motion.div
            initial={{ top: "-10%" }}
            animate={{ top: "110%" }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute left-0 right-0 h-px bg-linear-to-r from-transparent via-(--brand-primary)/50 to-transparent shadow-[0_0_15px_rgba(var(--brand-primary-rgb),0.5)] z-0"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
