"use client";

import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

export const CardContainer = ({
  children,
  className,
  containerClassName,
}) => {
  const [isMouseOver, setIsMouseOver] = useState(false);
  const containerRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const rotateYValue = ((mouseX - centerX) / (rect.width / 2)) * 10;
    const rotateXValue = ((mouseY - centerY) / (rect.height / 2)) * -10;

    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseEnter = () => setIsMouseOver(true);
    const handleMouseLeave = () => {
      setIsMouseOver(false);
      setRotateX(0);
      setRotateY(0);
    };

    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("mousemove", handleMouseMove);

    return () => {
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("flex items-center justify-center", containerClassName)}
    >
      <div
        className={cn("relative transition-all duration-200 ease-linear", className)}
        style={{
          transform: isMouseOver
            ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1, 1, 1)`
            : "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(0.95, 0.95, 0.95)",
          transition: isMouseOver ? "none" : "all 0.5s ease",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const CardBody = ({ children, className }) => {
  return <div className={cn("relative h-96 w-96", className)}>{children}</div>;
};

export const CardItem = ({
  children,
  className,
  translateX = 0,
  translateY = 0,
  translateZ = 0,
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
}) => {
  return (
    <div
      className={cn("absolute inset-0", className)}
      style={{
        transform: `translate3d(${translateX}px, ${translateY}px, ${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`,
      }}
    >
      {children}
    </div>
  );
};
