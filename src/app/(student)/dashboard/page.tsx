import { Metadata } from "next";
import { getSession } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";
import StudentExitForm from "@/components/student-exit-form";
import { UserExitInfo } from "@/types";

export const metadata: Metadata = {
  title: "Student Exit Checkout | AASTU",
  description: "Digital exit slip management for students.",
};

export default async function StudentExitPage() {
  const session = await getSession();
  const data = await prisma.userDormitory.findFirst({
    where: {
      userId: session.user?.id,
      isActive: true,
    },
    include: {
      dorm: {
        include: {
          block: true
        }
      },
      user: {
        include: {
          profile: true
        }
      }
    }
  })

  const userInfo: UserExitInfo = {
    name: session.user?.name ?? undefined,
    universityId: session.user?.universityId,
    dormNumber: data?.dorm.number,
    block: data?.dorm.block.name,
    profileUrl: data?.user.profile?.url || "/AASTU.jpg"
  }

  return (
    <main className="min-h-screen w-full bg-background flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">

      <div className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-125 h-125 bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />
      <StudentExitForm userInfo={userInfo} />)
    </main>
  );
}
