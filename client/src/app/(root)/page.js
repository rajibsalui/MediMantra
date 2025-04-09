"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import { API_URL, SOCKET_URL } from "@/config/environment";
import {
  Calendar,
  Search,
  FileText,
  Activity,
  Clock,
  Shield,
  Award,
  CheckCircle,
  ArrowRight,
  Star,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// This ensures the page is only rendered on the client side
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HomePage() {
  // Refs for GSAP animations
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const statsRef = useRef(null);
  const testimonialsRef = useRef(null);
  const reload = () => {
    window.location.reload(); // Reload the page
  };
  // Reload the page when the component mounts


  // GSAP animations
  useEffect(() => {
    // reload the page
    // reload();
    // Set up ScrollTrigger for smooth scrolling
    gsap.registerPlugin(ScrollTrigger);
    gsap.defaults({ ease: "power1.inOut" });
    gsap.from(".scroll-down-icon", {
      opacity: 0,
      duration: 1,
      ease: "elastic.out(1, 0.3)",
    });
    // Hero section animations
    const heroTl = gsap.timeline();
    heroTl.from(".hero-text", {
      y: 50,
      // opacity: 0,
      duration: 0.8,
      stagger: 0.2,
    });
    heroTl.from(
      ".hero-image",
      {
        x: 50,
        // opacity: 0,
        duration: 0.8,
      },
      "-=0.4"
    );
    heroTl.from(
      ".hero-badge",
      {
        scale: 0,
        // opacity: 0,
        duration: 0.4,
        stagger: 0.1,
        ease: "back.out(1.7)",
      },
      "-=0.4"
    );

    // Features stagger animation
    gsap.from(".feature-card", {
      scrollTrigger: {
        trigger: featuresRef.current,
        start: "top 80%",
      },
      y: 60,
      // opacity: 0,
      duration: 0.6,
      stagger: 0.15,
    });

    // Stats counter animation
    const statsElements = document.querySelectorAll(".stat-number");
    statsElements.forEach((stat) => {
      const target = parseInt(stat.getAttribute("data-target"));
      ScrollTrigger.create({
        trigger: statsRef.current,
        start: "top 80%",
        onEnter: () => {
          let obj = { val: 0 };
          gsap.to(obj, {
            val: target,
            duration: 2,
            ease: "power1.inOut",
            onUpdate: () => {
              stat.textContent = Math.floor(obj.val).toLocaleString();
            },
          });
        },
        once: true,
      });
    });

    // Testimonials animation
    gsap.from(".testimonial-card", {
      scrollTrigger: {
        trigger: testimonialsRef.current,
        start: "top 80%",
      },
      // opacity: 0,
      scale: 0.9,
      duration: 0.7,
      stagger: 0.2,
    });
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative overflow-hidden py-10 md:py-18"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800 -z-10" />
        <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Badge className="hero-badge bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 mb-4">
              AI-Powered Healthcare
            </Badge>

            <h1 className="hero-text text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Your Personal{" "}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Medical Assistant
              </span>
            </h1>

            <p className="hero-text text-xl text-muted-foreground max-w-lg">
              Get instant medical advice, book appointments with top doctors,
              and manage your health records all in one place.
            </p>

            <div className="hero-text flex flex-wrap gap-4">
              <Button size="lg" className="gap-2">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                Book a Doctor
                <Calendar className="h-4 w-4" />
              </Button>
            </div>

            <div className="hero-text pt-4 flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-10 w-10 rounded-full border-2 border-white overflow-hidden relative"
                  >
                    <Image
                      src={`/images/profile${i}.jpg`}
                      alt={`User profile ${i}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <span className="text-green-600 font-semibold">4.9/5</span>{" "}
                ratings from
                <span className="font-medium"> 10,000+</span> satisfied users
              </div>
            </div>
          </div>

          <div className="relative p-4">
            <div className="absolute -inset-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 opacity-20 blur-xl" />
            <div className="hero-image relative aspect-square md:aspect-[4/3] rounded-xl overflow-hidden bg-gray-200">
              <Image
                src="https://plus.unsplash.com/premium_photo-1673953510197-0950d951c6d9?q=80&w=1471&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Medical professional in white coat"
                fill
                priority
                className="object-cover"
              />
            </div>

            {/* Floating badges */}
            <div className="hero-badge absolute top-10 -left-5 bg-white dark:bg-slate-800 shadow-lg rounded-lg p-3 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <span className="font-medium text-sm">Easy Booking</span>
            </div>

            <div className="hero-badge absolute bottom-10 -right-5 bg-white dark:bg-slate-800 shadow-lg rounded-lg p-3 flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              <span className="font-medium text-sm">HIPAA Secure</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 bg-white dark:bg-slate-950">
        <div className="container mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge className="mb-4">Our Services</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Comprehensive Healthcare Solutions
            </h2>
            <p className="text-muted-foreground">
              Mediमंत्र offers a complete suite of digital healthcare tools to
              help you manage your health efficiently.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Calendar className="h-10 w-10 text-blue-500" />,
                title: "Doctor Appointments",
                description:
                  "Schedule appointments with top specialists in your area with our easy booking system.",
              },
              {
                icon: <FileText className="h-10 w-10 text-purple-500" />,
                title: "Symptom Checker",
                description:
                  "Advanced AI analysis to help identify possible conditions based on your symptoms.",
              },
              {
                icon: <Activity className="h-10 w-10 text-green-500" />,
                title: "Lab Tests",
                description:
                  "Book and manage your lab tests. Get results digitally and share with your doctor.",
              },
              {
                icon: <Search className="h-10 w-10 text-amber-500" />,
                title: "Find Specialists",
                description:
                  "Search for doctors by specialty, experience, location, and patient reviews.",
              },
              {
                icon: <Clock className="h-10 w-10 text-rose-500" />,
                title: "24/7 Assistance",
                description:
                  "Get medical advice anytime with our AI assistant and on-call medical professionals.",
              },
              {
                icon: <Shield className="h-10 w-10 text-cyan-500" />,
                title: "Secure Health Records",
                description:
                  "Store and access your medical history securely from anywhere, anytime.",
              },
            ].map((feature, i) => (
              <Card
                key={i}
                className="feature-card border-none shadow-lg hover:shadow-xl transition-shadow"
              >
                <CardContent className="pt-6">
                  <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-3 w-fit mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                  <Button variant="link" className="p-0 mt-4 gap-1">
                    Learn more
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section with GSAP Animation */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge className="mb-4">Simple Process</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              How Mediमंत्र Works
            </h2>
            <p className="text-muted-foreground">
              Get started in minutes with our simple and intuitive process
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create Account",
                description:
                  "Sign up and fill out a simple medical questionnaire for personalized service.",
              },
              {
                step: "02",
                title: "Describe Symptoms",
                description:
                  "Use our AI-powered symptom checker to analyze your condition.",
              },
              {
                step: "03",
                title: "Get Solutions",
                description:
                  "Receive treatment options, book appointments, or consult with specialists.",
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg h-full">
                  <div className="text-5xl font-bold text-slate-100 dark:text-slate-700 mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>

                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700">
                    <ArrowRight className="h-12 w-12" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        ref={statsRef}
        className="py-20 bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
      >
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: 50000, label: "Users" },
              { value: 5000, label: "Doctors" },
              { value: 100000, label: "Appointments" },
              { value: 98, label: "Satisfaction %" },
            ].map((stat, i) => (
              <div key={i} className="space-y-2">
                <div className="text-4xl md:text-5xl font-bold">
                  <span className="stat-number" data-target={stat.value}>
                    0
                  </span>
                  {stat.label === "Satisfaction %" && <span>%</span>}
                </div>
                <p className="text-blue-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        ref={testimonialsRef}
        className="py-20 bg-white dark:bg-slate-950"
      >
        <div className="container mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge className="mb-4">Testimonials</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              What Our Users Say
            </h2>
            <p className="text-muted-foreground">
              Hear from patients and doctors who have transformed their
              healthcare experience with Mediमंत्र
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "Mediमंत्र has revolutionized how I manage my chronic condition. I can easily track my symptoms and share reports with my doctor.",
                name: "Sarah Johnson",
                role: "Patient",
                rating: 5,
              },
              {
                quote:
                  "As a doctor, MediBot helps me stay connected with my patients. The symptom analysis tools provide valuable insights before appointments.",
                name: "Dr. Michael Chen",
                role: "Cardiologist",
                rating: 5,
              },
              {
                quote:
                  "The appointment scheduling system is so intuitive. I love that I can get lab results directly on the app without calling the clinic.",
                name: "Robert Williams",
                role: "Patient",
                rating: 4,
              },
            ].map((testimonial, i) => (
              <Card key={i} className="testimonial-card border-none shadow-lg">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5"
                        fill={i < testimonial.rating ? "currentColor" : "none"}
                      />
                    ))}
                  </div>

                  <p className="italic">"{testimonial.quote}"</p>

                  <div className="flex items-center gap-3 pt-2">
                    <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-8 md:p-12 shadow-xl">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="text-white space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Ready to transform your healthcare experience?
                </h2>
                <p className="text-blue-100 text-lg">
                  Join thousands of users who have made MediBot their trusted
                  health companion.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="bg-white text-blue-600 hover:bg-blue-50"
                  >
                    Get Started Now
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-white border-white hover:bg-blue-700"
                  >
                    Contact Support
                  </Button>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg p-4 flex flex-col items-center text-white text-center"
                    >
                      {i === 1 && (
                        <>
                          <Calendar className="h-8 w-8 mb-2" />
                          <p className="text-sm">Easy Scheduling</p>
                        </>
                      )}
                      {i === 2 && (
                        <>
                          <Activity className="h-8 w-8 mb-2" />
                          <p className="text-sm">Health Tracking</p>
                        </>
                      )}
                      {i === 3 && (
                        <>
                          <Shield className="h-8 w-8 mb-2" />
                          <p className="text-sm">Private & Secure</p>
                        </>
                      )}
                      {i === 4 && (
                        <>
                          <CheckCircle className="h-8 w-8 mb-2" />
                          <p className="text-sm">24/7 Support</p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* App Download */}
          <div className="mt-24 text-center">
            <Badge className="mb-4">Mobile App</Badge>
            <h2 className="text-3xl font-bold mb-4">Take MediBot Anywhere</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Download our mobile app to access all features on the go.
              Available for iOS and Android.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button
                variant="outline"
                className="flex items-center gap-2 h-auto py-2"
              >
                <div className="text-2xl">
                  {/* Apple logo placeholder */}
                  <span className="font-bold">iOS</span>
                </div>
                <div className="text-left">
                  <div className="text-xs">Download on the</div>
                  <div className="text-base font-semibold">App Store</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="flex items-center gap-2 h-auto py-2"
              >
                <div className="text-2xl">
                  {/* Google Play logo placeholder */}
                  <span className="font-bold">GP</span>
                </div>
                <div className="text-left">
                  <div className="text-xs">GET IT ON</div>
                  <div className="text-base font-semibold">Google Play</div>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16 border-t">
        <div className="container mx-auto">
          <h2 className="text-center text-lg font-medium text-muted-foreground mb-8">
            Trusted by leading healthcare providers
          </h2>

          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-12 w-28 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center text-muted-foreground"
              >
                Partner {i}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
