import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ThumbsUp, Clock, User, BookOpen, Code2, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { Markdown } from "@/components/ui/markdown";
import { questionService, Question } from "@/services/questions";
import { articleReadApi } from "@/services/articleRead";

const Article = () => {
  const { slug, subtopicId } = useParams();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upvoteStates, setUpvoteStates] = useState<{[key: number]: {count: number, hasUpvoted: boolean}}>({});
  const [recommendedQuestions, setRecommendedQuestions] = useState<{[key: number]: Question[]}>({});
  const [loadingQuestions, setLoadingQuestions] = useState<{[key: number]: boolean}>({});
  const [readStates, setReadStates] = useState<{[key: number]: boolean}>({});

  // Handle mark as read/unread
  const handleMarkAsRead = async (articleId: number) => {
    try {
      await articleReadApi.markArticleAsRead(articleId);
      setReadStates(prev => ({ ...prev, [articleId]: true }));
    } catch (error) {
      console.error('Failed to mark article as read:', error);
    }
  };

  const handleMarkAsUnread = async (articleId: number) => {
    try {
      await articleReadApi.markArticleAsUnread(articleId);
      setReadStates(prev => ({ ...prev, [articleId]: false }));
    } catch (error) {
      console.error('Failed to mark article as unread:', error);
    }
  };

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
          
          // Fetch recommended questions for each article
          articlesData.forEach((article: any) => {
            fetchRecommendedQuestions(article.id);
          });

          // Initialize read states for each article
          const initialReadStates: {[key: number]: boolean} = {};
          articlesData.forEach((article: any) => {
            initialReadStates[article.id] = false; // Will be updated after checking
          });
          setReadStates(initialReadStates);

          // Check read status for each article
          articlesData.forEach(async (article: any) => {
            try {
              const hasRead = await articleReadApi.hasUserReadArticle(article.id);
              setReadStates(prev => ({ ...prev, [article.id]: hasRead }));
            } catch (error) {
              console.error(`Failed to check read status for article ${article.id}:`, error);
            }
          });
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

  const fetchRecommendedQuestions = async (articleId: number) => {
    setLoadingQuestions(prev => ({ ...prev, [articleId]: true }));
    try {
      const questions = await questionService.getRecommendedQuestions(articleId);
      setRecommendedQuestions(prev => ({ ...prev, [articleId]: questions }));
    } catch (error) {
      console.error('Failed to fetch recommended questions:', error);
      setRecommendedQuestions(prev => ({ ...prev, [articleId]: [] }));
    } finally {
      setLoadingQuestions(prev => ({ ...prev, [articleId]: false }));
    }
  };

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
                  {readStates[article.id] && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Completed</Badge>
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
                  <Button
                    onClick={() => readStates[article.id] 
                      ? handleMarkAsUnread(article.id) 
                      : handleMarkAsRead(article.id)
                    }
                    variant="outline"
                    className={`${
                      readStates[article.id]
                        ? "border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        : "border-green-500/30 text-green-400 hover:bg-green-500/10 hover:text-green-300"
                    }`}
                  >
                    {readStates[article.id] ? "Mark as Unread" : "Mark as Read"}
                  </Button>
                </div>
              </div>
              {/* Article Content */}
              <Card className="bg-slate-800/50 border-slate-700 mb-8">
                <CardContent className="p-8">
                  <Markdown content={article.content || ''} />
                </CardContent>
              </Card>

              {/* Recommended Practice Questions */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-6">
                  <Code2 className="w-5 h-5 text-purple-400" />
                  <h2 className="text-2xl font-bold text-white">Recommended Practice Questions</h2>
                </div>
                
                {loadingQuestions[article.id] ? (
                  <div className="text-slate-400 text-center py-8">Loading recommended questions...</div>
                ) : recommendedQuestions[article.id]?.length > 0 ? (
                  <div className="grid gap-4">
                    {recommendedQuestions[article.id].map((question) => (
                      <Card key={question.id} className="bg-slate-800/30 border-slate-700 hover:bg-slate-800/50 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge 
                                  className={`${
                                    question.difficulty === 'Easy' 
                                      ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                                      : question.difficulty === 'Medium'
                                      ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                                  }`}
                                >
                                  {question.difficulty}
                                </Badge>
                                {question.isCoding && (
                                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                    <Code2 className="w-3 h-3 mr-1" />
                                    Coding
                                  </Badge>
                                )}
                                {question.importanceTag && (
                                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                                    {question.importanceTag}
                                  </Badge>
                                )}
                                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                  {question.question_year || 2024}
                                </Badge>
                              </div>
                              <h3 className="text-lg font-semibold text-white mb-2">{question.title}</h3>
                              <p className="text-slate-300 text-sm mb-3 line-clamp-2">
                                {question.description.replace(/[#*`]/g, '').substring(0, 120)}...
                              </p>
                              <div className="flex items-center gap-4 text-sm text-slate-400">
                                <span className="flex items-center gap-1">
                                  <ThumbsUp className="w-3 h-3" />
                                  {question.upvotes}
                                </span>
                                <span>By {question.createdByUsername}</span>
                                {question.subtopicName && (
                                  <span>{question.subtopicName}</span>
                                )}
                              </div>
                            </div>
                            <Button 
                              asChild
                              variant="outline" 
                              className="border-purple-500/50 bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 hover:text-white transition-colors"
                            >
                              <Link to={question.isCoding ? `/live-coding/${question.id}` : `/problem-selection?questionId=${question.id}`}>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Practice
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-slate-800/30 border-slate-700">
                    <CardContent className="p-8 text-center">
                      <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-400">No practice questions available for this topic yet.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Article;