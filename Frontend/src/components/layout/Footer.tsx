
import { Link } from "react-router-dom";
import { Code2, Mail, MapPin, Phone } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">CodeMentor BD</span>
            </Link>
            <p className="text-slate-400 text-sm">
              Bangladesh's premier platform for technical interview preparation and coding excellence.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/problems" className="block text-slate-400 hover:text-purple-400 text-sm">
                Practice Problems
              </Link>
              <Link to="/study-materials" className="block text-slate-400 hover:text-purple-400 text-sm">
                Study Materials
              </Link>
              <Link to="/companies" className="block text-slate-400 hover:text-purple-400 text-sm">
                Companies
              </Link>
              <Link to="/dashboard" className="block text-slate-400 hover:text-purple-400 text-sm">
                Dashboard
              </Link>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Support</h3>
            <div className="space-y-2">
              <Link to="/help" className="block text-slate-400 hover:text-purple-400 text-sm">
                Help Center
              </Link>
              <Link to="/contact" className="block text-slate-400 hover:text-purple-400 text-sm">
                Contact Us
              </Link>
              <Link to="/privacy" className="block text-slate-400 hover:text-purple-400 text-sm">
                Privacy Policy
              </Link>
              <Link to="/terms" className="block text-slate-400 hover:text-purple-400 text-sm">
                Terms of Service
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Contact</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-slate-400 text-sm">
                <Mail className="w-4 h-4" />
                <span>support@codementorbd.com</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-400 text-sm">
                <MapPin className="w-4 h-4" />
                <span>Dhaka, Bangladesh</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 mt-8 text-center">
          <p className="text-slate-400 text-sm">
            © 2024 CodeMentor BD. All rights reserved. Built with ❤️ for Bangladesh's tech community.
          </p>
        </div>
      </div>
    </footer>
  );
};
