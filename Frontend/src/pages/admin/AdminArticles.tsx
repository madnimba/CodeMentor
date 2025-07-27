import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, Search, Edit, Trash2, ArrowLeft, 
  CheckCircle, XCircle, Eye, Calendar, User, Tag
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { adminService, AdminArticle, PaginatedResponse } from "@/services/admin";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminArticles = () => {
  const location = useLocation();
  const isUnapproved = location.pathname.includes('/unapproved');
  
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);
  
  // View article state
  const [selectedArticle, setSelectedArticle] = useState<AdminArticle | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, [currentPage, pageSize, isUnapproved]);

  const fetchArticles = async () => {
    try {
      console.log('AdminArticles.fetchArticles called with:', { currentPage, pageSize, isUnapproved });
      setLoading(true);
      const response: PaginatedResponse<AdminArticle> = isUnapproved 
        ? await adminService.getUnapprovedArticles(currentPage, pageSize)
        : await adminService.getAllArticles(currentPage, pageSize);
      console.log('AdminArticles.fetchArticles response:', response);
      setArticles(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err: any) {
      console.error('AdminArticles.fetchArticles error:', err);
      setError(err?.response?.data?.message || "Failed to load articles");
      toast.error("Failed to load articles");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveArticle = async (articleId: number) => {
    try {
      await adminService.approveArticle(articleId);
      toast.success("Article approved successfully");
      fetchArticles();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to approve article");
    }
  };

  const handleDeleteArticle = async (articleId: number) => {
    if (!confirm("Are you sure you want to delete this article? This action cannot be undone.")) {
      return;
    }

    try {
      await adminService.deleteArticle(articleId);
      toast.success("Article deleted successfully");
      fetchArticles();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete article");
    }
  };

  const handleViewArticle = (article: AdminArticle) => {
    setSelectedArticle(article);
    setIsViewDialogOpen(true);
  };

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.createdBy?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-slate-900">
        <div className="pt-24 pb-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
            <p className="text-slate-400 mt-4">Loading articles...</p>
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
              <FileText className="w-12 h-12 text-cyan-400" />
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  {isUnapproved ? "Pending Articles" : "Article Management"}
                </h1>
                <p className="text-slate-400 text-lg">
                  {isUnapproved ? "Review and approve pending articles" : "Manage all articles and study materials"}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <Tabs value={isUnapproved ? "unapproved" : "all"} className="mb-6">
            <TabsList className="bg-slate-800/50 border-slate-700">
              <TabsTrigger value="all" asChild>
                <Link to="/admin/articles" className="data-[state=active]:bg-cyan-600">
                  All Articles
                </Link>
              </TabsTrigger>
              <TabsTrigger value="unapproved" asChild>
                <Link to="/admin/articles/unapproved" className="data-[state=active]:bg-orange-600">
                  Pending Approval
                </Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search and Stats */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search articles by title or author..."
                className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4">
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                {totalElements} {isUnapproved ? "Pending" : "Total"} Articles
              </Badge>
            </div>
          </div>

          {/* Articles Grid */}
          <div className="grid gap-6">
            {filteredArticles.map((article) => (
              <Card key={article.id} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg mb-2">{article.title}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {article.createdBy || "Unknown"}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(article.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Tag className="w-4 h-4" />
                          {article.questionCount} questions
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {article.track && (
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                            {article.track}
                          </Badge>
                        )}
                        {article.topic && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            {article.topic}
                          </Badge>
                        )}
                        {article.subtopic && (
                          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                            {article.subtopic}
                          </Badge>
                        )}
                        <Badge className={
                          article.isApproved 
                            ? "bg-green-500/20 text-green-400 border-green-500/30" 
                            : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                        }>
                          {article.isApproved ? "Approved" : "Pending"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewArticle(article)}
                        className="text-cyan-400 hover:text-cyan-300"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {!article.isApproved && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleApproveArticle(article.id)}
                          className="text-green-400 hover:text-green-300"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteArticle(article.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 text-sm line-clamp-3">
                    {article.content.substring(0, 200)}...
                  </p>
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

          {/* View Article Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="bg-slate-800 border-slate-700 max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">{selectedArticle?.title}</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Article details and content
                </DialogDescription>
              </DialogHeader>
              {selectedArticle && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-slate-400">Author</Label>
                      <p className="text-white">{selectedArticle.createdBy || "Unknown"}</p>
                    </div>
                    <div>
                      <Label className="text-slate-400">Created</Label>
                      <p className="text-white">{new Date(selectedArticle.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-slate-400">Track</Label>
                      <p className="text-white">{selectedArticle.track || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-slate-400">Topic</Label>
                      <p className="text-white">{selectedArticle.topic || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-slate-400">Subtopic</Label>
                      <p className="text-white">{selectedArticle.subtopic || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-slate-400">Status</Label>
                      <Badge className={
                        selectedArticle.isApproved 
                          ? "bg-green-500/20 text-green-400 border-green-500/30" 
                          : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                      }>
                        {selectedArticle.isApproved ? "Approved" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                  
                  {selectedArticle.jobRoles.length > 0 && (
                    <div>
                      <Label className="text-slate-400">Job Roles</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedArticle.jobRoles.map((role, index) => (
                          <Badge key={index} className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <Label className="text-slate-400">Content</Label>
                    <div className="mt-2 p-4 bg-slate-900 rounded-lg border border-slate-600">
                      <div className="prose prose-invert max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: selectedArticle.content }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default AdminArticles; 