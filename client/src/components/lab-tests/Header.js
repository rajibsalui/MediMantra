'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Header() {
  return (
    <motion.header 
      className="bg-white shadow-md"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/">
          <motion.div 
            className="flex items-center gap-2 cursor-pointer"
            whileHover={{ scale: 1.03 }}
          >
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white text-xl font-bold">M</span>
            </div>
            <span className="text-xl font-bold text-gray-800">MediLab</span>
          </motion.div>
        </Link>
        
        <nav>
          <ul className="flex space-x-6">
            <li><Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">Home</Link></li>
            <li><Link href="/services" className="text-gray-700 hover:text-blue-600 transition-colors">Services</Link></li>
            <li><Link href="/lab-tests" className="text-blue-600 font-medium">Lab Tests</Link></li>
            <li><Link href="/contact" className="text-gray-700 hover:text-blue-600 transition-colors">Contact</Link></li>
          </ul>
        </nav>
      </div>
    </motion.header>
  );
}
