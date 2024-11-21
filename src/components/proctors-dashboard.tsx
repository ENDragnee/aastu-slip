"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Settings, LogOut } from 'lucide-react'

// Mock data for demonstration
const mockStudents = [
  {
    id: "S12345",
    name: "John Doe",
    exitDate: "2024-03-15",
    items: [
      { name: "Clothing", quantity: 5 },
      { name: "Shoes", quantity: 2 },
      { name: "Books", quantity: 3 },
    ],
  },
  {
    id: "S67890",
    name: "Jane Smith",
    exitDate: "2024-03-20",
    items: [
      { name: "Electronics", quantity: 1 },
      { name: "Bed Sheets", quantity: 2 },
      { name: "Personal Care Items", quantity: 4 },
    ],
  },
]

export default function ProctorsDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [isAuthorized, setIsAuthorized] = useState(false)

  const handleSearch = () => {
    const student = mockStudents.find(
      (s) => s.id.toLowerCase() === searchTerm.toLowerCase() || s.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setSelectedStudent(student)
    setIsAuthorized(false)
  }

  const handleAuthorize = () => {
    setIsAuthorized(true)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Proctor&apos;s Dashboard</h1>
          <nav>
            <Button variant="ghost" className="mr-2">
              <Settings className="w-5 h-5 mr-2" />
              Settings
            </Button>
            <Button variant="ghost">
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </Button>
          </nav>
        </div>
      </header>
      <main>
        <Card className="mb-8">
          <CardContent className="pt-6">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSearch()
              }}
              className="flex items-center space-x-2"
            >
              <div className="relative flex-grow">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search by Student Name or ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
          </CardContent>
        </Card>
        {selectedStudent && (
          <Card>
            <CardHeader>
              <CardTitle>{selectedStudent.name}</CardTitle>
              <CardDescription>Student ID: {selectedStudent.id}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Requested Date: {selectedStudent.exitDate}</p>
              <h3 className="font-semibold mb-2">Items to Take Home:</h3>
              <ScrollArea className="h-[200px] rounded-md border p-4">
                <ul className="space-y-2">
                  {selectedStudent.items.map((item, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <span>{item.name}</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                        Quantity: {item.quantity}
                      </span>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-green-500 hover:bg-green-600" disabled={isAuthorized}>
                    {isAuthorized ? "Authorized" : "Authorize"}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Authorization</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to authorize the items for {selectedStudent.name}?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {}}>
                      Cancel
                    </Button>
                    <Button onClick={handleAuthorize}>Confirm</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        )}
      </main>
    </div>
  )
}