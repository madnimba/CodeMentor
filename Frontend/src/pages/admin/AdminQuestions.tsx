import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Markdown } from "@/components/ui/markdown";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Code2, Search, Edit, Trash2, ArrowLeft, 
  CheckCircle, Eye, Calendar, User, Zap, Target, Filter, X
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { adminService, AdminQuestion, PaginatedResponse } from "@/services/admin";
import { studyMaterialService, Track, Topic, Subtopic } from "@/services/studyMaterials";
import { companiesService, Company } from "@/services/companies";
import { toast } from "sonner";
import AdminNavigation from "../../components/admin/AdminNavigation";
import { TestcaseManager } from "@/components/admin/TestcaseManager";
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
import { Switch } from "@/components/ui/switch";

interface FilterState {
  searchTerm: string;
  trackId: number | undefined;
  topicId: number | undefined;
  subtopicId: number | undefined;
  difficulty: string;
  year: number | undefined;
  companyId: number | undefined;
  isCoding: boolean | undefined;
  isApproved: boolean | undefined;
}

const AdminQuestions = () => {
  const location = useLocation();
  const isUnapproved = location.pathname.includes('/unapproved');
  
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: "",
    trackId: undefined,
    topicId: undefined,
    subtopicId: undefined,
    difficulty: "all",
    year: undefined,
    companyId: undefined,
    isCoding: undefined,
    isApproved: isUnapproved ? false : undefined,
  });

  // Filter options
  const [tracks, setTracks] = useState<Track[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [allSubtopics, setAllSubtopics] = useState<Subtopic[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [years, setYears] = useState<number[]>([]);
  
  // View question state
  const [selectedQuestion, setSelectedQuestion] = useState<AdminQuestion | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  // Edit question state
  const [editingQuestion, setEditingQuestion] = useState<AdminQuestion | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    difficulty: "Medium" as "Easy" | "Medium" | "Hard",
    importanceTag: "",
    year: 2024,
    isCoding: false,
    trackId: 0,
    subtopicId: undefined as number | undefined,
  });
  
  // Testcase manager state
  const [isTestcaseManagerOpen, setIsTestcaseManagerOpen] = useState(false);
  const [selectedQuestionForTestcases, setSelectedQuestionForTestcases] = useState<number | null>(null);

  // Update filter
  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(0); // Reset to first page when filters change
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      searchTerm: "",
      trackId: undefined,
      topicId: undefined,
      subtopicId: undefined,
      difficulty: "all",
      year: undefined,
      companyId: undefined,
      isCoding: undefined,
      isApproved: isUnapproved ? false : undefined,
    });
    setCurrentPage(0);
  };

  // Load filter options
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [tracksData, companiesData] = await Promise.all([
          studyMaterialService.getAllTracks(),
          companiesService.getAllCompanies()
        ]);
        
        setTracks(tracksData);
        setCompanies(companiesData);
        
        // Generate years (current year and previous 5 years)
        const currentYear = new Date().getFullYear();
        const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);
        setYears(yearOptions);
        
        // Load all topics and subtopics for filtering
        const allTopics: Topic[] = [];
        const allSubtopicsData: Subtopic[] = [];
        
        for (const track of tracksData) {
          const trackTopics = await studyMaterialService.getTopicsByTrackId(track.id);
          allTopics.push(...trackTopics);
          
          for (const topic of trackTopics) {
            const topicSubtopics = await studyMaterialService.getSubtopicsByTopicId(topic.id);
            allSubtopicsData.push(...topicSubtopics);
          }
        }
        
        setTopics(allTopics);
        setAllSubtopics(allSubtopicsData);
      } catch (err) {
        console.error("Failed to load filter options:", err);
      }
    };
    
    loadFilterOptions();
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [currentPage, pageSize, isUnapproved, filters]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      
      // Use comprehensive filtering if any filters are applied
      const hasFilters = filters.searchTerm.trim() || 
                        filters.trackId || 
                        filters.topicId || 
                        filters.subtopicId || 
                        (filters.difficulty && filters.difficulty !== "all") ||
                        filters.year || 
                        filters.companyId ||
                        filters.isCoding !== undefined ||
                        filters.isApproved !== undefined;

      let response: PaginatedResponse<AdminQuestion>;
      
      if (hasFilters) {
        response = await adminService.getQuestionsWithFilters(
          filters.searchTerm.trim() || undefined,
          filters.trackId,
          filters.topicId,
          filters.subtopicId,
          filters.difficulty !== "all" ? filters.difficulty : undefined,
          filters.year,
          filters.companyId,
          filters.isCoding,
          filters.isApproved,
          currentPage,
          pageSize
        );
      } else {
        response = isUnapproved 
          ? await adminService.getUnapprovedQuestions(currentPage, pageSize)
          : await adminService.getAllQuestions(currentPage, pageSize);
      }
      
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

  const handleEditQuestion = (question: AdminQuestion) => {
    setEditingQuestion(question);
    setEditForm({
      title: question.title,
      description: question.description,
      difficulty: question.difficulty as "Easy" | "Medium" | "Hard",
      importanceTag: question.importanceTag || "",
      year: question.year,
      isCoding: question.isCoding,
      trackId: 0, // Default value since AdminQuestion doesn't have trackId
      subtopicId: undefined, // Default value since AdminQuestion doesn't have subtopicId
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return;

    try {
      await adminService.updateQuestion(editingQuestion.id, editForm);
      toast.success("Question updated successfully");
      setIsEditDialogOpen(false);
      setEditingQuestion(null);
      fetchQuestions();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update question");
    }
  };

  const handleViewTestcases = (questionId: number) => {
    setSelectedQuestionForTestcases(questionId);
    setIsTestcaseManagerOpen(true);
  };

  const handleEditTestcases = (questionId: number) => {
    setSelectedQuestionForTestcases(questionId);
    setIsTestcaseManagerOpen(true);
  };

  const handleDeleteTestcases = async (questionId: number) => {
    if (!confirm("Are you sure you want to delete all testcases for this question? This action cannot be undone.")) {
      return;
    }

    try {
      // TODO: Implement testcase deletion API call
      toast.success("Testcases deleted successfully");
      fetchQuestions();
    } catch (err: any) {
      toast.error("Failed to delete testcases");
    }
  };

  const handleBulkApprove = async () => {
    if (!confirm("Are you sure you want to approve all pending questions? This action cannot be undone.")) {
      return;
    }

    try {
      const result = await adminService.approveAllQuestions();
      toast.success(result.message);
      fetchQuestions();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to approve all questions");
    }
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

  // Client-side filtering removed - now using server-side search

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
          <div className="flex flex-col gap-6 mb-6">
            {/* Search and Filter Section */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left side - Search and primary filters */}
              <div className="lg:col-span-3 space-y-4">
                <div className="relative">
                  {/* <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" /> */}
                  {/* <Input
                    placeholder="Search questions by title, description, or author..."
                    className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400"
                    value={filters.searchTerm}
                    onChange={(e) => updateFilter("searchTerm", e.target.value)}
                  /> */}
                </div>
                
                {/* Active Filters Display */}
                {/* {(filters.searchTerm || filters.trackId || filters.topicId || filters.subtopicId || 
                  (filters.difficulty && filters.difficulty !== "all") || filters.year || filters.companyId ||
                  filters.isCoding !== undefined) && (
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm text-slate-400">Active filters:</span>
                    
                    {filters.searchTerm && (
                      <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                        Search: "{filters.searchTerm}"
                      </Badge>
                    )}
                    
                    {filters.trackId && (
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                        Track: {tracks.find(t => t.id === filters.trackId)?.name || filters.trackId}
                      </Badge>
                    )}
                    
                    {filters.topicId && (
                      <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                        Topic: {topics.find(t => t.id === filters.topicId)?.name || filters.topicId}
                      </Badge>
                    )}
                    
                    {filters.subtopicId && (
                      <Badge variant="secondary" className="bg-pink-500/20 text-pink-400 border-pink-500/30">
                        Subtopic: {allSubtopics.find(s => s.id === filters.subtopicId)?.name || filters.subtopicId}
                      </Badge>
                    )}
                    
                    {filters.difficulty && filters.difficulty !== "all" && (
                      <Badge variant="secondary" className={getDifficultyColor(filters.difficulty)}>
                        {filters.difficulty}
                      </Badge>
                    )}
                    
                    {filters.year && (
                      <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                        Year: {filters.year}
                      </Badge>
                    )}
                    
                    {filters.companyId && (
                      <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                        Company: {companies.find(c => c.id === filters.companyId)?.name || filters.companyId}
                      </Badge>
                    )}
                    
                    {filters.isCoding !== undefined && (
                      <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                        Type: {filters.isCoding ? "Coding" : "Theory"}
                      </Badge>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-slate-400 hover:text-white h-6 px-2"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Clear all
                    </Button>
                  </div>
                )}
              </div> */}
              
              {/* Right side - Filter panel */}
              {/* <div className="lg:col-span-1">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2 text-sm">
                      <Filter className="w-4 h-4" />
                      Advanced Filters
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4"> */}
                    {/* Track Filter */}
                    {/* <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-300">Track</label>
                      <Select value={filters.trackId?.toString() || "all"} onValueChange={(value) => updateFilter("trackId", value === "all" ? undefined : parseInt(value, 10))}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 h-8 text-xs">
                          <SelectValue placeholder="Select track" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="all" className="text-slate-300">All Tracks</SelectItem>
                          {tracks.map(track => (
                            <SelectItem key={track.id} value={track.id.toString()}>
                              {track.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div> */}

                    {/* Topic Filter */}
                    {/* <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-300">Topic</label>
                      <Select value={filters.topicId?.toString() || "all"} onValueChange={(value) => updateFilter("topicId", value === "all" ? undefined : parseInt(value, 10))}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 h-8 text-xs">
                          <SelectValue placeholder="Select topic" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="all" className="text-slate-300">All Topics</SelectItem>
                          {topics.filter(topic => !filters.trackId || topic.trackId === filters.trackId).map(topic => (
                            <SelectItem key={topic.id} value={topic.id.toString()}>
                              {topic.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div> */}

                    {/* Subtopic Filter */}
                    {/* <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-300">Subtopic</label>
                      <Select value={filters.subtopicId?.toString() || "all"} onValueChange={(value) => updateFilter("subtopicId", value === "all" ? undefined : parseInt(value, 10))}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 h-8 text-xs">
                          <SelectValue placeholder="Select subtopic" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="all" className="text-slate-300">All Subtopics</SelectItem>
                          {allSubtopics.filter(subtopic => !filters.topicId || subtopic.topicId === filters.topicId).map(subtopic => (
                            <SelectItem key={subtopic.id} value={subtopic.id.toString()}>
                              {subtopic.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div> */}

                    {/* Difficulty Filter */}
                    {/* <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-300">Difficulty</label>
                      <Select value={filters.difficulty} onValueChange={(value) => updateFilter("difficulty", value)}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 h-8 text-xs">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="all" className="text-slate-300">All Difficulties</SelectItem>
                          <SelectItem value="Easy" className="text-green-400">Easy</SelectItem>
                          <SelectItem value="Medium" className="text-yellow-400">Medium</SelectItem>
                          <SelectItem value="Hard" className="text-red-400">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div> */}

                    {/* Year Filter */}
                    {/* <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-300">Year</label>
                      <Select value={filters.year?.toString() || "all"} onValueChange={(value) => updateFilter("year", value === "all" ? undefined : parseInt(value, 10))}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 h-8 text-xs">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="all" className="text-slate-300">All Years</SelectItem>
                          {years.map(year => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div> */}

                    {/* Company Filter */}
                    {/* <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-300">Company</label>
                      <Select value={filters.companyId?.toString() || "all"} onValueChange={(value) => updateFilter("companyId", value === "all" ? undefined : parseInt(value, 10))}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 h-8 text-xs">
                          <SelectValue placeholder="Select company" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="all" className="text-slate-300">All Companies</SelectItem>
                          {companies.map(company => (
                            <SelectItem key={company.id} value={company.id.toString()}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div> */}

                    {/* Type Filter */}
                    {/* <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-300">Type</label>
                      <Select value={filters.isCoding?.toString() || "all"} onValueChange={(value) => updateFilter("isCoding", value === "all" ? undefined : value === "true")}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 h-8 text-xs">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="all" className="text-slate-300">All Types</SelectItem>
                          <SelectItem value="true" className="text-purple-400">Coding</SelectItem>
                          <SelectItem value="false" className="text-gray-400">Theory</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button variant="outline" onClick={clearFilters} className="w-full text-slate-400 hover:text-white border-slate-600 hover:bg-slate-600/50 h-8 text-xs">
                      <X className="w-3 h-3 mr-1" /> Clear
                    </Button> */}
                  {/* </CardContent>
                </Card>*/}
              </div>
            </div> 

            {/* Stats Section */}
            <div className="flex items-center gap-4">
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                {totalElements} {isUnapproved ? "Pending" : "Total"} Questions
              </Badge>
              {isUnapproved && (
                <Button
                  onClick={handleBulkApprove}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve All
                </Button>
              )}
            </div>
          </div>

          {/* Questions Grid */}
          <div className="grid gap-6">
            {questions.map((question) => (
              <Card key={question.id} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg mb-2">
                        <Markdown content={question.title} />
                      </CardTitle>
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
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          {question.question_year}
                        </Badge>
                        <Badge className={
                          question.isApproved 
                            ? "bg-green-500/20 text-green-400 border-green-500/30" 
                            : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                        }>
                          {question.isApproved ? "Approved" : "Pending"}
                        </Badge>
                        <Badge className={
                          question.isCoding 
                            ? "bg-purple-500/20 text-purple-400 border-purple-500/30" 
                            : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                        }>
                          {question.isCoding ? "Coding" : "Theory"}
                        </Badge>
                      </div>
                      {question.companies && question.companies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {question.companies.map((company, index) => (
                            <Badge key={index} className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                              {company}
                            </Badge>
                          ))}
                        </div>
                      )}
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditQuestion(question)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Edit className="w-4 h-4" />
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
                  <div className="text-slate-300 text-sm line-clamp-3">
                    <Markdown content={question.description.substring(0, 200) + (question.description.length > 200 ? '...' : '')} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-8">
              <div className="text-slate-400 text-sm">
                Page {currentPage + 1} of {totalPages} ({totalElements} total)
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
                
                {/* Page Numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i;
                  } else if (currentPage < 3) {
                    pageNum = i;
                  } else if (currentPage >= totalPages - 3) {
                    pageNum = totalPages - 5 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      onClick={() => setCurrentPage(pageNum)}
                      className={
                        currentPage === pageNum
                          ? "bg-purple-600 hover:bg-purple-700"
                          : "border-slate-600 text-slate-300"
                      }
                    >
                      {pageNum + 1}
                    </Button>
                  );
                })}
                
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
                <DialogTitle className="text-white">
                  <Markdown content={selectedQuestion?.title || ""} />
                </DialogTitle>
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
                      <Label className="text-slate-400">Type</Label>
                      <Badge className={
                        selectedQuestion.isCoding 
                          ? "bg-purple-500/20 text-purple-400 border-purple-500/30" 
                          : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                      }>
                        {selectedQuestion.isCoding ? "Coding" : "Theory"}
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
                    <div>
                      <Label className="text-slate-400">question_year</Label>
                      <p className="text-white">{selectedQuestion.question_year}</p>
                    </div>
                    {selectedQuestion.companies && selectedQuestion.companies.length > 0 && (
                      <div>
                        <Label className="text-slate-400">Companies</Label>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {selectedQuestion.companies.map((company, index) => (
                            <Badge key={index} className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                              {company}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
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
                      <Markdown content={selectedQuestion.description} />
                    </div>
                  </div>
                  
                  {/* Testcase Management */}
                  <div className="flex gap-2 mt-6">
                    <Button
                      variant="outline"
                      className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                      onClick={() => handleViewTestcases(selectedQuestion.id)}
                    >
                      View Testcases ({selectedQuestion.testcaseCount})
                    </Button>
                    <Button
                      variant="outline"
                      className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                      onClick={() => handleEditTestcases(selectedQuestion.id)}
                    >
                      Edit Testcases
                    </Button>
                    <Button
                      variant="outline"
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                      onClick={() => handleDeleteTestcases(selectedQuestion.id)}
                    >
                      Delete All Testcases
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Edit Question Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">Edit Question</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Update question details
                </DialogDescription>
              </DialogHeader>
              {editingQuestion && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-slate-200">Title</Label>
                    <Input
                      value={editForm.title}
                      onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-white mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-slate-200">Description</Label>
                    <Textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-white mt-1 min-h-[100px]"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-200">Difficulty</Label>
                      <Select 
                        value={editForm.difficulty} 
                        onValueChange={(value) => setEditForm({...editForm, difficulty: value as "Easy" | "Medium" | "Hard"})}
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="Easy">Easy</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-slate-200">Year</Label>
                      <Input
                        type="number"
                        value={editForm.year}
                        onChange={(e) => setEditForm({...editForm, year: parseInt(e.target.value)})}
                        className="bg-slate-700 border-slate-600 text-white mt-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-slate-200">Importance Tag (Optional)</Label>
                    <Input
                      value={editForm.importanceTag}
                      onChange={(e) => setEditForm({...editForm, importanceTag: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-white mt-1"
                      placeholder="e.g., High Priority, Must Know"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editForm.isCoding}
                      onCheckedChange={(checked) => setEditForm({...editForm, isCoding: checked})}
                    />
                    <Label className="text-slate-200">Coding Question</Label>
                  </div>
                  
                  <div className="flex justify-end space-x-4 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditDialogOpen(false)}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpdateQuestion}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Update Question
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Testcase Manager */}
      {selectedQuestionForTestcases && (
        <TestcaseManager
          questionId={selectedQuestionForTestcases}
          isOpen={isTestcaseManagerOpen}
          onClose={() => {
            setIsTestcaseManagerOpen(false);
            setSelectedQuestionForTestcases(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminQuestions; 