import { redirect } from "next/navigation";
import { getApiSession } from "@/lib/server-auth";

export default async function ProctorLayout({
  children
}: {
  children: React.ReactNode
}) {
  const session = await getApiSession();
  const user = session?.user;

  if (!user || user.role !== "ADMIN") {
    redirect("/auth/sign-in");
  }

  return (
    children
  )
}
