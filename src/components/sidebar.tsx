'use client'

import React, { useState, useEffect } from 'react'
import { useMediaQuery } from 'react-responsive'
import { DoorOpen, ListChecks } from 'lucide-react'
import { motion } from 'framer-motion'

const navItems = [
  { href: '/', icon: ListChecks, label: 'Check Out', name: "Register for Check out" },
  { href: '/gateway', icon: DoorOpen, label: 'Gateway', name: "Verify Check out" },
]

export default function NavBar() {
  // Only handle client-side state after mounting
  const [mounted, setMounted] = useState(false)
  const [activeItem, setActiveItem] = useState('')
  const isSmallScreen = useMediaQuery({ maxWidth: 640 })

  useEffect(() => {
    setMounted(true)
    // Set initial active item based on current pathname
    setActiveItem(window.location.pathname)
  }, [])

  const handleNavigation = (href: string) => {
    setActiveItem(href)
    window.location.href = href // Use window.location for navigation
  }

  // Render nothing during SSR to avoid hydration mismatch
  if (!mounted) {
    return null
  }

  const isMobile = isSmallScreen

  return (
    <motion.nav
      initial={{ opacity: 0, y: isMobile ? 50 : -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        fixed z-40 w-full backdrop-blur-lg
        ${isMobile 
          ? 'top-0 bg-white/90 dark:bg-gray-900/90 border-t' 
          : 'top-0 bg-white/80 dark:bg-gray-900/80 border-b shadow-lg'}
      `}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className={`
          flex items-center justify-around
          ${isMobile ? 'h-16' : 'h-14'}
        `}>
          {navItems.map((item) => (
            <motion.button
              key={item.href}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNavigation(item.href)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg
                transition-colors duration-200
                ${activeItem === item.href 
                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'}
              `}
            >
              <item.icon className={`
                h-5 w-5
                ${activeItem === item.href 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-600 dark:text-gray-400'}
              `} />
              
              <div className="flex flex-col">
                <span className={`
                  text-sm font-medium
                  ${isMobile ? 'block' : 'hidden sm:block'}
                `}>
                  {item.label}
                </span>
                <span className={`
                  text-xs text-gray-500 dark:text-gray-400
                  ${isMobile ? 'block' : 'hidden sm:block'}
                `}>
                  {item.name}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.nav>
  )
}