"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveAs } from "file-saver";
import Image from "next/image"; // Import the Image component
import aastuImage from '../../public/AASTU.jpg'

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
import { useRouter } from "next/navigation";

export default function ProctorsDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shortCode, setShortCode] = useState("");
  const [showShortCode, setShowShortCode] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false); // New state
  const router = useRouter();

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
      const response = await fetch("/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      localStorage.clear();
      sessionStorage.clear();

      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleExportExits = async () => {
    try {
      const response = await fetch("/api/export-exit");
      if (!response.ok) {
        throw new Error("Failed to export Exits table");
      }
  
      const blob = await response.blob();
      saveAs(blob, "Exits.xlsx");
    } catch (error) {
      console.error("Export error:", error.message);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const formattedSearchTerm = formatStudentId(searchTerm);
      setSearchTerm(formattedSearchTerm);

      const response = await fetch(`/api/requests?studentId=${formattedSearchTerm}`);
      if (!response.ok) {
        throw new Error("Student not found");
      }

      const data = await response.json();

      setSelectedStudent({
        id: data.StudentId,
        name: data.Name,
        exitDate: new Date(data.DateOfRequest).toLocaleDateString(),
        items: data.Items,
        status: data.Status,
        shortCode: data.ShortCode ?? ""
      });
      
      // Set isAuthorized based on the status
      setIsAuthorized(data.Status === 'Authorized');
    } catch (err) {
      setError(err.message);
      setSelectedStudent(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchTermChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
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

      // Update the selected student's status
      setSelectedStudent(prev => ({
        ...prev,
        status: 'Authorized'
      }));

      setShowConfirmModal(false);
      setShowShortCode(true);
    } catch (err) {
      setError("Failed to authorize: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-white p-10">
      <header className="mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-center">
          <div className="mb-6 lg:mb-0">
            <Image
              src={aastuImage}
              alt="AASTU Logo"
              width={200} // Adjust the width
              height={160} // Adjust the height
              className="w-full lg:w-48 h-auto"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#003366] text-center lg:text-left">
            Proctor&apos;s Dashboard
          </h1>
          <nav className="mt-4 lg:mt-0">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="text-[#003366] border-[#003366] hover:bg-[#003366] hover:text-white"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </Button>
          </nav>
        </div>
      </header>

      <main>
        <Button 
          onClick={handleExportExits} 
          className="bg-[#b8860b] text-white hover:bg-[#b8860b]/90 my-2"
        >
          Export Exits Table
        </Button>
        <Card className="mb-8 border-[#cccccc]">
          <CardContent className="pt-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="flex items-center space-x-2"
            >
              <div className="relative flex-grow">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-[#003366]" />
                <Input
                  type="text"
                  placeholder="Search by Student Name or ID"
                  value={searchTerm}
                  onChange={handleSearchTermChange}
                  className="pl-8 border-[#cccccc] text-[#003366] placeholder-[#003366]/50"
                />
              </div>
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-[#b8860b] text-white hover:bg-[#b8860b]/90"
              >
                {loading ? "Searching..." : "Search"}
              </Button>
            </form>
          </CardContent>
        </Card>
        {selectedStudent && (
          <Card className="border-[#cccccc]">
            <CardHeader>
              <CardTitle className="text-[#003366]">{selectedStudent.name}</CardTitle>
              <CardDescription className="text-[#003366]/70">
                Student ID: {selectedStudent.id}
                <div className={`mt-2 inline-block px-2 py-1 rounded-full text-sm ${
                  selectedStudent.status === 'Authorized' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  Status: {selectedStudent.status}
                </div>
              </CardDescription>
                <CardTitle className="text-[#003366]">Short Code: {selectedStudent.shortCode}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-[#003366]">Requested Date: {selectedStudent.exitDate}</p>
              <h3 className="font-semibold mb-2 text-[#003366]">Items to Take Home:</h3>
              <ScrollArea className="h-[200px] rounded-md border border-[#cccccc] p-4">
                <ul className="space-y-2">
                  {selectedStudent.items.map((item, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <span className="text-[#003366]">{item.name}</span>
                      <span className="bg-[#cccccc] text-[#003366] px-2 py-1 rounded-full text-sm">
                        {item.quantity}
                      </span>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                className={`${
                  isAuthorized 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-[#b8860b] text-white hover:bg-[#b8860b]/90"
                }`}
                disabled={isAuthorized}
                onClick={() => setShowConfirmModal(true)}
              >
                {isAuthorized ? "Authorized" : "Authorize"}
              </Button>
              <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
                <DialogContent className="bg-white border-[#cccccc]">
                  <DialogHeader>
                    <DialogTitle className="text-[#003366]">Confirm Authorization</DialogTitle>
                    <DialogDescription className="text-[#003366]/70">
                      Are you sure you want to authorize the items for{" "}
                      {selectedStudent.name}?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowConfirmModal(false)}
                      className="text-[#003366] border-[#003366] hover:bg-[#003366] hover:text-white"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAuthorize}
                      className="bg-[#b8860b] text-white hover:bg-[#b8860b]/90"
                    >
                      Confirm
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        )}
        {showShortCode && (
          <Dialog open={showShortCode} onOpenChange={setShowShortCode}>
            <DialogContent className="bg-white border-[#cccccc]">
              <DialogHeader>
                <DialogTitle className="text-[#003366]">Authorization Successful</DialogTitle>
                <DialogDescription className="text-[#003366]/70">Your short code is:</DialogDescription>
                <div className="mt-4 text-2xl font-bold text-center text-green-600">
                  {shortCode}
                </div>
              </DialogHeader>
              <DialogFooter>
                <Button 
                  onClick={() => setShowShortCode(false)}
                  className="bg-[#b8860b] text-white hover:bg-[#b8860b]/90"
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
}
