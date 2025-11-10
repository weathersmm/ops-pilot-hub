import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Shield, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center gap-2">
          <Truck className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Fleet Command</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <section className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Welcome to Fleet Command
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Choose your access level to continue
          </p>
        </section>

        <section className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/internal')}>
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="bg-primary/10 p-4 rounded-full">
                  <Shield className="h-12 w-12 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl text-center">Internal Access</CardTitle>
              <CardDescription className="text-center">
                For LifeLine EMS Staff
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Full fleet management</li>
                <li>✓ Real-time operations data</li>
                <li>✓ Complete commissioning workflows</li>
                <li>✓ Executive dashboards</li>
              </ul>
              <Button size="lg" className="w-full" onClick={() => navigate('/internal')}>
                Staff Sign In
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/demo')}>
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="bg-primary/10 p-4 rounded-full">
                  <Users className="h-12 w-12 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl text-center">External Demo</CardTitle>
              <CardDescription className="text-center">
                For Prospects & Test Drives
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Interactive demonstration</li>
                <li>✓ Sample fleet data</li>
                <li>✓ Explore key features</li>
                <li>✓ No commitment required</li>
              </ul>
              <Button size="lg" variant="outline" className="w-full" onClick={() => navigate('/demo')}>
                Try Demo
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t mt-16 py-8 text-center text-muted-foreground">
        <p>© 2025 Fleet Command • LifeLine EMS</p>
      </footer>
    </div>
  );
}
