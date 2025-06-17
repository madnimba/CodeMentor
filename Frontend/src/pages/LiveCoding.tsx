import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Code2, Play, CheckCircle, AlertCircle, ChevronDown } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import Editor from "@monaco-editor/react";

const LiveCoding = () => {
  const { companyId, questionId } = useParams();
  const [activeTab, setActiveTab] = useState("description");
  const [code, setCode] = useState(`// Write your solution here
function solution() {
    // Your code goes here
}`);

  // Mock data - in real app, this would come from an API
  const questionData = {
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
                <Badge className={`${
                  questionData.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                  questionData.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                  'bg-red-500/20 text-red-400 border-red-500/30'
                }`}>
                  {questionData.difficulty}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Panel - Question Description */}
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
                    {questionData.examples.map((example, index) => (
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
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Hints</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {questionData.hints.map((hint, index) => (
                      <div key={index} className="flex items-start gap-2 text-slate-300">
                        <span className="text-purple-400">{index + 1}.</span>
                        <span>{hint}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Code Editor and Test Cases */}
            <div className="space-y-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Code Editor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] border border-slate-700 rounded-lg overflow-hidden">
                    <Editor
                      height="100%"
                      defaultLanguage="javascript"
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
                  <CardTitle className="text-white">Test Cases</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {questionData.testCases.map((testCase, index) => (
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
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
                  <Play className="w-4 h-4 mr-2" />
                  Run Code
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