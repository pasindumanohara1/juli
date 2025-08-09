import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BookOpen, Github, Twitter, Linkedin, Youtube, Users, GraduationCap, User, Home as HomeIcon, Mail } from "lucide-react";

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path: string) => {
    // Exact match for home; prefix match for other sections
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path);
  };
  return (
    <footer className="mt-16 border-t border-ocean-100/60 dark:border-[rgba(230,234,242,0.2)] bg-gradient-to-b from-ocean-50 to-white dark:from-[rgba(255,255,255,0.04)] dark:to-[rgba(255,255,255,0.02)]">
      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-4 left-4 right-4 z-40 md:hidden">
        <nav className="glass-light dark:glass-dark rounded-2xl px-3 py-2 shadow-lg border border-ocean-100/60 dark:border-[rgba(163,203,255,0.18)]">
          <ul className="flex items-center justify-between">
            <li className="flex-1">
              <Link
                to="/"
                className={`flex flex-col items-center justify-center gap-1 px-2 py-1 transition ${
                  isActive('/')
                    ? 'text-white bg-ocean-600 rounded-xl'
                    : 'text-ocean-700 dark:text-[var(--foreground)]'
                }`}
                title="Home"
              >
                <HomeIcon className="w-5 h-5" />
                <span className="text-[11px] font-medium">Home</span>
              </Link>
            </li>
            <li className="flex-1">
              <Link
                to="/courses"
                className={`flex flex-col items-center justify-center gap-1 px-2 py-1 transition ${
                  isActive('/courses')
                    ? 'text-white bg-ocean-600 rounded-xl'
                    : 'text-ocean-700 dark:text-[var(--foreground)]'
                }`}
                title="Courses"
              >
                <GraduationCap className="w-5 h-5" />
                <span className="text-[11px] font-medium">Courses</span>
              </Link>
            </li>
            <li className="flex-1">
              <Link
                to="/community"
                className={`flex flex-col items-center justify-center gap-1 px-2 py-1 transition ${
                  isActive('/community')
                    ? 'text-white bg-ocean-600 rounded-xl'
                    : 'text-ocean-700 dark:text-[var(--foreground)]'
                }`}
                title="Community"
              >
                <Users className="w-5 h-5" />
                <span className="text-[11px] font-medium">Community</span>
              </Link>
            </li>
            <li className="flex-1">
              <Link
                to="/dashboard"
                className={`flex flex-col items-center justify-center gap-1 px-2 py-1 transition ${
                  isActive('/dashboard')
                    ? 'text-white bg-ocean-600 rounded-xl'
                    : 'text-ocean-700 dark:text-[var(--foreground)]'
                }`}
                title="Dashboard"
              >
                <User className="w-5 h-5" />
                <span className="text-[11px] font-medium">Dashboard</span>
              </Link>
            </li>
            <li className="flex-1">
              <Link
                to="/contact"
                className={`flex flex-col items-center justify-center gap-1 px-2 py-1 transition ${
                  isActive('/contact')
                    ? 'text-white bg-ocean-600 rounded-xl'
                    : 'text-ocean-700 dark:text-[var(--foreground)]'
                }`}
                title="Contact"
              >
                <Mail className="w-5 h-5" />
                <span className="text-[11px] font-medium">Contact</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12 text-ocean-700 dark:text-[var(--foreground)]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-ocean-500 to-teal-500 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-ocean-700">OnlinePanthi</span>
            </Link>
            <p className="text-ocean-600/80 text-sm leading-relaxed">
              Learn with a fluid, modern experience. Courses, community, and tools
              designed to help you grow.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-ocean-700 dark:text-[var(--foreground)] font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-ocean-600 dark:text-[var(--foreground)] hover:text-ocean-700 hover:underline">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/courses" className="text-ocean-600 dark:text-[var(--foreground)] hover:text-ocean-700 hover:underline">
                  Courses
                </Link>
              </li>
              <li>
                <Link to="/community" className="text-ocean-600 dark:text-[var(--foreground)] hover:text-ocean-700 hover:underline">
                  Community
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-ocean-600 dark:text-[var(--foreground)] hover:text-ocean-700 hover:underline">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-ocean-600 dark:text-[var(--foreground)] hover:text-ocean-700 hover:underline">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-ocean-700 dark:text-[var(--foreground)] font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a className="text-ocean-600 dark:text-[var(--foreground)] hover:text-ocean-700 hover:underline" href="#">
                  Blog
                </a>
              </li>
              <li>
                <a className="text-ocean-600 dark:text-[var(--foreground)] hover:text-ocean-700 hover:underline" href="#">
                  Docs
                </a>
              </li>
              <li>
                <a className="text-ocean-600 dark:text-[var(--foreground)] hover:text-ocean-700 hover:underline" href="#">
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-ocean-700 dark:text-[var(--foreground)] font-semibold mb-4">Follow Us</h3>
            <div className="flex items-center gap-3">
              <a
                href="#"
                aria-label="GitHub"
                className="w-10 h-10 rounded-full bg-ocean-50 dark:bg-[rgba(255,255,255,0.06)] border border-ocean-100 dark:border-[rgba(230,234,242,0.2)] flex items-center justify-center text-ocean-700 dark:text-[var(--foreground)] hover:bg-ocean-100 dark:hover:bg-[rgba(255,255,255,0.12)] transition"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="w-10 h-10 rounded-full bg-ocean-50 dark:bg-[rgba(255,255,255,0.06)] border border-ocean-100 dark:border-[rgba(230,234,242,0.2)] flex items-center justify-center text-ocean-700 dark:text-[var(--foreground)] hover:bg-ocean-100 dark:hover:bg-[rgba(255,255,255,0.12)] transition"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="w-10 h-10 rounded-full bg-ocean-50 dark:bg-[rgba(255,255,255,0.06)] border border-ocean-100 dark:border-[rgba(230,234,242,0.2)] flex items-center justify-center text-ocean-700 dark:text-[var(--foreground)] hover:bg-ocean-100 dark:hover:bg-[rgba(255,255,255,0.12)] transition"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="#"
                aria-label="YouTube"
                className="w-10 h-10 rounded-full bg-ocean-50 dark:bg-[rgba(255,255,255,0.06)] border border-ocean-100 dark:border-[rgba(230,234,242,0.2)] flex items-center justify-center text-ocean-700 dark:text-[var(--foreground)] hover:bg-ocean-100 dark:hover:bg-[rgba(255,255,255,0.12)] transition"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-ocean-100 dark:border-[rgba(230,234,242,0.2)] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-ocean-600/80 dark:text-[var(--foreground)]/80">
            © {new Date().getFullYear()} OnlinePanthi. All rights reserved.
          </p>
          <div className="text-xs text-ocean-600/80 dark:text-[var(--foreground)]/80">
            <a href="#" className="hover:underline">Privacy</a>
            <span className="mx-2">•</span>
            <a href="#" className="hover:underline">Terms</a>
            <span className="mx-2">•</span>
            <a href="#" className="hover:underline">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
