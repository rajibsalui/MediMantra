"use client"

import React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Phone, MapPin, ChevronRight, Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const footerLinks = [
  {
    title: "Company",
    links: [
      { name: "About Us", href: "/about" },
      { name: "Our Team", href: "/team" },
      { name: "Careers", href: "/careers" },
      { name: "Press", href: "/press" },
    ],
  },
  {
    title: "Services",
    links: [
      { name: "Find Doctors", href: "/doctors" },
      { name: "Book Appointment", href: "/appointments" },
      { name: "Lab Tests", href: "/lab-tests" },
      { name: "Health Packages", href: "/health-packages" },
    ],
  },
  {
    title: "Support",
    links: [
      { name: "Help Center", href: "/help" },
      { name: "Contact Us", href: "/contact" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-b from-background/50 to-background border-t">
      <div className="container px-4 sm:px-8 py-12">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/" className="flex items-center">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  Mediमंत्र
                </span>
              </Link>
              <p className="mt-4 text-sm text-muted-foreground">
                Your trusted healthcare companion, providing 24/7 medical assistance and seamless appointment scheduling.
              </p>

              {/* Social Links */}
              <div className="mt-6 flex space-x-4">
                {[
                  { icon: <Facebook size={18} />, href: "#", label: "Facebook" },
                  { icon: <Twitter size={18} />, href: "#", label: "Twitter" },
                  { icon: <Instagram size={18} />, href: "#", label: "Instagram" },
                  { icon: <Linkedin size={18} />, href: "#", label: "LinkedIn" },
                ].map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Links Columns */}
          {footerLinks.map((column, columnIndex) => (
            <div key={columnIndex} className="md:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * columnIndex }}
              >
                <h3 className="font-medium text-base mb-4">{column.title}</h3>
                <ul className="space-y-2">
                  {column.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link 
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center group"
                      >
                        <ChevronRight size={14} className="mr-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          ))}

          {/* Newsletter Column */}
          <div className="md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h3 className="font-medium text-base mb-4">Stay Updated</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Subscribe to our newsletter for health tips and updates.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="rounded-md" 
                />
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600">
                  Subscribe
                </Button>
              </div>
              
              {/* Contact Info */}
              <div className="mt-6 space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail size={14} className="mr-2" />
                  <span>contact@Mediमंत्र.com</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone size={14} className="mr-2" />
                  <span>+1 (800) Mediमंत्र</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin size={14} className="mr-2" />
                  <span>123 Health Street, Medical City</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Section */}
        <motion.div 
          className="mt-12 pt-6 border-t flex flex-col sm:flex-row justify-between items-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Mediमंत्र. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground mt-2 sm:mt-0 flex items-center">
            Made with <Heart size={12} className="mx-1 text-red-500" /> for better healthcare
          </p>
        </motion.div>
      </div>
    </footer>
  )
}