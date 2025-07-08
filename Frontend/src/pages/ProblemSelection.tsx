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
  Clock, 
  TrendingUp,
  Star,
  Zap,
  Target,
  BookOpen
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";

// Types
interface Problem {
  id: number;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  tags: string[];
  company?: string;
  acceptanceRate: number;
  timeLimit: number;
  memoryLimit: number;
  isPremium: boolean;
  isFeatured: boolean;
  solvedCount: number;
  attemptedCount: number;
}

const ProblemSelection = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("popularity");
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  // Dummy data - in real app, this would come from an API
  const problems: Problem[] = [
    {
      id: 1,
      title: "Two Sum",
      description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
      difficulty: "Easy",
      category: "Array",
      tags: ["Array", "Hash Table"],
      company: "Google",
      acceptanceRate: 85,
      timeLimit: 2,
      memoryLimit: 38,
      isPremium: false,
      isFeatured: true,
      solvedCount: 1500000,
      attemptedCount: 1800000
    },
    {
      id: 2,
      title: "Add Two Numbers",
      description: "You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order.",
      difficulty: "Medium",
      category: "Linked List",
      tags: ["Linked List", "Math"],
      company: "Microsoft",
      acceptanceRate: 72,
      timeLimit: 3,
      memoryLimit: 47,
      isPremium: false,
      isFeatured: false,
      solvedCount: 800000,
      attemptedCount: 1100000
    },
    {
      id: 3,
      title: "Longest Substring Without Repeating Characters",
      description: "Given a string s, find the length of the longest substring without repeating characters.",
      difficulty: "Medium",
      category: "String",
      tags: ["String", "Sliding Window"],
      company: "Amazon",
      acceptanceRate: 68,
      timeLimit: 3,
      memoryLimit: 39,
      isPremium: true,
      isFeatured: true,
      solvedCount: 600000,
      attemptedCount: 900000
    },
    {
      id: 4,
      title: "Median of Two Sorted Arrays",
      description: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.",
      difficulty: "Hard",
      category: "Array",
      tags: ["Array", "Binary Search"],
      company: "Meta",
      acceptanceRate: 45,
      timeLimit: 4,
      memoryLimit: 49,
      isPremium: true,
      isFeatured: false,
      solvedCount: 300000,
      attemptedCount: 700000
    },
    {
      id: 5,
      title: "Valid Parentheses",
      description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
      difficulty: "Easy",
      category: "Stack",
      tags: ["Stack", "String"],
      company: "Apple",
      acceptanceRate: 78,
      timeLimit: 2,
      memoryLimit: 36,
      isPremium: false,
      isFeatured: false,
      solvedCount: 1200000,
      attemptedCount: 1500000
    },
    {
      id: 6,
      title: "Merge Two Sorted Lists",
      description: "Merge two sorted linked lists and return it as a sorted list. The list should be made by splicing together the nodes of the first two lists.",
      difficulty: "Easy",
      category: "Linked List",
      tags: ["Linked List", "Recursion"],
      company: "Netflix",
      acceptanceRate: 82,
      timeLimit: 2,
      memoryLimit: 38,
      isPremium: false,
      isFeatured: false,
      solvedCount: 900000,
      attemptedCount: 1100000
    },
    {
      id: 7,
      title: "Container With Most Water",
      description: "Given n non-negative integers height where each represents a point at coordinate (i, height[i]), find two lines that together with the x-axis form a container.",
      difficulty: "Medium",
      category: "Array",
      tags: ["Array", "Two Pointers"],
      company: "Uber",
      acceptanceRate: 65,
      timeLimit: 3,
      memoryLimit: 49,
      isPremium: true,
      isFeatured: true,
      solvedCount: 500000,
      attemptedCount: 800000
    },
    {
      id: 8,
      title: "3Sum",
      description: "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.",
      difficulty: "Medium",
      category: "Array",
      tags: ["Array", "Two Pointers"],
      company: "LinkedIn",
      acceptanceRate: 58,
      timeLimit: 3,
      memoryLimit: 47,
      isPremium: false,
      isFeatured: false,
      solvedCount: 400000,
      attemptedCount: 700000
    },
    {
      id: 9,
      title: "Remove Nth Node From End of List",
      description: "Given the head of a linked list, remove the nth node from the end of the list and return its head.",
      difficulty: "Medium",
      category: "Linked List",
      tags: ["Linked List", "Two Pointers"],
      company: "Twitter",
      acceptanceRate: 70,
      timeLimit: 2,
      memoryLimit: 38,
      isPremium: false,
      isFeatured: false,
      solvedCount: 600000,
      attemptedCount: 850000
    },
    {
      id: 10,
      title: "Regular Expression Matching",
      description: "Given an input string s and a pattern p, implement regular expression matching with support for '.' and '*'.",
      difficulty: "Hard",
      category: "String",
      tags: ["String", "Dynamic Programming"],
      company: "Airbnb",
      acceptanceRate: 35,
      timeLimit: 4,
      memoryLimit: 49,
      isPremium: true,
      isFeatured: false,
      solvedCount: 200000,
      attemptedCount: 600000
    },
    {
      id: 11,
      title: "Palindrome Number",
      description: "Given an integer x, return true if x is a palindrome, and false otherwise.",
      difficulty: "Easy",
      category: "Math",
      tags: ["Math"],
      company: "Google",
      acceptanceRate: 88,
      timeLimit: 2,
      memoryLimit: 36,
      isPremium: false,
      isFeatured: false,
      solvedCount: 1000000,
      attemptedCount: 1200000
    },
    {
      id: 12,
      title: "Integer to Roman",
      description: "Given an integer, convert it to a roman numeral.",
      difficulty: "Medium",
      category: "Math",
      tags: ["Math", "String"],
      company: "Microsoft",
      acceptanceRate: 75,
      timeLimit: 3,
      memoryLimit: 39,
      isPremium: false,
      isFeatured: false,
      solvedCount: 350000,
      attemptedCount: 500000
    }
  ];

  // Available categories and tags for filtering
  const categories = ["Array", "String", "Linked List", "Stack", "Math"];
  const allTags = ["Array", "Hash Table", "Linked List", "Math", "String", "Sliding Window", "Binary Search", "Two Pointers", "Recursion", "Dynamic Programming"];

  // Filter and sort problems
  const filteredAndSortedProblems = useMemo(() => {
    let filtered = problems.filter(problem => {
      // Search filter
      const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           problem.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           problem.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      // Difficulty filter
      const matchesDifficulty = selectedDifficulty === "all" || problem.difficulty === selectedDifficulty;

      // Category filter
      const matchesCategory = selectedCategory === "all" || problem.category === selectedCategory;

      // Tags filter
      const matchesTags = selectedTags.length === 0 || 
                         selectedTags.some(tag => problem.tags.includes(tag));

      // Premium filter
      const matchesPremium = !showPremiumOnly || problem.isPremium;

      // Featured filter
      const matchesFeatured = !showFeaturedOnly || problem.isFeatured;

      return matchesSearch && matchesDifficulty && matchesCategory && matchesTags && matchesPremium && matchesFeatured;
    });

    // Sort problems
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "popularity":
          return b.solvedCount - a.solvedCount;
        case "difficulty":
          const difficultyOrder = { "Easy": 1, "Medium": 2, "Hard": 3 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        case "acceptance":
          return b.acceptanceRate - a.acceptanceRate;
        case "newest":
          return b.id - a.id;
        default:
          return 0;
      }
    });

    return filtered;
  }, [problems, searchTerm, selectedDifficulty, selectedCategory, selectedTags, sortBy, showPremiumOnly, showFeaturedOnly]);

  const handleProblemSelect = (problem: Problem) => {
    navigate(`/coding-editor/problem/${problem.id}`);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      <Header />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button asChild variant="ghost" className="text-slate-400 hover:text-white mb-4">
              <Link to="/companies">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Companies
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
                        placeholder="Search problems..."
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

                  {/* Category Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Category</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="all" className="text-slate-300">All Categories</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category} value={category} className="text-slate-300">
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tags Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Tags</label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {allTags.map(tag => (
                        <div key={tag} className="flex items-center space-x-2">
                          <Checkbox
                            id={tag}
                            checked={selectedTags.includes(tag)}
                            onCheckedChange={() => toggleTag(tag)}
                            className="border-slate-600 data-[state=checked]:bg-purple-600"
                          />
                          <label htmlFor={tag} className="text-sm text-slate-300 cursor-pointer">
                            {tag}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Premium Filter */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="premium"
                        checked={showPremiumOnly}
                        onCheckedChange={(checked) => setShowPremiumOnly(checked as boolean)}
                        className="border-slate-600 data-[state=checked]:bg-purple-600"
                      />
                      <label htmlFor="premium" className="text-sm text-slate-300 cursor-pointer">
                        Premium Only
                      </label>
                    </div>
                  </div>

                  {/* Featured Filter */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="featured"
                        checked={showFeaturedOnly}
                        onCheckedChange={(checked) => setShowFeaturedOnly(checked as boolean)}
                        className="border-slate-600 data-[state=checked]:bg-purple-600"
                      />
                      <label htmlFor="featured" className="text-sm text-slate-300 cursor-pointer">
                        Featured Only
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content - Problems List */}
            <div className="lg:col-span-3 space-y-6">
              {/* Sort and Results Count */}
              <div className="flex justify-between items-center">
                <div className="text-slate-400">
                  {filteredAndSortedProblems.length} problem{filteredAndSortedProblems.length !== 1 ? 's' : ''} found
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48 bg-slate-700 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="popularity" className="text-slate-300">Sort by Popularity</SelectItem>
                    <SelectItem value="difficulty" className="text-slate-300">Sort by Difficulty</SelectItem>
                    <SelectItem value="acceptance" className="text-slate-300">Sort by Acceptance Rate</SelectItem>
                    <SelectItem value="newest" className="text-slate-300">Sort by Newest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Problems List */}
              <div className="h-[600px] overflow-y-auto space-y-4 pr-2">
                {filteredAndSortedProblems.map((problem) => (
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
                            {problem.isPremium && (
                              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                                <Star className="w-3 h-3 mr-1" />
                                Premium
                              </Badge>
                            )}
                            {problem.isFeatured && (
                              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                                <Zap className="w-3 h-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-slate-400 line-clamp-2">{problem.description}</p>
                          
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <div className="flex items-center gap-1">
                              <BookOpen className="w-4 h-4" />
                              {problem.category}
                            </div>
                            <div className="flex items-center gap-1">
                              <Target className="w-4 h-4" />
                              {problem.acceptanceRate}% acceptance
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {problem.timeLimit}s
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              {problem.solvedCount.toLocaleString()} solved
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            {problem.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-slate-400 border-slate-600">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <Button className="bg-purple-600 hover:bg-purple-700">
                          Solve
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {filteredAndSortedProblems.length === 0 && (
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