import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "MediBot - Your Medical Assistant",
  description: "AI-powered medical assistant for healthcare professionals",
};

export default function RootLayout({ children }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground antialiased transition-colors duration-200">
      {/* Replace the header with our custom Header component */}
      {/* <Header /> */}
      
      {/* Keep the main content area as is */}
      <main className="flex-1">
        {children}
      </main>
      
      {/* Replace the footer with our custom Footer component */}
      {/* <Footer /> */}
    </div>
  );
}