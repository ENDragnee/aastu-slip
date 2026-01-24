import { redirect } from "next/navigation";
import { getSession } from "@/lib/server-auth";

export default async function StudentLayout({
  children
}: {
  children: React.ReactNode
}) {
  const session = await getSession();
  const user = session?.user;

  if (!user || user.role !== "STUDENT") {
    redirect("/auth/sign-in");
  }

  return (
    children
  )
}
