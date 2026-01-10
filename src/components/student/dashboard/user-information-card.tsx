import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserExitInfo } from "@/types";

export function UserInformation({ userInfo }: { userInfo: UserExitInfo }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" placeholder="e.g. Abebe Kebede" value={userInfo.name} disabled className="bg-background" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="studentId">Student ID</Label>
          <Input id="studentId" placeholder="ETSxxxx/xx" value={userInfo.universityId} disabled className="bg-background" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="block">Block No.</Label>
          <Input id="block" placeholder="B-44" value={userInfo.block} disabled className="bg-background" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dorm">Dorm No.</Label>
          <Input id="dorm" placeholder="101" value={userInfo.dormNumber} disabled className="bg-background" />
        </div>
      </div>
    </div>
  )
}
