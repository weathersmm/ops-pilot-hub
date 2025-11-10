import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, CheckCircle, Users, BarChart } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DemoLanding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Truck className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Fleet Command Demo</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/demo/login')}>
              Login
            </Button>
            <Button onClick={() => navigate('/demo/signup')}>
              Try Demo
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <section className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Experience Fleet Command
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Explore our comprehensive fleet management system with live demo data. 
            See how LifeLine EMS manages ambulance commissioning, compliance, and operations.
          </p>
          <Button size="lg" onClick={() => navigate('/demo/signup')}>
            Start Free Demo
          </Button>
        </section>

        <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader>
              <Truck className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Fleet Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Track vehicles, equipment, and compliance across multiple regions
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CheckCircle className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Commissioning Workflows</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                46-step automated commissioning process with evidence tracking
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Role-Based Access</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Admin, supervisor, technician, and viewer roles with granular permissions
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Executive Dashboards</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Real-time metrics and KPIs for fleet operations and compliance
              </CardDescription>
            </CardContent>
          </Card>
        </section>

        <section className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to explore?</CardTitle>
              <CardDescription>
                Sign up for instant access to the demo environment with sample data
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/demo/signup')}>
                Create Demo Account
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/demo/login')}>
                Login to Demo
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t mt-16 py-8 text-center text-muted-foreground">
        <p>© 2025 Fleet Command Demo • This is a demonstration environment with mock data</p>
      </footer>
    </div>
  );
}
