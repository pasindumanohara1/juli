
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, HelpCircle, Briefcase } from 'lucide-react';
import LiquidBackground from '@/components/LiquidBackground';
import GlassCard from '@/components/GlassCard';
import LiquidButton from '@/components/LiquidButton';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    // Reset form
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      details: 'support@onlinepanthi.com',
      description: 'Get in touch for general inquiries'
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: '+1 (555) 123-4567',
      description: 'Mon-Fri, 9AM-6PM EST'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      details: '123 Learning Street, Education City, EC 12345',
      description: 'Our headquarters'
    }
  ];

  const supportOptions = [
    {
      icon: HelpCircle,
      title: 'Help Center',
      description: 'Find answers to common questions',
      action: 'Browse FAQ'
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Chat with our support team',
      action: 'Start Chat'
    },
    {
      icon: Briefcase,
      title: 'Business Inquiries',
      description: 'Partnership and enterprise solutions',
      action: 'Contact Sales'
    }
  ];

  return (
    <div className="min-h-screen pt-24">
      <LiquidBackground />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-ocean-600 mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-ocean-500 max-w-2xl mx-auto">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <GlassCard className="p-8">
              <h2 className="text-2xl font-semibold text-ocean-600 mb-6">Send us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-ocean-600 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/50 border border-ocean-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-transparent transition-all duration-300"
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-ocean-600 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/50 border border-ocean-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-transparent transition-all duration-300"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-ocean-600 mb-2">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/50 border border-ocean-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-transparent transition-all duration-300"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="business">Business Partnership</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-ocean-600 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-white/50 border border-ocean-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-transparent transition-all duration-300"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <LiquidButton type="submit" className="w-full" size="lg">
                  <Send className="w-5 h-5 mr-2" />
                  Send Message
                </LiquidButton>
              </form>
            </GlassCard>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Details */}
            <GlassCard className="p-8">
              <h2 className="text-2xl font-semibold text-ocean-600 mb-6">Contact Information</h2>
              <div className="space-y-6">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon;
                  return (
                    <div key={index} className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-ocean-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-ocean-600 mb-1">{info.title}</h3>
                        <p className="text-ocean-600 font-medium mb-1">{info.details}</p>
                        <p className="text-sm text-ocean-500">{info.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>

            {/* Support Options */}
            <GlassCard className="p-8">
              <h2 className="text-2xl font-semibold text-ocean-600 mb-6">Other Ways to Get Help</h2>
              <div className="space-y-4">
                {supportOptions.map((option, index) => {
                  const Icon = option.icon;
                  return (
                    <div key={index} className="flex items-center justify-between p-4 bg-white/30 rounded-xl hover:bg-white/40 transition-colors cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-ocean-100 rounded-full flex items-center justify-center">
                          <Icon className="w-5 h-5 text-ocean-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-ocean-600">{option.title}</h3>
                          <p className="text-sm text-ocean-500">{option.description}</p>
                        </div>
                      </div>
                      <LiquidButton size="sm" variant="secondary">
                        {option.action}
                      </LiquidButton>
                    </div>
                  );
                })}
              </div>
            </GlassCard>

            {/* Office Hours */}
            <GlassCard className="p-8">
              <h2 className="text-2xl font-semibold text-ocean-600 mb-6">Office Hours</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-ocean-500">Monday - Friday</span>
                  <span className="text-ocean-600 font-medium">9:00 AM - 6:00 PM EST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ocean-500">Saturday</span>
                  <span className="text-ocean-600 font-medium">10:00 AM - 4:00 PM EST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ocean-500">Sunday</span>
                  <span className="text-ocean-600 font-medium">Closed</span>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-teal-50 rounded-xl border border-teal-200">
                <p className="text-sm text-teal-700">
                  <strong>Note:</strong> We typically respond to emails within 24 hours during business days.
                </p>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
