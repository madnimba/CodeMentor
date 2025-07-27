import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Shield, Users, FileText, Code2, Building2, 
  LogOut, BarChart3
} from "lucide-react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

const AdminNavigation = () => {
  const location = useLocation();
  const { signOut } = useAdminAuth();

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: BarChart3,
      current: location.pathname === "/admin/dashboard"
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: Users,
      current: location.pathname === "/admin/users"
    },
    {
      name: "Articles",
      href: "/admin/articles",
      icon: FileText,
      current: location.pathname.startsWith("/admin/articles")
    },
    {
      name: "Questions",
      href: "/admin/questions",
      icon: Code2,
      current: location.pathname.startsWith("/admin/questions")
    },
    {
      name: "Companies",
      href: "/admin/companies",
      icon: Building2,
      current: location.pathname === "/admin/companies"
    }
  ];

  const handleSignOut = () => {
    signOut();
  };

  return (
    <nav className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-red-600 to-orange-600 p-2 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            </div>
            
            <div className="hidden md:flex items-center gap-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.name}
                    asChild
                    variant={item.current ? "default" : "ghost"}
                    className={
                      item.current 
                        ? "bg-red-600 hover:bg-red-700 text-white" 
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }
                  >
                    <Link to={item.href}>
                      <Icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>
          
          <Button onClick={handleSignOut} variant="ghost" className="text-slate-400 hover:text-white">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavigation; 