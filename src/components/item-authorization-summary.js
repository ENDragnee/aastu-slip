"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, LogOut } from 'lucide-react'
import { Button } from "@/components/ui/button";


export default function StudentItemManagement() {
  const [searchShortcode, setSearchShortcode] = useState('')
  const [searchStudentId, setSearchStudentId] = useState('')
  const [showSummary, setShowSummary] = useState(false)
  const [studentData, setStudentData] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const formatStudentId = (studentId) => {
    // Regular expressions for the valid formats
    const etsPattern = /^ETS\d{4}\/\d{2}$/i;  // Case insensitive
    const numberPattern = /^\d{4}\/\d{2}$/;
    
    if (etsPattern.test(studentId)) {
      return studentId.toUpperCase(); // Normalize to uppercase
    } else if (numberPattern.test(studentId)) {
      return `ETS${studentId.toUpperCase()}`; // Add ETS prefix
    }
    return studentId; // Return original value if no pattern matches
  };

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
  
      // Clear any client-side state if needed
      localStorage.clear() // If you're using localStorage
      sessionStorage.clear() // If you're using sessionStorage
  
      // Redirect to login page
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleSearch = async () => {
    if (!searchShortcode || !searchStudentId) {
      setError("Both shortcode and student ID are required");
      return;
    }
  
    // Format the student ID before searching
    const formattedStudentId = formatStudentId(searchStudentId);
    setSearchStudentId(formattedStudentId); // Update the input field
  
    setIsLoading(true);
    setError(null);
  
    try {
      const response = await fetch(
        `/api/gate?shortcode=${encodeURIComponent(searchShortcode)}&studentId=${encodeURIComponent(formattedStudentId)}`
      );
  
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch student data');
      }
  
      const data = await response.json();
      setStudentData(data);
      setShowSummary(true);
    } catch (error) {
      setError(error.message);
      console.error('Error fetching student data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // Handle student ID input change
  const handleStudentIdChange = (e) => {
    const value = e.target.value;
    setSearchStudentId(value);
  };

  const handleFinish = async () => {
    if (!studentData?.studentId) return;
  
    try {
      const response = await fetch('/api/finish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: studentData.studentId,
        }),
      });
  
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to finish the request');
      }
  
      // Close the modal and reset the data
      setShowSummary(false);
      setStudentData(null);
      setSearchShortcode('');
      setSearchStudentId('');
    } catch (error) {
      setError(error.message);
      console.error('Error finishing request:', error);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 font-sans flex flex-col items-center justify-center">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <nav>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </Button>
          </nav>
        </div>
      </header>
      <motion.h1 
        className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 drop-shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Student Item Management System
      </motion.h1>

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
            onChange={handleStudentIdChange}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className={`w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 text-red-400 bg-red-900 bg-opacity-50 rounded-lg p-3"
        >
          {error}
        </motion.div>
      )}

      <AnimatePresence>
        {showSummary && studentData && (
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
                <p><strong className="text-blue-400">Name:</strong> {studentData.name}</p>
                <p><strong className="text-blue-400">Student ID:</strong> {studentData.studentId}</p>
                <p><strong className="text-blue-400">Request Date:</strong> {new Date(studentData.DateOfRequest).toLocaleDateString()}</p>
                <h3 className="text-xl font-bold mt-6 mb-4 text-purple-400">Items:</h3>
                <ul className="space-y-2">
                  {studentData.items.map((item, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="bg-gray-700 rounded-lg p-3 flex justify-between items-center"
                    >
                      <span>{item.name}</span>
                      <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-sm">{item.count}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
              <button
                onClick={handleFinish}
                className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              >
                Finish
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}