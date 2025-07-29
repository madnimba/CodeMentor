import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, Search, Edit, Trash2, ArrowLeft, 
  User, Mail, Calendar, Eye, EyeOff
} from "lucide-react";
import { Link } from "react-router-dom";
import { adminService, AdminUser, PaginatedResponse } from "@/services/admin";
import { toast } from "sonner";
import AdminNavigation from "../../components/admin/AdminNavigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AdminUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTrigger, setSearchTrigger] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);
  
  // Edit user state
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState({
    email: "",
    username: "",
    themePreference: "",
    languagePreference: "",
    isAdmin: false
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response: PaginatedResponse<AdminUser> = await adminService.getAllUsers(currentPage, pageSize);
      setUsers(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load users");
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const response: PaginatedResponse<AdminUser> = await adminService.searchUsers(
        searchQuery || undefined,
        undefined, // isAdmin - not filtering by admin status in search
        currentPage,
        pageSize
      );
      setUsers(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to search users");
      toast.error("Failed to search users");
    } finally {
      setLoading(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim() === '') {
        fetchUsers();
      } else {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, currentPage, pageSize]);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, pageSize]);

  const handleEditUser = (user: AdminUser) => {
    setEditingUser(user);
    setEditForm({
      email: user.email,
      username: user.username,
      themePreference: user.themePreference || "",
      languagePreference: user.languagePreference || "",
      isAdmin: user.isAdmin
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    setIsSubmitting(true);
    try {
      await adminService.updateUser(editingUser.id, editForm);
      toast.success("User updated successfully");
      setIsEditDialogOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      await adminService.deleteUser(userId);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete user");
    }
  };

  // Client-side filtering removed - now using server-side search

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-slate-900">
        <div className="pt-24 pb-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
            <p className="text-slate-400 mt-4">Loading users...</p>
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
      <AdminNavigation />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button asChild variant="ghost" className="text-slate-400 hover:text-white mb-4">
              <Link to="/admin/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            
            <div className="flex items-center gap-4">
              <Users className="w-12 h-12 text-blue-400" />
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">User Management</h1>
                <p className="text-slate-400 text-lg">
                  Manage user accounts and permissions
                </p>
              </div>
            </div>
          </div>

          {/* Search and Stats */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search users by username or email..."
                className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4">
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                {totalElements} Total Users
              </Badge>
            </div>
          </div>

          {/* Users Table */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Users</CardTitle>
              <CardDescription className="text-slate-400">
                Manage user accounts and their permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left p-3 text-slate-300 font-medium">User</th>
                      <th className="text-left p-3 text-slate-300 font-medium">Email</th>
                      <th className="text-left p-3 text-slate-300 font-medium">Role</th>
                      <th className="text-left p-3 text-slate-300 font-medium">Joined</th>
                      <th className="text-left p-3 text-slate-300 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-slate-300" />
                            </div>
                            <div>
                              <div className="text-white font-medium">{user.username}</div>
                              <div className="text-slate-400 text-sm">ID: {user.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-300">{user.email}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge className={
                            user.isAdmin 
                              ? "bg-red-500/20 text-red-400 border-red-500/30" 
                              : "bg-slate-500/20 text-slate-400 border-slate-500/30"
                          }>
                            {user.isAdmin ? "Admin" : "User"}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-300 text-sm">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditUser(user)}
                                  className="text-blue-400 hover:text-blue-300"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-slate-800 border-slate-700">
                                <DialogHeader>
                                  <DialogTitle className="text-white">Edit User</DialogTitle>
                                  <DialogDescription className="text-slate-400">
                                    Update user information and permissions
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="email" className="text-slate-300">Email</Label>
                                    <Input
                                      id="email"
                                      value={editForm.email}
                                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                      className="bg-slate-900 border-slate-600 text-white"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="username" className="text-slate-300">Username</Label>
                                    <Input
                                      id="username"
                                      value={editForm.username}
                                      onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                                      className="bg-slate-900 border-slate-600 text-white"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="theme" className="text-slate-300">Theme Preference</Label>
                                    <Input
                                      id="theme"
                                      value={editForm.themePreference}
                                      onChange={(e) => setEditForm({...editForm, themePreference: e.target.value})}
                                      className="bg-slate-900 border-slate-600 text-white"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="language" className="text-slate-300">Language Preference</Label>
                                    <Input
                                      id="language"
                                      value={editForm.languagePreference}
                                      onChange={(e) => setEditForm({...editForm, languagePreference: e.target.value})}
                                      className="bg-slate-900 border-slate-600 text-white"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="role" className="text-slate-300">Role</Label>
                                    <Select
                                      value={editForm.isAdmin ? "admin" : "user"}
                                      onValueChange={(value) => setEditForm({...editForm, isAdmin: value === "admin"})}
                                    >
                                      <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent className="bg-slate-800 border-slate-600">
                                        <SelectItem value="user">User</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="flex gap-2 pt-4">
                                    <Button
                                      onClick={handleUpdateUser}
                                      disabled={isSubmitting}
                                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                                    >
                                      {isSubmitting ? "Updating..." : "Update User"}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => setIsEditDialogOpen(false)}
                                      className="border-slate-600 text-slate-300"
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6">
                  <div className="text-slate-400 text-sm">
                    Page {currentPage + 1} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0}
                      className="border-slate-600 text-slate-300"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                      disabled={currentPage === totalPages - 1}
                      className="border-slate-600 text-slate-300"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers; 