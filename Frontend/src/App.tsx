import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import StudyMaterials from "./pages/StudyMaterials";
import Article from "./pages/Article";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Companies from "./pages/Companies";
import CompanyQuestions from "./pages/CompanyQuestions";
import LiveCoding from "./pages/LiveCoding";
import ProblemSelection from "./pages/ProblemSelection";
import Note from "./pages/Note";
import Chatbot from "./pages/Chatbot";

const queryClient = new QueryClient();

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/study-materials" element={<StudyMaterials />} />
            <Route path="/article/:slug" element={<Article />} />
            <Route path="/article/subtopic/:subtopicId" element={<Article />} />
            <Route path="/auth" element={<Auth />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/companies" 
              element={
                <ProtectedRoute>
                  <Companies />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/companies/:companyId" 
              element={
                <ProtectedRoute>
                  <CompanyQuestions />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/companies/:companyId/questions/:questionId" 
              element={
                <ProtectedRoute>
                  <LiveCoding />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/companies/:companyId/questions/:questionId/live-coding" 
              element={
                <ProtectedRoute>
                  <LiveCoding />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/coding-editor" 
              element={
                <ProtectedRoute>
                  <LiveCoding />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/problem-selection" 
              element={
                <ProtectedRoute>
                  <ProblemSelection />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/notes" 
              element={
                <ProtectedRoute>
                  <Note />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          {/* Chatbot - appears on all pages */}
          <Chatbot apiUrl={import.meta.env.VITE_CHATBOT_API_URL || '/chatbot/chat'} />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;