import { Role } from "@/generated/prisma/enums";
import { getSession } from "next-auth/react";
import { redirect } from "next/navigation";

export async function redirector() {
  const session = await getSession();

  if (!session?.user || !session.user.id) {
    redirect("/auth/sign-in");
  }
  if (session?.user?.role == Role.STUDENT) {
    redirect("/dashboard");
  } else if (session?.user?.role === Role.PROCTOR) {
    redirect("/proctor/dashboard");
  } else if (session?.user?.role === Role.ADMIN) {
    redirect("/admin/dashboard");
  } else if (session?.user?.role === Role.GATE) {
    redirect("/gate/dashboard");
  }
}
