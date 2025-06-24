import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Building2, Star, ArrowRight, Search, ArrowUpDown, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { useState, useMemo, useEffect } from "react";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

const Companies = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch companies from API
  useEffect(() => {
    if (!user) {
      setError("Please sign in to view companies");
      return;
    }

    setLoading(true);
    setError(null);
    api.get("/companies")
      .then(res => {
        setCompanies(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching companies:", err);
        if (err.response?.status === 401) {
          setError("Authentication required. Please sign in again.");
        } else {
          setError("Failed to load companies");
        }
        setLoading(false);
      });
  }, [user]);

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

  const filteredAndSortedCompanies = useMemo(() => {
    let filtered = companies.filter(company => 
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortOrder) {
      filtered.sort((a, b) => {
        if (sortOrder === "asc") {
          return a.name.localeCompare(b.name);
        } else {
          return b.name.localeCompare(a.name);
        }
      });
    }

    return filtered;
  }, [companies, searchQuery, sortOrder]);

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
            <h1 className="text-4xl font-bold text-white mb-2">
              Company Question Banks
            </h1>
            <p className="text-slate-400 text-lg">
              Practice questions from top tech companies
            </p>
          </div>

          {/* Featured Companies Section */}
          {featuredCompanies.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-400" />
                Featured Companies
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredCompanies.map((company) => (
                  <Card key={company.id} className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-colors flex flex-col h-full">
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="w-6 h-6 text-purple-400" />
                        <CardTitle className="text-white">{company.name}</CardTitle>
                      </div>
                      <CardDescription className="text-slate-400">
                        {company.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-grow justify-end h-full">
                      <div className="mt-auto space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Progress</span>
                            <span className="text-white">{company.solvedQuestions}/{company.totalQuestions}</span>
                          </div>
                          <Progress value={(company.solvedQuestions / company.totalQuestions) * 100} className="h-2" />
                        </div>
                        <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                          <Link to={`/companies/${company.id}`}>
                            View Questions <ArrowRight className="ml-2 w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* All Companies Section */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">All Companies</h2>
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search companies..."
                    className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-slate-700 text-slate-400 hover:text-white">
                      <ArrowUpDown className="w-4 h-4 mr-2" />
                      Sort
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-slate-800 border-slate-700">
                    <DropdownMenuItem 
                      className="text-slate-400 hover:text-white hover:bg-slate-700"
                      onClick={() => setSortOrder("asc")}
                    >
                      A to Z
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-slate-400 hover:text-white hover:bg-slate-700"
                      onClick={() => setSortOrder("desc")}
                    >
                      Z to A
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-slate-400 hover:text-white hover:bg-slate-700"
                      onClick={() => setSortOrder(null)}
                    >
                      Reset
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedCompanies.map((company) => (
                <Card key={company.id} className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-colors flex flex-col h-full">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-6 h-6 text-purple-400" />
                      <CardTitle className="text-white">{company.name}</CardTitle>
                    </div>
                    <CardDescription className="text-slate-400">
                      {company.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-grow justify-end h-full">
                    <div className="mt-auto space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Progress</span>
                          <span className="text-white">{company.solvedQuestions}/{company.totalQuestions}</span>
                        </div>
                        <Progress value={(company.solvedQuestions / company.totalQuestions) * 100} className="h-2" />
                      </div>
                      <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                        <Link to={`/companies/${company.id}`}>
                          View Questions <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Companies; 