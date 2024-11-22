"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, LogOut } from "lucide-react";
import { useRouter } from 'next/navigation'


export default function ProctorsDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shortCode, setShortCode] = useState("");
  const [showShortCode, setShowShortCode] = useState(false);
  const router = useRouter()


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
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/requests?studentId=${searchTerm}`);
      if (!response.ok) {
        throw new Error("Student not found");
      }
  
      const data = await response.json();
      setSelectedStudent({
        id: data.StudentId,
        name: data.Name,
        exitDate: new Date(data.DateOfRequest).toLocaleDateString(),
        items: data.Items, // Aggregated items
      });
    } catch (err) {
      setError(err.message);
      setSelectedStudent(null);
    } finally {
      setLoading(false);
    }
  };
  
  
  const handleAuthorize = async () => {
    try {
      const proctorId = 1;

      const response = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          proctorId: proctorId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to authorize");
      }

      const data = await response.json();
      setIsAuthorized(true);
      setShortCode(data.shortCode);
      setShowShortCode(true);
    } catch (err) {
      setError("Failed to authorize: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">
            Proctor&apos;s Dashboard
          </h1>
          <nav>
            <Button variant="ghost" onClick={handleLogout}>
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
                e.preventDefault();
                handleSearch();
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
              <CardDescription>
                Student ID: {selectedStudent.id}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Requested Date: {selectedStudent.exitDate}</p>
              <h3 className="font-semibold mb-2">Items to Take Home:</h3>
              <ScrollArea className="h-[200px] rounded-md border p-4">
              <ul className="space-y-2">
                {Object.entries(selectedStudent.items).map(([itemName, quantity], index) => (
                  <li key={index} className="flex justify-between items-center">
                    <span>{itemName}</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                      {quantity}
                    </span>
                  </li>
                ))}
              </ul>


              </ScrollArea>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    className="bg-green-500 hover:bg-green-600"
                    disabled={isAuthorized}
                  >
                    {isAuthorized ? "Authorized" : "Authorize"}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Authorization</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to authorize the items for{" "}
                      {selectedStudent.name}?
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

        {showShortCode && (
          <Dialog open={showShortCode} onOpenChange={setShowShortCode}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Authorization Successful</DialogTitle>
                <DialogDescription>Your short code is:</DialogDescription>
                <div className="mt-4 text-2xl font-bold text-center text-green-600">
                  {shortCode}
                </div>
              </DialogHeader>
              <DialogFooter>
                <Button onClick={() => setShowShortCode(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
}
