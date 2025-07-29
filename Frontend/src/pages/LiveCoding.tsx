import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Markdown } from "@/components/ui/markdown";
import { ArrowLeft, Code2, Play, CheckCircle, AlertCircle, ChevronDown, Loader2, Search } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { useToast } from "@/components/ui/use-toast";
import { judge0Service, CodeExecutionResponse } from "@/services/judge0";
import { api } from "@/services/api";
import { submissionsApi, CreateSubmissionRequest } from "@/services/submissions";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";

interface QuestionDetails {
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  importanceTag?: string;
  track?: {
    id: number;
    name: string;
  };
  upvotes: number;
  downvotes: number;
  testcases?: Array<{
    id: number;
    test1: string;
    output1: string;
    test2: string;
    output2: string;
    test3: string;
    output3: string;
  }>;
  hints?: string[];
}

const LiveCoding = () => {
  const { companyId, questionId } = useParams();
  const navigate = useNavigate();
  
  console.log('LiveCoding component - companyId:', companyId, 'questionId:', questionId);
  
  const [activeTab, setActiveTab] = useState("description");
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [serverHealth, setServerHealth] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [submissionResult, setSubmissionResult] = useState<'success' | 'failure' | null>(null);
  const [testInput, setTestInput] = useState(""); // New state for test input
  const { toast } = useToast();
  const [questionDetails, setQuestionDetails] = useState<QuestionDetails | null>(null);

  // Fetch questions from the database
  useEffect(() => {
    const fetchQuestionDetails = async () => {
      if (!questionId) return;
      setIsLoadingQuestions(true);
      try {
        let response;
        if (companyId) {
          // If we have companyId, use the company-specific endpoint
          response = await api.get(`/companies/${companyId}/questions/${questionId}/details`);
        } else {
          // If no companyId, we need to find the question from all companies
          // For now, let's use a fallback approach
          const companiesResponse = await api.get('/companies');
          const companies = companiesResponse.data;
          
          let foundQuestion = null;
          for (const company of companies) {
            try {
              const questionResponse = await api.get(`/companies/${company.id}/questions/${questionId}/details`);
              foundQuestion = questionResponse.data;
              break;
            } catch (err) {
              // Continue to next company
            }
          }
          
          if (!foundQuestion) {
            throw new Error('Question not found');
          }
          
          response = { data: foundQuestion };
        }
        
        setQuestionDetails(response.data);
        updateQuestionData(response.data);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: 'Failed to load question details',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingQuestions(false);
      }
    };
    fetchQuestionDetails();
  }, [companyId, questionId]);

  

  // Update question data when a question is selected
  const updateQuestionData = (question: QuestionDetails) => {
    setSelectedQuestion(question);
    
    // Don't set any default code template - let users start with empty editor
    // setCode(templates[selectedLanguage as keyof typeof templates] || templates.javascript);
  };

  // Filter questions based on search term
  const filteredQuestions = questions.filter(question =>
    question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check server health on component mount
  useEffect(() => {
    const checkServerHealth = async () => {
      try {
        const health = await judge0Service.checkHealth();
        setServerHealth(health);
        setIsConnected(true);
        toast({
          title: "Connected",
          description: "Connected to code execution service",
        });
      } catch (error) {
        setIsConnected(false);
        toast({
          title: "Connection Error",
          description: "Failed to connect to code execution service",
          variant: "destructive",
        });
      }
    };

    checkServerHealth();
    
    // Check health every 30 seconds
    const interval = setInterval(checkServerHealth, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRunCode = async () => {
    if (!isConnected) {
      toast({
        title: "Error",
        description: "Not connected to code execution service. Please wait...",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    setOutput([]);
    setSubmissionResult(null); // Reset submission result for normal run

    try {
      const result: CodeExecutionResponse = await judge0Service.executeCode({
        code: code,
        language: selectedLanguage,
        input: testInput // Pass the test input
      });

      // Process the result
      const outputLines: string[] = [];
      
      if (result.stdout) {
        outputLines.push(...result.stdout.split('\n').filter(line => line.trim()));
      }
      
      if (result.stderr) {
        outputLines.push(`Error: ${result.stderr}`);
      }
      
      if (result.compile_output) {
        outputLines.push(`Compilation: ${result.compile_output}`);
      }
      
      if (result.execution_time) {
        outputLines.push(`Execution time: ${result.execution_time}s`);
      }
      
      if (result.memory_used) {
        outputLines.push(`Memory used: ${result.memory_used}KB`);
      }

      setOutput(outputLines);

      // Show status toast
      if (result.status === "Accepted") {
        toast({
          title: "Success",
          description: "Code executed successfully",
        });
      } else {
        toast({
          title: "Execution Completed",
          description: `Status: ${result.status}`,
          variant: result.status.includes("Error") ? "destructive" : "default",
        });
      }

    } catch (error: any) {
      console.error('Error executing code:', error);
      setOutput([`Error: ${error.message}`]);
      toast({
        title: "Execution Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!isConnected) {
      toast({
        title: "Error",
        description: "Not connected to code execution service. Please wait...",
        variant: "destructive",
      });
      return;
    }

    if (!questionDetails?.testcases || questionDetails.testcases.length === 0) {
      toast({
        title: "Error",
        description: "No test cases available for this question",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    setOutput([]);

    try {
      const testCase = questionDetails.testcases[0]; // Use the first test case
      const testCases = [
        { input: testCase.test1, expected: testCase.output1, name: "Test Case 1" },
        { input: testCase.test2, expected: testCase.output2, name: "Test Case 2" },
        { input: testCase.test3, expected: testCase.output3, name: "Test Case 3" }
      ];

      // Filter out test cases that don't have input or expected output
      const validTestCases = testCases.filter(tc => tc.input && tc.expected);

      if (validTestCases.length === 0) {
        toast({
          title: "Error",
          description: "No valid test cases available",
          variant: "destructive",
        });
        return;
      }

      const results = [];
      const outputLines = [];

      // Execute each test case
      for (let i = 0; i < validTestCases.length; i++) {
        const testCase = validTestCases[i];
        
        outputLines.push(`\n--- ${testCase.name} ---`);
        outputLines.push(`Input: ${testCase.input}`);
        outputLines.push(`Expected: ${testCase.expected}`);

        try {
          const result: CodeExecutionResponse = await judge0Service.executeCode({
            code: code,
            language: selectedLanguage,
            input: testCase.input
          });

          // Process the result
          if (result.stdout) {
            outputLines.push(`Output: ${result.stdout.trim()}`);
          }
          
          if (result.stderr) {
            outputLines.push(`Error: ${result.stderr}`);
          }
          
          if (result.compile_output) {
            outputLines.push(`Compilation: ${result.compile_output}`);
          }

          // Extract the actual result from the output
          let actualResult = '';
          const actualOutput = result.stdout?.trim() || '';
          const outputLinesArray = actualOutput.split('\n');
          for (let j = outputLinesArray.length - 1; j >= 0; j--) {
            const line = outputLinesArray[j].trim();
            if (line && !line.includes('Input:') && !line.includes('Expected:') && !line.includes('Output:')) {
              actualResult = line;
              break;
            }
          }

          // Clean up the actual result
          actualResult = actualResult.replace(/^\[|\]$/g, '');
          const expectedClean = testCase.expected.trim().replace(/^\[|\]$/g, '');

          // Compare the actual result with expected output
          const isCorrect = actualResult === expectedClean || 
                           actualResult === testCase.expected.trim() ||
                           actualResult === `[${testCase.expected.trim()}]` ||
                           actualResult === testCase.expected.trim().replace(/[\[\]]/g, '');

          results.push({
            testCase: testCase.name,
            input: testCase.input,
            expected: testCase.expected,
            actual: actualResult,
            passed: isCorrect
          });

          outputLines.push(`Status: ${isCorrect ? '✅ PASSED' : '❌ FAILED'}`);

        } catch (error: any) {
          outputLines.push(`Error: ${error.message}`);
          results.push({
            testCase: testCase.name,
            input: testCase.input,
            expected: testCase.expected,
            actual: 'ERROR',
            passed: false
          });
        }
      }

      setOutput(outputLines);

      // Check if all test cases passed
      const allPassed = results.every(result => result.passed);
      const passedCount = results.filter(result => result.passed).length;
      const totalCount = results.length;

      if (allPassed) {
        setSubmissionResult('success');
        toast({
          title: "🎉 All Tests Passed!",
          description: `${passedCount}/${totalCount} test cases passed`,
          variant: "default",
        });
        
        // Save submission to database
        try {
          console.log('Attempting to save submission to database...');
          console.log('User token:', localStorage.getItem('token'));
          console.log('Question ID:', questionId);
          
          const submissionRequest: CreateSubmissionRequest = {
            questionId: parseInt(questionId!),
            code: code,
            language: selectedLanguage,
            status: 'accepted'
          };
          
          console.log('Submission request:', submissionRequest);
          await submissionsApi.submitCode(submissionRequest);
          console.log('Submission saved to database successfully');
        } catch (error) {
          console.error('Failed to save submission to database:', error);
          // Don't show error toast to user since the main functionality worked
        }
      } else {
        setSubmissionResult('failure');
        toast({
          title: "❌ Some Tests Failed",
          description: `${passedCount}/${totalCount} test cases passed`,
          variant: "destructive",
        });
        
        // Save failed submission to database
        try {
          console.log('Attempting to save failed submission to database...');
          console.log('User token:', localStorage.getItem('token'));
          console.log('Question ID:', questionId);
          
          const submissionRequest: CreateSubmissionRequest = {
            questionId: parseInt(questionId!),
            code: code,
            language: selectedLanguage,
            status: 'rejected'
          };
          
          console.log('Failed submission request:', submissionRequest);
          await submissionsApi.submitCode(submissionRequest);
          console.log('Failed submission saved to database successfully');
        } catch (error) {
          console.error('Failed to save submission to database:', error);
          // Don't show error toast to user since the main functionality worked
        }
      }

    } catch (error: any) {
      console.error('Error submitting code:', error);
      setOutput([`Error: ${error.message}`]);
      toast({
        title: "Submission Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    
    // Don't set any default code template - let users write their own code
    // setCode(templates[language as keyof typeof templates] || templates.javascript);
  };

  // Mock data - in real app, this would come from an API
  const questionData: QuestionDetails = questionDetails || {
    title: 'Two Sum',
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.`,
    difficulty: 'Easy',
    importanceTag: '',
    track: undefined,
    upvotes: 0,
    downvotes: 0,
    testcases: [
      {
        id: 1,
        test1: "nums = [2,7,11,15], target = 9",
        output1: "[0,1]",
        test2: "nums = [3,2,4], target = 6",
        output2: "[1,2]",
        test3: "nums = [3,3], target = 6",
        output3: "[0,1]"
      }
    ],
    hints: [
      'Try using a hash map to store the numbers you\'ve seen so far',
      'For each number, check if its complement (target - number) exists in the hash map',
      'If the complement exists, you\'ve found your pair'
    ]
  };

  if (isLoadingQuestions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
        <Header />
        <div className="pt-24 pb-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="text-slate-400 mt-4">Loading question...</p>
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
          
          
          {/* Back Button and Question Info */}
          <div className="mb-8">
            <Button asChild variant="ghost" className="text-slate-400 hover:text-white mb-4">
              <Link to={companyId ? `/companies/${companyId}` : "/problem-selection"}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {companyId ? "Back to Questions" : "Back to Problem Selection"}
              </Link>
            </Button>

            <div className="flex items-center gap-4">
              <Code2 className="w-12 h-12 text-purple-400" />
              <div>
                {/* <h1 className="text-4xl font-bold text-white mb-2">
                  <span
                    dangerouslySetInnerHTML={{
                      __html: getFirstParagraphOnly(questionData.title),
                    }}
                  />
                </h1> */}
                <Badge
                  className={`${
                    questionData.difficulty === "Easy"
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : questionData.difficulty === "Medium"
                      ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                      : "bg-red-500/20 text-red-400 border-red-500/30"
                  }`}
                >
                  {questionData.difficulty}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Problem Description and Hints */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <Markdown content={questionData.description} />
                </CardContent>
              </Card>

              {/* Hints */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Hints</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {questionData.hints?.map((hint: string, index: number) => (
                      <div key={index} className="flex items-start gap-2 text-slate-300">
                        <span className="text-purple-400">{index + 1}.</span>
                        <span>{hint}</span>
                      </div>
                    )) || (
                      <div className="text-slate-400 text-center py-4">
                        No hints available for this question
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Expected Input/Output Format */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Expected Input/Output Format</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2 text-slate-300">
                      <span className="text-blue-400 font-medium">Input Format:</span>
                      <span className="text-slate-200">
                        {questionData.testcases?.[0]?.test1 || "No test case available"}
                      </span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-300">
                      <span className="text-green-400 font-medium">Output Format:</span>
                      <span className="text-slate-200">
                        {questionData.testcases?.[0]?.output1 || "No output format available"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Code Editor and Output */}
            <div className="lg:col-span-2 space-y-6">
              {/* Code Editor */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Code Editor</CardTitle>
                    <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                      <SelectTrigger className="w-32 bg-slate-700 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {judge0Service.getSupportedLanguages().map((lang) => (
                          <SelectItem key={lang.id} value={lang.id} className="text-slate-300">
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Test Input Field */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Test Input (optional)
                      </label>
                      <textarea
                        value={testInput}
                        onChange={(e) => setTestInput(e.target.value)}
                        placeholder="Enter test input here (e.g., [1,2,3,4] 9)"
                        className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 resize-none"
                        rows={2}
                      />
                    </div>
                    
                    {/* Code Editor */}
                    <div className="h-[500px] border border-slate-700 rounded-lg overflow-hidden">
                      <Editor
                        height="100%"
                        language={judge0Service.getMonacoLanguage(selectedLanguage)}
                        theme="vs-dark"
                        value={code}
                        onChange={(value) => setCode(value || "")}
                        options={{
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
                </CardContent>
              </Card>

              {/* Output */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Output</CardTitle>
                  {submissionResult && (
                    <div className={`text-sm font-medium ${
                      submissionResult === 'success' 
                        ? 'text-green-400' 
                        : 'text-red-400'
                    }`}>
                      {submissionResult === 'success' ? '✅ Test Passed' : '❌ Test Failed'}
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] bg-slate-900/50 p-4 rounded-lg overflow-auto font-mono text-sm">
                    {output.length === 0 ? (
                      <div className="text-slate-500">No output yet. Run your code to see the results.</div>
                    ) : (
                      output.map((line, index) => (
                        <div key={index} className="text-slate-300">{line}</div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button 
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  onClick={handleRunCode}
                  disabled={isRunning || !isConnected}
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      {isConnected ? 'Run Code' : 'Connecting...'}
                    </>
                  )}
                </Button>
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={handleSubmit}
                  disabled={isRunning || !isConnected}
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Submit
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LiveCoding;