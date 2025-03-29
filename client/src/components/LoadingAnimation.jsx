'use client';

import { motion } from "framer-motion";
import { Activity, Brain, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";

export default function LoadingAnimation() {
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  
  const steps = [
    { icon: <Activity className="h-6 w-6" />, label: "Analyzing symptoms" },
    { icon: <Brain className="h-6 w-6" />, label: "Processing medical data" },
    { icon: <FileText className="h-6 w-6" />, label: "Generating insights" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress < 33) setActiveStep(0);
    else if (progress < 66) setActiveStep(1);
    else setActiveStep(2);
  }, [progress]);

  return (
    <div className="max-w-md mx-auto text-center p-8 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10">
      <div className="relative h-32 w-32 mx-auto mb-6">
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-0 rounded-full border-t-4 border-blue-500"
        ></motion.div>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {steps[activeStep].icon}
          </motion.div>
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-white mb-2">
        {steps[activeStep].label}
      </h3>
      
      <p className="text-gray-300 mb-6">
        Our AI is analyzing your information to provide accurate results
      </p>
      
      <Progress value={progress} className="h-2 mb-2" />
      <p className="text-sm text-gray-400">{progress}% Complete</p>
    </div>
  );
}
