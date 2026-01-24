"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast"; // Adjust path if needed

export default function ContactUsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsLoading(false);
    toast({
      title: "Message Sent",
      description: "We'll get back to you as soon as possible.",
    });

  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 md:px-8 flex items-center justify-center">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Left Column: Info */}
        <div className="space-y-8 flex flex-col justify-center">
          <div>
            <h1 className="text-4xl font-extrabold text-primary mb-4">Get in Touch</h1>
            <p className="text-lg text-muted-foreground">
              Facing issues with your exit slip? Have a suggestion for the SAAS Club? We are here to help.
            </p>
          </div>

          <div className="space-y-6">
            <ContactItem
              icon={MapPin}
              title="Visit Us"
              text="AASTU Campus, Block 59, Software Engineering Dept."
            />
            <ContactItem
              icon={Mail}
              title="Email Support"
              text="mesfinmastwal@gmail.com"
            />
            <ContactItem
              icon={Phone}
              title="Call Us"
              text="+2519949551"
            />
          </div>
        </div>

        {/* Right Column: Form */}
        <Card className="shadow-xl border-t-4 border-t-secondary">
          <CardHeader>
            <CardTitle>Send a Message</CardTitle>
            <CardDescription>Fill out the form below and we will respond via email.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="John" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Doe" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="john@example.com" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="Issue with Laptop Registration" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Describe your issue in detail..."
                  className="min-h-[120px]"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" /> Send Message
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

function ContactItem({ icon: Icon, title, text }: { icon: any, title: string, text: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}
