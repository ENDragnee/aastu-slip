import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import { getSession } from "@/lib/server-auth";

export default async function ProctorLayout({
  children
}: {
  children: React.ReactNode
}) {
  const session = await getSession();
  const user = session?.user;

  if (!user || user.role !== "PROCTOR") {
    redirect("/auth/sign-in");
  }

  return (
    children
  )
}
