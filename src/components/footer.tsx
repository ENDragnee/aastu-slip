import React from 'react'

const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[#cccccc] text-center text-[#003366] shadow-lg">
    <p className="text-base font-medium">
      &copy; AASTU SAAS Founders Club <span className="text-[#b8860b]">{new Date().getFullYear()}</span>
    </p>
  </footer>
  )
}

export default Footer