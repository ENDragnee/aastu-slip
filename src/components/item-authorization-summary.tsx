"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X } from 'lucide-react'

export default function StudentItemManagement() {
  const [searchShortcode, setSearchShortcode] = useState('')
  const [searchStudentId, setSearchStudentId] = useState('')
  const [showSummary, setShowSummary] = useState(false)

  const handleSearch = () => {
    // Here you would typically fetch data based on shortcode and student ID
    // For this example, we'll just show a mock summary
    setShowSummary(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 font-sans flex flex-col items-center justify-center">
      <motion.h1 
        className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 drop-shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Student Item Management System
      </motion.h1>

      {/* Search Section */}
      <motion.div 
        className="mb-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search Shortcode"
            className="w-full bg-gray-800 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            value={searchShortcode}
            onChange={(e) => setSearchShortcode(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search Student ID"
            className="w-full bg-gray-800 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            value={searchStudentId}
            onChange={(e) => setSearchStudentId(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>
        <button
          onClick={handleSearch}
          className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Search
        </button>
      </motion.div>

      <AnimatePresence>
        {showSummary && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              exit={{ y: 50 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 shadow-2xl max-w-md w-full relative overflow-hidden"
            >
              <button
                onClick={() => setShowSummary(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition duration-300"
              >
                <X size={24} />
              </button>
              <h2 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Summary</h2>
              <div className="space-y-4">
                <p><strong className="text-blue-400">Name:</strong> John Doe</p>
                <p><strong className="text-blue-400">Student ID:</strong> 12345</p>
                <p><strong className="text-blue-400">Exit Date:</strong> 2023-05-15</p>
                <h3 className="text-xl font-bold mt-6 mb-4 text-purple-400">Items:</h3>
                <ul className="space-y-2">
                  {['Clothing: 2', 'Shoes: 1', 'Books: 3'].map((item, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="bg-gray-700 rounded-lg p-3 flex justify-between items-center"
                    >
                      <span>{item.split(':')[0]}</span>
                      <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-sm">{item.split(':')[1]}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

