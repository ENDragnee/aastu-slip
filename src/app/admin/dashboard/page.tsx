"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Users, DoorOpen, LogOut, Building, Loader2
} from "lucide-react";
import { StatCard } from "@/components/admin/dashboard/stat-card";
import { GateStatusList } from "@/components/admin/dashboard/gate-status-list";
import { OccupancyList } from "@/components/admin/dashboard/occupancy-list";
import { fetchBlockStats, fetchGateStats, fetchRecentExits } from "@/lib/api/admin";
import { GateStatus } from "@/generated/prisma/enums";

export default function AdminDashboard() {
  // Parallel Data Fetching
  const { data: gates, isLoading: gatesLoading } = useQuery({
    queryKey: ["adminGates"],
    queryFn: fetchGateStats,
  });

  const { data: blocks, isLoading: blocksLoading } = useQuery({
    queryKey: ["adminBlocks"],
    queryFn: fetchBlockStats,
  });

  const { data: exits, isLoading: exitsLoading } = useQuery({
    queryKey: ["adminExits"],
    queryFn: fetchRecentExits,
  });

  const isLoading = gatesLoading || blocksLoading || exitsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  // Calculate Metrics
  const totalStudents = blocks?.reduce((acc, b) => acc + b.activeStudents, 0) || 0;
  const activeGates = gates?.filter(g => g.status === GateStatus.ONLINE).length || 0;
  const exitsToday = exits?.filter(e => {
    const date = new Date(e.createdAt);
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  }).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-primary">Dashboard</h2>
      </div>

      {/* --- Key Metrics Row --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Residents"
          value={totalStudents}
          description="Active students in dorms"
          icon={Users}
        />
        <StatCard
          title="Exits Today"
          value={exitsToday}
          description="Requests created today"
          icon={LogOut}
        />
        <StatCard
          title="Active Gates"
          value={activeGates}
          description={`${gates?.length || 0} total gates configured`}
          icon={DoorOpen}
        />
        <StatCard
          title="Housing Blocks"
          value={blocks?.length || 0}
          description="Managed residential blocks"
          icon={Building}
        />
      </div>

      {/* --- Detailed Widgets Row --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <OccupancyList blocks={blocks || []} />
        <GateStatusList gates={gates || []} />
      </div>
    </div>
  );
}
