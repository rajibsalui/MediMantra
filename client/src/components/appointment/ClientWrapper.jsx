"use client";

import { useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AppointmentContent from "./AppointmentContent";
import LoadingScreen from "./LoadingScreen";

export default function ClientWrapper() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Register GSAP plugins only on the client
    gsap.registerPlugin(ScrollTrigger);
    
    // Small delay to ensure everything is ready
    setTimeout(() => {
      setIsLoaded(true);
    }, 500);
  }, []);

  if (!isLoaded) {
    return <LoadingScreen />;
  }

  return <AppointmentContent />;
}