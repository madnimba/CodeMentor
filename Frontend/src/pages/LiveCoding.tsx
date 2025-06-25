import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Code2, Play, CheckCircle, AlertCircle, ChevronDown, Loader2, Search } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { useToast } from "@/components/ui/use-toast";
import { judge0Service, CodeExecutionResponse } from "@/services/judge0";
import { api } from "@/services/api";

const LiveCoding = () => {
  const { companyId, questionId } = useParams();
  const navigate = useNavigate();
  
  console.log('LiveCoding component - companyId:', companyId, 'questionId:', questionId);
  
  const [activeTab, setActiveTab] = useState("description");
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState(`// Write your solution here
function solution(nums, target) {
    // Create a map to store numbers and their indices
    const numMap = new Map();
    
    // Iterate through the array
    for (let i = 0; i < nums.length; i++) {
        // Calculate the complement needed
        const complement = target - nums[i];
        
        // If complement exists in map, we found our pair
        if (numMap.has(complement)) {
            return [numMap.get(complement), i];
        }
        
        // Store current number and its index
        numMap.set(nums[i], i);
    }
    
    // No solution found
    return [];
}

// Test cases
console.log("Test Case 1:");
console.log("Input: nums = [2,7,11,15], target = 9");
console.log("Output:", solution([2,7,11,15], 9));

console.log("\\nTest Case 2:");
console.log("Input: nums = [3,2,4], target = 6");
console.log("Output:", solution([3,2,4], 6));

console.log("\\nTest Case 3:");
console.log("Input: nums = [3,3], target = 6");
console.log("Output:", solution([3,3], 6));`);
  
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [serverHealth, setServerHealth] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Fetch questions from the database
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!companyId) return;
      
      setIsLoadingQuestions(true);
      try {
        console.log('Fetching questions for company:', companyId);
        console.log('API URL:', `/companies/${companyId}/questions`);
        
        const response = await api.get(`/companies/${companyId}/questions`);
        console.log('API Response:', response);
        console.log('Questions data:', response.data);
        
        setQuestions(response.data);
        
        // If questionId is provided, find and set the selected question
        if (questionId) {
          const question = response.data.find((q: any) => q.id === parseInt(questionId));
          if (question) {
            setSelectedQuestion(question);
            updateQuestionData(question);
          }
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
        console.error('Error details:', error.response?.data);
        console.error('Error status:', error.response?.status);
        toast({
          title: "Error",
          description: "Failed to load questions",
          variant: "destructive",
        });
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    fetchQuestions();
  }, [companyId, questionId]);

  // Update question data when a question is selected
  const updateQuestionData = (question: any) => {
    setSelectedQuestion(question);
    
    // Update code template based on the question
    const templates = {
      javascript: `// ${question.title}
// ${question.description}

function solution() {
    // Your solution here
    return null;
}

// Test your solution here
console.log("Testing solution...");`,
      python: `# ${question.title}
# ${question.description}

def solution():
    # Your solution here
    return None

# Test your solution here
print("Testing solution...")`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

// ${question.title}
// ${question.description}

// Your solution here
void solution() {
    // Implementation
}

int main() {
    cout << "Testing solution..." << endl;
    return 0;
}`,
      java: `import java.util.*;

// ${question.title}
// ${question.description}

class Solution {
    public void solution() {
        // Your solution here
    }
}

class Main {
    public static void main(String[] args) {
        System.out.println("Testing solution...");
    }
}`
    };
    
    setCode(templates[selectedLanguage as keyof typeof templates] || templates.javascript);
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

    try {
      const result: CodeExecutionResponse = await judge0Service.executeCode({
        code: code,
        language: selectedLanguage
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

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    // Update code template based on language
    const templates = {
      javascript: `// Write your solution here
function solution(nums, target) {
    // Your code here
    return [];
}

// Test cases
console.log("Test Case 1:");
console.log("Input: nums = [2,7,11,15], target = 9");
console.log("Output:", solution([2,7,11,15], 9));`,
      python: `# Write your solution here
def solution(nums, target):
    # Your code here
    return []

# Test cases
print("Test Case 1:")
print("Input: nums = [2,7,11,15], target = 9")
print("Output:", solution([2,7,11,15], 9))`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

// Write your solution here
vector<int> solution(vector<int>& nums, int target) {
    // Your code here
    return {};
}

int main() {
    // Test cases
    vector<int> nums1 = {2,7,11,15};
    int target1 = 9;
    
    cout << "Test Case 1:" << endl;
    cout << "Input: nums = [2,7,11,15], target = 9" << endl;
    vector<int> result1 = solution(nums1, target1);
    cout << "Output: [";
    for(int i = 0; i < result1.size(); i++) {
        cout << result1[i];
        if(i < result1.size() - 1) cout << ",";
    }
    cout << "]" << endl;
    
    return 0;
}`,
      java: `import java.util.*;

// Write your solution here
class Solution {
    public int[] solution(int[] nums, int target) {
        // Your code here
        return new int[]{};
    }
}

class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        
        // Test cases
        int[] nums1 = {2,7,11,15};
        int target1 = 9;
        
        System.out.println("Test Case 1:");
        System.out.println("Input: nums = [2,7,11,15], target = 9");
        int[] result1 = sol.solution(nums1, target1);
        System.out.println("Output: " + Arrays.toString(result1));
    }
}`
    };
    
    setCode(templates[language as keyof typeof templates] || templates.javascript);
  };

  // Mock data - in real app, this would come from an API
  const questionData = selectedQuestion || {
    id: questionId,
    title: "Two Sum",
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    difficulty: "Easy",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
        explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]."
      }
    ],
    hints: [
      "Try using a hash map to store the numbers you've seen so far",
      "For each number, check if its complement (target - number) exists in the hash map",
      "If the complement exists, you've found your pair"
    ],
    testCases: [
      { input: "[2,7,11,15]", target: 9, expected: "[0,1]" },
      { input: "[3,2,4]", target: 6, expected: "[1,2]" },
      { input: "[3,3]", target: 6, expected: "[0,1]" }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      <Header />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Back Button and Question Info */}
          <div className="mb-8">
            <Button asChild variant="ghost" className="text-slate-400 hover:text-white mb-4">
              <Link to={`/companies/${companyId}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Questions
              </Link>
            </Button>
            
            <div className="flex items-center gap-4">
              <Code2 className="w-12 h-12 text-purple-400" />
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  {questionData.title}
                </h1>
                <div className="flex items-center gap-4">
                  <Badge className={`${
                    questionData.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                    questionData.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                    'bg-red-500/20 text-red-400 border-red-500/30'
                  }`}>
                    {questionData.difficulty}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm text-slate-400">
                      {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Middle Panel - Question Description */}
            <div className="space-y-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-slate-300 whitespace-pre-line">
                      {questionData.description}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Examples</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {questionData.examples?.map((example: any, index: number) => (
                      <div key={index} className="bg-slate-900/50 p-4 rounded-lg">
                        <div className="text-slate-400 mb-2">Example {index + 1}:</div>
                        <div className="space-y-2">
                          <div>
                            <span className="text-slate-400">Input: </span>
                            <code className="text-purple-400">{example.input}</code>
                          </div>
                          <div>
                            <span className="text-slate-400">Output: </span>
                            <code className="text-green-400">{example.output}</code>
                          </div>
                          <div>
                            <span className="text-slate-400">Explanation: </span>
                            <span className="text-slate-300">{example.explanation}</span>
                          </div>
                        </div>
                      </div>
                    )) || (
                      <div className="text-slate-400 text-center py-4">
                        No examples available for this question
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

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
            </div>

            {/* Right Panel - Code Editor and Test Cases */}
            <div className="space-y-6">
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
                  <div className="h-[400px] border border-slate-700 rounded-lg overflow-hidden">
                    <Editor
                      height="100%"
                      language={judge0Service.getMonacoLanguage(selectedLanguage)}
                      theme="vs-dark"
                      value={code}
                      onChange={(value) => setCode(value || '')}
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
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Output</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] bg-slate-900/50 p-4 rounded-lg overflow-auto font-mono text-sm">
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

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Test Cases</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {questionData.testCases?.map((testCase: any, index: number) => (
                      <div key={index} className="bg-slate-900/50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-slate-400">Test Case {index + 1}</span>
                          <Badge variant="outline" className="text-slate-400 border-slate-600">
                            Pending
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <span className="text-slate-400">Input: </span>
                            <code className="text-purple-400">nums = {testCase.input}, target = {testCase.target}</code>
                          </div>
                          <div>
                            <span className="text-slate-400">Expected: </span>
                            <code className="text-green-400">{testCase.expected}</code>
                          </div>
                        </div>
                      </div>
                    )) || (
                      <div className="text-slate-400 text-center py-4">
                        No test cases available for this question
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

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
                <Button className="flex-1 bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Submit
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