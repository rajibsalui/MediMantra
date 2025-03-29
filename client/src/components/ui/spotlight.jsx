"use client";
import React, { useRef, useState, useEffect } from "react";

export const Spotlight = ({ children, className = "", fill = "white" }) => {
  const containerRef = useRef(null);
  const mouseX = useRef(0);
  const mouseY = useRef(0);

  const [isMounted, setIsMounted] = useState(false);

  const onMouseMove = (event) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.current = event.clientX - rect.left;
    mouseY.current = event.clientY - rect.top;
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className={className}>{children}</div>;

  return (
    <div
      ref={containerRef}
      onMouseMove={onMouseMove}
      className={`relative overflow-hidden ${className}`}
    >
      {children}
      <div
        className="pointer-events-none absolute -inset-px opacity-0"
        style={{
          background: `radial-gradient(600px circle at ${mouseX.current}px ${mouseY.current}px, ${fill}20, transparent 40%)`,
        }}
      />
    </div>
  );
};
