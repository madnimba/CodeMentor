import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Code2, Search, Filter, ChevronDown, ChevronUp, Loader2
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
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

interface Question {
  id: number;
  title: string;
  description: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  importanceTag?: string;
  track?: {
    id: number;
    name: string;
  };
  subtopic?: {
    id: number;
    name: string;
    topic?: {
      id: number;
      name: string;
    };
  };
  createdBy?: {
    id: number;
    name: string;
    email: string;
  };
  upvotes: number;
  downvotes: number;
  createdAt: string;
}

interface Track {
  id: number;
  name: string;
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

const Questions = () => {
  const navigate = useNavigate();
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(null);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTrack, setSelectedTrack] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [selectedImportanceTag, setSelectedImportanceTag] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch tracks for filter dropdown
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await api.get("/tracks");
        setTracks(response.data.data);
      } catch (error) {
        console.error("Failed to fetch tracks:", error);
        // Don't set error state for tracks as it's not critical
      }
    };
    fetchTracks();
  }, []);

  // Fetch questions with filters
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);

      try {
        let url = `/questions?page=${currentPage}&size=${pageSize}`;
        
        // Add search parameter
        if (searchTerm.trim()) {
          url += `&title=${encodeURIComponent(searchTerm.trim())}`;
        }

        // Add track filter
        if (selectedTrack) {
          url = `/questions/track/${selectedTrack}?page=${currentPage}&size=${pageSize}`;
        }

        // Add difficulty filter
        if (selectedDifficulty) {
          url = `/questions/difficulty/${selectedDifficulty}?page=${currentPage}&size=${pageSize}`;
        }

        // Add importance tag filter
        if (selectedImportanceTag) {
          url = `/questions/importance/${selectedImportanceTag}?page=${currentPage}&size=${pageSize}`;
        }

        // If multiple filters are applied, use search endpoint
        if (searchTerm.trim() || (selectedTrack && selectedDifficulty)) {
          url = `/questions/search?title=${encodeURIComponent(searchTerm.trim())}&page=${currentPage}&size=${pageSize}`;
        }

        const response = await api.get(url);
        const paginatedData: PaginatedResponse<Question> = response.data.data;

        setQuestions(paginatedData.content);
        setTotalPages(paginatedData.totalPages);
        setTotalElements(paginatedData.totalElements);
        setLoading(false);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to load questions");
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [currentPage, pageSize, searchTerm, selectedTrack, selectedDifficulty, selectedImportanceTag]);

  const toggleAnswer = (questionId: number) => {
    setExpandedQuestionId(expandedQuestionId === questionId ? null : questionId);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0); // Reset to first page when searching
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTrack("");
    setSelectedDifficulty("");
    setSelectedImportanceTag("");
    setCurrentPage(0);
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
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          Loading questions...
        </div>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      <Header />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4">
              <Code2 className="w-12 h-12 text-purple-400" />
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Practice Questions
                </h1>
                <p className="text-slate-400 text-lg">
                  Master coding problems across different tracks and difficulty levels
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <Card className="bg-slate-800/50 border-slate-700 mb-8">
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="space-y-4">
                {/* Search Bar */}
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search questions by title..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>
                  <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                    Search
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                    {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
                  </Button>
                </div>

                {/* Filter Options */}
                {showFilters && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-700">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Track
                      </label>
                      <Select value={selectedTrack} onValueChange={setSelectedTrack}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue placeholder="All tracks" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="" className="text-slate-300">All tracks</SelectItem>
                          {tracks.map((track) => (
                            <SelectItem key={track.id} value={track.id.toString()} className="text-slate-300">
                              {track.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Difficulty
                      </label>
                      <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue placeholder="All difficulties" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="" className="text-slate-300">All difficulties</SelectItem>
                          <SelectItem value="Easy" className="text-green-400">Easy</SelectItem>
                          <SelectItem value="Medium" className="text-yellow-400">Medium</SelectItem>
                          <SelectItem value="Hard" className="text-red-400">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Importance Tag
                      </label>
                      <Input
                        type="text"
                        placeholder="e.g., Fundamental, Advanced..."
                        value={selectedImportanceTag}
                        onChange={(e) => setSelectedImportanceTag(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                )}

                {/* Clear Filters */}
                {(searchTerm || selectedTrack || selectedDifficulty || selectedImportanceTag) && (
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={clearFilters}
                      className="text-slate-400 hover:text-white"
                    >
                      Clear all filters
                    </Button>
                  </div>
                )}
              </form>
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
                      <div className="space-y-2 flex-1">
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
                        
                        <div className="text-slate-400 prose prose-invert max-w-none">
                          <div
                            dangerouslySetInnerHTML={{ __html: question.description }}
                          />
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {question.track && (
                            <Badge variant="outline" className="text-purple-400 border-purple-500/30">
                              {question.track.name}
                            </Badge>
                          )}
                          {question.subtopic && (
                            <Badge variant="outline" className="text-blue-400 border-blue-500/30">
                              {question.subtopic.name}
                            </Badge>
                          )}
                          {question.importanceTag && (
                            <Badge variant="outline" className="text-slate-400 border-slate-600">
                              {question.importanceTag}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span>👍 {question.upvotes}</span>
                          <span>👎 {question.downvotes}</span>
                          {question.createdBy && (
                            <span>By {question.createdBy.name}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          className="bg-purple-600 hover:bg-purple-700"
                          onClick={() => navigate(`/questions/${question.id}/solve`)}
                        >
                          Solve This
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {questions.length === 0 && (
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-12 text-center">
                    <Code2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-400 mb-2">
                      No questions found
                    </h3>
                    <p className="text-slate-500">
                      Try adjusting your search criteria or filters
                    </p>
                  </CardContent>
                </Card>
              )}
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

export default Questions; 