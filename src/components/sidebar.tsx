'use client'

import * as React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useMediaQuery } from 'react-responsive'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
// import { ThemeToggle } from '@/components/theme-toggle'
import { DoorOpen, ListChecks, MenuIcon, XIcon } from 'lucide-react'

const navItems = [
  { href: '/', icon: ListChecks, label: 'Check Out' },
  { href: '/gateway', icon: DoorOpen, label: 'Gateway' },
]

export function Sidebar() {
  const [isMounted, setIsMounted] = React.useState(false)
  const isSmallScreen = useMediaQuery({ maxWidth: 640 })
  const [isOpen, setIsOpen] = React.useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Handle hydration mismatch
  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  const isMobile = isMounted && isSmallScreen

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const handleNavigation = (href: string) => {
    router.push(href)
    if (isMobile) {
      setIsOpen(false)
    }
  }

  const sidebar = {
    open: {
      width: isMobile ? '100%' : '4rem',
      transition: { type: 'spring', stiffness: 400, damping: 40 }
    },
    closed: {
      width: '0',
      transition: { type: 'spring', stiffness: 400, damping: 40 }
    }
  }

  // Prevent hydration mismatch
  if (!isMounted) return null

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 sm:hidden hover:bg-accent"
        onClick={toggleSidebar}
      >
        {isOpen ? <XIcon className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
        <span className="sr-only">Toggle Sidebar</span>
      </Button>

      <AnimatePresence>
        <motion.aside
          initial={false}
          animate={isMobile ? (isOpen ? 'open' : 'closed') : 'open'}
          variants={sidebar}
          className={cn(
            'fixed inset-y-0 left-0 z-40 flex flex-col border-r bg-background/80 backdrop-blur-xl',
            'dark:bg-background/80 dark:border-border/10 py-72 max-h-full',
            isMobile && !isOpen && 'hidden'
          )}
        >
          <ScrollArea className="flex-grow">
            <nav className={cn(
              "flex flex-col gap-2 p-3",
              isMobile ? "pt-16" : "pt-4",
              "items-center space-y-4"
            )}>
              <TooltipProvider>
              {/* <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-full flex justify-center">
                      <ThemeToggle />
                    </div>
                  </TooltipTrigger>
                  {!isMobile && (
                    <TooltipContent 
                      side="right"
                      className="bg-popover/80 backdrop-blur-lg"
                    >
                      Toggle theme
                    </TooltipContent>
                  )}
                </Tooltip> */}
                {navItems.map((item) => (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={pathname === item.href ? "secondary" : "ghost"}
                        size={isMobile ? "default" : "icon"}
                        className={cn(
                          "w-full transition-all duration-200",
                          "hover:bg-accent hover:text-accent-foreground",
                          "dark:hover:bg-accent dark:hover:text-accent-foreground",
                          isMobile ? "justify-start" : "justify-center"
                        )}
                        onClick={() => handleNavigation(item.href)}
                      >
                        <item.icon className="h-5 w-5" />
                        {isMobile && <span className="ml-2">{item.label}</span>}
                        {!isMobile && <span className="sr-only">{item.label}</span>}
                      </Button>
                    </TooltipTrigger>
                    {!isMobile && (
                      <TooltipContent 
                        side="right"
                        className="bg-popover/80 backdrop-blur-lg"
                      >
                        {item.label}
                      </TooltipContent>
                    )}
                  </Tooltip>
                ))}
              </TooltipProvider>
            </nav>
          </ScrollArea>
        </motion.aside>
      </AnimatePresence>
    </>
  )
}

export default Sidebar