"use client";
import React, { useRef, useState, useEffect } from "react";

export const Spotlight = ({
  className = "",
  fill = "white",
}) => {
  const divRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const [active, setActive] = useState(false);

  const handleMouseMove = (e) => {
    if (!divRef.current) return;
    
    const rect = divRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left;
    const newY = e.clientY - rect.top;
    setPosition({ x: newX, y: newY });
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  useEffect(() => {
    setActive(true);
  }, []);

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative ${className}`}
      style={{
        width: "100vw",
        height: "100vh",
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
      }}
    >
      <svg
        style={{
          opacity: active ? opacity : 0,
          transition: "opacity 0.3s ease-in-out",
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient
            id="gradient"
            cx={position.x / divRef.current?.clientWidth || 0.5}
            cy={position.y / divRef.current?.clientHeight || 0.5}
            r="0.5"
            gradientUnits="objectBoundingBox"
          >
            <stop offset="0%" stopColor={fill} stopOpacity="0.8" />
            <stop offset="100%" stopColor={fill} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#gradient)" />
      </svg>
    </div>
  );
};