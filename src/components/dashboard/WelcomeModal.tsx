"use client";

import React, { useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  QrCode, 
  Zap, 
  PartyPopper,
  ArrowRight,
  TrendingUp,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useRouter, useParams } from "next/navigation";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WelcomeModal = ({ isOpen, onClose }: WelcomeModalProps) => {
  const router = useRouter();
  const params = useParams();
  const businessSlug = params.business as string;

  useEffect(() => {
    if (isOpen) {
      // Fire confetti celebration!
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const handleSeePlans = () => {
    onClose();
    router.push(`/${businessSlug}/pricing`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
        <div className="relative">
          {/* Header Visual */}
          <div className="bg-indigo-600 h-32 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-indigo-700 opacity-50" />
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 10, stiffness: 100, delay: 0.2 }}
              className="relative z-10 w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30"
            >
              <PartyPopper className="w-10 h-10 text-white" />
            </motion.div>
            
            {/* Animated particles in background */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.2, 0.5, 0.2]
                }}
                transition={{
                  duration: 2 + i,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute w-2 h-2 bg-white rounded-full"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`
                }}
              />
            ))}
          </div>

          <div className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight">
                Welcome to <span className="text-indigo-600">ReviewFunnel!</span>
              </DialogTitle>
              <DialogDescription className="text-slate-500 font-bold text-base leading-relaxed">
                Your business is now ready to explode online. We&apos;ve started you off with some trial perks.
              </DialogDescription>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex flex-col items-center text-center gap-2 group hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm transition-transform group-hover:scale-110">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xl font-black text-emerald-700">10 Credits</p>
                  <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest">AI Generation</p>
                </div>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex flex-col items-center text-center gap-2 group hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm transition-transform group-hover:scale-110">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xl font-black text-indigo-700">1 Asset</p>
                  <p className="text-[10px] font-bold text-indigo-600/70 uppercase tracking-widest">Active QR Code</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
               <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                 <CheckCircle2 className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                 <p className="text-xs font-bold text-slate-600">Business profile successfully verified</p>
               </div>
               <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                 <CheckCircle2 className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                 <p className="text-xs font-bold text-slate-600">Reception QR code created & active</p>
               </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="w-full sm:flex-1 h-12 rounded-xl font-black text-slate-500 hover:bg-slate-50 active:scale-95 transition-all"
              >
                Go to Dashboard
              </Button>
              <Button 
                onClick={handleSeePlans}
                className="w-full sm:flex-1 h-12 rounded-xl font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-200 gap-2 active:scale-95 transition-all"
              >
                Upgrade Plan
                <ArrowRight className="w-4 h-4" />
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;
