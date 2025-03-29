"use client";
import React, { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

export const SparklesCore = ({
  id,
  className,
  background,
  particleCount = 50,
  speed = 1,
  opacity = 1,
}) => {
  const canvasRef = useRef(null);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Initialize particles
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const newParticles = [...Array(particleCount)].map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * speed,
      speedY: (Math.random() - 0.5) * speed,
    }));
    
    setParticles(newParticles);

    const animate = () => {
      if (!canvasRef.current) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle, i) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.y > canvas.height) particle.y = 0;
        if (particle.y < 0) particle.y = canvas.height;
        
        ctx.fillStyle = `rgba(255,255,255,${opacity})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    const handleResize = () => {
      if (!canvasRef.current) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [particleCount, speed, opacity]);

  return (
    <canvas
      ref={canvasRef}
      id={id}
      className={cn("absolute inset-0", className)}
      style={{
        background,
      }}
    />
  );
};