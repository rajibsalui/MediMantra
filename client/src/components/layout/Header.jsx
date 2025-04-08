"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  FileText,
  Menu,
  X,
  UserCircle,
  Bell,
  ChevronDown,
  User,
  LogIn,
  UserPlus,
  Stethoscope,
  Heart,
  Bot,
  Settings,
  HelpCircle,
  Search
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import ChatbotDialog from "@/components/chatbot/ChatbotDialog"
import ThemeSwitcher from "../ui/ThemeSwitcher"

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const [chatbotOpen, setChatbotOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Check for authentication token and user role in localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('Role');

        setIsLoggedIn(!!token);

        if (role) {
          setUserRole(role);
        }
      } catch (error) {
        console.error('Error accessing localStorage:', error);
        setIsLoggedIn(false);
        setUserRole(null);
      }
    }
  }, []);

  const navItems = [
    {
      name: "Book Appointment",
      href: "/appointments",
      icon: <Calendar className="h-4 w-4 mr-2" />,
    },
    {
      name: "Symptom Checker",
      href: "/symptom-checker",
      icon: <FileText className="h-4 w-4 mr-2" />,
    }
  ]

  const router = useRouter()

  // Handle logout function
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('Role');
      localStorage.removeItem('userId');
      setIsLoggedIn(false);
      setUserRole(null);
      router.push('/');
    }
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm dark:shadow-gray-800/10"
          : "bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm"
      )}
    >
      <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link
            onClick={() => router.push("/")}
            href="/"
            className="flex items-center space-x-2"
          >
            <motion.span
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300 bg-clip-text text-transparent"
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              Mediमंत्र
            </motion.span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              <Link
                href={item.href}
                className={cn(
                  "flex items-center text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                )}
              >
                {item.icon}
                {item.name}
              </Link>
              {pathname === item.href && (
                <motion.div
                  className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-blue-500 to-cyan-400 dark:from-blue-400 dark:to-cyan-300"
                  layoutId="navbar-active-indicator"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.div>
          ))}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center space-x-2">
          <ThemeSwitcher />
          {/* AI Chatbot Button */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="hidden md:block"
          >
            <Button
              onClick={() => setChatbotOpen(true)}
              variant="ghost"
              size="icon"
              className="bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/50 rounded-full"
              aria-label="Open AI Medical Assistant"
            >
              <Bot className="h-5 w-5" />
            </Button>
          </motion.div>

          {/* Notifications */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button variant="ghost" size="icon" className="hidden md:flex relative dark:text-gray-200 dark:hover:bg-gray-800">
              <Bell className="h-5 w-5" />
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-red-600 dark:bg-red-500"
              ></motion.span>
            </Button>
          </motion.div>

          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" size="icon" className="rounded-full dark:bg-gray-800/50 dark:text-gray-200 dark:hover:bg-gray-800">
                    <UserCircle className="h-6 w-6" />
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="backdrop-blur-lg bg-white/90 dark:bg-gray-800/90 border dark:border-gray-700">
                <div className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  My Account {userRole && `(${userRole.charAt(0).toUpperCase() + userRole.slice(1)})`}
                </div>
                <DropdownMenuSeparator className="dark:border-gray-700" />

                {/* Common menu items for both roles */}
                <DropdownMenuItem
                  onClick={() =>{
                    const userId = localStorage.getItem('userId')
                    if(!userId) return
                    if(userRole === 'doctor') {
                      router.push(`/doctor/dashboard/${userId}`)
                    }
                    else{
                      router.push(`/patient/dashboard/${userId}`)
                    }
                    } }
                  className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/70 dark:focus:bg-gray-700"
                >
                  <User className="mr-2 h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <span>Profile</span>
                </DropdownMenuItem>

                {/* Doctor-specific menu items */}
                {userRole === 'doctor' && (
                  <>
                    <DropdownMenuItem
                      onClick={() => router.push("/doctor/appointments")}
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/70 dark:focus:bg-gray-700"
                    >
                      <Calendar className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span>My Schedule</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push("/doctor/patients")}
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/70 dark:focus:bg-gray-700"
                    >
                      <Heart className="mr-2 h-4 w-4 text-red-500 dark:text-red-400" />
                      <span>My Patients</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push("/doctor/prescriptions")}
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/70 dark:focus:bg-gray-700"
                    >
                      <FileText className="mr-2 h-4 w-4 text-green-600 dark:text-green-400" />
                      <span>Prescriptions</span>
                    </DropdownMenuItem>
                  </>
                )}

                {/* Patient-specific menu items */}
                {userRole === 'patient' && (
                  <>
                    <DropdownMenuItem
                      onClick={() => router.push("/patient/appointments")}
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/70 dark:focus:bg-gray-700"
                    >
                      <Calendar className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span>My Appointments</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push("/patient/medical-history")}
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/70 dark:focus:bg-gray-700"
                    >
                      <FileText className="mr-2 h-4 w-4 text-green-600 dark:text-green-400" />
                      <span>Medical History</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push("/patient/settings")}
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/70 dark:focus:bg-gray-700"
                    >
                      <Settings className="mr-2 h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  </>
                )}

                {/* Common support item */}
                <DropdownMenuItem
                  onClick={() => router.push("/support")}
                  className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/70 dark:focus:bg-gray-700"
                >
                  <HelpCircle className="mr-2 h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span>Help & Support</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="dark:border-gray-700" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 dark:focus:bg-red-900/20"
                >
                  <LogIn className="mr-2 h-4 w-4 rotate-180" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex space-x-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  onClick={() => router.push("/login")}
                  className="dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              </motion.div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-500 dark:to-cyan-400 hover:from-blue-700 hover:to-cyan-600 dark:hover:from-blue-600 dark:hover:to-cyan-500 text-white">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Sign Up
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="backdrop-blur-lg bg-white/90 dark:bg-gray-800/90 border dark:border-gray-700">
                  <DropdownMenuItem
                    onClick={() => router.push("/signup")}
                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/70 dark:focus:bg-gray-700"
                  >
                    <Heart className="mr-2 h-4 w-4 text-red-500 dark:text-red-400" />
                    <span>As a Patient</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/signup/doctor")}
                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/70 dark:focus:bg-gray-700"
                  >
                    <Stethoscope className="mr-2 h-4 w-4 text-blue-500 dark:text-blue-400" />
                    <span>As a Doctor</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Mobile menu button */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden dark:text-gray-200 dark:hover:bg-gray-800"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <motion.div
          className="md:hidden"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="space-y-1 px-4 py-3 pt-2 bg-white dark:bg-gray-900 border-t dark:border-gray-800">
            {/* Mobile search */}
            <div className="relative mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="search"
                placeholder="Search doctors, symptoms..."
                className="w-full rounded-md bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 pl-8"
              />
            </div>

            {navItems.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center py-2 px-3 text-base font-medium rounded-md",
                    pathname === item.href
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  {item.icon}
                  {item.name}
                </Link>
              </motion.div>
            ))}

            <div className="py-2">
              <div className="h-px bg-gray-200 dark:bg-gray-700"></div>
            </div>

            {/* Mobile AI Chatbot button */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-4"
            >
              <Button
                onClick={() => {
                  setChatbotOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/50"
              >
                <Bot className="mr-2 h-5 w-5" />
                Chat with Medical AI
              </Button>
            </motion.div>

            {/* Auth buttons - mobile */}
            {!isLoggedIn && (
              <motion.div
                className="mt-4 space-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  variant="outline"
                  className="w-full border-gray-300 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                  onClick={() => {
                    router.push("/login");
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>

                <div className="text-xs font-medium text-center my-2 text-gray-500 dark:text-gray-400">Sign up as:</div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-500 dark:to-cyan-400 hover:from-blue-700 hover:to-cyan-600 dark:hover:from-blue-600 dark:hover:to-cyan-500 text-white"
                    onClick={() => {
                      router.push("/signup");
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Heart className="mr-1 h-4 w-4" />
                    Patient
                  </Button>

                  <Button
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-400 dark:to-blue-500 hover:from-cyan-600 hover:to-blue-700 dark:hover:from-cyan-500 dark:hover:to-blue-600 text-white"
                    onClick={() => {
                      router.push("/signup/doctor");
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Stethoscope className="mr-1 h-4 w-4" />
                    Doctor
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* AI Chatbot Dialog */}
      <ChatbotDialog open={chatbotOpen} onOpenChange={setChatbotOpen} />
    </motion.header>
  )
}