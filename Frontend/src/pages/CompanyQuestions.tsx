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
  ChevronDown, ChevronUp, Plus, X, Trash2
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import Editor from "@monaco-editor/react";
import { api } from "@/services/api";
import { studyMaterialService, Track, Subtopic } from "@/services/studyMaterials";
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
        }));

        setQuestions(mappedQuestions);
        setTotalPages(paginatedData.totalPages);
        setTotalElements(paginatedData.totalElements);
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
                <PaginationLink onClick={() => handlePageChange(0)}>1</PaginationLink>
              </PaginationItem>
              {startPage > 1 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
            </>
          )}

          {pages.map((page) => (
            <PaginationItem key={page}>
              <PaginationLink 
                onClick={() => handlePageChange(page)}
                isActive={page === currentPage}
                className="cursor-pointer"
              >
                {page + 1}
              </PaginationLink>
            </PaginationItem>
          ))}

          {endPage < totalPages - 1 && (
            <>
              {endPage < totalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationLink onClick={() => handlePageChange(totalPages - 1)}>
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
                      </div>
                      <div className="flex gap-2">
                        {question.solution && (
                          <Button
                            variant="outline"
                            className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
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
                        <div className="h-[300px] border border-slate-700 rounded-lg overflow-hidden p-4">
                          <Markdown content={question.solution} />
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
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-200">Importance Tag</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., High, Medium, Low"
                            className="bg-slate-700 border-slate-600 text-white"
                            {...field}
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
                </div>

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

                {/* Testcases Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-slate-200">Test Cases</FormLabel>
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
                            rules={{ required: "Input is required" }}
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
                            rules={{ required: "Expected output is required" }}
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