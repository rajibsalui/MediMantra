"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export function Tabs({ defaultValue, value, onValueChange, className, children, ...props }) {
  const [activeTab, setActiveTab] = useState(value || defaultValue);
  
  const handleTabChange = (newValue) => {
    setActiveTab(newValue);
    if (onValueChange) {
      onValueChange(newValue);
    }
  };
  
  // Filter children to get only TabsTrigger and TabsContent components
  const triggers = [];
  const contents = [];
  
  React.Children.forEach(children, (child) => {
    if (child?.type?.displayName === "TabsList") {
      const tabListChildren = [];
      React.Children.forEach(child.props.children, (tabChild) => {
        if (tabChild?.type?.displayName === "TabsTrigger") {
          const isActive = tabChild.props.value === activeTab;
          tabListChildren.push(
            React.cloneElement(tabChild, {
              onClick: () => handleTabChange(tabChild.props.value),
              "data-state": isActive ? "active" : "inactive",
              key: tabChild.props.value
            })
          );
        }
      });
      triggers.push(React.cloneElement(child, {}, tabListChildren));
    } else if (child?.type?.displayName === "TabsContent") {
      const isActive = child.props.value === activeTab;
      if (isActive) {
        contents.push(
          React.cloneElement(child, {
            "data-state": "active",
            key: child.props.value
          })
        );
      }
    }
  });
  
  return (
    <div className={cn("w-full", className)} {...props}>
      {triggers}
      {contents}
    </div>
  );
}

export function TabsList({ className, ...props }) {
  return (
    <div
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500",
        className
      )}
      {...props}
    />
  );
}
TabsList.displayName = "TabsList";

export function TabsTrigger({ className, ...props }) {
  const isActive = props["data-state"] === "active";
  
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus:outline-none disabled:pointer-events-none disabled:opacity-50",
        isActive 
          ? "bg-white text-blue-600 shadow-sm" 
          : "hover:bg-gray-200 hover:text-gray-700",
        className
      )}
      {...props}
    />
  );
}
TabsTrigger.displayName = "TabsTrigger";

export function TabsContent({ className, ...props }) {
  return (
    <div
      className={cn(
        "mt-2 focus:outline-none",
        className
      )}
      {...props}
    />
  );
}
TabsContent.displayName = "TabsContent";
