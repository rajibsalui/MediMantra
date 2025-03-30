"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Search,
  Calendar,
  Activity,
  FileText,
  Menu,
  X,
  UserCircle,
  Bell,
  Phone,
  ChevronDown,
  User,
  LogIn,
  UserPlus,
  Stethoscope,
  Heart,
  Bot,
  MessageSquare
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

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false) // Replace with actual auth state
  const [scrolled, setScrolled] = useState(false)
  const [chatbotOpen, setChatbotOpen] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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
    },
  ]

  const router = useRouter()

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "sticky top-0 z-50 w-full backdrop-blur transition-all duration-300",
        scrolled 
          ? "bg-background/80 shadow-md" 
          : "bg-background/60"
      )}
    >
      <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link 
            onClick={()=>{
              router.push("/")
            }}
            href="/" 
            className="flex items-center space-x-2"
          >
            <motion.span 
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent"
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
                  "flex items-center text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.icon}
                {item.name}
              </Link>
              {pathname === item.href && (
                <motion.div 
                  className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-blue-500 to-cyan-400"
                  layoutId="navbar-active-indicator"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.div>
          ))}

          {/* <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              <motion.span 
                className="flex items-center"
                whileHover={{ scale: 1.05 }}
              >
                <FileText className="h-4 w-4 mr-2" />
                More
                <ChevronDown className="h-4 w-4 ml-1" />
              </motion.span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="backdrop-blur-lg bg-background/90">
              <DropdownMenuItem asChild>
                <Link href="/health-records">Health Records</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/doctors">Find Doctors</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/help">Help & Support</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center space-x-2">
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
              className="bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-full"
              aria-label="Open AI Medical Assistant"
            >
              <Bot className="h-5 w-5" />
            </Button>
          </motion.div>

          {/* Emergency */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant="outline" 
              size="sm" 
              className="hidden md:flex text-red-500 border-red-500 hover:bg-red-50 dark:hover:bg-red-950"
            >
              <Phone className="mr-2 h-4 w-4" />
              Emergency
            </Button>
          </motion.div>
          
          {/* Notifications */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button variant="ghost" size="icon" className="hidden md:flex relative">
              <Bell className="h-5 w-5" />
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-red-600"
              ></motion.span>
            </Button>
          </motion.div>

          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <UserCircle className="h-6 w-6" />
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="backdrop-blur-lg bg-background/90">
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>My Appointments</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Medical History</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setIsLoggedIn(false)} 
                  className="cursor-pointer"
                >
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
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              </motion.div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Sign Up
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="backdrop-blur-lg bg-background/90">
                  <DropdownMenuItem 
                    onClick={() => router.push("/signup")} 
                    className="cursor-pointer"
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    <span>As a Patient</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => router.push("/signup/doctor")} 
                    className="cursor-pointer"
                  >
                    <Stethoscope className="mr-2 h-4 w-4" />
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
              className="md:hidden" 
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
          <div className="space-y-1 px-4 py-3 pt-2">
            {/* Mobile search */}
            <div className="relative mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search doctors, symptoms..."
                className="w-full rounded-md bg-background pl-8"
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
                      ? "bg-primary/10 text-primary" 
                      : "text-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {item.icon}
                  {item.name}
                </Link>
              </motion.div>
            ))}
            
            <div className="py-2">
              <div className="h-px bg-border"></div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link
                href="/health-records" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center py-2 px-3 text-base font-medium rounded-md text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <FileText className="h-4 w-4 mr-2" />
                Health Records
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Link
                href="/doctors" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center py-2 px-3 text-base font-medium rounded-md text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <UserCircle className="h-4 w-4 mr-2" />
                Find Doctors
              </Link>
            </motion.div>

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
                className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100"
              >
                <Bot className="mr-2 h-5 w-5" />
                Chat with Medical AI
              </Button>
            </motion.div>

            {/* Emergency button - mobile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button 
                variant="outline" 
                className="w-full mt-2 text-red-500 border-red-500 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <Phone className="mr-2 h-4 w-4" />
                Emergency Helpline
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
                  className="w-full" 
                  onClick={() => {
                    router.push("/login");
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
                
                <div className="text-xs font-medium text-center my-2 text-slate-500">Sign up as:</div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600" 
                    onClick={() => {
                      router.push("/signup");
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Heart className="mr-1 h-4 w-4" />
                    Patient
                  </Button>
                  
                  <Button 
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700" 
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