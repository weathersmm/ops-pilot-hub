import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Shield, User, Eye, Wrench, Search, Users, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import InviteUserDialog from "./InviteUserDialog";
import { Button } from "@/components/ui/button";

type UserRole = "admin" | "supervisor" | "technician" | "viewer";
type TenantType = "internal" | "demo";

interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  tenant_type: TenantType;
  role: UserRole;
  role_id: string;
}

const roleIcons = {
  admin: Shield,
  supervisor: Wrench,
  technician: User,
  viewer: Eye,
};

const roleColors = {
  admin: "destructive",
  supervisor: "default",
  technician: "secondary",
  viewer: "outline",
} as const;

export default function UserManagement() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [tenantFilter, setTenantFilter] = useState<TenantType | "all">("all");
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          email,
          full_name,
          tenant_type,
          user_roles!inner (
            id,
            role
          )
        `)
        .order("email");

      if (error) throw error;

      const usersWithRoles = data.map((user: any) => ({
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        tenant_type: user.tenant_type,
        role: user.user_roles[0]?.role || "viewer",
        role_id: user.user_roles[0]?.id,
      }));

      setUsers(usersWithRoles);
      setFilteredUsers(usersWithRoles);
    } catch (error: any) {
      toast({
        title: "Error loading users",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Apply tenant filter
    if (tenantFilter !== "all") {
      filtered = filtered.filter((user) => user.tenant_type === tenantFilter);
    }

    setFilteredUsers(filtered);
  }, [searchQuery, roleFilter, tenantFilter, users]);

  const userStats = {
    total: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    supervisors: users.filter((u) => u.role === "supervisor").length,
    technicians: users.filter((u) => u.role === "technician").length,
    viewers: users.filter((u) => u.role === "viewer").length,
    internal: users.filter((u) => u.tenant_type === "internal").length,
    demo: users.filter((u) => u.tenant_type === "demo").length,
  };

  const handleRoleChange = async (userId: string, roleId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("id", roleId);

      if (error) throw error;

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );

      toast({
        title: "Role updated",
        description: "User role has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating role",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-3xl font-bold">{userStats.total}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">By Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Admins:</span>
                <span className="font-semibold">{userStats.admins}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Supervisors:</span>
                <span className="font-semibold">{userStats.supervisors}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">More Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Technicians:</span>
                <span className="font-semibold">{userStats.technicians}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Viewers:</span>
                <span className="font-semibold">{userStats.viewers}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">By Tenant</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Internal:</span>
                <span className="font-semibold">{userStats.internal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Demo:</span>
                <span className="font-semibold">{userStats.demo}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main User Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user roles and permissions. New SSO users start as 'viewer' and can be promoted as needed.
              </CardDescription>
            </div>
            <InviteUserDialog />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={roleFilter} onValueChange={(value: any) => setRoleFilter(value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="supervisor">Supervisor</SelectItem>
                <SelectItem value="technician">Technician</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>

            <Select value={tenantFilter} onValueChange={(value: any) => setTenantFilter(value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by tenant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tenants</SelectItem>
                <SelectItem value="internal">Internal</SelectItem>
                <SelectItem value="demo">Demo</SelectItem>
              </SelectContent>
            </Select>

            {(searchQuery || roleFilter !== "all" || tenantFilter !== "all") && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery("");
                  setRoleFilter("all");
                  setTenantFilter("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {filteredUsers.length} of {users.length} users
          </div>

          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Tenant</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  {searchQuery || roleFilter !== "all" || tenantFilter !== "all"
                    ? "No users match your filters"
                    : "No users found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => {
                const RoleIcon = roleIcons[user.role];
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>{user.full_name || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={user.tenant_type === "internal" ? "default" : "secondary"}>
                        {user.tenant_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <RoleIcon className="h-4 w-4" />
                        <Badge variant={roleColors[user.role]}>
                          {user.role}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        value={user.role}
                        onValueChange={(newRole: UserRole) =>
                          handleRoleChange(user.id, user.role_id, newRole)
                        }
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">
                            <div className="flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              Viewer
                            </div>
                          </SelectItem>
                          <SelectItem value="technician">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Technician
                            </div>
                          </SelectItem>
                          <SelectItem value="supervisor">
                            <div className="flex items-center gap-2">
                              <Wrench className="h-4 w-4" />
                              Supervisor
                            </div>
                          </SelectItem>
                          <SelectItem value="admin">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              Admin
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        </CardContent>
      </Card>
    </div>
  );
}
