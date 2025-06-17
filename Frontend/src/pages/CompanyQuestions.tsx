import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, ArrowLeft, CheckCircle, Code2, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Editor from "@monaco-editor/react";

const CompanyQuestions = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(null);
  
  // Mock data - in real app, this would come from an API
  const companyData = {
    id: companyId,
    name: "Google",
    description: "Top tech company focusing on search and AI",
    totalQuestions: 60,
    solvedQuestions: 45
  };

  const allCompanies = [
    { id: 1, name: "Google", solved: 45, total: 60 },
    { id: 2, name: "Microsoft", solved: 38, total: 55 },
    { id: 3, name: "Amazon", solved: 42, total: 58 },
    { id: 4, name: "Meta", solved: 35, total: 50 },
    { id: 5, name: "Apple", solved: 30, total: 45 },
    { id: 6, name: "Netflix", solved: 25, total: 40 },
    { id: 7, name: "Twitter", solved: 20, total: 35 },
    { id: 8, name: "LinkedIn", solved: 28, total: 42 },
    { id: 9, name: "Uber", solved: 22, total: 38 },
    { id: 10, name: "Airbnb", solved: 18, total: 32 }
  ];

  const questions = [
    {
      id: 1,
      title: "Two Sum",
      description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
      difficulty: "Easy",
      status: "solved",
      tags: ["Array", "Hash Table"],
      solution: `// Time Complexity: O(n)
// Space Complexity: O(n)
function twoSum(nums: number[], target: number): number[] {
    const map = new Map<number, number>();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        
        if (map.has(complement)) {
            return [map.get(complement)!, i];
        }
        
        map.set(nums[i], i);
    }
    
    return [];
}`
    },
    {
      id: 2,
      title: "Add Two Numbers",
      description: "You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit.",
      difficulty: "Medium",
      status: "attempted",
      tags: ["Linked List", "Math"],
      solution: `// Time Complexity: O(max(n, m))
// Space Complexity: O(max(n, m))
function addTwoNumbers(l1: ListNode | null, l2: ListNode | null): ListNode | null {
    const dummy = new ListNode(0);
    let current = dummy;
    let carry = 0;
    
    while (l1 || l2 || carry) {
        const x = l1 ? l1.val : 0;
        const y = l2 ? l2.val : 0;
        const sum = x + y + carry;
        
        carry = Math.floor(sum / 10);
        current.next = new ListNode(sum % 10);
        current = current.next;
        
        if (l1) l1 = l1.next;
        if (l2) l2 = l2.next;
    }
    
    return dummy.next;
}`
    },
    {
      id: 3,
      title: "Longest Substring Without Repeating Characters",
      description: "Given a string s, find the length of the longest substring without repeating characters.",
      difficulty: "Medium",
      status: "unsolved",
      tags: ["String", "Sliding Window"],
      solution: `// Time Complexity: O(n)
// Space Complexity: O(min(m, n))
function lengthOfLongestSubstring(s: string): number {
    const map = new Map<string, number>();
    let maxLength = 0;
    let start = 0;
    
    for (let end = 0; end < s.length; end++) {
        const char = s[end];
        
        if (map.has(char)) {
            start = Math.max(start, map.get(char)! + 1);
        }
        
        map.set(char, end);
        maxLength = Math.max(maxLength, end - start + 1);
    }
    
    return maxLength;
}`
    },
    {
      id: 4,
      title: "Median of Two Sorted Arrays",
      description: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.",
      difficulty: "Hard",
      status: "unsolved",
      tags: ["Array", "Binary Search"],
      solution: `// Time Complexity: O(log(min(m, n)))
// Space Complexity: O(1)
function findMedianSortedArrays(nums1: number[], nums2: number[]): number {
    if (nums1.length > nums2.length) {
        return findMedianSortedArrays(nums2, nums1);
    }
    
    const x = nums1.length;
    const y = nums2.length;
    let low = 0;
    let high = x;
    
    while (low <= high) {
        const partitionX = Math.floor((low + high) / 2);
        const partitionY = Math.floor((x + y + 1) / 2) - partitionX;
        
        const maxLeftX = partitionX === 0 ? -Infinity : nums1[partitionX - 1];
        const minRightX = partitionX === x ? Infinity : nums1[partitionX];
        
        const maxLeftY = partitionY === 0 ? -Infinity : nums2[partitionY - 1];
        const minRightY = partitionY === y ? Infinity : nums2[partitionY];
        
        if (maxLeftX <= minRightY && maxLeftY <= minRightX) {
            if ((x + y) % 2 === 0) {
                return (Math.max(maxLeftX, maxLeftY) + Math.min(minRightX, minRightY)) / 2;
            } else {
                return Math.max(maxLeftX, maxLeftY);
            }
        } else if (maxLeftX > minRightY) {
            high = partitionX - 1;
        } else {
            low = partitionX + 1;
        }
    }
    
    return 0;
}`
    }
  ];

  const toggleAnswer = (questionId: number) => {
    setExpandedQuestionId(expandedQuestionId === questionId ? null : questionId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      <Header />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Back Button and Company Info */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <Button asChild variant="ghost" className="text-slate-400 hover:text-white">
                <Link to="/companies">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Companies
                </Link>
              </Button>
              
              <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="border-slate-700 text-slate-400 hover:text-white">
                    All Companies
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-slate-900 border-slate-800">
                  <SheetHeader>
                    <SheetTitle className="text-white">All Companies</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-2">
                    {allCompanies.map((company) => (
                      <Button
                        key={company.id}
                        variant="ghost"
                        className={`w-full justify-between text-left ${
                          company.id === Number(companyId)
                            ? 'bg-purple-500/10 text-purple-400'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                        onClick={() => {
                          navigate(`/companies/${company.id}`);
                          setIsSidebarOpen(false);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          <span>{company.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {company.solved}/{company.total}
                          </span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </Button>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            
            <div className="flex items-center gap-4 mt-4">
              <Building2 className="w-12 h-12 text-purple-400" />
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  {companyData.name} Questions
                </h1>
                <p className="text-slate-400 text-lg">
                  {companyData.description}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Overview */}
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

          {/* Questions List */}
          <div className="space-y-6">
            {questions.map((question) => (
              <Card key={question.id} className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-5 h-5 text-purple-400" />
                        <h3 className="text-xl font-semibold text-white">{question.title}</h3>
                        <Badge className={`${
                          question.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                          question.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                          'bg-red-500/20 text-red-400 border-red-500/30'
                        }`}>
                          {question.difficulty}
                        </Badge>
                        {question.status === 'solved' && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            Solved
                          </Badge>
                        )}
                        {question.status === 'attempted' && (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                            Attempted
                          </Badge>
                        )}
                      </div>
                      <p className="text-slate-400">{question.description}</p>
                      <div className="flex gap-2">
                        {question.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-slate-400 border-slate-600">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
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
                      <Button 
                        className="bg-purple-600 hover:bg-purple-700"
                        onClick={() => navigate(`/companies/${companyId}/questions/${question.id}`)}
                      >
                        Solve This
                      </Button>
                    </div>
                  </div>

                  {/* Expandable Answer Section */}
                  {expandedQuestionId === question.id && (
                    <div className="mt-6 border-t border-slate-700 pt-6">
                      <h4 className="text-lg font-semibold text-white mb-4">Solution</h4>
                      <div className="h-[300px] border border-slate-700 rounded-lg overflow-hidden">
                        <Editor
                          height="100%"
                          defaultLanguage="typescript"
                          theme="vs-dark"
                          value={question.solution}
                          options={{
                            readOnly: true,
                            minimap: { enabled: false },
                            fontSize: 14,
                            lineNumbers: "on",
                            roundedSelection: false,
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CompanyQuestions; 