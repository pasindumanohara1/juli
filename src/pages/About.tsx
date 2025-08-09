
import React from 'react';
import { Users, Target, Heart, Award, BookOpen, Lightbulb } from 'lucide-react';
import LiquidBackground from '@/components/LiquidBackground';
import GlassCard from '@/components/GlassCard';

const About = () => {
  const values = [
    {
      icon: Users,
      title: 'Community First',
      description: 'We believe learning is better together. Our platform fosters collaboration and peer support.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Target,
      title: 'Goal-Oriented',
      description: 'Every course is designed with clear objectives and practical outcomes in mind.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Heart,
      title: 'Passion for Teaching',
      description: 'Our instructors are not just experts, but passionate educators who care about your success.',
      color: 'from-red-500 to-red-600'
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'We continuously evolve our platform using the latest educational technologies.',
      color: 'from-yellow-500 to-yellow-600'
    }
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'Founder & CEO',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b812b833?w=300&h=300&fit=crop&crop=face',
      bio: 'Former Google engineer turned educator, passionate about making quality education accessible to everyone.'
    },
    {
      name: 'Dr. Michael Chen',
      role: 'Head of Curriculum',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
      bio: 'PhD in Computer Science with 15 years of experience in curriculum design and educational technology.'
    },
    {
      name: 'Emma Rodriguez',
      role: 'Community Manager',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face',
      bio: 'Expert in building online communities and fostering engagement among learners worldwide.'
    },
    {
      name: 'David Kim',
      role: 'Lead Developer',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
      bio: 'Full-stack developer with a passion for creating seamless learning experiences through technology.'
    }
  ];

  const stats = [
    { number: '50,000+', label: 'Students Worldwide' },
    { number: '200+', label: 'Expert Instructors' },
    { number: '500+', label: 'Courses Available' },
    { number: '98%', label: 'Satisfaction Rate' }
  ];

  return (
    <div className="min-h-screen pt-24">
      <LiquidBackground />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-ocean-600 mb-6">
            About OnlinePanthi
          </h1>
          <p className="text-xl text-ocean-500 max-w-3xl mx-auto leading-relaxed">
            We're on a mission to democratize education and create a world where anyone, 
            anywhere can access high-quality learning experiences and connect with a 
            supportive community of learners.
          </p>
        </div>

        {/* Mission Statement */}
        <GlassCard className="p-12 mb-16 text-center glass-light">
          <div className="w-20 h-20 bg-gradient-to-br from-ocean-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-ocean-600 mb-6">Our Mission</h2>
          <p className="text-lg text-ocean-600 max-w-4xl mx-auto leading-relaxed">
            To break down barriers to quality education by creating an inclusive, 
            community-driven platform where learners can access expert instruction, 
            collaborate with peers, and achieve their personal and professional goals 
            through structured, engaging courses.
          </p>
        </GlassCard>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <GlassCard key={index} className="p-8 text-center">
              <div className="text-3xl lg:text-4xl font-bold text-ocean-600 mb-2">
                {stat.number}
              </div>
              <div className="text-ocean-500 font-medium">{stat.label}</div>
            </GlassCard>
          ))}
        </div>

        {/* Our Values */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-ocean-600 mb-4">Our Values</h2>
            <p className="text-xl text-ocean-500 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <GlassCard key={index} className="p-8">
                  <div className={`w-16 h-16 bg-gradient-to-br ${value.color} rounded-full flex items-center justify-center mb-6`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-ocean-600 mb-4">
                    {value.title}
                  </h3>
                  <p className="text-ocean-500 leading-relaxed">
                    {value.description}
                  </p>
                </GlassCard>
              );
            })}
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-ocean-600 mb-4">Meet Our Team</h2>
            <p className="text-xl text-ocean-500 max-w-2xl mx-auto">
              Passionate educators and technologists working to transform online learning
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <GlassCard key={index} className="p-6 text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-ocean-200">
                  <img 
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold text-ocean-600 mb-2">
                  {member.name}
                </h3>
                <p className="text-teal-600 font-medium mb-4">{member.role}</p>
                <p className="text-sm text-ocean-500 leading-relaxed">
                  {member.bio}
                </p>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* Story Section */}
        <GlassCard className="p-12 glass-light">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-ocean-600 mb-6 text-center">Our Story</h2>
            <div className="space-y-6 text-lg text-ocean-600 leading-relaxed">
              <p>
                OnlinePanthi was born from a simple observation: traditional education wasn't 
                keeping pace with the rapidly changing world. We saw talented individuals 
                struggling to access quality learning resources, and brilliant instructors 
                limited by geographical boundaries.
              </p>
              <p>
                In 2020, our founder Sarah Johnson, a former Google engineer, decided to bridge 
                this gap. She assembled a team of educators, technologists, and community builders 
                who shared her vision of democratizing education through technology.
              </p>
              <p>
                Today, OnlinePanthi serves over 50,000 learners worldwide, offering courses in 
                everything from programming and design to business and personal development. 
                But we're more than just a learning platform – we're a community where knowledge 
                flows freely, connections are made, and dreams are realized.
              </p>
              <p>
                Our journey is just beginning. We're constantly evolving, listening to our 
                community, and working to make quality education accessible to everyone, 
                everywhere. Join us as we continue to learn without limits.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default About;
