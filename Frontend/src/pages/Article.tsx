import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ThumbsUp, Clock, User, BookOpen, Code2, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/services/api";

const Article = () => {
  const { slug, subtopicId } = useParams();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upvoteStates, setUpvoteStates] = useState<{[key: number]: {count: number, hasUpvoted: boolean}}>({});

  useEffect(() => {
    if (subtopicId) {
      setLoading(true);
      api.get(`/articles/by-subtopic/${subtopicId}`)
        .then(res => {
          const articlesData = res.data.data;
          setArticles(articlesData);
          // Initialize upvote states for each article
          const initialUpvoteStates: {[key: number]: {count: number, hasUpvoted: boolean}} = {};
          articlesData.forEach((article: any) => {
            initialUpvoteStates[article.id] = { count: 42, hasUpvoted: false };
          });
          setUpvoteStates(initialUpvoteStates);
          setLoading(false);
        })
        .catch(() => {
          setError("Failed to load article(s)");
          setLoading(false);
        });
    } else {
      // fallback: show nothing or mock (legacy slug-based, not used for subtopic click)
      setArticles([]);
    }
  }, [subtopicId]);

  const handleUpvote = (articleId: number) => {
    const currentState = upvoteStates[articleId];
    if (currentState && !currentState.hasUpvoted) {
      setUpvoteStates(prev => ({
        ...prev,
        [articleId]: {
          count: currentState.count + 1,
          hasUpvoted: true
        }
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
        <Header />
        <div className="pt-24 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="text-slate-400 mt-4">Loading article(s)...</p>
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
          <div className="max-w-4xl mx-auto text-center">
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
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button asChild variant="ghost" className="mb-6 text-slate-300 hover:text-white">
            <Link to="/study-materials">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Study Materials
            </Link>
          </Button>

          {/* Render all articles for this subtopic */}
          {articles.length === 0 && (
            <div className="text-slate-400 text-center">No articles found for this subtopic.</div>
          )}
          {articles.map((article, idx) => (
            <div key={article.id} className={idx > 0 ? "mt-12" : ""}>
              {/* Article Header */}
              <div className="mb-8">
                <div className="flex flex-wrap gap-2 mb-4">
                  {article.topicName && (
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">{article.topicName}</Badge>
                  )}
                  {article.subtopicName && (
                    <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30">{article.subtopicName}</Badge>
                  )}
                  {article.isApproved && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Approved</Badge>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">
                  {article.title}
                </h1>
                <div className="flex items-center gap-6 text-slate-400 mb-6">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{article.createdByUsername}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{article.createdAt?.slice(0, 10)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => handleUpvote(article.id)}
                    variant="outline"
                    className={`border-slate-700 bg-slate-800/50 ${upvoteStates[article.id]?.hasUpvoted ? 'bg-purple-600/20 border-purple-500/50 text-purple-300 hover:bg-purple-600/30' : 'text-slate-200 hover:bg-slate-800 hover:text-white'} transition-colors`}
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    {upvoteStates[article.id]?.count || 42} Upvotes
                  </Button>
                </div>
              </div>
              {/* Article Content */}
              <Card className="bg-slate-800/50 border-slate-700 mb-8">
                <CardContent className="p-8">
                  <div className="prose prose-invert prose-purple max-w-none">
                    <div className="text-slate-200 leading-relaxed space-y-6">
                      {article.content?.split('\n').map((paragraph: string, index: number) => {
                        if (paragraph.startsWith('# ')) {
                          return <h1 key={index} className="text-3xl font-bold text-white mt-8 mb-4">{paragraph.slice(2)}</h1>;
                        }
                        if (paragraph.startsWith('## ')) {
                          return <h2 key={index} className="text-2xl font-semibold text-purple-300 mt-6 mb-3">{paragraph.slice(3)}</h2>;
                        }
                        if (paragraph.startsWith('### ')) {
                          return <h3 key={index} className="text-xl font-medium text-slate-200 mt-4 mb-2">{paragraph.slice(4)}</h3>;
                        }
                        if (paragraph.startsWith('```')) {
                          return <pre key={index} className="bg-slate-900 p-4 rounded-lg overflow-x-auto"><code className="text-cyan-300">{paragraph.slice(3)}</code></pre>;
                        }
                        if (paragraph.trim() === '') {
                          return <br key={index} />;
                        }
                        return <p key={index} className="mb-4">{paragraph}</p>;
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Article;
