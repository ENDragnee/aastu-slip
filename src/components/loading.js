'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function LoadingAnimation() {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  if (!show) return null

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white p-4"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 1, delay: 2 }}
    >
      <motion.div
        className="w-16 h-16 sm:w-24 sm:h-24 mb-4 sm:mb-8 border-t-4 border-b-4 border-amber-700 rounded-full"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 2, ease: "linear", repeat: Infinity }}
      />
      <motion.h1
        className="text-xl sm:text-3xl font-bold text-[#003366] text-center"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        AASTU Check Out Portal
      </motion.h1>
      <motion.p
        className="mt-2 sm:mt-4 text-base sm:text-xl text-amber-700 text-center"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        Powered by AASTU SAAS Founders Club
      </motion.p>
    </motion.div>
  )
}