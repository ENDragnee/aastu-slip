'use client'

import { usePathname } from 'next/navigation'
import Sidebar from './sidebar'

const SidebarWrapper = () => {
  const pathname = usePathname()
  
  // Add routes where you don't want the sidebar to appear
  const excludedRoutes = ['/login', '/register', '/404', '/proctor' , '/signup', '/transaction', '/transaction/orderSummary', '/invoice', '/qr']

  // Add pattern for /products/[id]
  const excludedPatterns = [
    /^\/product\/[^/]+$/  // Matches /products/[anything]
  ]

  // Check if the current path is in the excluded routes
  const isExcludedRoute = excludedRoutes.includes(pathname)

  // Check if the current path matches any of the excluded patterns
  const isExcludedPattern = excludedPatterns.some(pattern => pattern.test(pathname))

  if (isExcludedRoute || isExcludedPattern) {
    return null
  }

  return <Sidebar />
}

export default SidebarWrapper