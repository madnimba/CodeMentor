
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Code2, BookOpen, Trophy, Users, Target, Zap, Sparkles, Star, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const Index = () => {
  const features = [
    {
      icon: Code2,
      title: "Live Coding Editor",
      description: "Practice with our advanced online IDE supporting multiple languages with real-time compilation and testing",
      color: "text-cyan-400",
      hoverColor: "hover:text-cyan-300",
      link: "/problem-selection",
      linkText: "Try Editor"
    },
    {
      icon: BookOpen,
      title: "Study Materials",
      description: "Comprehensive guides for DSA, System Design, Database, and more with interactive learning paths",
      color: "text-purple-400",
      hoverColor: "hover:text-purple-300",
      link: "/study-materials",
      linkText: "Start Learning"
    },
    {
      icon: Zap,
      title: "Company-Specific Prep",
      description: "Practice questions from top Bangladeshi tech companies with detailed solutions and explanations",
      color: "text-pink-400",
      hoverColor: "hover:text-pink-300",
      link: "/companies",
      linkText: "Explore Companies"
    }
  ];

  const benefits = [
    "Real-time code compilation and testing",
    "Company-specific question banks",
    "Comprehensive study materials",
    "Progress tracking and analytics",
    "Community-driven learning",
    "Mobile-responsive design"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="mb-8">
            <Badge className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30 px-6 py-3 text-sm font-medium backdrop-blur-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              🇧🇩 Built for Bangladesh Tech Community
            </Badge>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent leading-tight">
            CodeMentor BD
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Master technical interviews with Bangladesh's premier coding platform. 
            Practice problems from top local companies and accelerate your career with our comprehensive learning ecosystem.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-10 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <Link to="/auth">
                <Star className="w-5 h-5 mr-2" />
                Get Started Free
              </Link>
            </Button>
            <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-10 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <Link to="/study-materials">
                <BookOpen className="w-5 h-5 mr-2" />
                Explore Study Materials
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-6 text-white">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              From live coding practice to comprehensive study materials, we provide all the tools you need to excel in technical interviews.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50 transition-all duration-500 backdrop-blur-sm group hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-500/10">
                <CardHeader className="pb-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-8 h-8 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-white text-2xl mb-4">{feature.title}</CardTitle>
                  <CardDescription className="text-slate-400 text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="ghost" className={`${feature.color} ${feature.hoverColor} p-0 text-base font-medium group-hover:translate-x-2 transition-transform duration-300`}>
                    <Link to={feature.link}>
                      {feature.linkText} <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-white">
              Why Choose CodeMentor BD?
            </h2>
            <p className="text-xl text-slate-400">
              Join thousands of developers who have accelerated their careers with our platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-4 p-6 bg-slate-800/20 border border-slate-700/50 rounded-xl hover:bg-slate-800/40 transition-all duration-300 group">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-slate-300 group-hover:text-white transition-colors duration-300">
                  {benefit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-3xl p-12 backdrop-blur-sm">
            <h2 className="text-4xl font-bold mb-6 text-white">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              Join thousands of developers who have transformed their careers with CodeMentor BD
            </p>
            <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <Link to="/auth">
                <Sparkles className="w-5 h-5 mr-2" />
                Start Learning Today
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
