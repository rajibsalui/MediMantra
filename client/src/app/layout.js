import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ToastProvider } from "@/components/toast-provider";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { AuthProvider } from "@/contexts/AuthContext";
import { DoctorProvider } from "@/contexts/DoctorContext";
import { PatientProvider } from "@/contexts/PatientContext";
import { AppointmentProvider } from "@/contexts/AppointmentContext";
import { Toaster } from "react-hot-toast";
import AppointmentContent from "@/components/appointment/AppointmentContent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Mediमंत्र - Modern Healthcare Platform",
  description: "A comprehensive healthcare management system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <ToastProvider />
          <AuthProvider>
            <DoctorProvider>
              <PatientProvider>
                <AppointmentProvider>
                  <div className="flex min-h-screen w-full flex-col bg-background text-foreground antialiased transition-colors duration-200">
                    <Header />
                    <main className="flex-1">{children}</main>
                    <Footer />
                  </div>
                  <Toaster position="top-right" />
                </AppointmentProvider>
              </PatientProvider>
            </DoctorProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
