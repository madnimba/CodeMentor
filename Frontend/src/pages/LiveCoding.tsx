import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Code2, Play, CheckCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { api } from "@/services/api";
// import DOMPurify from "dompurify";

function getFirstParagraphOnly(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const firstP = doc.querySelector("p");
  return firstP ? firstP.outerHTML : "";
}


const LiveCoding = () => {
  const { companyId, id } = useParams();
  const [activeTab, setActiveTab] = useState("description");

  const [questionData, setQuestionData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    setError(null);
    if (companyId && id) {
      api
        .get(`/companies/${companyId}/questions/${id}`)
        .then((res) => {
          setQuestionData(res.data);
          setCode("// Write your solution here\nfunction solution() {\n    // Your code goes here\n}");
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError("Failed to load question.");
          setLoading(false);
        });
    } else if (id) {
      api
        .get(`/problems/${id}`)
        .then((res) => {
          setQuestionData(res.data);
          setCode("// Write your solution here\nfunction solution() {\n    // Your code goes here\n}");
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError("Failed to load problem.");
          setLoading(false);
        });
    } else {
      setError("No problem or question specified.");
      setLoading(false);
    }
  }, [companyId, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        Loading question...
      </div>
    );
  }

  if (error || !questionData) {
    return (
      <div className="min-h-screen bg-slate-900 text-red-400 flex items-center justify-center">
        {error || "Question not found."}
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
              <Link to={`/companies/${companyId}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Questions
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Panel - Question Description */}
            <div className="space-y-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-invert max-w-none text-slate-300">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: questionData.description,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Optional: Add hints/examples/test cases here if your API returns them */}
            </div>

            {/* Right Panel - Code Editor */}
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
