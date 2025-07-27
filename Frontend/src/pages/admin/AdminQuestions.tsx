import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Code2, Search, Edit, Trash2, ArrowLeft, 
  CheckCircle, Eye, Calendar, User, Zap, Target
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { adminService, AdminQuestion, PaginatedResponse } from "@/services/admin";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AdminQuestions = () => {
  const location = useLocation();
  const isUnapproved = location.pathname.includes('/unapproved');
  
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);
  
  // View question state
  const [selectedQuestion, setSelectedQuestion] = useState<AdminQuestion | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [currentPage, pageSize, isUnapproved]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response: PaginatedResponse<AdminQuestion> = isUnapproved 
        ? await adminService.getUnapprovedQuestions(currentPage, pageSize)
        : await adminService.getAllQuestions(currentPage, pageSize);
      setQuestions(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load questions");
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveQuestion = async (questionId: number) => {
    try {
      await adminService.approveQuestion(questionId);
      toast.success("Question approved successfully");
      fetchQuestions();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to approve question");
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm("Are you sure you want to delete this question? This action cannot be undone.")) {
      return;
    }

    try {
      await adminService.deleteQuestion(questionId);
      toast.success("Question deleted successfully");
      fetchQuestions();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete question");
    }
  };

  const handleViewQuestion = (question: AdminQuestion) => {
    setSelectedQuestion(question);
    setIsViewDialogOpen(true);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case 'medium':
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case 'hard':
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const filteredQuestions = questions.filter(question =>
    question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    question.createdBy?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-slate-900">
        <div className="pt-24 pb-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
            <p className="text-slate-400 mt-4">Loading questions...</p>
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
              <Code2 className="w-12 h-12 text-purple-400" />
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  {isUnapproved ? "Pending Questions" : "Question Management"}
                </h1>
                <p className="text-slate-400 text-lg">
                  {isUnapproved ? "Review and approve pending questions" : "Manage all coding questions and test cases"}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <Tabs value={isUnapproved ? "unapproved" : "all"} className="mb-6">
            <TabsList className="bg-slate-800/50 border-slate-700">
              <TabsTrigger value="all" asChild>
                <Link to="/admin/questions" className="data-[state=active]:bg-purple-600">
                  All Questions
                </Link>
              </TabsTrigger>
              <TabsTrigger value="unapproved" asChild>
                <Link to="/admin/questions/unapproved" className="data-[state=active]:bg-orange-600">
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
                placeholder="Search questions by title or author..."
                className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4">
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                {totalElements} {isUnapproved ? "Pending" : "Total"} Questions
              </Badge>
            </div>
          </div>

          {/* Questions Grid */}
          <div className="grid gap-6">
            {filteredQuestions.map((question) => (
              <Card key={question.id} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg mb-2">{question.title}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {question.createdBy || "Unknown"}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(question.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          {question.testcaseCount} testcases
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="w-4 h-4" />
                          {question.solutionCount} solutions
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge className={getDifficultyColor(question.difficulty)}>
                          {question.difficulty}
                        </Badge>
                        {question.track && (
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                            {question.track}
                          </Badge>
                        )}
                        {question.subtopic && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            {question.subtopic}
                          </Badge>
                        )}
                        {question.importanceTag && (
                          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                            {question.importanceTag}
                          </Badge>
                        )}
                        <Badge className={
                          question.isApproved 
                            ? "bg-green-500/20 text-green-400 border-green-500/30" 
                            : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                        }>
                          {question.isApproved ? "Approved" : "Pending"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewQuestion(question)}
                        className="text-purple-400 hover:text-purple-300"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {!question.isApproved && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleApproveQuestion(question.id)}
                          className="text-green-400 hover:text-green-300"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 text-sm line-clamp-3">
                    {question.description.substring(0, 200)}...
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

          {/* View Question Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="bg-slate-800 border-slate-700 max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">{selectedQuestion?.title}</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Question details and description
                </DialogDescription>
              </DialogHeader>
              {selectedQuestion && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-slate-400">Author</Label>
                      <p className="text-white">{selectedQuestion.createdBy || "Unknown"}</p>
                    </div>
                    <div>
                      <Label className="text-slate-400">Created</Label>
                      <p className="text-white">{new Date(selectedQuestion.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-slate-400">Difficulty</Label>
                      <Badge className={getDifficultyColor(selectedQuestion.difficulty)}>
                        {selectedQuestion.difficulty}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-slate-400">Status</Label>
                      <Badge className={
                        selectedQuestion.isApproved 
                          ? "bg-green-500/20 text-green-400 border-green-500/30" 
                          : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                      }>
                        {selectedQuestion.isApproved ? "Approved" : "Pending"}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-slate-400">Track</Label>
                      <p className="text-white">{selectedQuestion.track || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-slate-400">Subtopic</Label>
                      <p className="text-white">{selectedQuestion.subtopic || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-slate-400">Test Cases</Label>
                      <p className="text-white">{selectedQuestion.testcaseCount}</p>
                    </div>
                    <div>
                      <Label className="text-slate-400">Solutions</Label>
                      <p className="text-white">{selectedQuestion.solutionCount}</p>
                    </div>
                  </div>
                  
                  {selectedQuestion.importanceTag && (
                    <div>
                      <Label className="text-slate-400">Importance Tag</Label>
                      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                        {selectedQuestion.importanceTag}
                      </Badge>
                    </div>
                  )}
                  
                  <div>
                    <Label className="text-slate-400">Description</Label>
                    <div className="mt-2 p-4 bg-slate-900 rounded-lg border border-slate-600">
                      <div className="prose prose-invert max-w-none">
                        <div className="whitespace-pre-wrap text-slate-300">
                          {selectedQuestion.description}
                        </div>
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

export default AdminQuestions; 