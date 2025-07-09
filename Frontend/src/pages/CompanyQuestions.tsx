import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2, ArrowLeft, CheckCircle, Code2,
  ChevronDown, ChevronUp
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { api } from "@/services/api";
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
                          <h3 className="text-xl font-semibold text-white">
                            {question.title}
                          </h3>
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
                        </div>
                        <div
                          className="text-slate-400"
                          dangerouslySetInnerHTML={{ __html: question.description }}
                        />
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
                        <Button
                          className="bg-purple-600 hover:bg-purple-700"
                          onClick={() =>
                            navigate(`/companies/${companyId}/questions/${question.id}`)
                          }
                        >
                          Solve This
                        </Button>
                      </div>
                    </div>

                    {expandedQuestionId === question.id && question.solution && (
                      <div className="mt-6 border-t border-slate-700 pt-6">
                        <h4 className="text-lg font-semibold text-white mb-4">Solution</h4>
                        <div className="h-[300px] border border-slate-700 rounded-lg overflow-hidden">
                        <div
    className="prose max-w-none text-white"
    dangerouslySetInnerHTML={{ __html: question.solution }}
  />
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