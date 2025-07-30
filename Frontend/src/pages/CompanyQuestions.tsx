import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Markdown } from "@/components/ui/markdown";
import {
  Building2, ArrowLeft, CheckCircle, Code2,
  ChevronDown, ChevronUp, Plus, X, Trash2, Clock
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import Editor from "@monaco-editor/react";
import { api } from "@/services/api";
import { studyMaterialService, Track, Subtopic, Topic } from "@/services/studyMaterials";
import { questionService, CreateQuestionRequest, TestcaseRequest } from "@/services/questions";
import { companiesService, Company as CompanyType } from "@/services/companies";
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
import { completedQuestionsApi } from "@/services/completedQuestions";
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
  const [completedQuestions, setCompletedQuestions] = useState<Set<number>>(new Set());
  const [loadingCompleted, setLoadingCompleted] = useState<Set<number>>(new Set());

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
  const [topics, setTopics] = useState<{ [key: number]: Topic[] }>({});
  const [companies, setCompanies] = useState<CompanyType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();

  const form = useForm<CreateQuestionRequest>({
    defaultValues: {
      title: "",
      description: "",
      difficulty: "Medium",
      importanceTag: "",
      trackId: 0,
      topicId: undefined,
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
  const selectedTopicId = form.watch("topicId");
  const isCoding = form.watch("isCoding");

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

  // Fetch topics when track is selected
  useEffect(() => {
    if (selectedTrackId && selectedTrackId > 0) {
      const fetchTopics = async () => {
        try {
          const trackTopics = await studyMaterialService.getTopicsByTrackId(selectedTrackId);
          setTopics(prev => ({ ...prev, [selectedTrackId]: trackTopics }));
        } catch (err) {
          console.error("Failed to fetch topics:", err);
        }
      };
      fetchTopics();
    }
  }, [selectedTrackId]);

  // Fetch subtopics when topic is selected
  useEffect(() => {
    if (selectedTopicId && selectedTopicId > 0) {
      const fetchSubtopics = async () => {
        try {
          const topicSubtopics = await studyMaterialService.getSubtopicsByTopicId(selectedTopicId);
          setSubtopics(prev => ({ ...prev, [selectedTopicId]: topicSubtopics }));
        } catch (err) {
          console.error("Failed to fetch subtopics:", err);
        }
      };
      fetchSubtopics();
    }
  }, [selectedTopicId]);

  useEffect(() => {
    if (!companyId) {
      setCompanyData(null);
      setQuestions([]);
      return;
    }

    setLoading(true);
    setError(null);

    Promise.all([
      api.get(`/companies/${companyId}`),
      api.get(`/companies/${companyId}/questions/paginated?page=${currentPage}&size=${pageSize}`)
    ])
      .then(([companyRes, questionsRes]) => {
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
        }));

        setQuestions(mappedQuestions);
        setTotalPages(paginatedData.totalPages);
        setTotalElements(paginatedData.totalElements);
        
        // Check completion status for all questions
        if (user) {
          mappedQuestions.forEach((question: Question) => {
            if (!question.isCoding) {
              checkCompletionStatus(question.id);
            }
          });
        }
        
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load company or questions");
        setLoading(false);
      });
  }, [companyId, currentPage, pageSize]);

  const toggleAnswer = (questionId: number) => {
    setExpandedQuestionId(expandedQuestionId === questionId ? null : questionId);
  };

  const handleMarkAsCompleted = async (questionId: number) => {
    if (!user) {
      toast.error("You must be logged in to mark questions as completed");
      return;
    }

    setLoadingCompleted(prev => new Set(prev).add(questionId));
    try {
      await completedQuestionsApi.markQuestionCompleted({ questionId });
      setCompletedQuestions(prev => new Set(prev).add(questionId));
      toast.success("Question marked as completed!");
    } catch (error) {
      console.error('Failed to mark question as completed:', error);
      toast.error("Failed to mark question as completed");
    } finally {
      setLoadingCompleted(prev => {
        const newSet = new Set(prev);
        newSet.delete(questionId);
        return newSet;
      });
    }
  };

  const handleMarkAsIncomplete = async (questionId: number) => {
    if (!user) {
      toast.error("You must be logged in to mark questions as incomplete");
      return;
    }

    setLoadingCompleted(prev => new Set(prev).add(questionId));
    try {
      await completedQuestionsApi.removeQuestionCompletion(questionId);
      setCompletedQuestions(prev => {
        const newSet = new Set(prev);
        newSet.delete(questionId);
        return newSet;
      });
      toast.success("Question marked as incomplete!");
    } catch (error) {
      console.error('Failed to mark question as incomplete:', error);
      toast.error("Failed to mark question as incomplete");
    } finally {
      setLoadingCompleted(prev => {
        const newSet = new Set(prev);
        newSet.delete(questionId);
        return newSet;
      });
    }
  };

  const checkCompletionStatus = async (questionId: number) => {
    if (!user) return;
    
    try {
      const isCompleted = await completedQuestionsApi.hasUserCompletedQuestion(questionId);
      if (isCompleted) {
        setCompletedQuestions(prev => new Set(prev).add(questionId));
      }
    } catch (error) {
      console.error(`Failed to check completion status for question ${questionId}:`, error);
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

    // Validate testcases for coding questions
    if (data.isCoding) {
      const hasValidTestcases = data.testcases.some(testcase => 
        testcase.test1 && testcase.output1
      );
      if (!hasValidTestcases) {
        toast.error("At least one test case is required for coding questions");
        return;
      }
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
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <Button asChild variant="ghost" className="text-slate-400 hover:text-white">
                <Link to="/companies">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Companies
                </Link>
              </Button>
              
              {/* Create Question Button */}
              <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => {
                      if (!user) {
                        toast.error("Please log in to create a question");
                        return;
                      }
                      setIsQuestionDialogOpen(true);
                    }}
                  >
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
                        {!question.isCoding && (
                          <Button
                            variant="outline"
                            disabled={loadingCompleted.has(question.id)}
                            className={`${
                              completedQuestions.has(question.id)
                                ? "border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                : "border-green-500/30 text-green-400 hover:bg-green-500/10 hover:text-green-300"
                            }`}
                            onClick={() => 
                              completedQuestions.has(question.id)
                                ? handleMarkAsIncomplete(question.id)
                                : handleMarkAsCompleted(question.id)
                            }
                          >
                            {loadingCompleted.has(question.id) ? (
                              <Clock className="w-4 h-4 mr-2 animate-spin" />
                            ) : completedQuestions.has(question.id) ? (
                              <CheckCircle className="w-4 h-4 mr-2" />
                            ) : null}
                            {completedQuestions.has(question.id) ? "Mark as Incomplete" : "Mark as Completed"}
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
                          placeholder="Describe the problem statement..."
                          className="bg-slate-700 border-slate-600 text-white min-h-[150px]"
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
                    name="companyId"
                    rules={{ required: "Company is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-200">Company</FormLabel>
                        <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                              <SelectValue placeholder="Select a company" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            {companies.map((company) => (
                              <SelectItem key={company.id} value={company.id.toString()}>
                                {company.name}
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
                              <SelectValue placeholder="Select difficulty" />
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
                    name="importanceTag"
                    rules={{ required: "Importance tag is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-200">Importance Tag</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                              <SelectValue placeholder="Select importance" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                <FormField
                    control={form.control}
                    name="trackId"
                    rules={{ required: "Track is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-200">Track</FormLabel>
                        <Select onValueChange={(value) => {
                          field.onChange(Number(value));
                          // Reset topic and subtopic when track changes
                          form.setValue("topicId", undefined);
                          form.setValue("subtopicId", undefined);
                        }} value={field.value?.toString()}>
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

                  <FormField
                    control={form.control}
                    name="topicId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-200">Topic (Optional)</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value ? Number(value) : undefined);
                            // Reset subtopic when topic changes
                            form.setValue("subtopicId", undefined);
                          }} 
                          value={field.value?.toString()}
                          disabled={!selectedTrackId || selectedTrackId === 0}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                              <SelectValue placeholder="Select a topic (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            {topics[selectedTrackId]?.map((topic) => (
                              <SelectItem key={topic.id} value={topic.id.toString()}>
                                {topic.name}
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
                    name="subtopicId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-200">Subtopic (Optional)</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(value ? Number(value) : undefined)} 
                          value={field.value?.toString()}
                          disabled={!selectedTopicId || selectedTopicId === 0}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                              <SelectValue placeholder="Select a subtopic (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            {subtopics[selectedTopicId]?.map((subtopic) => (
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
                </div>

                <FormField
                  control={form.control}
                  name="isCoding"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="w-4 h-4"
                        />
                      </FormControl>
                      <FormLabel className="text-slate-200">Coding Question</FormLabel>
                    </FormItem>
                  )}
                />

                {/* Testcases Section - Only show for coding questions */}
                {isCoding && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-slate-200">Test Cases (Required for coding questions)</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addTestcase}
                        className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Test Case
                      </Button>
                    </div>
                    
                    {fields.map((field, index) => (
                      <Card key={field.id} className="bg-slate-700/50 border-slate-600">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-white font-medium">Test Case {index + 1}</h4>
                            {fields.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeTestcase(index)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`testcases.${index}.test1`}
                              rules={{ required: isCoding ? "Input is required for coding questions" : false }}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-slate-200">Input</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Test case input"
                                      className="bg-slate-600 border-slate-500 text-white"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`testcases.${index}.output1`}
                              rules={{ required: isCoding ? "Expected output is required for coding questions" : false }}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-slate-200">Expected Output</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Expected output"
                                      className="bg-slate-600 border-slate-500 text-white"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <FormField
                              control={form.control}
                              name={`testcases.${index}.test2`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-slate-200">Input</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Test case input"
                                      className="bg-slate-600 border-slate-500 text-white"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`testcases.${index}.output2`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-slate-200">Expected Output</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Expected output"
                                      className="bg-slate-600 border-slate-500 text-white"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <FormField
                              control={form.control}
                              name={`testcases.${index}.test3`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-slate-200">Input</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Test case input"
                                      className="bg-slate-600 border-slate-500 text-white"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`testcases.${index}.output3`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-slate-200">Expected Output</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Expected output"
                                      className="bg-slate-600 border-slate-500 text-white"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

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
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isSubmitting ? "Creating..." : "Create Question"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        )}
      </Dialog>

      <Footer />
    </div>
  );
};

export default CompanyQuestions;