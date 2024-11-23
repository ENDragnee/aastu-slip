"use client";

import { useState } from "react";
import { ChevronDown, Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const items = [
  "Clothing",
  "Shoes",
  "Bed Sheets",
  "Electronics",
  "Books",
  "Personal Care Items",
];

export default function StudentItemManagement() {
  const [formData, setFormData] = useState({
    name: "",
    studentId: "",
    dorm: "",
    block: "",
  });
  const [selectedItems, setSelectedItems] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState("");

  const addItem = (item) => {
    if (selectedItems.some((selectedItem) => selectedItem.name === item)) {
      setError("Item already added.");
      setTimeout(() => setError(""), 3000);
      return;
    }
    setSelectedItems([...selectedItems, { name: item, quantity: 1 }]);
  };

  const removeItem = (index) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const updateQuantity = (index, delta) => {
    setSelectedItems(
      selectedItems.map((item, i) =>
        i === index
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (
      !formData.name ||
      !formData.studentId ||
      !formData.dorm ||
      !formData.block ||
      selectedItems.length === 0
    ) {
      setError("All fields and at least one item are required.");
      setTimeout(() => setError(""), 3000);
      return;
    }
  
    try {
      const response = await fetch("/api/studentReq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, items: selectedItems }),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        setShowConfirmation(true);
        setTimeout(() => setShowConfirmation(false), 3000);
        setFormData({
          name: "",
          studentId: "",
          dorm: "",
          block: "",
        });
        setSelectedItems([]);
      } else if (response.status === 409) {
        setError(result.error); // Display duplicate entry error
      } else {
        setError(result.error || "Failed to submit request.");
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      setError("An unexpected error occurred. Please try again.");
    }
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 p-6 ios-font">
      <div className="max-w-md mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 pb-2">
          Student Item Management System
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {["name", "studentId", "dorm", "block"].map((field) => (
              <div key={field}>
                <Label htmlFor={field} className="text-sm font-medium text-gray-300">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </Label>
                <Input
                  id={field}
                  value={formData[field]}
                  onChange={handleInputChange}
                  placeholder={`Enter your ${field}`}
                  className="mt-1 bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400"
                />
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <Label className="text-sm font-medium text-gray-300">Select Items</Label>
            <Select onValueChange={addItem}>
              <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-gray-100">
                <SelectValue placeholder="Add an item" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-gray-100">
                {items.map((item) => (
                  <SelectItem key={item} value={item} className="focus:bg-gray-700">
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-4">
            {selectedItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-800 p-3 rounded-lg shadow-md"
              >
                <span>{item.name}</span>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full"
                    onClick={() => updateQuantity(index, -1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span>{item.quantity}</span>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full"
                    onClick={() => updateQuantity(index, 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full text-red-400"
                    onClick={() => removeItem(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          >
            Submit
          </Button>
        </form>
        {error && (
          <div className="text-red-500 text-center mt-4">{error}</div>
        )}
        {showConfirmation && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg animate-fade-in-up">
            Items submitted successfully!
          </div>
        )}
      </div>
    </div>
  );
}
