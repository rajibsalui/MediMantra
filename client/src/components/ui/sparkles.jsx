"use client";

import React, { useEffect, useState, useRef } from "react";
import { createNoise3D } from "simplex-noise";

export const SparklesCore = ({
  id,
  background,
  minSize,
  maxSize,
  particleDensity,
  particleColor,
  className,
}) => {
  const canvasRef = useRef(null);
  const noiseRef = useRef(createNoise3D());
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };
    
    const initParticles = () => {
      const count = Math.min(
        Math.floor((canvas.width * canvas.height) / 10000) * particleDensity,
        1000
      );
      const newParticles = [];
      
      for (let i = 0; i < count; i++) {
        newParticles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: minSize + Math.random() * (maxSize - minSize),
          speedX: -1 + Math.random() * 2,
          speedY: -1 + Math.random() * 2,
        });
      }
      
      setParticles(newParticles);
    };
    
    window.addEventListener("resize", handleResize);
    handleResize();
    
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [minSize, maxSize, particleDensity]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || particles.length === 0) return;
    
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let t = 0;
    
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.005;
      
      particles.forEach((p, i) => {
        const n = noiseRef.current(p.x * 0.001, p.y * 0.001, t) * Math.PI * 2;
        p.x += Math.cos(n) * 0.5;
        p.y += Math.sin(n) * 0.5;
        
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = particleColor || "#ffffff";
        ctx.fill();
      });
      
      animationFrameId = window.requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [particles, particleColor]);
  
  return (
    <canvas
      ref={canvasRef}
      id={id || "sparkles"}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        background: background || "transparent",
      }}
      className={className}
    />
  );
};
