import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function Executive() {
  // Mock data
  const vehiclesActive = 24;
  const vehiclesReady = 18;
  const readinessRate = Math.round((vehiclesReady / vehiclesActive) * 100);
  const avgDaysToReady = 12;
  const slaBreaches = 5;
  const inspectionsDue = 3;
  const equipmentService = 7;
  const openWorkOrders = 8;
  const agingWorkOrders = 2;

  const statusData = [
    { name: "Ready", value: 18, fill: "hsl(var(--chart-2))" },
    { name: "Commissioning", value: 4, fill: "hsl(var(--chart-3))" },
    { name: "Out of Service", value: 2, fill: "hsl(var(--chart-4))" },
  ];

  const regionData = [
    { region: "OC", ready: 5, commissioning: 1, total: 6 },
    { region: "LA", ready: 4, commissioning: 2, total: 6 },
    { region: "UCI", ready: 3, commissioning: 1, total: 4 },
    { region: "KP", ready: 3, commissioning: 0, total: 3 },
    { region: "RIV", ready: 3, commissioning: 0, total: 3 },
  ];

  const chartConfig = {
    ready: {
      label: "Ready",
      color: "hsl(var(--chart-2))",
    },
    commissioning: {
      label: "Commissioning",
      color: "hsl(var(--chart-3))",
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Executive Dashboard</h1>
        <p className="text-muted-foreground">Fleet readiness and operational metrics</p>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Readiness Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{readinessRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {vehiclesReady} of {vehiclesActive} vehicles ready
            </p>
            <div className="flex items-center gap-1 mt-2 text-xs text-success">
              <TrendingUp className="h-3 w-3" />
              +5% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Days to Ready</CardTitle>
            <TrendingDown className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgDaysToReady}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Commissioning cycle time
            </p>
            <div className="flex items-center gap-1 mt-2 text-xs text-success">
              <TrendingDown className="h-3 w-3" />
              -2 days improvement
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SLA Breaches (30d)</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{slaBreaches}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Overdue commissioning tasks
            </p>
            <Badge variant="outline" className="mt-2">
              {slaBreaches > 10 ? "High" : "Normal"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Work Orders</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openWorkOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {agingWorkOrders} aging over 7 days
            </p>
            <Badge variant={agingWorkOrders > 5 ? "destructive" : "outline"} className="mt-2">
              {agingWorkOrders > 5 ? "Attention" : "Normal"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fleet Status Distribution</CardTitle>
            <CardDescription>Current vehicle operational status</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Readiness by Region</CardTitle>
            <CardDescription>Regional fleet operational status</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="region" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="ready" stackId="a" fill="hsl(var(--chart-2))" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="commissioning" stackId="a" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Inspections (7d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{inspectionsDue}</div>
            <p className="text-sm text-muted-foreground">
              CHP and internal inspections due within 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Equipment Service (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{equipmentService}</div>
            <p className="text-sm text-muted-foreground">
              Equipment items requiring service within 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Critical Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="h-6">2</Badge>
                <span className="text-sm">Overdue inspections</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="h-6">{slaBreaches}</Badge>
                <span className="text-sm">SLA breaches</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
