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

const Dashboard = () => {
  const userStats = {
    totalAttempted: 156,
    totalSolved: 142,
    accuracyRate: 91,
    currentStreak: 12,
    longestStreak: 23,
    totalStudyTime: "147h 32m"
  };

  const progressByTopic = [
    { topic: "Arrays & Strings", solved: 25, total: 30, progress: 83 },
    { topic: "Linked Lists", solved: 18, total: 22, progress: 82 },
    { topic: "Trees", solved: 15, total: 25, progress: 60 },
    { topic: "Dynamic Programming", solved: 12, total: 28, progress: 43 },
    { topic: "Graphs", solved: 8, total: 20, progress: 40 }
  ];

  const companyProgress = [
    { company: "Pridesys IT", solved: 35, total: 50, difficulty: "Medium" },
    { company: "Brain Station", solved: 28, total: 40, difficulty: "Easy" },
    { company: "IQVIA", solved: 22, total: 45, difficulty: "Hard" },
    { company: "Therap BD", solved: 15, total: 35, difficulty: "Medium" }
  ];

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

  const featuredCompanies = [
    { id: 1, name: "Google", solved: 45, total: 60, difficulty: "Hard" },
    { id: 2, name: "Microsoft", solved: 38, total: 55, difficulty: "Hard" },
    { id: 3, name: "Amazon", solved: 42, total: 58, difficulty: "Hard" },
    { id: 4, name: "Meta", solved: 35, total: 50, difficulty: "Medium" }
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

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6 text-center">
                <Target className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">{userStats.totalSolved}</div>
                <div className="text-sm text-slate-400">Problems Solved</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">{userStats.accuracyRate}%</div>
                <div className="text-sm text-slate-400">Accuracy Rate</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6 text-center">
                <Award className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">{userStats.currentStreak}</div>
                <div className="text-sm text-slate-400">Day Streak</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6 text-center">
                <Clock className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">{userStats.totalStudyTime}</div>
                <div className="text-sm text-slate-400">Study Time</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Quick Actions */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/30 hover:border-purple-400/50 transition-colors">
                  <CardHeader>
                    <Code2 className="w-8 h-8 text-purple-800 mb-2" />
                    <CardTitle className="text-purple-800">Start Solving</CardTitle>
                    <CardDescription className="text-purple-600">
                      Continue your coding journey with curated problems
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                      <Link to="/problems">
                        Browse Problems <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 border-cyan-500/30 hover:border-cyan-400/50 transition-colors">
                  <CardHeader>
                    <BookOpen className="w-8 h-8 text-cyan-400 mb-2" />
                    <CardTitle className="text-cyan-800">Study Materials</CardTitle>
                    <CardDescription className="text-cyan-600">
                      Master concepts with our comprehensive guides
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="outline" className="w-full border-cyan-700 text-cyan-600 hover:bg-cyan-500/10">
                      <Link to="/study-materials">
                        Start Learning <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Progress by Topic */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    Progress by Topic
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Track your mastery across different subjects
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {progressByTopic.map((topic, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-medium">{topic.topic}</span>
                        <span className="text-slate-400 text-sm">{topic.solved}/{topic.total}</span>
                      </div>
                      <Progress value={topic.progress} className="h-2" />
                    </div>
                  ))}
                  <Button asChild variant="ghost" className="w-full text-purple-400 hover:text-purple-300 mt-4">
                    <Link to="/progress">
                      View Detailed Progress <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Company Progress */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    Company-Specific Progress
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Your preparation status for top companies
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {companyProgress.map((company, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                      <div>
                        <h4 className="text-white font-medium">{company.company}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-slate-400 text-sm">{company.solved}/{company.total} solved</span>
                          <Badge className={`text-xs ${
                            company.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                            company.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                            'bg-red-500/20 text-red-400 border-red-500/30'
                          }`}>
                            {company.difficulty}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-purple-400 font-medium">
                          {Math.round((company.solved / company.total) * 100)}%
                        </div>
                        <Progress value={(company.solved / company.total) * 100} className="w-20 mt-1" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Featured Companies */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-purple-400" />
                    Featured Companies
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Practice questions from top tech companies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {featuredCompanies.map((company) => (
                      <div key={company.id} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                        <div>
                          <h4 className="text-white font-medium">{company.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-slate-400 text-sm">{company.solved}/{company.total} solved</span>
                            <Badge className={`text-xs ${
                              company.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                              company.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                              'bg-red-500/20 text-red-400 border-red-500/30'
                            }`}>
                              {company.difficulty}
                            </Badge>
                          </div>
                        </div>
                        <Button asChild variant="ghost" className="text-purple-400 hover:text-purple-300">
                          <Link to={`/companies/${company.id}`}>
                            View <ArrowRight className="ml-2 w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    ))}
                    <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                      <Link to="/companies">
                        View All Companies <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-cyan-400" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg">
                      <div className="mt-1">
                        {activity.type === 'problem' ? 
                          <Code2 className="w-4 h-4 text-purple-400" /> : 
                          <BookOpen className="w-4 h-4 text-cyan-400" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-medium truncate">
                          {activity.title}
                        </div>
                        {activity.company && (
                          <div className="text-slate-400 text-xs">{activity.company}</div>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          {activity.status === 'solved' && <CheckCircle className="w-3 h-3 text-green-400" />}
                          <span className={`text-xs ${
                            activity.status === 'solved' ? 'text-green-400' :
                            activity.status === 'read' ? 'text-cyan-400' :
                            'text-yellow-400'
                          }`}>
                            {activity.status}
                          </span>
                          <span className="text-slate-500 text-xs">{activity.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Upcoming Goals */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-pink-400" />
                    Upcoming Goals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingGoals.map((goal, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-white text-sm font-medium leading-tight">
                          {goal.title}
                        </span>
                        <Star className="w-4 h-4 text-yellow-400 flex-shrink-0 ml-2" />
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                      <div className="text-slate-400 text-xs">{goal.deadline}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
