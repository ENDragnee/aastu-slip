"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Users, DoorOpen, LogOut, Building, Loader2, AlertCircle,
  History
} from "lucide-react";
import { StatCard } from "@/components/admin/dashboard/stat-card";
import { GateStatusList } from "@/components/admin/dashboard/gate-status-list";
import { OccupancyList } from "@/components/admin/dashboard/occupancy-list";
import { fetchAdminDashboardGraphQL } from "@/lib/api/admin-graphql";
import { GateStatus } from "@/generated/prisma/enums";

export default function AdminDashboard() {

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminDashboardGraphQL"],
    queryFn: fetchAdminDashboardGraphQL,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
        <AlertCircle className="h-10 w-10 mb-2" />
        <p>Failed to load dashboard data.</p>
        <p className="text-sm">{(error as Error)?.message}</p>
      </div>
    );
  }

  // Calculate totals
  const totalStudents = data.blocks.reduce((acc, b) => acc + (b.activeStudent || 0), 0);
  const activeGates = data.gateways.filter(g => g.status === GateStatus.ONLINE).length;

  // Map 'blocks' to match OccupancyList prop name (activeStudent -> activeStudents)
  const mappedBlocks = data.blocks.map(b => ({
    ...b,
    activeStudents: b.activeStudent
  }));

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
          title="Total Exits"
          value={data.requests.total}
          description="All time processed exits"
          icon={History}
        />
        <StatCard
          title="Exits Today"
          value={data.requests.today}
          description="Requests created today"
          icon={LogOut}
        />
        <StatCard
          title="Active Gates"
          value={activeGates}
          description={`${data.gateways.length} total gates configured`}
          icon={DoorOpen}
        />
        <StatCard
          title="Housing Blocks"
          value={data.blocks.length}
          description="Managed residential blocks"
          icon={Building}
        />
      </div>

      {/* --- Detailed Widgets Row --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <OccupancyList blocks={mappedBlocks} />
        <GateStatusList gates={data.gateways} />
      </div>
    </div>
  );
}
