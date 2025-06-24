
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Code2, BookOpen, Trophy, Users, Target, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const Index = () => {
  const stats = [
    { number: "30+", label: "Partner Companies", icon: Users },
    { number: "500+", label: "Coding Problems", icon: Code2 },
    { number: "15K+", label: "Active Learners", icon: Target },
    { number: "98%", label: "Success Rate", icon: Trophy },
  ];

  const companies = [
    "Pridesys IT", "IQVIA", "Synesis IT", "Therap BD", 
    "Brain Station", "Chaldal", "Priyo", "Optimizely"
  ];

  const jobRoles = [
    "Software Engineer", "Database Engineer", 
    "Machine Learning Engineer", "System Engineer"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-4 py-2 text-sm font-medium">
              🇧🇩 Built for Bangladesh Tech Community
            </Badge>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            CodeMentor BD
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Master technical interviews with Bangladesh's premier coding platform. 
            Practice problems from top local companies and accelerate your career.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 text-lg">
              <Link to="/auth">Get Started Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 text-lg">
              <Link to="/study-materials">Explore Study Materials</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700 text-center hover:bg-slate-800/70 transition-all duration-300">
                <CardContent className="pt-6">
                  <stat.icon className="w-8 h-8 text-purple-400 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
                  <div className="text-slate-400">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-white">
            Everything You Need to Succeed
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300">
              <CardHeader>
                <Code2 className="w-12 h-12 text-cyan-400 mb-4" />
                <CardTitle className="text-white">Live Coding Editor</CardTitle>
                <CardDescription className="text-slate-400">
                  Practice with our advanced online IDE supporting multiple languages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="ghost" className="text-cyan-400 hover:text-cyan-300 p-0">
                  <Link to="/coding-editor">
                    Try Editor <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300">
              <CardHeader>
                <BookOpen className="w-12 h-12 text-purple-400 mb-4" />
                <CardTitle className="text-white">Study Materials</CardTitle>
                <CardDescription className="text-slate-400">
                  Comprehensive guides for DSA, System Design, Database, and more
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="ghost" className="text-purple-400 hover:text-purple-300 p-0">
                  <Link to="/study-materials">
                    Start Learning <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300">
              <CardHeader>
                <Zap className="w-12 h-12 text-pink-400 mb-4" />
                <CardTitle className="text-white">Company-Specific Prep</CardTitle>
                <CardDescription className="text-slate-400">
                  Practice questions from top Bangladeshi tech companies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="ghost" className="text-pink-400 hover:text-pink-300 p-0">
                  <Link to="/companies">
                    Explore Companies <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Companies Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-16 text-white">
            Trusted by Top Bangladesh Companies
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {companies.map((company, index) => (
              <div key={index} className="bg-slate-800/30 border border-slate-700 rounded-lg p-6 hover:bg-slate-800/50 transition-all duration-300">
                <div className="text-slate-300 font-medium">{company}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Job Roles Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8 text-white">
            Prepare for Your Dream Role
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {jobRoles.map((role, index) => (
              <Card key={index} className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700 hover:from-slate-800/70 hover:to-slate-900/70 transition-all duration-300">
                <CardHeader className="text-center">
                  <CardTitle className="text-white text-xl">{role}</CardTitle>
                  <CardDescription className="text-slate-400">
                    Specialized preparation track
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
