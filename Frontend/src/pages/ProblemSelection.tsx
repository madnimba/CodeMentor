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
  Building2,
  ArrowRight,
  Target,
  Calendar,
  X
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { api } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { questionService } from "@/services/questions";
import { studyMaterialService, Track, Topic, Subtopic } from "@/services/studyMaterials";
import { companiesService, Company } from "@/services/companies";

// Types
interface Problem {
  id: number;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  company?: string;
  isCoding: boolean;
  question_year?: number;
}

interface FilterState {
  searchTerm: string;
  trackId: number | undefined;
  topicId: number | undefined;
  subtopicId: number | undefined;
  difficulty: string;
  year: number | undefined;
  companyId: number | undefined;
}

const ProblemSelection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: "",
    trackId: undefined,
    topicId: undefined,
    subtopicId: undefined,
    difficulty: "all",
    year: undefined,
    companyId: undefined,
  });
  
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filter options
  const [tracks, setTracks] = useState<Track[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [years, setYears] = useState<number[]>([]);

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
      } catch (err) {
        console.error('Failed to load filter options:', err);
      }
    };
    
    loadFilterOptions();
  }, []);

  // Load topics when track changes
  useEffect(() => {
    if (filters.trackId) {
      const loadTopics = async () => {
        try {
          const topicsData = await studyMaterialService.getTopicsByTrackId(filters.trackId!);
          setTopics(topicsData);
          // Reset dependent filters
          setFilters(prev => ({ ...prev, topicId: undefined, subtopicId: undefined }));
          setSubtopics([]);
        } catch (err) {
          console.error('Failed to load topics:', err);
        }
      };
      loadTopics();
    } else {
      setTopics([]);
      setSubtopics([]);
    }
  }, [filters.trackId]);

  // Load subtopics when topic changes
  useEffect(() => {
    if (filters.topicId) {
      const loadSubtopics = async () => {
        try {
          const subtopicsData = await studyMaterialService.getSubtopicsByTopicId(filters.topicId!);
          setSubtopics(subtopicsData);
          // Reset dependent filter
          setFilters(prev => ({ ...prev, subtopicId: undefined }));
        } catch (err) {
          console.error('Failed to load subtopics:', err);
        }
      };
      loadSubtopics();
    } else {
      setSubtopics([]);
    }
  }, [filters.topicId]);

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
    });
    setCurrentPage(0);
  };

  // Handle search on Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setCurrentPage(0);
    }
  };

  // Fetch coding problems from all companies
  useEffect(() => {
    const fetchCodingProblems = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let response;
        
        // Use comprehensive filtering if any filters are applied
        const hasFilters = filters.searchTerm.trim() || 
                          filters.trackId || 
                          filters.topicId || 
                          filters.subtopicId || 
                          (filters.difficulty && filters.difficulty !== "all") ||
                          filters.year || 
                          filters.companyId;
        
        if (hasFilters) {
          response = await questionService.getQuestionsWithFilters(
            filters.searchTerm.trim() || undefined,
            filters.trackId,
            filters.topicId,
            filters.subtopicId,
            filters.difficulty !== "all" ? filters.difficulty : undefined,
            filters.year,
            filters.companyId,
            true, // isCoding = true for coding problems only
            currentPage,
            pageSize
          );
        } else {
          response = await questionService.getCodingQuestionsPaginated(currentPage, pageSize);
        }
        
        const allCodingProblems: Problem[] = response.content.map((q: any) => ({
          id: q.id,
          title: q.title,
          description: q.description || "",
          difficulty: q.difficulty as "Easy" | "Medium" | "Hard",
          company: q.companyName || "Unknown", // Use company name from response
          isCoding: q.isCoding || true,
          question_year: q.question_year || 2024
        }));
        
        console.log('Total coding problems found:', allCodingProblems.length);
        setProblems(allCodingProblems);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
        setLoading(false);
        
        if (allCodingProblems.length === 0) {
          toast({
            title: "No coding problems found",
            description: "There are currently no coding problems available with the selected filters. Try adjusting your filters.",
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
  }, [toast, currentPage, pageSize, filters]);

  // Reset to first page when filters change  
  useEffect(() => {
    setCurrentPage(0);
  }, [filters]);

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
            {/* <div className="lg:col-span-1 space-y-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6"> */}
                  {/* Search
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        type="text"
                        placeholder="Search by title... (Press Enter to search)"
                        value={filters.searchTerm}
                        onChange={(e) => updateFilter("searchTerm", e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      />
                    </div>
                  </div> */}

                  {/* Track Filter
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Track</label>
                    <Select value={filters.trackId?.toString() || "all"} onValueChange={(value) => updateFilter("trackId", value === "all" ? undefined : parseInt(value, 10))}>
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue placeholder="Select a track" />
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

                  {/* Topic Filter
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Topic</label>
                    <Select value={filters.topicId?.toString() || "all"} onValueChange={(value) => updateFilter("topicId", value === "all" ? undefined : parseInt(value, 10))}>
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="all" className="text-slate-300">All Topics</SelectItem>
                        {topics.map(topic => (
                          <SelectItem key={topic.id} value={topic.id.toString()}>
                            {topic.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div> */}

                  {/* Subtopic Filter
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Subtopic</label>
                    <Select value={filters.subtopicId?.toString() || "all"} onValueChange={(value) => updateFilter("subtopicId", value === "all" ? undefined : parseInt(value, 10))}>
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue placeholder="Select a subtopic" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="all" className="text-slate-300">All Subtopics</SelectItem>
                        {subtopics.map(subtopic => (
                          <SelectItem key={subtopic.id} value={subtopic.id.toString()}>
                            {subtopic.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div> */}

                  {/* Difficulty Filter */}
                  {/* <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Difficulty</label>
                    <Select value={filters.difficulty} onValueChange={(value) => updateFilter("difficulty", value)}>
                      <SelectTrigger className="bg-slate-700 border-slate-600">
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
                    <label className="text-sm font-medium text-slate-300">Year</label>
                    <Select value={filters.year?.toString() || "all"} onValueChange={(value) => updateFilter("year", value === "all" ? undefined : parseInt(value, 10))}>
                      <SelectTrigger className="bg-slate-700 border-slate-600">
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
                    <label className="text-sm font-medium text-slate-300">Company</label>
                    <Select value={filters.companyId?.toString() || "all"} onValueChange={(value) => updateFilter("companyId", value === "all" ? undefined : parseInt(value, 10))}>
                      <SelectTrigger className="bg-slate-700 border-slate-600">
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

                  {/* Clear Filters Button */}
                  {/* <Button variant="outline" onClick={clearFilters} className="w-full text-slate-400 hover:text-white border-slate-600 hover:bg-slate-600/50">
                    <X className="w-4 h-4 mr-2" /> Clear Filters
                  </Button> */}
                {/* </CardContent>
              </Card>
            </div> */}

            {/* Main Content - Problems List */}
            <div className="lg:col-span-3 space-y-6">
              {/* Results Count and Active Filters */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-slate-400">
                    {totalElements} problem{totalElements !== 1 ? 's' : ''} found
                  </div>
                </div>

                {/* Active Filters Display
                {(filters.searchTerm || filters.trackId || filters.topicId || filters.subtopicId || 
                  (filters.difficulty && filters.difficulty !== "all") || filters.year || filters.companyId) && (
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
                        Subtopic: {subtopics.find(s => s.id === filters.subtopicId)?.name || filters.subtopicId}
                      </Badge>
                    )}
                    
                    {filters.difficulty && filters.difficulty !== "all" && (
                      <Badge variant="secondary" className={
                        filters.difficulty === "Easy" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                        filters.difficulty === "Medium" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                        "bg-red-500/20 text-red-400 border-red-500/30"
                      }>
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

              {/* {problems.length === 0 && (
                <div className="text-center py-12">
                  <Code2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-400 mb-2">No problems found</h3>
                  <p className="text-slate-500">Try adjusting your filters or search terms</p>
                </div>
              )} */}

              {/* Problems Grid */}
              <div className="grid gap-6">
                {problems.map((problem) => (
                  <Card key={problem.id} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-white text-lg mb-2">
                            <Markdown content={problem.title} />
                          </CardTitle>
                          {/* <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
                            <div className="flex items-center gap-1">
                              <Target className="w-4 h-4" />
                              {problem.difficulty}
                            </div>
                            <div className="flex items-center gap-1">
                              <Building2 className="w-4 h-4" />
                              {problem.company}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {problem.year}
                            </div>
                          </div> */}
                          <div className="flex flex-wrap gap-2">
                            <Badge className={
                              problem.difficulty === "Easy" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                              problem.difficulty === "Medium" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                              "bg-red-500/20 text-red-400 border-red-500/30"
                            }>
                              {problem.difficulty}
                            </Badge>
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                              {problem.company}
                            </Badge>
                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                              {problem.question_year}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                        <Button
                            className="bg-purple-600 hover:bg-purple-700"
                            onClick={() =>
                              handleProblemSelect(problem)
                            }
                          >
                            Solve This
                          </Button>
                          {/* <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleProblemSelect(problem)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </Button> */}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                    <Markdown content={problem.description} />
                    </CardContent>
                  </Card>
                ))}
              </div>
              {renderPagination()}
            </div>
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProblemSelection; 