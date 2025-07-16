import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Search, Edit, Trash2, Eye, Calendar, User } from "lucide-react";
import { templateEntityService, TemplateEntity, CreateTemplateEntityRequest } from "@/services/templateEntity";

const TemplateEntityPage = () => {
  const [entities, setEntities] = useState<TemplateEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<TemplateEntity | null>(null);
  const [formData, setFormData] = useState<CreateTemplateEntityRequest>({
    name: "",
    description: "",
    status: "DRAFT",
    isActive: true,
  });

  // Load entities on component mount
  useEffect(() => {
    loadEntities();
  }, [currentPage]);

  const loadEntities = async () => {
    setLoading(true);
    try {
      const response = await templateEntityService.getAll({
        page: currentPage,
        size: 10,
      });
      setEntities(response.content);
      setTotalPages(response.totalPages);
      setError(null);
    } catch (err) {
      setError("Failed to load template entities");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadEntities();
      return;
    }

    setLoading(true);
    try {
      const response = await templateEntityService.search(searchTerm, currentPage, 10);
      setEntities(response.content);
      setTotalPages(response.totalPages);
      setError(null);
    } catch (err) {
      setError("Failed to search template entities");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await templateEntityService.create(formData);
      setIsCreateDialogOpen(false);
      setFormData({ name: "", description: "", status: "DRAFT", isActive: true });
      loadEntities();
    } catch (err) {
      setError("Failed to create template entity");
      console.error(err);
    }
  };

  const handleUpdate = async () => {
    if (!editingEntity) return;

    try {
      await templateEntityService.update(editingEntity.id, formData);
      setIsEditDialogOpen(false);
      setEditingEntity(null);
      setFormData({ name: "", description: "", status: "DRAFT", isActive: true });
      loadEntities();
    } catch (err) {
      setError("Failed to update template entity");
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await templateEntityService.delete(id);
      loadEntities();
    } catch (err) {
      setError("Failed to delete template entity");
      console.error(err);
    }
  };

  const openEditDialog = (entity: TemplateEntity) => {
    setEditingEntity(entity);
    setFormData({
      name: entity.name,
      description: entity.description || "",
      status: entity.status as any,
      isActive: entity.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "DRAFT":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "ARCHIVED":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  if (loading && entities.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
        <Header />
        <div className="pt-24 pb-16 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="text-slate-400 mt-4">Loading template entities...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      <Header />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Template Entities</h1>
              <p className="text-slate-400">Manage your template entities</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Create Template Entity</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Add a new template entity to the system.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-slate-300">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-slate-300">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="status" className="text-slate-300">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="PUBLISHED">Published</SelectItem>
                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="border-slate-600 text-slate-300">
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} className="bg-purple-600 hover:bg-purple-700">
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search template entities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <Button onClick={handleSearch} className="bg-slate-700 hover:bg-slate-600">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-400 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Entities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entities.map((entity) => (
              <Card key={entity.id} className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg">{entity.name}</CardTitle>
                      <CardDescription className="text-slate-400 mt-2">
                        {entity.description || "No description"}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusBadgeColor(entity.status)}>
                      {entity.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <User className="w-4 h-4" />
                      <span>{entity.createdByUsername}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(entity.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(entity)}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-600 text-red-400 hover:bg-red-600/20"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-slate-800 border-slate-700">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">Delete Template Entity</AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-400">
                              Are you sure you want to delete "{entity.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-slate-600 text-slate-300">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(entity.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="border-slate-600 text-slate-300"
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-slate-400">
                  Page {currentPage + 1} of {totalPages}
                </span>
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

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Edit Template Entity</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Update the template entity information.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name" className="text-slate-300">Name</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description" className="text-slate-300">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-status" className="text-slate-300">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-slate-600 text-slate-300">
                  Cancel
                </Button>
                <Button onClick={handleUpdate} className="bg-purple-600 hover:bg-purple-700">
                  Update
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TemplateEntityPage; 