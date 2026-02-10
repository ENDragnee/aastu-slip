import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BlockStat } from "@/types/admin";
import { Progress } from "@/components/ui/progress"; // Ensure you have Shadcn Progress

export function OccupancyList({ blocks }: { blocks: BlockStat[] }) {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Dormitory Occupancy</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {blocks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No block data available.</p>
        ) : blocks.map((block) => (
          <div key={block.id} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{block.name}</span>
              <span className="text-muted-foreground">{block.activeStudents} Residents</span>
            </div>
            {/* 
               Assuming average dorm capacity is ~4 students per room for visualization. 
               Ideally you calculate percentage based on total beds. 
               Here we just show a visual bar proportional to dorm count * 4 
            */}
            <Progress value={(block.activeStudents / (block.dormCount * 4)) * 100} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
