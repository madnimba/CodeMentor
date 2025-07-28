import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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
  difficulty: "Easy" | "Medium" | "Hard";
  company?: string;
  isCoding: boolean;
}

const ProblemSelection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch coding problems from all companies
  useEffect(() => {
    const fetchCodingProblems = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // First, get all companies
        const companiesResponse = await api.get('/companies');
        const companies = companiesResponse.data;
        
        // Then, get coding questions from each company
        const allCodingProblems: Problem[] = [];
        
        for (const company of companies) {
          try {
            const codingQuestionsResponse = await api.get(`/companies/${company.id}/questions/coding`);
            console.log(`Coding questions for ${company.name}:`, codingQuestionsResponse.data);
            
            if (codingQuestionsResponse.data && codingQuestionsResponse.data.length > 0) {
              const companyQuestions = codingQuestionsResponse.data.map((q: any) => ({
                id: q.id,
                title: q.title,
                difficulty: q.difficulty as "Easy" | "Medium" | "Hard",
                company: company.name,
                isCoding: q.isCoding || true
              }));
              allCodingProblems.push(...companyQuestions);
            }
          } catch (err) {
            console.warn(`Failed to fetch coding questions for company ${company.name}:`, err);
          }
        }
        
        console.log('Total coding problems found:', allCodingProblems.length);
        setProblems(allCodingProblems);
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
  }, [toast]);

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
                      <div className="flex justify-between items-center">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-semibold text-white">{problem.title}</h3>
                            <Badge className={`${
                              problem.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                              problem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                              'bg-red-500/20 text-red-400 border-red-500/30'
                            }`}>
                              {problem.difficulty}
                            </Badge>
                          </div>
                          
                          {problem.company && (
                            <div className="flex items-center gap-1 text-sm text-slate-400">
                              <Building2 className="w-4 h-4" />
                              {problem.company}
                            </div>
                          )}
                        </div>
                        
                        <Button className="bg-purple-600 hover:bg-purple-700">
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
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProblemSelection; 