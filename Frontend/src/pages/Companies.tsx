import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Building2, Star, ArrowRight, Search, ArrowUpDown, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { MapPin, FileText } from "lucide-react";
import { companiesService } from "@/services/companies";

// Types
interface Company {
  id: number;
  name: string;
  description: string;
  totalQuestions: number;
  solvedQuestions: number;
  logoUrl?: string;
  country?: string;
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

const Companies = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(12); // 12 companies per page
  const { user } = useAuth();
  const navigate = useNavigate();

  // Separate search trigger state
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

  // Fetch companies from API with pagination
  useEffect(() => {
    if (!user) {
      setError("Please sign in to view companies");
      return;
    }

    setLoading(true);
    setError(null);
    
    const fetchCompanies = async () => {
      try {
        let response;
        if (searchTrigger.trim()) {
          response = await companiesService.searchCompanies(searchTrigger, currentPage, pageSize);
        } else {
          response = await companiesService.getAllCompaniesPaginated(currentPage, pageSize);
        }
        
        setCompanies(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching companies:", err);
        if (err.response?.status === 401) {
          setError("Authentication required. Please sign in again.");
        } else {
          setError("Failed to load companies");
        }
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [user, currentPage, pageSize, searchTrigger]);

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, sortOrder]);

  // Listen for question completion updates
  useEffect(() => {
    const handleQuestionCompletionUpdate = () => {
      // Refresh companies data when question completion changes
      if (user) {
        setRefreshing(true);
        api.get(`/companies/paginated?page=${currentPage}&size=${pageSize}`)
          .then(res => {
            const paginatedData: PaginatedResponse<Company> = res.data;
            setCompanies(paginatedData.content);
            setTotalPages(paginatedData.totalPages);
            setTotalElements(paginatedData.totalElements);
            setRefreshing(false);
          })
          .catch((err) => {
            console.error("Error refreshing companies:", err);
            setRefreshing(false);
          });
      }
    };

    // Listen for the custom event
    window.addEventListener('questionCompletionUpdate', handleQuestionCompletionUpdate);

    // Cleanup
    return () => {
      window.removeEventListener('questionCompletionUpdate', handleQuestionCompletionUpdate);
    };
  }, [user, currentPage, pageSize]);

  // Mock data - commented out but kept for reference
  /*
  const featuredCompanies = [
    { id: 1, name: "Google", description: "Top tech company focusing on search and AI", solved: 45, total: 60, difficulty: "Hard" },
    { id: 2, name: "Microsoft", description: "Leading software and cloud computing company", solved: 38, total: 55, difficulty: "Hard" },
    { id: 3, name: "Amazon", description: "E-commerce and cloud computing giant", solved: 42, total: 58, difficulty: "Hard" },
    { id: 4, name: "Meta", description: "Social media and technology company", solved: 35, total: 50, difficulty: "Medium" }
  ];

  const allCompanies = [
    { id: 5, name: "Apple", description: "Technology and consumer electronics", solved: 30, total: 45, difficulty: "Hard" },
    { id: 6, name: "Netflix", description: "Streaming and entertainment", solved: 25, total: 40, difficulty: "Medium" },
    { id: 7, name: "Twitter", description: "Social media platform", solved: 20, total: 35, difficulty: "Medium" },
    { id: 8, name: "LinkedIn", description: "Professional networking", solved: 28, total: 42, difficulty: "Medium" },
    { id: 9, name: "Uber", description: "Ride-sharing and delivery", solved: 22, total: 38, difficulty: "Medium" },
    { id: 10, name: "Airbnb", description: "Online marketplace for lodging", solved: 18, total: 32, difficulty: "Medium" }
  ];
  */

  // Remove client-side filtering since we're using server-side search
  // const filteredCompanies = companies.filter(company =>
  //   company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //   company.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //   (company.country && company.country.toLowerCase().includes(searchQuery.toLowerCase()))
  // );

  // Get featured companies (first 4 with highest question counts)
  const featuredCompanies = useMemo(() => {
    return companies
      .sort((a, b) => b.totalQuestions - a.totalQuestions)
      .slice(0, 4);
  }, [companies]);

  // Get remaining companies
  const allCompanies = useMemo(() => {
    return companies.filter(company => 
      !featuredCompanies.some(featured => featured.id === company.id)
    );
  }, [companies, featuredCompanies]);

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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
        <Header />
        <div className="pt-24 pb-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex flex-col items-center gap-4">
              <Lock className="w-16 h-16 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">Authentication Required</h2>
              <p className="text-slate-400 max-w-md">
                You need to sign in to access company question banks and track your progress.
              </p>
              <Button asChild className="mt-4 bg-purple-600 hover:bg-purple-700">
                <Link to="/auth">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
        <Header />
        <div className="pt-24 pb-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="text-slate-400 mt-4">Loading companies...</p>
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
            <Button onClick={() => window.location.reload()} className="mt-4">Retry</Button>
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
          {/* Page Title */}
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold text-white mb-2">
                Company Question Banks
              </h1>
              {refreshing && (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
              )}
            </div>
            <p className="text-slate-400 text-lg">
              Practice questions from top tech companies
            </p>
          </div>

          {/* Featured Companies Section - Only show when not searching */}
          {!searchQuery.trim() && featuredCompanies.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-400" />
                Featured Companies
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredCompanies.map((company) => (
                  <Card key={company.id} className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-colors flex flex-col h-full">
                    <CardHeader className="flex-shrink-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="w-6 h-6 text-purple-400" />
                        <CardTitle className="text-white">{company.name}</CardTitle>
                      </div>
                      <CardDescription className="text-slate-400">
                        {company.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-grow">
                      <div className="space-y-4 flex-grow">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Progress</span>
                            <span className="text-white">{company.solvedQuestions}/{company.totalQuestions}</span>
                          </div>
                          <Progress value={(company.solvedQuestions / company.totalQuestions) * 100} className="h-2" />
                        </div>
                      </div>
                      <Button asChild className="w-full bg-purple-600 hover:bg-purple-700 mt-4">
                        <Link to={`/companies/${company.id}`}>
                          View Questions <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* All Companies Section */}
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">All Companies</h2>
                <p className="text-slate-400">
                  Showing {companies.length} of {totalElements} companies
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search companies... (Press Enter to search)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400 w-full sm:w-64"
                  />
                </div>

                {/* Sort */}
                <div className="flex items-center gap-4">
                  {/* Sort */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="border-slate-700 text-slate-400 hover:bg-slate-800/50">
                        <ArrowUpDown className="w-4 h-4 mr-2" />
                        Sort
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-slate-800 border-slate-700">
                      <DropdownMenuItem onClick={() => setSortOrder("asc")}>
                        Name A-Z
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortOrder("desc")}>
                        Name Z-A
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortOrder(null)}>
                        Reset
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Companies Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map((company) => (
                <Card key={company.id} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg mb-2">{company.name}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                          {company.country && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {company.country}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            {company.totalQuestions} questions
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-grow">
                    <div className="space-y-4 flex-grow">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Progress</span>
                          <span className="text-white">{company.solvedQuestions}/{company.totalQuestions}</span>
                        </div>
                        <Progress value={(company.solvedQuestions / company.totalQuestions) * 100} className="h-2" />
                      </div>
                    </div>
                    <Button asChild className="w-full bg-purple-600 hover:bg-purple-700 mt-4">
                      <Link to={`/companies/${company.id}`}>
                        View Questions <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
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

export default Companies; 