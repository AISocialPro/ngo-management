"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  CreditCard, 
  Smartphone, 
  Monitor, 
  Users,
  DollarSign,
  Calendar,
  FileText,
  BarChart3,
  Shield,
  CheckCircle,
  Database,
  Globe,
  Settings,
  Zap,
  Lock,
  Download,
  Cloud,
  Server,
  Bell,
  Mail,
  MessageSquare,
  PieChart,
  TrendingUp,
  Award,
  Gift,
  Headphones,
  ShieldCheck,
  Clock,
  RefreshCw,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  Star,
  BookOpen,
  Video,
  HelpCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// ========== TYPE DEFINITIONS ==========
interface Module {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
}

interface FeatureCard {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface Screenshot {
  id: number;
  title: string;
  description: string;
  device: 'mobile' | 'desktop';
}

interface IncludedItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

// ========== MAIN COMPONENT ==========
const ProductPreviewPage: React.FC = () => {
  const router = useRouter();
  const [activeScreenshot, setActiveScreenshot] = useState<number>(1);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBackToHome = () => {
    // In a real app, you would use navigate('/') or history.back()
    router.push('/');
  };

  const handleBuyNow = () => {
    alert('Proceeding to secure payment gateway...');
    // In real app: router.push('/checkout');
  };

  const screenshots: Screenshot[] = [
    {
      id: 1,
      title: "Dashboard Overview",
      description: "Get a comprehensive view of your NGO's performance at a glance",
      device: 'desktop'
    },
    {
      id: 2,
      title: "Donation Management",
      description: "Track all donations and generate receipts automatically",
      device: 'desktop'
    },
    {
      id: 3,
      title: "Volunteer Portal",
      description: "Mobile-friendly volunteer management interface",
      device: 'mobile'
    },
    {
      id: 4,
      title: "Event Planning",
      description: "Plan and manage events with detailed calendars",
      device: 'desktop'
    },
    {
      id: 5,
      title: "Real-time Analytics",
      description: "Monitor impact and generate compliance reports",
      device: 'desktop'
    },
    {
      id: 6,
      title: "Mobile App View",
      description: "Access your NGO data on the go",
      device: 'mobile'
    }
  ];

  const modules: Module[] = [
    {
      icon: <DollarSign size={28} />,
      title: "Donation Management",
      description: "Complete system to manage donations, donors, and fundraising",
      features: [
        "Automated receipt generation",
        "Donor relationship management",
        "Recurring donation setup",
        "Tax exemption certificate tracking",
        "Fund allocation tracking"
      ]
    },
    {
      icon: <Users size={28} />,
      title: "Volunteer Management",
      description: "Recruit, schedule, and manage volunteers efficiently",
      features: [
        "Volunteer registration portal",
        "Shift scheduling & reminders",
        "Skill-based matching",
        "Attendance tracking",
        "Performance evaluation"
      ]
    },
    {
      icon: <Calendar size={28} />,
      title: "Event & Campaign Management",
      description: "Plan and execute successful events and campaigns",
      features: [
        "Event calendar & scheduling",
        "Participant registration",
        "Ticket sales management",
        "Campaign progress tracking",
        "Email & SMS notifications"
      ]
    },
    {
      icon: <FileText size={28} />,
      title: "Compliance & Reporting",
      description: "Stay compliant with automated reporting and documentation",
      features: [
        "Auto-generated compliance reports",
        "Audit trail & history",
        "Financial statement generation",
        "Regulatory deadline reminders",
        "Document management system"
      ]
    },
    {
      icon: <BarChart3 size={28} />,
      title: "Analytics & Insights",
      description: "Data-driven insights to measure and improve impact",
      features: [
        "Real-time dashboard",
        "Impact measurement metrics",
        "Donation trend analysis",
        "Volunteer engagement reports",
        "Custom report builder"
      ]
    },
    {
      icon: <Shield size={28} />,
      title: "Security & Admin",
      description: "Enterprise-grade security with role-based access control",
      features: [
        "Role-based permissions",
        "Data encryption at rest & transit",
        "Two-factor authentication",
        "Activity logs & monitoring",
        "GDPR & data privacy compliance"
      ]
    }
  ];

  const includedItems: IncludedItem[] = [
    {
      icon: <Download size={24} />,
      title: "Complete Source Code",
      description: "Full access to all source files with documentation"
    },
    {
      icon: <Cloud size={24} />,
      title: "Cloud Hosting (1 Year Free)",
      description: "Free hosting for first year with 99.9% uptime guarantee"
    },
    {
      icon: <Headphones size={24} />,
      title: "Premium Support (6 Months)",
      description: "Priority email and chat support for 6 months"
    },
    {
      icon: <BookOpen size={24} />,
      title: "Detailed Documentation",
      description: "Complete setup guide and API documentation"
    },
    {
      icon: <Video size={24} />,
      title: "Video Tutorials",
      description: "Step-by-step video tutorials for all features"
    },
    {
      icon: <RefreshCw size={24} />,
      title: "1 Year Free Updates",
      description: "All feature updates and security patches for 1 year"
    },
    {
      icon: <ShieldCheck size={24} />,
      title: "SSL Certificate",
      description: "Free SSL certificate for secure data transmission"
    },
    {
      icon: <Server size={24} />,
      title: "Database Backups",
      description: "Automated daily backups for 30 days retention"
    }
  ];

  const features: FeatureCard[] = [
    {
      icon: <Zap size={24} />,
      title: "Fast Implementation",
      description: "Get your NGO up and running in under 24 hours"
    },
    {
      icon: <Lock size={24} />,
      title: "Bank-Grade Security",
      description: "Enterprise security with regular security audits"
    },
    {
      icon: <Globe size={24} />,
      title: "Multi-language Support",
      description: "Support for English, Hindi, and regional languages"
    },
    {
      icon: <Settings size={24} />,
      title: "Customizable Workflows",
      description: "Adapt the system to your NGO's unique processes"
    },
    {
      icon: <TrendingUp size={24} />,
      title: "Scalable Architecture",
      description: "Grows with your NGO from small to large operations"
    },
    {
      icon: <Award size={24} />,
      title: "Award-Winning Design",
      description: "Intuitive interface praised by NGOs worldwide"
    }
  ];

  const testimonials = [
    {
      name: "Rohit Sharma",
      role: "Director, Green Earth NGO",
      content: "This software transformed how we manage 500+ volunteers. Efficiency increased by 70%!",
      rating: 5
    },
    {
      name: "Priya Patel",
      role: "Founder, Education For All",
      content: "Donation tracking became effortless. We saved 20 hours weekly on administrative work.",
      rating: 5
    },
    {
      name: "Amit Kumar",
      role: "CEO, Health First Foundation",
      content: "The compliance module alone is worth the investment. Never missed a reporting deadline!",
      rating: 5
    }
  ];

  // ========== RENDER COMPONENT ==========
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-lg py-3' : 'bg-white/90 backdrop-blur-sm py-4'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <button 
            onClick={handleBackToHome}
            className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors font-medium"
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full">
              <CheckCircle size={16} className="text-green-600" />
              <span className="text-sm font-medium text-green-700">Trusted by 500+ NGOs</span>
            </div>
            
            <button 
              onClick={handleBuyNow}
              className="btn flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <CreditCard size={18} />
              Buy Now - ₹6,999
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-6">
          {/* Page Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              NGO Management Software
              <span className="block text-3xl md:text-4xl text-green-600 mt-4">Complete Preview</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage your NGO efficiently. See what you're getting before purchase.
            </p>
          </div>

          {/* Section 1: Screenshots / Mock UI */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">See It In Action</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Modern, intuitive interface designed specifically for NGOs
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 items-start">
              {/* Screenshot Preview */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <span className="text-gray-300 text-sm font-medium">
                      {screenshots.find(s => s.id === activeScreenshot)?.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    {screenshots.find(s => s.id === activeScreenshot)?.device === 'mobile' ? (
                      <Smartphone size={20} />
                    ) : (
                      <Monitor size={20} />
                    )}
                    <span className="text-sm">
                      {screenshots.find(s => s.id === activeScreenshot)?.device === 'mobile' ? 'Mobile View' : 'Desktop View'}
                    </span>
                  </div>
                </div>

                {/* Mock Screen */}
                <div className={`relative bg-white rounded-2xl overflow-hidden ${screenshots.find(s => s.id === activeScreenshot)?.device === 'mobile' ? 'max-w-sm mx-auto' : ''}`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-6">
                        {activeScreenshot === 1 && <BarChart3 size={32} className="text-white" />}
                        {activeScreenshot === 2 && <DollarSign size={32} className="text-white" />}
                        {activeScreenshot === 3 && <Users size={32} className="text-white" />}
                        {activeScreenshot === 4 && <Calendar size={32} className="text-white" />}
                        {activeScreenshot === 5 && <TrendingUp size={32} className="text-white" />}
                        {activeScreenshot === 6 && <Smartphone size={32} className="text-white" />}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">
                        {screenshots.find(s => s.id === activeScreenshot)?.title}
                      </h3>
                      <p className="text-gray-600">
                        {screenshots.find(s => s.id === activeScreenshot)?.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Screenshot Thumbnails */}
              <div className="space-y-6">
                {screenshots.map((screenshot) => (
                  <button
                    key={screenshot.id}
                    onClick={() => setActiveScreenshot(screenshot.id)}
                    className={`w-full p-6 rounded-2xl text-left transition-all ${activeScreenshot === screenshot.id ? 'bg-green-50 border-2 border-green-200' : 'bg-white border border-gray-200 hover:border-green-200'}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${activeScreenshot === screenshot.id ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                        {screenshot.device === 'mobile' ? <Smartphone size={24} /> : <Monitor size={24} />}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">{screenshot.title}</h3>
                        <p className="text-gray-600 text-sm">{screenshot.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                            {screenshot.device === 'mobile' ? 'Mobile' : 'Desktop'}
                          </span>
                          {activeScreenshot === screenshot.id && (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                              Currently Viewing
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-gray-400 ml-auto" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Section 2: Modules List */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Complete Feature Modules</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Everything you need in one comprehensive package
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {modules.map((module, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl border border-gray-200 p-8 hover:border-green-200 hover:shadow-xl transition-all group"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                    {module.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{module.title}</h3>
                  <p className="text-gray-600 mb-6">{module.description}</p>
                  
                  <ul className="space-y-3">
                    {module.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-500 mt-1 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Section 3: What You Get */}
          <section className="mb-20 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 md:p-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">What You Get After Purchase</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Complete package with everything included
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {includedItems.map((item, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-2xl p-6 border border-green-100 hover:border-green-200 hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600 mb-4">
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              ))}
            </div>

            {/* Additional Features */}
            <div className="mt-12 pt-12 border-t border-green-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Additional Benefits</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-white/50">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">{feature.title}</h4>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Loved by NGOs Worldwide</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                See what other organizations are saying about our software
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                      <p className="text-gray-600 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 4: Final CTA */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 to-gray-800 text-white p-8 md:p-12">
            <div className="relative z-10">
              <div className="text-center max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 backdrop-blur-sm mb-6">
                  <Gift size={20} />
                  <span className="font-medium">Limited Time Offer</span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Ready to Transform Your NGO?
                </h2>
                
                <p className="text-xl text-gray-300 mb-8">
                  Join 500+ NGOs who have streamlined their operations and increased their impact.
                </p>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 max-w-2xl mx-auto">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                      <div className="text-5xl font-bold">₹6,999</div>
                      <div className="text-gray-300">One-time payment</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold">Everything Included</div>
                      <div className="text-gray-300">No hidden fees</div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-green-400">
                      <ShieldCheck size={24} />
                      <span className="font-medium">30-Day Money Back</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    onClick={handleBuyNow}
                    className="btn bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-lg px-12 py-4 flex items-center justify-center gap-3"
                  >
                    <CreditCard size={24} />
                    Proceed to Secure Payment
                    <ArrowRight size={20} />
                  </button>
                  
                  <button className="px-8 py-4 border-2 border-white/30 rounded-full hover:bg-white/10 transition-colors font-medium">
                    <span className="flex items-center gap-2">
                      <HelpCircle size={20} />
                      Need Help? Chat with us
                    </span>
                  </button>
                </div>

                <div className="mt-8 text-gray-400 text-sm">
                  <p className="flex items-center justify-center gap-2">
                    <Lock size={16} />
                    Secure payment processed by Razorpay • 256-bit SSL encryption
                  </p>
                </div>
              </div>
            </div>
            
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.1)_1px,_transparent_0)] bg-[length:40px_40px]"></div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mt-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Get answers to common questions about our NGO software
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {[
                {
                  q: "How soon can we start using the software?",
                  a: "You can get started within 24 hours of purchase. We provide instant access to the software and detailed setup instructions."
                },
                {
                  q: "Do you offer customization?",
                  a: "Yes, we offer customization services at an additional cost. The base software is highly configurable to fit most NGO requirements."
                },
                {
                  q: "Is there a free trial?",
                  a: "We offer a 14-day free trial with full access to all features. No credit card required."
                },
                {
                  q: "What kind of support do you provide?",
                  a: "We provide 6 months of premium support including email, chat, and video calls. Extended support plans are available."
                },
                {
                  q: "Can we host it on our own server?",
                  a: "Yes, you get the complete source code and can host it on your own infrastructure if preferred."
                },
                {
                  q: "Is there training included?",
                  a: "Yes, we provide comprehensive video tutorials and documentation. Additional training sessions can be arranged."
                }
              ].map((faq, index) => (
                <div key={index} className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-green-200 transition-colors">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <HelpCircle size={20} className="text-green-600" />
                    {faq.q}
                  </h3>
                  <p className="text-gray-600">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <Users className="text-green-600" size={24} />
                </div>
                <span className="text-2xl font-bold">
                  Nexa<span className="text-green-400">NGO</span>
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                Empowering NGOs with technology since 2020
              </p>
            </div>
            
            <div className="flex items-center gap-6">
              <button className="text-gray-400 hover:text-white transition-colors text-sm">
                Terms of Service
              </button>
              <button className="text-gray-400 hover:text-white transition-colors text-sm">
                Privacy Policy
              </button>
              <button className="text-gray-400 hover:text-white transition-colors text-sm">
                Refund Policy
              </button>
            </div>
            
            <div className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} NexaNGO. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// ========== STYLES ==========
const styledComponents = `
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: white;
    padding: 14px 32px;
    border-radius: 50px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 1rem;
    text-decoration: none;
  }
  
  .btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  }
  
  .btn:active {
    transform: translateY(-1px);
  }
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    line-height: 1.6;
    color: #1f2937;
    overflow-x: hidden;
  }
  
  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
  }
  
  /* Smooth scrolling */
  html {
    scroll-behavior: smooth;
  }
`;

// Add styles to the document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styledComponents;
  document.head.appendChild(styleSheet);
}

export default ProductPreviewPage;