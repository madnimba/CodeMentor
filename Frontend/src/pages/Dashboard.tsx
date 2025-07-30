import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy, Target, Clock, TrendingUp, BookOpen, Code2,
  CheckCircle, Award, Calendar, ArrowRight, Users, Star, Building2
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { submissionsApi, StreakStats } from "@/services/submissions";
import { companiesService, CompanyStats } from "@/services/companies";
import { dashboardService, TopicProgress } from "@/services/dashboard";

const Dashboard = () => {
  const [totalAttempted, setTotalAttempted] = useState<number>(0);
  const [totalSolved, setTotalSolved] = useState<number>(0);
  const [accuracyRate, setAccuracyRate] = useState<number>(0);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [featuredCompanies, setFeaturedCompanies] = useState<CompanyStats[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [topicProgress, setTopicProgress] = useState<TopicProgress[]>([]);
  const [topicProgressLoading, setTopicProgressLoading] = useState(true);
  const [totalProgress, setTotalProgress] = useState({
    totalArticles: 0,
    articlesRead: 0,
    totalQuestions: 0,
    questionsSolved: 0
  });

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const [attempted, solved, accuracy, streakStats] = await Promise.all([
          submissionsApi.getTotalQuestionsAttempted(),
          submissionsApi.getTotalQuestionsSolved(),
          submissionsApi.getAccuracyRate(),
          submissionsApi.getStreakStats()
        ]);
        setTotalAttempted(attempted);
        setTotalSolved(solved);
        setAccuracyRate(accuracy);
        setCurrentStreak(streakStats.currentStreak);
      } catch (error) {
        console.error('Failed to fetch user stats:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchFeaturedCompanies = async () => {
      try {
        const companies = await companiesService.getFeaturedCompanies();
        setFeaturedCompanies(companies);
      } catch (error) {
        console.error('Failed to fetch featured companies:', error);
      } finally {
        setCompaniesLoading(false);
      }
    };

    const fetchTopicProgress = async () => {
      try {
        console.log('Fetching topic progress...');
        const progress = await dashboardService.getTopicProgress();
        console.log('Topic progress received:', progress);
        setTopicProgress(progress);
        
        // Calculate total progress across all topics
        const totals = progress.reduce((acc, topic) => ({
          totalArticles: acc.totalArticles + (topic.totalArticles || 0),
          articlesRead: acc.articlesRead + (topic.articlesRead || 0),
          totalQuestions: acc.totalQuestions + (topic.totalQuestions || 0),
          questionsSolved: acc.questionsSolved + (topic.questionsSolved || 0)
        }), { totalArticles: 0, articlesRead: 0, totalQuestions: 0, questionsSolved: 0 });
        
        setTotalProgress(totals);
      } catch (error) {
        console.error('Failed to fetch topic progress:', error);
        // Set empty array to show the "no data" message
        setTopicProgress([]);
      } finally {
        setTopicProgressLoading(false);
      }
    };

    fetchUserStats();
    fetchFeaturedCompanies();
    fetchTopicProgress();
  }, []);

  const userStats = {
    totalAttempted: totalAttempted,
    totalSolved: totalSolved,
    accuracyRate: accuracyRate,
    currentStreak: currentStreak,
    longestStreak: 23, // TODO: Calculate from submission dates
    totalStudyTime: "147h 32m" // TODO: Calculate from submission timestamps
  };

  const recentActivity = [
    { type: "problem", title: "Two Sum", company: "Pridesys IT", status: "solved", time: "2 hours ago" },
    { type: "article", title: "Binary Search Trees", status: "read", time: "5 hours ago" },
    { type: "problem", title: "Maximum Subarray", company: "Brain Station", status: "attempted", time: "1 day ago" },
    { type: "article", title: "Graph Algorithms", status: "read", time: "2 days ago" }
  ];

  const upcomingGoals = [
    { title: "Complete 50 problems this month", progress: 78, deadline: "Dec 31, 2024" },
    { title: "Finish Database Systems track", progress: 65, deadline: "Jan 15, 2025" },
    { title: "Achieve 95% accuracy rate", progress: 91, deadline: "Jan 31, 2025" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      <Header />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back! 👋
            </h1>
            <p className="text-slate-400 text-lg">
              Keep up the great work! You're on a {userStats.currentStreak}-day streak.
            </p>
          </div>

          {/* Overall Progress Summary */}
          <Card className="bg-slate-800/50 border-slate-700 mb-8 card-hover">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                Overall Progress
              </CardTitle>
              <CardDescription className="text-slate-400">
                Your total progress across all topics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topicProgressLoading ? (
                <div className="grid grid-cols-2 gap-6">
                  {/* Loading state for Articles */}
                  <div className="text-center">
                    <div className="relative mb-4">
                      <div className="w-20 h-20 mx-auto bg-slate-700/50 rounded-full flex items-center justify-center border-2 border-slate-600/50 animate-pulse">
                        <div className="w-8 h-8 bg-slate-600 rounded"></div>
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-slate-600 rounded-full animate-pulse"></div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1 animate-pulse">
                      <div className="h-8 bg-slate-700 rounded w-16 mx-auto"></div>
                    </div>
                    <div className="text-sm text-slate-400 mb-3">Articles Read</div>
                    <div className="h-3 bg-slate-700/50 rounded-full animate-pulse"></div>
                  </div>
                  
                  {/* Loading state for Questions */}
                  <div className="text-center">
                    <div className="relative mb-4">
                      <div className="w-20 h-20 mx-auto bg-slate-700/50 rounded-full flex items-center justify-center border-2 border-slate-600/50 animate-pulse">
                        <div className="w-8 h-8 bg-slate-600 rounded"></div>
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-slate-600 rounded-full animate-pulse"></div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1 animate-pulse">
                      <div className="h-8 bg-slate-700 rounded w-16 mx-auto"></div>
                    </div>
                    <div className="text-sm text-slate-400 mb-3">Questions Solved</div>
                    <div className="h-3 bg-slate-700/50 rounded-full animate-pulse"></div>
                  </div>
                </div>
              ) : topicProgress.length > 0 ? (
                <div className="grid grid-cols-2 gap-6">
                  {/* Articles Progress */}
                  <div className="text-center group">
                    <div className="relative mb-4">
                      <div className="w-20 h-20 mx-auto bg-slate-700/50 rounded-full flex items-center justify-center border-2 border-slate-600/50 group-hover:border-blue-400/50 transition-colors">
                        <BookOpen className="w-8 h-8 text-blue-400" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                          {totalProgress.totalArticles > 0 ? Math.round((totalProgress.articlesRead / totalProgress.totalArticles) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">
                      {totalProgress.articlesRead}/{totalProgress.totalArticles}
                    </div>
                    <div className="text-sm text-slate-400 mb-3">Articles Read</div>
                    <div className="relative">
                      <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full transition-all duration-700 ease-out"
                          style={{ 
                            width: totalProgress.totalArticles > 0 
                              ? `${(totalProgress.articlesRead / totalProgress.totalArticles) * 100}%` 
                              : '0%' 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Questions Progress */}
                  <div className="text-center group">
                    <div className="relative mb-4">
                      <div className="w-20 h-20 mx-auto bg-slate-700/50 rounded-full flex items-center justify-center border-2 border-slate-600/50 group-hover:border-green-400/50 transition-colors">
                        <Code2 className="w-8 h-8 text-green-400" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                          {totalProgress.totalQuestions > 0 ? Math.round((totalProgress.questionsSolved / totalProgress.totalQuestions) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1 group-hover:text-green-300 transition-colors">
                      {totalProgress.questionsSolved}/{totalProgress.totalQuestions}
                    </div>
                    <div className="text-sm text-slate-400 mb-3">Questions Solved</div>
                    <div className="relative">
                      <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full transition-all duration-700 ease-out"
                          style={{ 
                            width: totalProgress.totalQuestions > 0 
                              ? `${(totalProgress.questionsSolved / totalProgress.totalQuestions) * 100}%` 
                              : '0%' 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-slate-700/50 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-slate-400" />
                  </div>
                  <div className="text-slate-400 text-sm font-medium mb-2">
                    No progress data available yet.
                  </div>
                  <div className="text-slate-500 text-xs">
                    Start solving problems and reading articles to see your overall progress.
                  </div>
                </div>
              )}
              
              {/* Overall Stats - Show only when data is loaded */}
              {!topicProgressLoading && topicProgress.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-700/50">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-white">
                        {totalProgress.totalArticles + totalProgress.totalQuestions}
                      </div>
                      <div className="text-xs text-slate-400">Total Items</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-purple-400">
                        {totalProgress.articlesRead + totalProgress.questionsSolved}
                      </div>
                      <div className="text-xs text-slate-400">Completed</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-yellow-400">
                        {totalProgress.totalArticles + totalProgress.totalQuestions > 0 
                          ? Math.round(((totalProgress.articlesRead + totalProgress.questionsSolved) / (totalProgress.totalArticles + totalProgress.totalQuestions)) * 100)
                          : 0}%
                      </div>
                      <div className="text-xs text-slate-400">Overall</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6 text-center">
                <Target className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">
                  {loading ? "..." : userStats.totalAttempted}
                </div>
                <div className="text-sm text-slate-400">Problems Attempted</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">
                  {loading ? "..." : userStats.totalSolved}
                </div>
                <div className="text-sm text-slate-400">Problems Solved</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">
                  {loading ? "..." : `${userStats.accuracyRate}%`}
                </div>
                <div className="text-sm text-slate-400">Accuracy Rate</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6 text-center">
                <Award className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">
                  {loading ? "..." : userStats.currentStreak}
                </div>
                <div className="text-sm text-slate-400">Day Streak</div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/30 hover:border-purple-400/50 transition-colors">
              <CardHeader>
                <Code2 className="w-8 h-8 text-purple-400 mb-2" />
                <CardTitle className="text-purple-800 font-bold">Live Coding</CardTitle>
                <CardDescription className="text-purple-700">
                  Practice coding problems with our live editor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold">
                  <Link to="/problem-selection">
                    Start Coding <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 border-cyan-500/30 hover:border-cyan-400/50 transition-colors">
              <CardHeader>
                <BookOpen className="w-8 h-8 text-cyan-400 mb-2" />
                <CardTitle className="text-cyan-800 font-bold">Study Materials</CardTitle>
                <CardDescription className="text-cyan-700">
                  Master concepts with our comprehensive guides
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full border-cyan-600 text-cyan-800 hover:bg-cyan-500/20 hover:text-cyan-900 font-semibold">
                  <Link to="/study-materials">
                    Start Learning <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Featured Companies */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Featured Companies
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Most Popular Companies are Here !!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {companiesLoading ? (
                    <div className="grid grid-cols-2 gap-4">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-24 bg-slate-700 rounded-lg"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {featuredCompanies.map((company) => (
                        <Link
                          key={company.id}
                          to={`/companies/${company.id}`}
                          className="block group"
                        >
                          <Card className="bg-slate-700/50 border-slate-600 hover:border-slate-500 transition-colors">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors">
                                  {company.name}
                                </h3>
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-400">Progress</span>
                                  <span className="text-white">
                                    {company.solvedQuestions}/{company.totalQuestions}
                                  </span>
                                </div>
                                <Progress
                                  value={company.progressPercentage}
                                  className="h-2"
                                />
                                <div className="text-xs text-slate-400">
                                  {company.progressPercentage.toFixed(1)}% complete
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Progress by Topic */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Progress by Topic
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Your performance across different topics
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {topicProgressLoading ? (
                    <div className="space-y-6 max-h-80 pr-2">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="flex justify-between items-center mb-3">
                            <div className="h-5 bg-slate-700 rounded w-32"></div>
                            <div className="h-5 bg-slate-700 rounded w-16"></div>
                          </div>
                          <div className="h-3 bg-slate-700 rounded mb-3"></div>
                          <div className="flex justify-between">
                            <div className="h-3 bg-slate-700 rounded w-20"></div>
                            <div className="h-3 bg-slate-700 rounded w-24"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : topicProgress.length > 0 ? (
                    <div className="space-y-6 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                      {topicProgress.map((topic, index) => (
                        <div key={index} className="group">
                          {/* Topic Header */}
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 group-hover:scale-125 transition-transform"></div>
                              <span className="text-white font-semibold text-sm group-hover:text-purple-300 transition-colors">
                                {topic.topicName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-300 font-medium text-sm">
                                {topic.solved}/{topic.total}
                              </span>
                              <div className="w-8 h-6 bg-slate-700/50 rounded-md flex items-center justify-center">
                                <span className="text-xs text-slate-400">
                                  {topic.progress.toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="relative mb-4">
                            <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${topic.progress}%` }}
                              ></div>
                            </div>
                            {/* Progress indicator dots */}
                            <div className="absolute top-1/2 transform -translate-y-1/2 left-0 right-0 flex justify-between px-1">
                              {[25, 50, 75, 100].map((milestone) => (
                                <div 
                                  key={milestone}
                                  className={`w-1 h-1 rounded-full transition-all duration-300 ${
                                    topic.progress >= milestone 
                                      ? 'bg-white shadow-sm' 
                                      : 'bg-slate-600/30'
                                  }`}
                                ></div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 gap-4">
                            {/* Articles Stats */}
                            <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/50 hover:border-slate-500/50 transition-colors">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <BookOpen className="w-4 h-4 text-blue-400" />
                                  <span className="text-xs text-slate-400 font-medium">Articles</span>
                                </div>
                                <span className="text-xs text-slate-300 font-semibold">
                                  {topic.articlesRead || 0}/{topic.totalArticles || 0}
                                </span>
                              </div>
                              <div className="h-2 bg-slate-600/50 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full transition-all duration-500"
                                  style={{ 
                                    width: topic.totalArticles > 0 
                                      ? `${(topic.articlesRead / topic.totalArticles) * 100}%` 
                                      : '0%' 
                                  }}
                                ></div>
                              </div>
                            </div>
                            
                            {/* Questions Stats */}
                            <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/50 hover:border-slate-500/50 transition-colors">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Code2 className="w-4 h-4 text-green-400" />
                                  <span className="text-xs text-slate-400 font-medium">Questions</span>
                                </div>
                                <span className="text-xs text-slate-300 font-semibold">
                                  {topic.questionsSolved || 0}/{topic.totalQuestions || 0}
                                </span>
                              </div>
                              <div className="h-2 bg-slate-600/50 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full transition-all duration-500"
                                  style={{ 
                                    width: topic.totalQuestions > 0 
                                      ? `${(topic.questionsSolved / topic.totalQuestions) * 100}%` 
                                      : '0%' 
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Completion Status */}
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                topic.progress >= 100 ? 'bg-green-400 animate-pulse' :
                                topic.progress >= 75 ? 'bg-yellow-400' :
                                topic.progress >= 50 ? 'bg-blue-400' :
                                topic.progress >= 25 ? 'bg-purple-400' : 'bg-slate-500'
                              }`}></div>
                              <span className="text-xs text-slate-400">
                                {topic.progress >= 100 ? 'Completed' :
                                 topic.progress >= 75 ? 'Almost Done' :
                                 topic.progress >= 50 ? 'Halfway' :
                                 topic.progress >= 25 ? 'Getting Started' : 'Just Started'}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500">
                              {topic.totalArticles + topic.totalQuestions} total items
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-slate-700/50 rounded-full flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-slate-400" />
                      </div>
                      <div className="text-slate-400 text-sm font-medium mb-2">
                        No topic progress data available yet.
                      </div>
                      <div className="text-slate-500 text-xs">
                        Start solving problems and reading articles to see your progress by topic.
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Recent Activity */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.status === 'solved' ? 'bg-green-400' :
                          activity.status === 'read' ? 'bg-blue-400' : 'bg-yellow-400'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm text-white">{activity.title}</p>
                          <p className="text-xs text-slate-400">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Goals */}
{/*               <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Upcoming Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingGoals.map((goal, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-white">{goal.title}</span>
                          <span className="text-slate-400">{goal.progress}%</span>
                        </div>
                        <Progress value={goal.progress} className="h-2" />
                        <p className="text-xs text-slate-400">Due: {goal.deadline}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card> */}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
