"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Calendar,
  FileText,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Activity,
  Pill,
  MessageSquare,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Determine if the user is a patient or doctor
  const isPatient = user?.role === "patient";
  const isDoctor = user?.role === "doctor";

  // Navigation items based on user role
  const navigationItems = isPatient
    ? [
        { name: "Dashboard", href: `/patient/dashboard/${user?.id}`, icon: Home },
        { name: "Appointments", href: "/patient/appointments", icon: Calendar },
        { name: "Medical Records", href: "/patient/medical-records", icon: FileText },
        { name: "Prescriptions", href: "/patient/prescriptions", icon: Pill },
        { name: "Vital Statistics", href: "/patient/vitals", icon: Activity },
        { name: "Messages", href: "/patient/messages", icon: MessageSquare },
        { name: "Profile", href: "/patient/profile", icon: User },
      ]
    : isDoctor
      ? [
          { name: "Dashboard", href: `/doctor/dashboard/${user?.id}`, icon: Home },
          { name: "Appointments", href: "/doctor/appointments", icon: Calendar },
          { name: "Patients", href: "/doctor/patients", icon: User },
          { name: "Prescriptions", href: "/doctor/prescriptions", icon: Pill },
          { name: "Messages", href: "/doctor/messages", icon: MessageSquare },
          { name: "Profile", href: "/doctor/profile", icon: User },
        ]
      : [];

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-white dark:bg-slate-800 shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:z-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300 bg-clip-text text-transparent">
              Mediमंत्र
            </span>
          </Link>
          <button
            className="p-1 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 lg:hidden"
            onClick={toggleSidebar}
          >
            <X className="h-6 w-6" />
          </button>
        </div> */}

        <nav className="mt-6 px-4 space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/50"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5 mr-3",
                  isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"
                )} />
                {item.name}
                {isActive && (
                  <ChevronRight className="ml-auto h-4 w-4 text-blue-600 dark:text-blue-400" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="space-y-2">
            <Link href={`${isDoctor ? "/doctor" : "/patient"}/settings`}>
              <Button variant="outline" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
            <Link href="/help">
              <Button variant="outline" className="w-full justify-start">
                <HelpCircle className="h-4 w-4 mr-2" />
                Help & Support
              </Button>
            </Link>
            <Button
              variant="destructive"
              className="w-full justify-start"
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white dark:bg-slate-800 shadow-sm z-10">
          <div className="flex h-16 items-center justify-between px-4">
            <button
              className="p-1 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 lg:hidden"
              onClick={toggleSidebar}
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {isPatient ? "Patient Portal" : isDoctor ? "Doctor Portal" : "User Portal"}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-900">
          {children}
        </main>
      </div>
    </div>
  );
}
