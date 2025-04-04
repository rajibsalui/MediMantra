"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StepProgress({ currentStep }) {
  const steps = [
    { num: 1, title: "Find a Doctor" },
    { num: 2, title: "Patient Details" },
    { num: 3, title: "Confirmation" }
  ];

  return (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center w-full max-w-3xl">
        {steps.map((step, i) => (
          <div key={i} className="flex-1 relative">
            <div className="flex flex-col items-center">
              <div 
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium border-2 z-10",
                  currentStep > step.num 
                    ? "bg-blue-600 dark:bg-blue-700 border-blue-600 dark:border-blue-700 text-white" 
                    : currentStep === step.num 
                    ? "bg-blue-600 dark:bg-blue-700 border-blue-600 dark:border-blue-700 text-white" 
                    : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400"
                )}
              >
                {currentStep > step.num ? <Check className="h-5 w-5" /> : step.num}
              </div>
              <span className={cn(
                "text-sm mt-2 font-medium",
                currentStep >= step.num 
                  ? "text-blue-600 dark:text-blue-400" 
                  : "text-slate-500 dark:text-slate-400"
              )}>
                {step.title}
              </span>
            </div>
            
            {/* Connecting line */}
            {i < 2 && (
              <div className={cn(
                "absolute top-5 left-1/2 w-full h-0.5",
                currentStep > step.num + 1 
                  ? "bg-blue-600 dark:bg-blue-500" 
                  : "bg-slate-300 dark:bg-slate-600"
              )}></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}