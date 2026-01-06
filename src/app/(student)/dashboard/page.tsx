import { Metadata } from "next";
import StudentExitForm from "@/components/student-exit-form";

export const metadata: Metadata = {
  title: "Student Exit Checkout | AASTU",
  description: "Digital exit slip management for students.",
};

export default function StudentExitPage() {
  return (
    <main className="min-h-screen w-full bg-background flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">

      {/* Optional: Decorative Background Blobs matching theme colors */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

      {/* The Client Form */}
      <StudentExitForm />
    </main>
  );
}
