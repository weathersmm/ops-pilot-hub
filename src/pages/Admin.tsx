import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CsvImport from "@/components/CsvImport";
import UserManagement from "@/components/UserManagement";
import { Settings } from "lucide-react";

export default function Admin() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">System configuration and data management</p>
        </div>
      </div>

      <Tabs defaultValue="import">
        <TabsList>
          <TabsTrigger value="import">CSV Import</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="settings">System Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-6">
          <CsvImport />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="settings">
          <div className="text-center py-12 text-muted-foreground">
            System settings coming soon
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
