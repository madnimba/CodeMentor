import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Markdown } from "@/components/ui/markdown";
import {
  Building2, ArrowLeft, CheckCircle, Code2,
  ChevronDown, ChevronUp, Plus, X, Trash2, Circle
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import Editor from "@monaco-editor/react";
import { api } from "@/services/api";
import { studyMaterialService, Track, Subtopic } from "@/services/studyMaterials";
import { questionService, CreateQuestionRequest, TestcaseRequest } from "@/services/questions";
import { companiesService, Company as CompanyType } from "@/services/companies";
import { completedQuestionsApi } from "@/services/completedQuestions";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Switch } from "@/components/ui/switch";
// import DOMPurify from "dompurify"; // ✅ Added for sanitization

interface Question {
  id: number;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  importanceTag: string;
  solution?: string;
  status?: "solved" | "attempted" | "unsolved";
  tags?: string[];
  isCoding: boolean;
  question_year?: number;
  isCompleted?: boolean;
}

interface Company {
  id: number;
  name: string;
  description: string;
  totalQuestions: number;
  solvedQuestions: number;
}

interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

const CompanyQuestions = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(null);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [companyData, setCompanyData] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10); // 10 questions per page

  // Question creation state
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [subtopics, setSubtopics] = useState<{ [key: number]: Subtopic[] }>({});
  const [companies, setCompanies] = useState<CompanyType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completionStates, setCompletionStates] = useState<{[key: number]: boolean}>({});

  const { user } = useAuth();

  const form = useForm<CreateQuestionRequest>({
    defaultValues: {
      title: "",
      description: "",
      difficulty: "Medium",
      importanceTag: "",
      trackId: 0,
      subtopicId: undefined,
      companyId: companyId ? Number(companyId) : undefined,
      isCoding: false,
      question_year: 2024,
      testcases: [{ test1: "", output1: "", test2: "", output2: "", test3: "", output3: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "testcases",
  });

  const selectedTrackId = form.watch("trackId");

  // Fetch tracks and companies for question creation
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tracksData, companiesData] = await Promise.all([
          studyMaterialService.getAllTracks(),
          companiesService.getAllCompanies()
        ]);
        setTracks(tracksData);
        setCompanies(companiesData);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };
    fetchData();
  }, []);

  // Fetch subtopics when track is selected
  useEffect(() => {
    if (selectedTrackId && selectedTrackId > 0) {
      const fetchSubtopics = async () => {
        try {
          const topics = await studyMaterialService.getTopicsByTrackId(selectedTrackId);
          const allSubtopics: Subtopic[] = [];
          for (const topic of topics) {
            const topicSubtopics = await studyMaterialService.getSubtopicsByTopicId(topic.id);
            allSubtopics.push(...topicSubtopics);
          }
          setSubtopics(prev => ({ ...prev, [selectedTrackId]: allSubtopics }));
        } catch (err) {
          console.error("Failed to fetch subtopics:", err);
        }
      };
      fetchSubtopics();
    }
  }, [selectedTrackId]);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchTrigger, setSearchTrigger] = useState("");

  // Handle search on Enter key press
  const handleSearch = (query: string) => {
    setSearchTrigger(query);
    setCurrentPage(0); // Reset to first page when searching
  };

  // Handle Enter key press in search input
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(searchQuery);
    }
  };

  useEffect(() => {
    if (!companyId) {
      setCompanyData(null);
      setQuestions([]);
      return;
    }

    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        const [companyRes, questionsRes] = await Promise.all([
          api.get(`/companies/${companyId}`),
          searchTrigger.trim() 
            ? api.get(`/companies/${companyId}/questions/search?searchTerm=${encodeURIComponent(searchTrigger)}&page=${currentPage}&size=${pageSize}`)
            : api.get(`/companies/${companyId}/questions/paginated?page=${currentPage}&size=${pageSize}`)
        ]);

        setCompanyData(companyRes.data);

        const paginatedData: PaginatedResponse<any> = questionsRes.data;
        const mappedQuestions: Question[] = paginatedData.content.map((cq: any) => ({
          id: cq.id,
          title: cq.title,
          description: cq.description,
          difficulty: cq.difficulty as "Easy" | "Medium" | "Hard",
          importanceTag: cq.importanceTag ?? "",
          solution: cq.solution ?? "",
          status: cq.status ?? "unsolved",
          tags: cq.tags ?? [],
          isCoding: cq.isCoding ?? false,
          question_year: cq.question_year ?? 2024,
          isCompleted: cq.isCompleted ?? false,
        }));

        setQuestions(mappedQuestions);
        setTotalPages(paginatedData.totalPages);
        setTotalElements(paginatedData.totalElements);
        
        // Initialize completion states
        const states: {[key: number]: boolean} = {};
        mappedQuestions.forEach((question) => {
          states[question.id] = question.isCompleted || false;
        });
        setCompletionStates(states);
        
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load company or questions");
        setLoading(false);
      }
    };

    fetchData();
  }, [companyId, currentPage, pageSize, searchTrigger]);

  const toggleAnswer = (questionId: number) => {
    setExpandedQuestionId(expandedQuestionId === questionId ? null : questionId);
  };

  const handleMarkCompleted = async (questionId: number) => {
    try {
      await completedQuestionsApi.markQuestionCompleted({ questionId });
      setCompletionStates(prev => ({ ...prev, [questionId]: true }));
      toast.success('Question marked as completed!');
      
      // Trigger event to refresh companies data
      localStorage.setItem('questionCompletionUpdate', Date.now().toString());
      window.dispatchEvent(new Event('questionCompletionUpdate'));
    } catch (error) {
      console.error('Failed to mark question as completed:', error);
      toast.error('Failed to mark question as completed');
    }
  };

  const handleMarkIncomplete = async (questionId: number) => {
    try {
      await completedQuestionsApi.removeQuestionCompletion(questionId);
      setCompletionStates(prev => ({ ...prev, [questionId]: false }));
      toast.success('Question marked as incomplete!');
      
      // Trigger event to refresh companies data
      localStorage.setItem('questionCompletionUpdate', Date.now().toString());
      window.dispatchEvent(new Event('questionCompletionUpdate'));
    } catch (error) {
      console.error('Failed to mark question as incomplete:', error);
      toast.error('Failed to mark question as incomplete');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const onSubmitQuestion = async (data: CreateQuestionRequest) => {
    if (!user) {
      toast.error("You must be logged in to create a question");
      return;
    }

    setIsSubmitting(true);
    try {
      await questionService.createQuestion(data);
      toast.success("Question created successfully! It will be reviewed before publication.");
      setIsQuestionDialogOpen(false);
      form.reset();
      // Refresh questions list
      window.location.reload();
    } catch (err) {
      toast.error("Failed to create question. Please try again.");
      console.error("Failed to create question:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTestcase = () => {
    append({ test1: "", output1: "", test2: "", output2: "", test3: "", output3: "" });
  };

  const removeTestcase = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <Pagination className="mt-8">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
              className={currentPage === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          
          {startPage > 0 && (
            <>
              <PaginationItem>
                <PaginationLink 
                  onClick={() => handlePageChange(0)}
                  className="bg-slate-700/50 text-slate-300 border-slate-600 hover:bg-slate-600/50 hover:text-white"
                >
                  1
                </PaginationLink>
              </PaginationItem>
              {startPage > 1 && (
                <PaginationItem>
                  <PaginationEllipsis className="text-slate-400" />
                </PaginationItem>
              )}
            </>
          )}

          {pages.map((page) => (
            <PaginationItem key={page}>
              <PaginationLink 
                onClick={() => handlePageChange(page)}
                isActive={page === currentPage}
                className={`cursor-pointer ${
                  page === currentPage 
                    ? "bg-white text-black border-white" 
                    : "bg-slate-700/50 text-slate-300 border-slate-600 hover:bg-slate-600/50 hover:text-white"
                }`}
              >
                {page + 1}
              </PaginationLink>
            </PaginationItem>
          ))}

          {endPage < totalPages - 1 && (
            <>
              {endPage < totalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis className="text-slate-400" />
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationLink 
                  onClick={() => handlePageChange(totalPages - 1)}
                  className="bg-slate-700/50 text-slate-300 border-slate-600 hover:bg-slate-600/50 hover:text-white"
                >
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}

          <PaginationItem>
            <PaginationNext 
              onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
              className={currentPage === totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        Loading questions...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-red-400 flex items-center justify-center">
        {error}
      </div>
    );
  }

  if (!companyData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      <Header />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Building2 className="w-12 h-12 text-blue-400" />
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{companyData?.name} Questions</h1>
                <p className="text-slate-400 text-lg">
                  Practice questions from {companyData?.name}
                </p>
              </div>
            </div>
            
            {user && (
              <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>

            <div className="flex items-center gap-4 mt-4">
              <Building2 className="w-12 h-12 text-purple-400" />
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  {companyData.name} Questions
                </h1>
                <p className="text-slate-400 text-lg">{companyData.description}</p>
              </div>
            </div>
          </div>

          <Card className="bg-slate-800/50 border-slate-700 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white">
                    {companyData.solvedQuestions} of {companyData.totalQuestions} questions solved
                  </span>
                </div>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                  {Math.round((companyData.solvedQuestions / companyData.totalQuestions) * 100)}% Complete
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Questions Section */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Questions</h2>
              <p className="text-slate-400">
                Showing {questions.length} of {totalElements} questions
              </p>
            </div>

            <div className="space-y-6">
              {questions.map((question) => (
                <Card
                  key={question.id}
                  className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-colors"
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Code2 className="w-5 h-5 text-purple-400" />
                          <Badge
                            className={`${
                              question.difficulty === 'Easy'
                                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                : question.difficulty === 'Medium'
                                ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                : 'bg-red-500/20 text-red-400 border-red-500/30'
                            }`}
                          >
                            {question.difficulty}
                          </Badge>
                          <Badge className={
                            question.isCoding 
                              ? "bg-purple-500/20 text-purple-400 border-purple-500/30" 
                              : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                          }>
                            {question.isCoding ? "Coding" : "Theory"}
                          </Badge>
                          {completionStates[question.id] && (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              Completed
                            </Badge>
                          )}
                        </div>
                        <div className="text-slate-400">
                          <Markdown content={question.description} />
                        </div>
                        {question.importanceTag && (
                          <Badge variant="outline" className="text-slate-400 border-slate-600">
                            {question.importanceTag}
                          </Badge>
                        )}
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          {question.question_year || 2024}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        {!question.isCoding && (
                          <Button
                            variant="outline"
                            size="sm"
                            className={`${
                              completionStates[question.id]
                                ? "border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                : "border-green-500/30 text-green-400 hover:bg-green-500/10 hover:text-green-300"
                            }`}
                            onClick={() => completionStates[question.id] 
                              ? handleMarkIncomplete(question.id) 
                              : handleMarkCompleted(question.id)
                            }
                          >
                            {completionStates[question.id] ? "Mark as Unread" : "Mark as Read"}
                          </Button>
                        )}
                        {question.solution && (
                          <Button
                            variant="outline"
                            className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300"
                            onClick={() => toggleAnswer(question.id)}
                          >
                            {expandedQuestionId === question.id ? (
                              <>
                                Close <ChevronUp className="ml-2 w-4 h-4" />
                              </>
                            ) : (
                              <>
                                See Answer <ChevronDown className="ml-2 w-4 h-4" />
                              </>
                            )}
                          </Button>
                        )}
                        {question.isCoding && (
                          <Button
                            className="bg-purple-600 hover:bg-purple-700"
                            onClick={() =>
                              navigate(`/companies/${companyId}/questions/${question.id}`)
                            }
                          >
                            Solve This
                          </Button>
                        )}
                      </div>
                    </div>

                    {expandedQuestionId === question.id && question.solution && (
                      <div className="mt-6 border-t border-slate-700 pt-6">
                        <h4 className="text-lg font-semibold text-white mb-4">Solution</h4>
                        <div className="h-[300px] border border-slate-700 rounded-lg overflow-hidden p-4 bg-slate-700/50">
                          <div className="text-slate-200">
                            <Markdown content={question.solution} />
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {renderPagination()}
          </div>
        </div>
      </div>

      {/* Create Question Dialog */}
      <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
        
        {user && (
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Question</DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitQuestion)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  rules={{ required: "Title is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter question title"
                          className="bg-slate-700 border-slate-600 text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                      <FormField
                        control={form.control}
                        name="description"
                        rules={{ required: "Description is required" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-200">Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe the question..."
                                className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="difficulty"
                          rules={{ required: "Difficulty is required" }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-200">Difficulty</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-slate-700 border-slate-600">
                                  <SelectItem value="Easy">Easy</SelectItem>
                                  <SelectItem value="Medium">Medium</SelectItem>
                                  <SelectItem value="Hard">Hard</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="year"
                          rules={{ required: "Year is required" }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-200">Year</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="2024"
                                  className="bg-slate-700 border-slate-600 text-white"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="importanceTag"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-200">Importance Tag (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., High Priority, Must Know"
                                className="bg-slate-700 border-slate-600 text-white"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="trackId"
                        rules={{ required: "Track is required" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-200">Track</FormLabel>
                            <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                              <FormControl>
                                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                                  <SelectValue placeholder="Select a track" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-slate-700 border-slate-600">
                                {tracks.map((track) => (
                                  <SelectItem key={track.id} value={track.id.toString()}>
                                    {track.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="subtopicId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-200">Subtopic (Optional)</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(value ? Number(value) : undefined)} 
                          value={field.value?.toString()}
                          disabled={!selectedTrackId || selectedTrackId === 0}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                              <SelectValue placeholder="Select a subtopic (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            {subtopics[selectedTrackId]?.map((subtopic) => (
                              <SelectItem key={subtopic.id} value={subtopic.id.toString()}>
                                {subtopic.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="question_year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-200">question_year</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="2024"
                            className="bg-slate-700 border-slate-600 text-white"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                      <FormField
                        control={form.control}
                        name="isCoding"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-slate-600 p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-slate-200">Coding Question</FormLabel>
                              <div className="text-sm text-slate-400">
                                Check if this is a coding question that requires implementation
                              </div>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {/* Testcases */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-slate-200">Test Cases</FormLabel>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addTestcase}
                            className="border-slate-600 text-slate-300"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Test Case
                          </Button>
                        </div>
                        
                        {fields.map((field, index) => (
                          <div key={field.id} className="space-y-4 p-4 border border-slate-600 rounded-lg">
                            <div className="flex items-center justify-between">
                              <h4 className="text-slate-200 font-medium">Test Case {index + 1}</h4>
                              {fields.length > 1 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeTestcase(index)}
                                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <FormLabel className="text-slate-300 text-sm">Input 1</FormLabel>
                                <Input
                                  placeholder="Enter test input"
                                  className="bg-slate-700 border-slate-600 text-white"
                                  {...form.register(`testcases.${index}.test1`)}
                                />
                              </div>
                              <div>
                                <FormLabel className="text-slate-300 text-sm">Expected Output 1</FormLabel>
                                <Input
                                  placeholder="Enter expected output"
                                  className="bg-slate-700 border-slate-600 text-white"
                                  {...form.register(`testcases.${index}.output1`)}
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <FormLabel className="text-slate-300 text-sm">Input 2 (Optional)</FormLabel>
                                <Input
                                  placeholder="Enter test input"
                                  className="bg-slate-700 border-slate-600 text-white"
                                  {...form.register(`testcases.${index}.test2`)}
                                />
                              </div>
                              <div>
                                <FormLabel className="text-slate-300 text-sm">Expected Output 2 (Optional)</FormLabel>
                                <Input
                                  placeholder="Enter expected output"
                                  className="bg-slate-700 border-slate-600 text-white"
                                  {...form.register(`testcases.${index}.output2`)}
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <FormLabel className="text-slate-300 text-sm">Input 3 (Optional)</FormLabel>
                                <Input
                                  placeholder="Enter test input"
                                  className="bg-slate-700 border-slate-600 text-white"
                                  {...form.register(`testcases.${index}.test3`)}
                                />
                              </div>
                              <div>
                                <FormLabel className="text-slate-300 text-sm">Expected Output 3 (Optional)</FormLabel>
                                <Input
                                  placeholder="Enter expected output"
                                  className="bg-slate-700 border-slate-600 text-white"
                                  {...form.register(`testcases.${index}.output3`)}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-end space-x-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsQuestionDialogOpen(false)}
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {isSubmitting ? "Creating..." : "Create Question"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search questions... (Press Enter to search)"
                className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
          </div>

          <Card className="bg-slate-800/50 border-slate-700 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white">
                    {companyData.solvedQuestions} of {companyData.totalQuestions} questions solved
                  </span>
                </div>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                  {Math.round((companyData.solvedQuestions / companyData.totalQuestions) * 100)}% Complete
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Questions Section */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Questions</h2>
              <p className="text-slate-400">
                Showing {questions.length} of {totalElements} questions
              </p>
            </div>

            {/* Questions Grid */}
            <div className="grid gap-6">
              {questions.map((question) => (
                <Card key={question.id} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg mb-2">{question.title}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
                          <div className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            {question.difficulty}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {question.year}
                          </div>
                          {question.importanceTag && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4" />
                              {question.importanceTag}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge className={
                            question.difficulty === "Easy" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                            question.difficulty === "Medium" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                            "bg-red-500/20 text-red-400 border-red-500/30"
                          }>
                            {question.difficulty}
                          </Badge>
                          {question.importanceTag && (
                            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                              {question.importanceTag}
                            </Badge>
                          )}
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                            {question.year}
                          </Badge>
                          <Badge className={
                            question.isCoding 
                              ? "bg-purple-500/20 text-purple-400 border-purple-500/30" 
                              : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                          }>
                            {question.isCoding ? "Coding" : "Theory"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleAnswer(question.id)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          {expandedQuestionId === question.id ? "Hide" : "Show"} Answer
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-slate-300 text-sm line-clamp-3">
                      {question.description}
                    </div>
                    {expandedQuestionId === question.id && question.solution && (
                      <div className="mt-4 p-4 bg-slate-900 rounded-lg border border-slate-600">
                        <h4 className="text-white font-medium mb-2">Solution:</h4>
                        <div className="text-slate-300 text-sm">
                          {question.solution}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {renderPagination()}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CompanyQuestions;