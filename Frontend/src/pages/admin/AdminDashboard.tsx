import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, Building2, FileText, Code2, 
  TrendingUp, AlertTriangle, Clock, Calendar,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { adminService, AdminDashboardStats } from "@/services/admin";
import { toast } from "sonner";
import AdminNavigation from "../../components/admin/AdminNavigation";

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getDashboardStats();
        setStats(data);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load dashboard stats");
        toast.error("Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Removed handleSignOut as it's now handled in AdminNavigation

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-slate-900">
        <div className="pt-24 pb-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
            <p className="text-slate-400 mt-4">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-slate-900">
        <div className="pt-24 pb-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-red-400">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-slate-900">
      {/* Header */}
      <AdminNavigation />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome to Admin Dashboard 👋
            </h1>
            <p className="text-slate-400 text-lg">
              Manage your platform's content, users, and settings
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">{stats?.totalUsers || 0}</div>
                <div className="text-sm text-slate-400">Total Users</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6 text-center">
                <Building2 className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">{stats?.totalCompanies || 0}</div>
                <div className="text-sm text-slate-400">Companies</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6 text-center">
                <Code2 className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">{stats?.totalQuestions || 0}</div>
                <div className="text-sm text-slate-400">Questions</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6 text-center">
                <FileText className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">{stats?.totalArticles || 0}</div>
                <div className="text-sm text-slate-400">Articles</div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Approvals */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-red-900/20 border-red-800">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Pending Article Approvals
                </CardTitle>
                <CardDescription className="text-red-300">
                  Articles waiting for admin approval
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-400 mb-2">{stats?.unapprovedArticles || 0}</div>
                <Button asChild variant="outline" className="border-red-700 text-red-400 hover:bg-red-900/20">
                  <Link to="/admin/articles/unapproved">
                    Review Articles <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-orange-900/20 border-orange-800">
              <CardHeader>
                <CardTitle className="text-orange-400 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Pending Question Approvals
                </CardTitle>
                <CardDescription className="text-orange-300">
                  Questions waiting for admin approval
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-400 mb-2">{stats?.unapprovedQuestions || 0}</div>
                <Button asChild variant="outline" className="border-orange-700 text-orange-400 hover:bg-orange-900/20">
                  <Link to="/admin/questions/unapproved">
                    Review Questions <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-4">Content Management</h2>
              
              <div className="grid gap-4">
                <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-400" />
                      User Management
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Manage user accounts, roles, and permissions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                      <Link to="/admin/users">
                        Manage Users <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-cyan-400" />
                      Article Management
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Create, edit, and approve study materials
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full bg-cyan-600 hover:bg-cyan-700">
                      <Link to="/admin/articles">
                        Manage Articles <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Code2 className="w-5 h-5 text-purple-400" />
                      Question Management
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Manage coding questions and test cases
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                      <Link to="/admin/questions">
                        Manage Questions <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-4">Platform Management</h2>
              
              <div className="grid gap-4">
                <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-green-400" />
                      Company Management
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Add and manage company information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                      <Link to="/admin/companies">
                        Manage Companies <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-yellow-400" />
                      Analytics
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      View platform analytics and insights
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Active Users Today</span>
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                          {stats?.activeUsersToday || 0}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">New Users This Week</span>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          {stats?.newUsersThisWeek || 0}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-red-400" />
                      System Status
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Monitor system health and performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">System Status</span>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          Operational
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Last Updated</span>
                        <span className="text-slate-300 text-sm">
                          {new Date().toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 