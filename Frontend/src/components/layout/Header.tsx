import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Code2, Menu, User, Moon, Sun, LogOut } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Study Materials", href: "/study-materials" },
  { name: "Questions", href: "/questions" },
  { name: "Companies", href: "/companies" },
  { name: "Dashboard", href: "/dashboard" },
];

export const Header = () => {
  const [darkMode, setDarkMode] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-sm border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-bold text-xl">CodeMentor</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-slate-300 hover:text-white transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
              className="text-slate-400 hover:text-white"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            <div className="hidden md:flex items-center space-x-3">
              {user ? (
                <Button 
                  variant="ghost" 
                  className="text-slate-300 hover:text-white flex items-center gap-2"
                  onClick={signOut}
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </Button>
              ) : (
                <>
                  <Button asChild variant="ghost" className="text-slate-300 hover:text-white">
                    <Link to="/auth?tab=signin">Sign In</Link>
                  </Button>
                  <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <Link to="/auth?tab=signup">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-slate-400">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-slate-950 border-slate-800">
                <div className="flex flex-col space-y-4 mt-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="text-slate-300 hover:text-purple-400 transition-colors duration-200 font-medium py-2"
                    >
                      {item.name}
                    </Link>
                  ))}
                  <div className="pt-4 border-t border-slate-800">
                    {user ? (
                      <button 
                        onClick={signOut}
                        className="flex items-center gap-2 w-full py-2 text-slate-300 hover:text-white"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    ) : (
                      <>
                        <Link to="/auth?tab=signin" className="block py-2 text-slate-300 hover:text-white">
                          Sign In
                        </Link>
                        <Link to="/auth?tab=signup" className="block py-2 text-purple-400 hover:text-purple-300">
                          Sign Up
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};
