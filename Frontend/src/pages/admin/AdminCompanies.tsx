import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, Search, Edit, Trash2, ArrowLeft, 
  Plus, Globe, MapPin, FileText
} from "lucide-react";
import { Link } from "react-router-dom";
import { adminService, AdminCompany, PaginatedResponse, CreateCompanyRequest, UpdateCompanyRequest } from "@/services/admin";
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

const AdminCompanies = () => {
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);
  
  // Create/Edit company state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<AdminCompany | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [companyForm, setCompanyForm] = useState({
    name: "",
    logoUrl: "",
    country: "",
    description: ""
  });

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response: PaginatedResponse<AdminCompany> = await adminService.getAllCompanies(currentPage, pageSize);
      setCompanies(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load companies");
      toast.error("Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const response: PaginatedResponse<AdminCompany> = await adminService.searchCompanies(
        searchQuery || undefined,
        currentPage,
        pageSize
      );
      setCompanies(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to search companies");
      toast.error("Failed to search companies");
    } finally {
      setLoading(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim() === '') {
        fetchCompanies();
      } else {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, currentPage, pageSize]);

  useEffect(() => {
    fetchCompanies();
  }, [currentPage, pageSize]);

  const handleCreateCompany = async () => {
    setIsSubmitting(true);
    try {
      const createData: CreateCompanyRequest = {
        name: companyForm.name,
        logoUrl: companyForm.logoUrl || undefined,
        country: companyForm.country || undefined,
        description: companyForm.description || undefined
      };
      
      await adminService.createCompany(createData);
      toast.success("Company created successfully");
      setIsCreateDialogOpen(false);
      setCompanyForm({ name: "", logoUrl: "", country: "", description: "" });
      fetchCompanies();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create company");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCompany = (company: AdminCompany) => {
    setEditingCompany(company);
    setCompanyForm({
      name: company.name,
      logoUrl: company.logoUrl || "",
      country: company.country || "",
      description: company.description || ""
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateCompany = async () => {
    if (!editingCompany) return;
    
    setIsSubmitting(true);
    try {
      const updateData: UpdateCompanyRequest = {
        name: companyForm.name,
        logoUrl: companyForm.logoUrl || undefined,
        country: companyForm.country || undefined,
        description: companyForm.description || undefined
      };
      
      await adminService.updateCompany(editingCompany.id, updateData);
      toast.success("Company updated successfully");
      setIsEditDialogOpen(false);
      fetchCompanies();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update company");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCompany = async (companyId: number) => {
    if (!confirm("Are you sure you want to delete this company? This action cannot be undone.")) {
      return;
    }

    try {
      await adminService.deleteCompany(companyId);
      toast.success("Company deleted successfully");
      fetchCompanies();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete company");
    }
  };

  // Client-side filtering removed - now using server-side search

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-slate-900">
        <div className="pt-24 pb-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
            <p className="text-slate-400 mt-4">Loading companies...</p>
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
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Building2 className="w-12 h-12 text-green-400" />
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">Company Management</h1>
                  <p className="text-slate-400 text-lg">
                    Manage company information and question banks
                  </p>
                </div>
              </div>
              
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Company
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Create New Company</DialogTitle>
                    <DialogDescription className="text-slate-400">
                      Add a new company to the platform
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-slate-300">Company Name *</Label>
                      <Input
                        id="name"
                        value={companyForm.name}
                        onChange={(e) => setCompanyForm({...companyForm, name: e.target.value})}
                        className="bg-slate-900 border-slate-600 text-white"
                        placeholder="Enter company name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="logoUrl" className="text-slate-300">Logo URL</Label>
                      <Input
                        id="logoUrl"
                        value={companyForm.logoUrl}
                        onChange={(e) => setCompanyForm({...companyForm, logoUrl: e.target.value})}
                        className="bg-slate-900 border-slate-600 text-white"
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country" className="text-slate-300">Country</Label>
                      <Input
                        id="country"
                        value={companyForm.country}
                        onChange={(e) => setCompanyForm({...companyForm, country: e.target.value})}
                        className="bg-slate-900 border-slate-600 text-white"
                        placeholder="Enter country"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description" className="text-slate-300">Description</Label>
                      <Textarea
                        id="description"
                        value={companyForm.description}
                        onChange={(e) => setCompanyForm({...companyForm, description: e.target.value})}
                        className="bg-slate-900 border-slate-600 text-white"
                        placeholder="Enter company description"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={handleCreateCompany}
                        disabled={isSubmitting || !companyForm.name.trim()}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {isSubmitting ? "Creating..." : "Create Company"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                        className="border-slate-600 text-slate-300"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Search and Stats */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search companies by name or country..."
                className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                {totalElements} Total Companies
              </Badge>
            </div>
          </div>

          {/* Companies Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <Card key={company.id} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg mb-2">{company.name}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                        {company.country && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {company.country}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {company.questionCount} questions
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditCompany(company)}
                        className="text-green-400 hover:text-green-300"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCompany(company.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {company.logoUrl && (
                    <div className="mb-3">
                      <img 
                        src={company.logoUrl} 
                        alt={`${company.name} logo`}
                        className="w-16 h-16 object-contain rounded-lg bg-slate-700"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  {company.description && (
                    <p className="text-slate-300 text-sm line-clamp-3">
                      {company.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-8">
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

          {/* Edit Company Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Edit Company</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Update company information
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name" className="text-slate-300">Company Name *</Label>
                  <Input
                    id="edit-name"
                    value={companyForm.name}
                    onChange={(e) => setCompanyForm({...companyForm, name: e.target.value})}
                    className="bg-slate-900 border-slate-600 text-white"
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-logoUrl" className="text-slate-300">Logo URL</Label>
                  <Input
                    id="edit-logoUrl"
                    value={companyForm.logoUrl}
                    onChange={(e) => setCompanyForm({...companyForm, logoUrl: e.target.value})}
                    className="bg-slate-900 border-slate-600 text-white"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-country" className="text-slate-300">Country</Label>
                  <Input
                    id="edit-country"
                    value={companyForm.country}
                    onChange={(e) => setCompanyForm({...companyForm, country: e.target.value})}
                    className="bg-slate-900 border-slate-600 text-white"
                    placeholder="Enter country"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description" className="text-slate-300">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={companyForm.description}
                    onChange={(e) => setCompanyForm({...companyForm, description: e.target.value})}
                    className="bg-slate-900 border-slate-600 text-white"
                    placeholder="Enter company description"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleUpdateCompany}
                    disabled={isSubmitting || !companyForm.name.trim()}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? "Updating..." : "Update Company"}
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
        </div>
      </div>
    </div>
  );
};

export default AdminCompanies; 