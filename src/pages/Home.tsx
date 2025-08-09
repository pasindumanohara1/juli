
import React from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, GraduationCap, ArrowRight, Play, Star, TrendingUp } from 'lucide-react';
import LiquidBackground from '@/components/LiquidBackground';
import GlassCard from '@/components/GlassCard';
import LiquidButton from '@/components/LiquidButton';

const Home = () => {
  const features = [
    {
      icon: Users,
      title: 'Community-Driven',
      description: 'Learn together with peers, share knowledge, and grow as a community of lifelong learners.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: BookOpen,
      title: 'Structured Courses',
      description: 'Well-organized curriculum designed by experts to take you from beginner to advanced level.',
      color: 'from-teal-500 to-teal-600'
    },
    {
      icon: GraduationCap,
      title: 'Expert Guidance',
      description: 'Learn from industry professionals and experienced educators who are passionate about teaching.',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Active Learners', icon: Users },
    { number: '500+', label: 'Courses Available', icon: BookOpen },
    { number: '98%', label: 'Success Rate', icon: TrendingUp },
    { number: '50+', label: 'Expert Instructors', icon: GraduationCap }
  ];

  return (
    <div className="min-h-screen">
      <LiquidBackground />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-float">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-ocean-600 mb-6">
              Learn Without
              <span className="block bg-gradient-to-r from-teal-500 to-ocean-500 bg-clip-text text-transparent">
                Limits
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-ocean-500 mb-8 max-w-3xl mx-auto">
              Join thousands of learners in our community-driven platform. Access structured courses, 
              connect with peers, and get expert guidance on your learning journey.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link to="/courses">
              <LiquidButton size="lg" variant="primary">
                Explore Courses
                <ArrowRight className="ml-2 w-5 h-5" />
              </LiquidButton>
            </Link>
            <LiquidButton size="lg" variant="secondary">
              <Play className="mr-2 w-5 h-5" />
              Watch Demo
            </LiquidButton>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <GlassCard key={index} className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-ocean-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-ocean-600 mb-2">{stat.number}</div>
                  <div className="text-ocean-500 text-sm">{stat.label}</div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-ocean-600 mb-4">
              Why Choose OnlinePanthi?
            </h2>
            <p className="text-xl text-ocean-500 max-w-2xl mx-auto">
              We combine the best of community learning, structured education, and expert mentorship
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <GlassCard key={index} className="p-8 text-center group">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-ocean-600 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-ocean-500 leading-relaxed">
                    {feature.description}
                  </p>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <GlassCard className="p-12 glass-light">
            <h2 className="text-4xl font-bold text-ocean-600 mb-6">
              Ready to Start Learning?
            </h2>
            <p className="text-xl text-ocean-500 mb-8">
              Join our community today and unlock your potential with expert-led courses and peer support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/courses">
                <LiquidButton size="lg" variant="primary">
                  Browse Courses
                </LiquidButton>
              </Link>
              <Link to="/community">
                <LiquidButton size="lg" variant="accent">
                  Join Community
                </LiquidButton>
              </Link>
            </div>
          </GlassCard>
        </div>
      </section>
    </div>
  );
};

export default Home;
