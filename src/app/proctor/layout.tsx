import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";

export default async function ProctorLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession();
  const user = session?.user;

  if (!user || user.role !== "PROCTOR") {
    redirect("/auth/sign-in");
  }

  return (
    children
  )
}
