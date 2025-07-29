import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Markdown } from "@/components/ui/markdown";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { 
  ArrowLeft, 
  Code2, 
  Search, 
  Filter,
  Building2
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { api } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

// Types
interface Problem {
  id: number;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  company?: string;
  isCoding: boolean;
  year?: number;
}

const ProblemSelection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10); // 10 problems per page
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Fetch coding problems from all companies
  useEffect(() => {
    const fetchCodingProblems = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Use the global coding questions endpoint with pagination
        const response = await api.get(`/questions/coding/paginated?page=${currentPage}&size=${pageSize}`);
        const pageData = response.data.data;
        
        const allCodingProblems: Problem[] = pageData.content.map((q: any) => ({
          id: q.id,
          title: q.title,
          description: q.description || "",
          difficulty: q.difficulty as "Easy" | "Medium" | "Hard",
          company: q.companyName || "Unknown", // Use company name from response
          isCoding: q.isCoding || true,
          year: q.year || 2024
        }));
        
        console.log('Total coding problems found:', allCodingProblems.length);
        setProblems(allCodingProblems);
        setTotalPages(pageData.totalPages);
        setTotalElements(pageData.totalElements);
        setLoading(false);
        
        if (allCodingProblems.length === 0) {
          toast({
            title: "No coding problems found",
            description: "There are currently no coding problems available. Please check back later or contact an administrator.",
            variant: "destructive",
          });
        }
      } catch (err) {
        console.error('Failed to fetch coding problems:', err);
        setError("Failed to load coding problems");
        setLoading(false);
      }
    };

    fetchCodingProblems();
  }, [toast, currentPage, pageSize]);

  // Filter problems
  const filteredProblems = useMemo(() => {
    return problems.filter(problem => {
      // Search filter - only search by title
      const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase());

      // Difficulty filter
      const matchesDifficulty = selectedDifficulty === "all" || problem.difficulty === selectedDifficulty;

      return matchesSearch && matchesDifficulty;
    });
  }, [problems, searchTerm, selectedDifficulty]);

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

  const handleProblemSelect = (problem: Problem) => {
    // Navigate to the live coding page with the selected problem
    navigate(`/live-coding/${problem.id}`);
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
        <Header />
        <div className="pt-24 pb-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="text-slate-400 mt-4">Loading coding problems...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
        <Header />
        <div className="pt-24 pb-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-red-400">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-purple-600 hover:bg-purple-700"
            >
              Try Again
            </Button>
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
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button asChild variant="ghost" className="text-slate-400 hover:text-white mb-4">
              <Link to="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            
            <div className="flex items-center gap-4">
              <Code2 className="w-12 h-12 text-purple-400" />
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Problem Selection
                </h1>
                <p className="text-slate-400 text-lg">
                  Choose a problem to solve in the code editor
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Sidebar - Filters */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Search */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        type="text"
                        placeholder="Search by title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Difficulty Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Difficulty</label>
                    <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="all" className="text-slate-300">All Difficulties</SelectItem>
                        <SelectItem value="Easy" className="text-green-400">Easy</SelectItem>
                        <SelectItem value="Medium" className="text-yellow-400">Medium</SelectItem>
                        <SelectItem value="Hard" className="text-red-400">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content - Problems List */}
            <div className="lg:col-span-3 space-y-6">
              {/* Results Count */}
              <div className="flex justify-between items-center">
                <div className="text-slate-400">
                  {filteredProblems.length} problem{filteredProblems.length !== 1 ? 's' : ''} found
                </div>
              </div>

              {/* Problems List */}
              <div className="h-[600px] overflow-y-auto space-y-4 pr-2">
                {filteredProblems.map((problem) => (
                  <Card 
                    key={problem.id} 
                    className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-colors cursor-pointer"
                    onClick={() => handleProblemSelect(problem)}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-semibold text-white">{problem.title}</h3>
                            <Badge className={`${
                              problem.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                              problem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                              'bg-red-500/20 text-red-400 border-red-500/30'
                            }`}>
                              {problem.difficulty}
                            </Badge>
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                              {problem.year || 2024}
                            </Badge>
                          </div>
                          
                          {problem.description && (
                            <div className="text-slate-300 text-sm">
                              <Markdown content={problem.description} />
                            </div>
                          )}
                          
                          {problem.company && (
                            <div className="flex items-center gap-1 text-sm text-slate-400">
                              <Building2 className="w-4 h-4" />
                              {problem.company}
                            </div>
                          )}
                        </div>
                        
                        <Button className="bg-purple-600 hover:bg-purple-700 ml-4">
                          Solve
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {filteredProblems.length === 0 && (
                  <div className="text-center py-12">
                    <Code2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-400 mb-2">No problems found</h3>
                    <p className="text-slate-500">Try adjusting your filters or search terms</p>
                  </div>
                )}
              </div>
              {renderPagination()}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProblemSelection; 