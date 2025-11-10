import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, AlertTriangle, Phone } from "lucide-react";

export default function Operations() {
  // Mock data
  const currentCalls = 142;
  const callGoal = 180;
  const openWork = 12;
  const halfCrews = 3;
  const callOffs = 2;
  const crewPairings = 8;

  const percentComplete = Math.round((currentCalls / callGoal) * 100);
  const remainingCalls = callGoal - currentCalls;
  const isOnTrack = percentComplete >= 60; // Simplified pace check

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Operations Dashboard</h1>
        <p className="text-muted-foreground">Real-time call monitoring and crew status</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Call Progress</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentCalls} / {callGoal}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {remainingCalls} calls remaining
            </p>
            <div className="mt-2">
              <Badge variant={isOnTrack ? "default" : "destructive"}>
                {percentComplete}% Complete
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Work</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openWork}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active incidents
            </p>
            <Badge variant="outline" className="mt-2">
              {isOnTrack ? "Normal" : "High Volume"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crew Status</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{crewPairings}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active crew pairings
            </p>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline">{halfCrews} half crews</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Call-Offs</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{callOffs}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Today's call-offs
            </p>
            <Badge variant={callOffs > 5 ? "destructive" : "outline"} className="mt-2">
              {callOffs > 5 ? "High" : "Normal"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Hourly Summary</CardTitle>
          <CardDescription>Last updated: {new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit' })} ET</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <Phone className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium mb-1">Call Volume</h4>
                <p className="text-sm text-muted-foreground">
                  Current call count is {currentCalls} against a goal of {callGoal}. 
                  Need {remainingCalls} more calls to hit target.
                </p>
              </div>
              <Badge variant={isOnTrack ? "default" : "destructive"}>
                {isOnTrack ? "On Track" : "Behind Pace"}
              </Badge>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <Users className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium mb-1">Crew Updates</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• {crewPairings} crew pairings active</li>
                  <li>• {halfCrews} half-crew arrangements in place</li>
                  <li>• {callOffs} call-offs reported today</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium mb-1">Open Work Status</h4>
                <p className="text-sm text-muted-foreground">
                  {openWork} units currently on open work. Volume is {openWork > 15 ? "high" : "normal"} for this time of day.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Comparison</CardTitle>
          <CardDescription>Yesterday vs. Same Weekday Last Week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm font-medium">Yesterday's Final Count</p>
                <p className="text-2xl font-bold">185</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Same Day Last Week</p>
                <p className="text-2xl font-bold">178</p>
              </div>
              <Badge variant="default" className="ml-4">
                +7 (+3.9%)
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Demand trending upward compared to last week
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
