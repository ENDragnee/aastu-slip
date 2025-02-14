"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, LogOut } from 'lucide-react'
import Image from "next/image"
import aastuImage from '/public/AASTU.jpg'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Footer  from "@/components/footer"


export default function StudentItemManagement() {
  const [searchShortcode, setSearchShortcode] = useState('')
  const [gate, setGate] = useState('')
  const [searchStudentId, setSearchStudentId] = useState('')
  const [showSummary, setShowSummary] = useState(false)
  const [studentData, setStudentData] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const formatStudentId = (studentId) => {
    const etsPattern = /^ETS\d{4}\/\d{2}$/i
    const numberPattern = /^\d{4}\/\d{2}$/
    
    if (etsPattern.test(studentId)) {
      return studentId.toUpperCase()
    } else if (numberPattern.test(studentId)) {
      return `ETS${studentId.toUpperCase()}`
    }
    return studentId
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
  
      if (!response.ok) {
        throw new Error('Logout failed')
      }
  
      localStorage.clear()
      sessionStorage.clear()
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleSearch = async () => {
    if (!searchShortcode || !searchStudentId || !gate) {
      setError("Shortcode, student ID, and exit gate are all required")
      return
    }
  
    const formattedStudentId = formatStudentId(searchStudentId)
    setSearchStudentId(formattedStudentId)
    setIsLoading(true)
    setError(null)
  
    try {
      const response = await fetch(
        `/api/gate?shortcode=${encodeURIComponent(searchShortcode)}&studentId=${encodeURIComponent(formattedStudentId)}&gate=${encodeURIComponent(gate)}`
      )
  
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to fetch student data')
      }
  
      const data = await response.json()
      setStudentData(data)
      setShowSummary(true)
    } catch (error) {
      setError(error.message)
      console.error('Error fetching student data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStudentIdChange = (e) => {
    setSearchStudentId(e.target.value)
  }

  const handleFinish = async () => {
    if (!studentData?.studentId) return
  
    try {
      const response = await fetch('/api/finish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: studentData.studentId,
          exitedBy: gate,
        }),
      })
  
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to finish the request')
      }
  
      setShowSummary(false)
      setStudentData(null)
      setSearchShortcode('')
      setSearchStudentId('')
      setGate('')
    } catch (error) {
      setError(error.message)
      console.error('Error finishing request:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white text-[#003366] font-sans flex flex-col items-center justify-center p-4">
      <header className="mb-8 w-full max-w-4xl">
        <div className="flex flex-col lg:flex-row items-center justify-center">
          <div className="mb-6 lg:mb-0 lg:mr-8">
            <Image
              src={aastuImage}
              alt="AASTU Logo"
              width={260}
              height={240}
              className="w-full lg:w-64 h-auto"
            />
          </div>
          <motion.h1
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-[#003366]"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Gateway Dashboard
          </motion.h1>
        </div>
      </header>

      <div className="w-full max-w-2xl space-y-6">
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Exit Gate
          </label>
          <Select onValueChange={setGate} value={gate}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Gate" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gate1">Gate 1 (Kilinto Gate)</SelectItem>
              <SelectItem value="gate2">Gate 2 (The Asphalt Gate)</SelectItem>
              <SelectItem value="gate3">Gate 3 (Tulu Dimtu Gate)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search Shortcode"
              className="w-full bg-white text-[#003366] placeholder-gray-400 border border-[#cccccc] rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#003366] transition duration-300"
              value={searchShortcode}
              onChange={(e) => setSearchShortcode(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>

          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search Student ID"
              className="w-full bg-white text-[#003366] placeholder-gray-400 border border-[#cccccc] rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#003366] transition duration-300"
              value={searchStudentId}
              onChange={handleStudentIdChange}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>

        <button
          onClick={handleSearch}
          disabled={isLoading}
          className={`w-full bg-[#b8860b] hover:bg-[#8B6508] text-white font-bold py-2 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#b8860b] focus:ring-opacity-50 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-700 bg-red-100 rounded-lg p-3"
          >
            {error}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showSummary && studentData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              exit={{ y: 50 }}
              className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full relative"
            >
              <button
                onClick={() => setShowSummary(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-[#003366] transition duration-300"
              >
                <X size={24} />
              </button>
              <h2 className="text-3xl font-bold mb-6 text-center text-[#003366]">Summary</h2>
              
              <div className="space-y-4">
                <p><strong className="text-[#003366]">Name:</strong> {studentData.name}</p>
                <p><strong className="text-[#003366]">Student ID:</strong> {studentData.studentId}</p>
                <p><strong className="text-[#003366]">Block:</strong> {studentData.block}</p>
                <p><strong className="text-[#003366]">Dorm:</strong> {studentData.dorm}</p>
                <p><strong className="text-[#003366]">Approved By:</strong> {studentData.approvedBy}</p>
                <p><strong className="text-[#003366]">Request Date:</strong> {new Date(studentData.DateOfRequest).toLocaleDateString()}</p>
                <p><strong className="text-[#003366]">Status:</strong> {studentData.status}</p>

                <h3 className="text-xl font-bold mt-6 mb-4 text-[#003366]">Items:</h3>
                <ul className="space-y-2">
                  {studentData.items.map((item, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="bg-gray-50 border border-[#cccccc] rounded-lg p-3 flex justify-between items-center"
                    >
                      <span className="text-[#003366]">{item.name}</span>
                      <span className="bg-[#b8860b] text-white px-2 py-1 rounded-full text-sm">{item.count}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <button
                onClick={handleFinish}
                className="mt-6 w-full bg-[#b8860b] hover:bg-[#8B6508] text-white font-bold py-2 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#b8860b] focus:ring-opacity-50"
              >
                Finish
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <Footer/>
    </div>
  )
}