'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import axios from 'axios';
import Link from "next/link";
import { API_URL, SOCKET_URL } from '@/config/environment';
import {
  BackgroundBeams,
  MovingBorder,
  TextGenerateEffect,
  Spotlight,
  AnimatedTooltip,
  CardHoverEffect,
  SparklesCore,
  AnimatedGradientText
} from "@/components/ui/aceternity/index";
import {
  Activity,
  FileText,
  Brain,
  Syringe,
  UploadCloud,
  AlarmClock,
  Shuffle,
  ListChecks,
  ShieldCheck
} from 'lucide-react';

import SymptomForm from '@/components/SymptomForm';
import LoadingAnimation from '@/components/LoadingAnimation';
import ResultsDisplay from '@/components/ResultsDisplay';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
// import { API_URL } from '@/config/environment';

// This ensures the page is only rendered on the client side
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export default function SymptomChecker() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [showBeams, setShowBeams] = useState(true);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true });
  const mainControls = useAnimation();
  const navigate = useRouter();

  useEffect(() => {
    if (isInView) {
      mainControls.start("visible");
    }
  }, [isInView, mainControls]);

  // Hide background beams when showing results for better readability
  useEffect(() => {
    if (results) {
      setShowBeams(false);
    } else {
      setShowBeams(true);
    }
  }, [results]);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/symptom-checker/analyze`, formData);
      setResults(response.data.data);
    } catch (err) {
      console.error('Error analyzing symptoms:', err);
      setError(err.response?.data?.message || 'An error occurred while analyzing your symptoms');
    } finally {
      setLoading(false);
    }
  };

  // Sample medical experts data for the trust indicators
  const medicalExperts = [
    {
      name: "Dr. Sarah Johnson",
      designation: "Cardiologist",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&auto=format&fit=crop"
    },
    {
      name: "Dr. Michael Chen",
      designation: "Neurologist",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200&auto=format&fit=crop"
    },
    {
      name: "Dr. Emily Wilson",
      designation: "Immunologist",
      image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=200&auto=format&fit=crop"
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 antialiased">
      {/* Animated background effect */}
      {showBeams && (
        <BackgroundBeams className="opacity-20 dark:opacity-30" />
      )}

      {/* Dark mode gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-500/5 dark:from-blue-800/10 dark:via-indigo-900/5 dark:to-transparent pointer-events-none"></div>

      <div className="container relative z-10 mx-auto py-16 px-4">
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="hsl(var(--primary)/0.15)"
        />

        {/* Header section with animated gradient text */}
        <div className="relative z-10 text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <AnimatedGradientText className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              AI Symptom Checker
            </AnimatedGradientText>
          </motion.div>

          <div className="max-w-3xl mx-auto mt-6">
            <TextGenerateEffect
              words="Upload your medical reports or describe your symptoms for an AI-powered health analysis backed by clinical research and medical expertise."
              className="text-base md:text-lg text-gray-600 dark:text-gray-300"
            />
          </div>

          {/* Animated stats */}
          <motion.div
            className="flex flex-wrap justify-center gap-8 mt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-blue-100/80 dark:bg-blue-900/30">
                <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-gray-700 dark:text-gray-300">
                <span className="font-bold text-blue-600 dark:text-blue-400">98%</span> Analysis Accuracy
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-blue-100/80 dark:bg-blue-900/30">
                <Brain className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-gray-700 dark:text-gray-300">
                <span className="font-bold text-blue-600 dark:text-blue-400">10M+</span> Medical Records Analyzed
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-blue-100/80 dark:bg-blue-900/30">
                <AlarmClock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-gray-700 dark:text-gray-300">
                <span className="font-bold text-blue-600 dark:text-blue-400">30s</span> Average Analysis Time
              </span>
            </div>
          </motion.div>
        </div>

        {/* Medical experts endorsement */}
        {!loading && !results && (
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            <h2 className="text-xl text-gray-700 dark:text-gray-300 mb-4 font-medium">Trusted by medical professionals</h2>
            <div className="flex flex-wrap justify-center gap-2">
              <AnimatedTooltip items={medicalExperts} />
            </div>
          </motion.div>
        )}

        {/* Main content - Form or Results */}
        <div className="max-w-4xl mx-auto" ref={containerRef}>
          {!loading && !results && (
            <motion.div
              variants={{
                hidden: { opacity: 1, y: 50 },
                visible: { opacity: 1, y: 0 },
              }}
              initial="hidden"
              animate={mainControls}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 p-1 rounded-2xl shadow-xl dark:shadow-gray-900/30 border border-gray-200/50 dark:border-gray-700/50">
                <SymptomForm onSubmit={handleSubmit} />

                <SparklesCore
                  id="tsparticles"
                  background="transparent"
                  particleCount={15}
                  speed={0.3}
                  opacity={0.3}
                  className="absolute inset-0 -z-10"
                />
              </div>
            </motion.div>
          )}

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 p-6 rounded-2xl shadow-xl dark:shadow-gray-900/30 border border-gray-200/50 dark:border-gray-700/50"
            >
              <LoadingAnimation />
            </motion.div>
          )}

          {!loading && results && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <ResultsDisplay results={results} onReset={() => {
                setResults(null);
                setShowBeams(true);
              }} />
            </motion.div>
          )}

          {error && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/60 text-red-800 dark:text-red-300 rounded-lg p-6 mb-6 shadow-lg"
            >
              <h3 className="font-medium text-lg mb-2">Error</h3>
              <p>{error}</p>
              <Button
                variant="outline"
                className="mt-4 border-red-300 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
                onClick={() => setError(null)}
              >
                Try Again
              </Button>
            </motion.div>
          )}
        </div>

        {/* Feature cards - Visible only on form page */}
        {!loading && !results && (
          <motion.div
            className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            {[
              {
                icon: <UploadCloud className="h-6 w-6" />,
                title: "Upload Reports",
                description: "Securely upload medical records and reports for analysis"
              },
              {
                icon: <Brain className="h-6 w-6" />,
                title: "AI Analysis",
                description: "Advanced algorithms analyze symptoms and medical data"
              },
              {
                icon: <Syringe className="h-6 w-6" />,
                title: "Personalized Results",
                description: "Get tailored health insights based on your unique profile"
              },
              {
                icon: <ListChecks className="h-6 w-6" />,
                title: "Action Plan",
                description: "Receive clear next steps and recommendations"
              }
            ].map((feature, index) => (
              <div key={index} className="group relative">
                <CardHoverEffect className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700/80 bg-white dark:bg-gray-800/90 shadow-sm dark:shadow-gray-900/30 backdrop-blur-sm p-6 min-h-[200px]">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{feature.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                  </div>
                </CardHoverEffect>
              </div>
            ))}
          </motion.div>
        )}

        {/* CTA section - Visible only on form page */}
        {!loading && !results && (
          <div className="mt-20 text-center">
            <MovingBorder
              borderRadius="0.75rem"
              className="p-0.5 bg-gradient-to-r from-blue-100 via-white to-blue-100 dark:from-blue-900/30 dark:via-gray-800/80 dark:to-blue-900/30"
            >
              <button className="relative w-full rounded-[11px] bg-white dark:bg-gray-800 px-8 py-4 group transition-colors">
                <div className="flex items-center justify-center gap-2 text-gray-800 dark:text-gray-200 font-medium">
                  <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 opacity-70 group-hover:opacity-100 transition-opacity" />
                  Your data is secure and confidential
                </div>
              </button>
            </MovingBorder>

            <div className="mt-10 text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} MediMantra. All rights reserved.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
