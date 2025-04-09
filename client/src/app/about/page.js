"use client";

import React from 'react';
import { motion } from "framer-motion";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { SparklesCore } from "@/components/ui/sparkles";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { HoverEffect } from "@/components/ui/card-hover-effect";
import { StickyScroll } from "@/components/ui/sticky-scroll-reveal";
import { LampContainer } from "@/components/ui/lamp";
import { Spotlight } from "@/components/ui/spotlight";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import Image from "next/image";
// This ensures the page is only rendered on the client side
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export default function About() {
  // Features content for hover cards
  const features = [
    {
      title: "Symptom Assessment",
      description: "Using advanced AI algorithms to analyze your symptoms and provide preliminary insights based on the latest medical research and clinical guidelines.",
      icon: "🩺",
    },
    {
      title: "Medical Information",
      description: "Access our extensive database of peer-reviewed medical information covering conditions, treatments, medications, and preventive care practices.",
      icon: "📚",
    },
    {
      title: "Personalized Care Plans",
      description: "Receive customized health recommendations that adapt to your unique health profile, preferences, and medical history for truly personalized care.",
      icon: "💊",
    },
    {
      title: "Health Monitoring",
      description: "Track vital health metrics, medication adherence, and symptoms over time with smart alerts and trends analysis to better manage chronic conditions.",
      icon: "📊",
    }
  ];

  // Team members for the about section
  const team = [
    {
      name: "Dr. Sarah Chen",
      role: "Chief Medical Officer",
      bio: "Board-certified physician with 15+ years of clinical experience and expertise in AI healthcare applications."
    },
    {
      name: "Michael Rodriguez",
      role: "AI Research Director",
      bio: "Former Google AI researcher with PhD in Machine Learning, specializing in natural language processing for healthcare."
    },
    {
      name: "Dr. Amara Okafor",
      role: "Clinical Validation Lead",
      bio: "Epidemiologist and public health expert ensuring Mediमंत्र's recommendations align with evidence-based guidelines."
    }
  ];

  // Content for sticky scroll sections
  const scrollContent = [
    {
      title: "Clinical Validation",
      description: "Every recommendation and piece of information provided by Mediमंत्र undergoes rigorous verification by our team of healthcare professionals, ensuring alignment with the latest medical guidelines and research.",
      content: <div className="h-full w-full bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl flex items-center justify-center p-8">
        <div className="flex flex-col items-center">
          <span className="text-6xl mb-4">🔬</span>
          <h4 className="text-blue-800 font-semibold text-lg">99.2% Accuracy Rate</h4>
          <p className="text-sm text-blue-700 text-center mt-2">In clinical validation studies comparing Mediमंत्र's assessments with physician diagnoses</p>
        </div>
      </div>
    },
    {
      title: "Data Security & Privacy",
      description: "Your health information is protected with enterprise-grade encryption, HIPAA-compliant data handling protocols, and a strict privacy-first approach that gives you complete control over your personal data.",
      content: <div className="h-full w-full bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl flex items-center justify-center p-8">
        <div className="flex flex-col items-center">
          <span className="text-6xl mb-4">🔒</span>
          <h4 className="text-teal-800 font-semibold text-lg">End-to-End Encryption</h4>
          <p className="text-sm text-teal-700 text-center mt-2">With SOC 2 Type II and HIPAA compliance certification</p>
        </div>
      </div>
    },
    {
      title: "Accessibility & Inclusion",
      description: "Mediमंत्र is designed following WCAG 2.1 AAA standards, featuring voice navigation, screen reader optimization, and support for 45+ languages to ensure healthcare information is accessible to everyone.",
      content: <div className="h-full w-full bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl flex items-center justify-center p-8">
        <div className="flex flex-col items-center">
          <span className="text-6xl mb-4">♿</span>
          <h4 className="text-indigo-800 font-semibold text-lg">Universal Design</h4>
          <p className="text-sm text-indigo-700 text-center mt-2">Supporting 45+ languages and multiple accessibility features</p>
        </div>
      </div>
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 text-gray-800">
      {/* Hero section with spotlight effect */}
      <Spotlight
        className="max-w-6xl mx-auto h-[40rem] relative z-10"
        fill="rgba(59, 130, 246, 0.15)"
      >
        <div className="p-4 max-w-7xl mx-auto relative z-10 w-full pt-20 md:pt-32">
          <h1 className="text-4xl md:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-teal-600">
            About Mediमंत्र
          </h1>
          <p className="mt-6 md:text-xl text-center text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
            Advanced AI healthcare assistant helping millions make better health decisions every day
          </p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-10 flex justify-center"
          >
            <div className="relative h-16 w-16 md:h-24 md:w-24 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 p-1 shadow-lg">
              <div className="absolute inset-0 rounded-full bg-white flex items-center justify-center overflow-hidden">
                <span className="text-3xl md:text-5xl">🤖</span>
              </div>
            </div>
          </motion.div>
        </div>
      </Spotlight>

      {/* Who We Are section with text generation effect */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-teal-600">
          Transforming Healthcare with AI
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <TextGenerateEffect
              words="Mediमंत्र leverages advanced artificial intelligence to provide personalized healthcare guidance based on your unique health profile. Our AI assistant combines clinical knowledge with the latest medical research to help you make informed decisions about your wellbeing."
              className="text-lg leading-relaxed text-gray-700"
            />
            <p className="mt-6 text-gray-600">
              Founded in 2023 by a team of physicians, AI researchers, and healthcare specialists, 
              Mediमंत्र aims to make quality healthcare information accessible to everyone while supporting
              medical professionals in delivering more efficient and personalized care.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-600">
                <h3 className="font-semibold text-blue-800">500K+</h3>
                <p className="text-xs text-gray-500">Active Users</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-teal-600">
                <h3 className="font-semibold text-teal-800">97%</h3>
                <p className="text-xs text-gray-500">User Satisfaction</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-indigo-600">
                <h3 className="font-semibold text-indigo-800">24/7</h3>
                <p className="text-xs text-gray-500">Support & Monitoring</p>
              </div>
            </div>
          </div>
          <CardContainer className="inter-var">
            <CardBody className="bg-white relative group/card rounded-2xl p-6 border border-gray-200 shadow-xl">
              <CardItem
                translateZ="120"
                className="w-full"
              >
                <div className="w-full aspect-square bg-gradient-to-br from-blue-500 to-teal-400 rounded-xl flex items-center justify-center shadow-md">
                  <Image 
                    src="/ai-doctor-image.png" 
                    width={300} 
                    height={300}
                    alt="Medical AI Assistant"
                    className="object-cover rounded-xl"
                    unoptimized
                  />
                </div>
              </CardItem>
              <CardItem
                translateZ="60"
                className="text-2xl font-bold text-blue-800 mt-6"
              >
                Next-Gen Medical Assistant
              </CardItem>
              <CardItem
                translateZ="80"
                className="text-gray-600 text-sm mt-2"
              >
                Powered by advanced machine learning and clinical knowledge bases
              </CardItem>
              <CardItem
                translateZ="100"
                className="mt-6"
              >
                <button className="px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all">
                  How It Works →
                </button>
              </CardItem>
            </CardBody>
          </CardContainer>
        </div>
      </section>

      {/* Mission section with lamp highlighting */}
      <section className="py-24 bg-gradient-to-r from-blue-50 to-teal-50">
        <LampContainer>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-3xl font-bold text-center text-blue-800 mb-6"
          >
            Our Mission
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <p className="text-xl text-gray-700 leading-relaxed">
              <span className="font-semibold text-blue-700">Empowering individuals</span> with accessible, personalized healthcare guidance and 
              <span className="font-semibold text-teal-700"> supporting medical professionals</span> in delivering more efficient care.
            </p>
            <p className="mt-6 text-gray-600">
              We believe everyone deserves access to quality healthcare information regardless of location, 
              socioeconomic status, or prior medical knowledge. Through innovation and collaboration with the medical 
              community, we're creating a future where AI augments human expertise for better health outcomes worldwide.
            </p>
          </motion.div>
        </LampContainer>
      </section>

      {/* Features section with hover effect cards */}
      <section className="max-w-6xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-teal-600">
            Comprehensive Health Support
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Mediमंत्र combines medical expertise with advanced technology to provide these core services
          </p>
        </div>
        <HoverEffect items={features} />
        
        <div className="mt-20 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/3">
              <div className="aspect-square bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl flex items-center justify-center p-8">
                <span className="text-6xl">🧠</span>
              </div>
            </div>
            <div className="md:w-2/3">
              <h3 className="text-2xl font-bold text-blue-800 mb-4">Advanced Natural Language Processing</h3>
              <p className="text-gray-600 mb-6">
                Our proprietary NLP engine allows Mediमंत्र to understand complex medical descriptions in everyday language. 
                Trained on millions of medical records and scientific papers, it can interpret symptoms, recognize patterns, 
                and generate insights with remarkable accuracy.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="font-medium text-blue-700">90+ languages</span> supported
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="font-medium text-blue-700">Medical terminology</span> recognition
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="font-medium text-blue-700">Context-aware</span> conversations
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Team section */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold mb-16 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-teal-600">
          Meet Our Expert Team
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
            >
              <div className="h-32 bg-gradient-to-r from-blue-400 to-teal-400"></div>
              <div className="p-6 -mt-14">
                <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg mx-auto">
                  <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                    <span className="text-xl">{member.name.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-center mt-4 text-gray-800">{member.name}</h3>
                <p className="text-blue-700 text-sm text-center font-medium mb-4">{member.role}</p>
                <p className="text-gray-600 text-sm text-center">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-gray-600">
            Backed by a diverse team of 30+ healthcare professionals, AI researchers, and software engineers
          </p>
          <button className="mt-6 px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-teal-500 text-white font-medium hover:shadow-lg transition-all">
            Join Our Team
          </button>
        </div>
      </section>

      {/* Our Approach with sticky scroll */}
      <section className="max-w-6xl mx-auto px-4 py-24 bg-white rounded-3xl shadow-sm md:mx-auto my-16">
        <h2 className="text-3xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-teal-600">
          Our Medical Standards
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto text-center mb-16">
          Mediमंत्र adheres to the highest standards in healthcare technology to deliver reliable, accurate, and secure assistance
        </p>
        <div className="h-[30rem] md:h-[40rem]">
          <StickyScroll content={scrollContent} />
        </div>
      </section>
      
      {/* Important Note section with gradient background */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <BackgroundGradient className="p-8 rounded-3xl bg-white">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="md:w-1/4 flex justify-center">
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-4xl">⚕️</span>
              </div>
            </div>
            <div className="md:w-3/4">
              <h2 className="text-2xl font-bold mb-4 text-blue-800">Medical Disclaimer</h2>
              <p className="text-gray-700">
                While Mediमंत्र provides valuable health information and guidance based on the latest medical knowledge, 
                it is not a substitute for professional medical advice, diagnosis, or treatment. Always consult with qualified 
                healthcare providers for medical concerns and before making decisions about your health.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">FDA Registered</span>
                <span className="px-3 py-1 bg-teal-50 text-teal-700 text-xs rounded-full">HIPAA Compliant</span>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full">SOC 2 Certified</span>
                <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs rounded-full">ISO 27001</span>
              </div>
            </div>
          </div>
        </BackgroundGradient>
      </section>

      {/* Contact section with sparkles effect */}
      <section className="relative py-24 bg-gradient-to-b from-blue-50 to-white">
        <div className="w-full h-full absolute">
          <SparklesCore
            id="sparklesEffect"
            background="transparent"
            minSize={0.6}
            maxSize={1.4}
            particleDensity={70}
            className="w-full h-full"
            particleColor="#2563EB"
          />
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-teal-600">
            Get in Touch
          </h2>
          <p className="text-xl text-center text-gray-700 mb-8 max-w-2xl">
            Have questions about how Mediमंत्र can support your health journey?
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12">
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xl">📧</span>
              </div>
              <h3 className="font-medium text-gray-800 mb-2">Email Us</h3>
              <a href="mailto:support@Mediमंत्र.ai" className="text-blue-600 hover:underline text-sm">
                support@Mediमंत्र.ai
              </a>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-teal-100 rounded-full flex items-center justify-center">
                <span className="text-teal-600 text-xl">📞</span>
              </div>
              <h3 className="font-medium text-gray-800 mb-2">Call Us</h3>
              <a href="tel:+18005551234" className="text-teal-600 hover:underline text-sm">
                +1 (800) 555-1234
              </a>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 text-xl">💬</span>
              </div>
              <h3 className="font-medium text-gray-800 mb-2">Live Chat</h3>
              <p className="text-indigo-600 text-sm">
                Available 24/7
              </p>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-teal-500 rounded-full text-white font-medium shadow-lg hover:shadow-xl transition-all"
          >
            Schedule a Demo
          </motion.button>
          
          <div className="mt-12 border-t border-gray-200 pt-8 w-full text-center">
            <p className="text-gray-500 text-sm">
              © 2023 Medibot, Inc. All rights reserved.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
