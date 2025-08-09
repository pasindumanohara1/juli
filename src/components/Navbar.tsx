
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, BookOpen, Users, Info, Mail, LogIn } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [session, setSession] = useState<Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']>(null);

  const navItems = [
    { name: 'Home', path: '/', icon: BookOpen },
    { name: 'Courses', path: '/courses', icon: BookOpen },
    { name: 'Community', path: '/community', icon: Users },
    // Removed Dashboard from visible nav as requested
    { name: 'About', path: '/about', icon: Info },
    { name: 'Contact', path: '/contact', icon: Mail },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Load auth session and subscribe to changes
  useEffect(() => {
    let mounted = true;

    // Initial fetch
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSession(data.session);
    });

    // Listen to ALL auth events so Navbar updates immediately
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      // Update navbar state only; do not force navigation on every event
      setSession(sess || null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 glass-light rounded-b-3xl mx-4 mt-4">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-ocean-500 to-teal-500 rounded-full flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-ocean-600">OnlinePanthi</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
                    isActive(item.path)
                      ? 'bg-ocean-500 text-white shadow-lg'
                      : 'text-ocean-600 hover:bg-ocean-50 hover:text-ocean-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Auth / Profile */}
          <div className="hidden md:flex items-center">
            {session ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center cursor-pointer liquid-hover"
                title="Open Dashboard"
              >
                <User className="w-5 h-5 text-white" />
              </button>
            ) : (
              <button
                onClick={() => navigate('/auth')}
                className="w-10 h-10 rounded-full border border-ocean-200 text-ocean-700 hover:bg-ocean-50 flex items-center justify-center"
                title="Sign In"
              >
                <LogIn className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-full text-ocean-600 hover:bg-ocean-50 transition-all duration-300"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-6">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      isActive(item.path)
                        ? 'bg-ocean-500 text-white'
                        : 'text-ocean-600 hover:bg-ocean-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
              <div className="pt-4 border-t border-ocean-100">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 px-4 py-3">
                    {session ? (
                      <>
                        <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            navigate('/dashboard');
                          }}
                          className="font-medium text-ocean-600 text-left"
                        >
                          Dashboard
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="w-8 h-8 rounded-full border border-ocean-200 flex items-center justify-center text-ocean-700">
                          <LogIn className="w-4 h-4" />
                        </div>
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            navigate('/auth');
                          }}
                          className="font-medium text-ocean-600"
                        >
                          Sign In
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
