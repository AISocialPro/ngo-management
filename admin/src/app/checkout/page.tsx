"use client";
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle,
  ArrowRight,
  CreditCard,
  ShieldCheck,
  Zap,
  Lock,
  Star,
  Users,
  DollarSign,
  FileText,
  Calendar,
  BarChart3,
  Shield,
  TrendingUp,
  Database,
  ChevronRight,
  ArrowLeft,
  BadgeCheck,
  Clock,
  Headphones,
  Cloud,
  Server,
  BookOpen,
  Gift
} from 'lucide-react';

// ========== TYPE DEFINITIONS ==========
interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface IncludedItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface Testimonial {
  name: string;
  role: string;
  content: string;
}

// ========== MAIN COMPONENT ==========
const PricingPage: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>('professional');
  const [isAnnual, setIsAnnual] = useState<boolean>(true);
  const [showPayment, setShowPayment] = useState<boolean>(false);
  const [paymentStep, setPaymentStep] = useState<number>(1);

  // Mock user data
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    ngoName: '',
    teamSize: '5-10'
  });

  // Single Professional Plan (as per requirement - only one plan)
  const professionalPlan = {
    name: "Professional",
    monthlyPrice: "₹6,999",
    annualPrice: "₹6,299",
    annualSavings: "Save ₹8,400 yearly",
    description: "Perfect for growing NGOs with multiple programs",
    features: [
      "Up to 20 team members",
      "Unlimited donations tracking",
      "Advanced volunteer management",
      "Compliance & audit reports",
      "Priority email & chat support",
      "10 GB secure storage",
      "Custom workflows",
      "Basic API access",
      "Event management tools",
      "Impact analytics dashboard"
    ],
    included: [
      "30-day free trial",
      "Setup assistance",
      "Training sessions",
      "Regular updates",
      "Data migration help"
    ]
  };

  const features: Feature[] = [
    { 
      icon: <DollarSign size={32} />, 
      title: "Donation Management", 
      description: "Track all donations, generate receipts, automate thank you emails"
    },
    { 
      icon: <Users size={32} />, 
      title: "Volunteer Management", 
      description: "Schedule, communicate with, and track volunteer activities"
    },
    { 
      icon: <Calendar size={32} />, 
      title: "Event & Campaigns", 
      description: "Plan and manage fundraising events and awareness campaigns"
    },
    { 
      icon: <FileText size={32} />, 
      title: "Compliance & Reports", 
      description: "Automated reporting for regulatory compliance and stakeholders"
    },
    { 
      icon: <Shield size={32} />, 
      title: "Security & Permissions", 
      description: "Role-based access control with enterprise security"
    },
    { 
      icon: <TrendingUp size={32} />, 
      title: "Impact Analytics", 
      description: "Measure and visualize your organization's impact"
    },
  ];

  const includedItems: IncludedItem[] = [
    {
      icon: <Cloud size={24} />,
      title: "Cloud Hosting",
      description: "Free hosting for 1 year with 99.9% uptime"
    },
    {
      icon: <Headphones size={24} />,
      title: "Premium Support",
      description: "Priority support for 6 months"
    },
    {
      icon: <BookOpen size={24} />,
      title: "Training & Setup",
      description: "Complete setup and team training"
    },
    {
      icon: <Server size={24} />,
      title: "Daily Backups",
      description: "Automated daily backups for 30 days"
    },
    {
      icon: <ShieldCheck size={24} />,
      title: "SSL Certificate",
      description: "Free SSL for secure data transmission"
    },
    {
      icon: <Zap size={24} />,
      title: "Regular Updates",
      description: "All feature updates for 1 year"
    }
  ];

  const testimonials: Testimonial[] = [
    {
      name: "Priya Sharma",
      role: "Director, Education For All",
      content: "This software transformed how we manage our 200 volunteers. Donation tracking became effortless and we saved 20+ hours weekly!"
    },
    {
      name: "Rahul Mehta",
      role: "Founder, Green Earth NGO",
      content: "The compliance module alone is worth the investment. Never missed a reporting deadline since we started using it."
    },
    {
      name: "Anjali Patel",
      role: "CEO, Health First Foundation",
      content: "Our donation collection increased by 40% after implementing the automated receipt system. Highly recommended!"
    }
  ];

  const handleBuyNow = () => {
    // Save selected plan to localStorage or state management
    localStorage.setItem('selectedPlan', JSON.stringify({
      plan: professionalPlan.name,
      isAnnual,
      price: isAnnual ? professionalPlan.annualPrice : professionalPlan.monthlyPrice
    }));
    
    // Move to payment flow
    setShowPayment(true);
  };

  const handlePaymentSubmit = () => {
    // In real app, integrate with payment gateway
    // For now, simulate payment
    setPaymentStep(2);
    setTimeout(() => {
      setPaymentStep(3);
    }, 2000);
  };

  const handleBackToPricing = () => {
    setShowPayment(false);
    setPaymentStep(1);
  };

  const calculateTotal = () => {
    const price = isAnnual ? 
      parseInt(professionalPlan.annualPrice.replace('₹', '').replace(',', '')) : 
      parseInt(professionalPlan.monthlyPrice.replace('₹', '').replace(',', ''));
    
    const gst = price * 0.18; // 18% GST
    return {
      subtotal: price,
      gst: gst,
      total: price + gst
    };
  };

  const totals = calculateTotal();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-emerald-50/30">
      {/* Navigation */}
      <header className="fixed w-full z-50 bg-white/95 backdrop-blur-md shadow-lg py-4">
        <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <Users size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              Nexa<span className="text-emerald-600">NGO</span>
            </span>
          </div>
          
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-20">
        {/* Hero Section */}
        <section className="py-12 px-4 md:px-8">
          <div className="container mx-auto text-center max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 px-6 py-3 rounded-full text-sm md:text-base font-semibold mb-6 shadow-sm">
              <CheckCircle size={18} />
              Trusted by 500+ NGOs across India
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Simple, Transparent Pricing for
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-600">
                Every NGO
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
              One powerful plan that grows with your organization. No hidden fees, no complicated tiers.
            </p>
          </div>
        </section>

        {/* Pricing Section */}
        {!showPayment ? (
          <>
            <section className="py-8 px-4 md:px-8">
              <div className="container mx-auto max-w-6xl">
                {/* Billing Toggle */}
                <div className="flex justify-center mb-12">
                  <div className="bg-white p-2 rounded-2xl shadow-lg inline-flex">
                    <button
                      onClick={() => setIsAnnual(false)}
                      className={`px-8 py-4 rounded-xl font-semibold transition-all ${!isAnnual ? 'bg-emerald-500 text-white shadow-lg' : 'text-gray-600 hover:text-emerald-600'}`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setIsAnnual(true)}
                      className={`px-8 py-4 rounded-xl font-semibold transition-all ${isAnnual ? 'bg-emerald-500 text-white shadow-lg' : 'text-gray-600 hover:text-emerald-600'}`}
                    >
                      Annual <span className="text-sm font-normal">(Save 10%)</span>
                    </button>
                  </div>
                </div>

                {/* Single Plan Card */}
                <div className="max-w-4xl mx-auto">
                  <div className="bg-gradient-to-br from-white to-emerald-50 border-4 border-emerald-300 rounded-3xl p-8 md:p-12 shadow-2xl relative">
                    {/* Popular Badge */}
                    <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2">
                        <BadgeCheck size={18} />
                        RECOMMENDED FOR MOST NGOS
                      </span>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                      {/* Plan Details */}
                      <div className="lg:col-span-2">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">{professionalPlan.name}</h2>
                        <p className="text-gray-600 text-lg mb-8">{professionalPlan.description}</p>
                        
                        <div className="flex items-baseline mb-8">
                          <span className="text-6xl md:text-7xl font-bold text-gray-900">
                            {isAnnual ? professionalPlan.annualPrice : professionalPlan.monthlyPrice}
                          </span>
                          <span className="text-gray-600 text-xl ml-2">
                            {isAnnual ? '/year' : '/month'}
                          </span>
                        </div>

                        {isAnnual && (
                          <div className="flex items-center gap-2 text-emerald-700 bg-emerald-100 px-4 py-3 rounded-xl mb-8">
                            <Gift size={20} />
                            <span className="font-semibold">{professionalPlan.annualSavings}</span>
                          </div>
                        )}

                        <button 
                          onClick={handleBuyNow}
                          className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-5 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 mb-8"
                        >
                          <CreditCard size={24} />
                          Get Started with Free Trial
                          <ArrowRight size={22} />
                        </button>

                        <div className="flex items-center justify-center gap-4 text-gray-600 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock size={16} />
                            <span>30-day free trial</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ShieldCheck size={16} />
                            <span>No credit card required</span>
                          </div>
                        </div>
                      </div>

                      {/* Features List */}
                      <div className="bg-white rounded-2xl p-6 border border-gray-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Everything Included:</h3>
                        <ul className="space-y-4">
                          {professionalPlan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start">
                              <CheckCircle className="text-emerald-500 mt-1 mr-3 flex-shrink-0" size={20} />
                              <span className="text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Included Items */}
                <div className="mt-16">
                  <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Also Included Free</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {includedItems.map((item, idx) => (
                      <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-emerald-200 hover:shadow-lg transition-all">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
                          {item.icon}
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2">{item.title}</h4>
                        <p className="text-gray-600 text-sm">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Features Grid */}
            <section className="py-16 px-4 md:px-8 bg-gradient-to-b from-white to-gray-50">
              <div className="container mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-12">
                  <h2 className="text-4xl font-bold text-gray-900 mb-6">Powerful Features</h2>
                  <p className="text-xl text-gray-600">
                    Everything you need to manage your NGO efficiently
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {features.map((feature, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-emerald-200 hover:shadow-xl transition-all">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white mb-6">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Testimonials */}
            <section className="py-16 px-4 md:px-8">
              <div className="container mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-12">
                  <h2 className="text-4xl font-bold text-gray-900 mb-6">Loved by NGOs Worldwide</h2>
                  <p className="text-xl text-gray-600">
                    See what other organizations are saying
                  </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                  {testimonials.map((testimonial, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow">
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white">
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
              </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 px-4 md:px-8 bg-gradient-to-b from-gray-50 to-white">
              <div className="container mx-auto max-w-4xl">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                </div>
                
                <div className="space-y-6">
                  {[
                    {
                      q: "Is there a free trial?",
                      a: "Yes! We offer a 30-day free trial with full access to all features. No credit card required."
                    },
                    {
                      q: "Can I switch between monthly and annual billing?",
                      a: "Yes, you can switch at any time. If you switch to annual, we'll pro-rate the remaining time."
                    },
                    {
                      q: "What payment methods do you accept?",
                      a: "We accept all major credit cards, debit cards, UPI, and net banking through our secure payment gateway."
                    },
                    {
                      q: "Do you offer discounts for large NGOs?",
                      a: "Yes, we offer special pricing for NGOs with 50+ team members. Contact our sales team for custom quotes."
                    },
                    {
                      q: "How long does setup take?",
                      a: "Most NGOs are up and running within 24 hours. We provide setup assistance and training."
                    },
                    {
                      q: "What happens after my free trial ends?",
                      a: "You can choose to subscribe to continue using the platform. Your data is preserved during the transition."
                    }
                  ].map((faq, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-emerald-200 transition-colors">
                      <h3 className="text-lg font-bold text-gray-900 mb-3">{faq.q}</h3>
                      <p className="text-gray-600">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Final CTA */}
            <section className="py-20 px-4 md:px-8 bg-gradient-to-br from-emerald-50 via-white to-green-50">
              <div className="container mx-auto max-w-4xl text-center">
                <h2 className="text-4xl font-bold text-gray-900 mb-8">Ready to Transform Your NGO?</h2>
                <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
                  Join hundreds of NGOs that have streamlined their operations
                </p>
                <button 
                  onClick={handleBuyNow}
                  className="group inline-flex items-center gap-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-12 py-6 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300"
                >
                  Start Your Free Trial Today
                  <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                </button>
                <p className="text-gray-500 mt-8 text-sm">
                  No credit card required • 30-day free trial • Cancel anytime
                </p>
              </div>
            </section>
          </>
        ) : (
          /* Payment Flow */
          <section className="py-12 px-4 md:px-8">
            <div className="container mx-auto max-w-4xl">
              {/* Progress Steps */}
              <div className="flex justify-center mb-12">
                <div className="flex items-center">
                  <div className={`flex flex-col items-center ${paymentStep >= 1 ? 'text-emerald-600' : 'text-gray-400'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${paymentStep >= 1 ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                      1
                    </div>
                    <span className="text-sm mt-2 font-medium">Plan Details</span>
                  </div>
                  <div className={`w-24 h-1 ${paymentStep >= 2 ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                  <div className={`flex flex-col items-center ${paymentStep >= 2 ? 'text-emerald-600' : 'text-gray-400'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${paymentStep >= 2 ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                      2
                    </div>
                    <span className="text-sm mt-2 font-medium">Your Details</span>
                  </div>
                  <div className={`w-24 h-1 ${paymentStep >= 3 ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                  <div className={`flex flex-col items-center ${paymentStep >= 3 ? 'text-emerald-600' : 'text-gray-400'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${paymentStep >= 3 ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                      3
                    </div>
                    <span className="text-sm mt-2 font-medium">Confirmation</span>
                  </div>
                </div>
              </div>

              {/* Plan Summary */}
              <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden mb-8">
                <div className="p-8 border-b border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Order Summary</h2>
                    <button 
                      onClick={handleBackToPricing}
                      className="text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Change Plan
                    </button>
                  </div>
                  
                  <div className="bg-emerald-50 rounded-xl p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{professionalPlan.name}</h3>
                        <p className="text-gray-600">{isAnnual ? 'Annual billing' : 'Monthly billing'}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-gray-900">
                          {isAnnual ? professionalPlan.annualPrice : professionalPlan.monthlyPrice}
                          <span className="text-lg font-normal text-gray-600">
                            {isAnnual ? '/year' : '/month'}
                          </span>
                        </div>
                        {isAnnual && (
                          <p className="text-emerald-600 text-sm font-medium">
                            {professionalPlan.annualSavings}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Details Form */}
                {paymentStep === 1 && (
                  <div className="p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Your Information</h3>
                    
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={userData.name}
                          onChange={(e) => setUserData({...userData, name: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                          placeholder="Enter your full name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={userData.email}
                          onChange={(e) => setUserData({...userData, email: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                          placeholder="Enter your email"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={userData.phone}
                          onChange={(e) => setUserData({...userData, phone: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                          placeholder="Enter your phone number"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          NGO Name *
                        </label>
                        <input
                          type="text"
                          value={userData.ngoName}
                          onChange={(e) => setUserData({...userData, ngoName: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                          placeholder="Enter your NGO name"
                        />
                      </div>
                    </div>

                    <div className="mb-8">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Team Size *
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {['1-5', '5-10', '10-20', '20+'].map((size) => (
                          <button
                            key={size}
                            onClick={() => setUserData({...userData, teamSize: size})}
                            className={`py-3 rounded-xl border ${userData.teamSize === size ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-300 hover:border-emerald-300'}`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => setPaymentStep(2)}
                      className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                      disabled={!userData.name || !userData.email || !userData.ngoName}
                    >
                      Continue to Payment
                    </button>
                  </div>
                )}

                {/* Payment Details */}
                {paymentStep === 2 && (
                  <div className="p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Payment Details</h3>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
                      <div className="flex items-start gap-3">
                        <Lock className="text-yellow-600 mt-1 flex-shrink-0" size={20} />
                        <div>
                          <h4 className="font-bold text-gray-900 mb-2">Secure Payment Gateway</h4>
                          <p className="text-gray-600 text-sm">
                            This is a demo payment flow. In production, this would connect to Razorpay/Stripe with 256-bit SSL encryption.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Demo Payment Form */}
                    <div className="mb-8">
                      <div className="bg-gray-50 rounded-xl p-6 mb-6">
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Plan Price</span>
                            <span className="font-medium">{isAnnual ? professionalPlan.annualPrice : professionalPlan.monthlyPrice}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">GST (18%)</span>
                            <span className="font-medium">₹{Math.round(totals.gst).toLocaleString('en-IN')}</span>
                          </div>
                          <div className="border-t border-gray-300 pt-4 flex justify-between text-lg font-bold">
                            <span>Total Amount</span>
                            <span>₹{Math.round(totals.total).toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Card Number
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition pr-12"
                              placeholder="4242 4242 4242 4242"
                              defaultValue="4242 4242 4242 4242"
                            />
                            <div className="absolute right-3 top-3 text-gray-400">
                              <CreditCard size={20} />
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              MM/YY
                            </label>
                            <input
                              type="text"
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                              placeholder="12/28"
                              defaultValue="12/28"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              CVV
                            </label>
                            <input
                              type="text"
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                              placeholder="123"
                              defaultValue="123"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() => setPaymentStep(1)}
                        className="flex-1 py-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={handlePaymentSubmit}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 rounded-xl font-bold hover:shadow-xl transition-all flex items-center justify-center gap-3"
                      >
                        <CreditCard size={22} />
                        Complete Payment
                      </button>
                    </div>
                  </div>
                )}

                {/* Confirmation */}
                {paymentStep === 3 && (
                  <div className="p-8 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle size={40} className="text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Payment Successful!</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      Thank you for choosing NexaNGO! Your account is being set up. 
                      You'll receive an email with login details within 15 minutes.
                    </p>
                    
                    <div className="bg-emerald-50 rounded-xl p-6 mb-8 max-w-md mx-auto">
                      <div className="text-left">
                        <h4 className="font-bold text-gray-900 mb-4">Order Details</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Order ID</span>
                            <span className="font-mono font-medium">NGO-{Date.now().toString().slice(-8)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Plan</span>
                            <span className="font-medium">{professionalPlan.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Billing</span>
                            <span className="font-medium">{isAnnual ? 'Annual' : 'Monthly'}</span>
                          </div>
                          <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-300">
                            <span>Amount Paid</span>
                            <span>₹{Math.round(totals.total).toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={() => window.location.href = '/'}
                        className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-bold hover:shadow-xl transition-all"
                      >
                        Go to Dashboard
                      </button>
                      <button
                        onClick={handleBackToPricing}
                        className="px-8 py-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                      >
                        Back to Pricing
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Security Assurance */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex flex-wrap items-center justify-center gap-8">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="text-emerald-600" size={24} />
                    <div>
                      <div className="font-medium">256-bit SSL</div>
                      <div className="text-sm text-gray-600">Secure encryption</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Lock className="text-emerald-600" size={24} />
                    <div>
                      <div className="font-medium">PCI DSS Compliant</div>
                      <div className="text-sm text-gray-600">Payment security</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-emerald-600" size={24} />
                    <div>
                      <div className="font-medium">Money Back Guarantee</div>
                      <div className="text-sm text-gray-600">30-day refund</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 md:px-8">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                  <Users size={24} className="text-emerald-600" />
                </div>
                <span className="text-2xl font-bold">
                  Nexa<span className="text-emerald-400">NGO</span>
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                Empowering NGOs with technology since 2020
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Features</li>
                <li>Pricing</li>
                <li>Use Cases</li>
                <li>Updates</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>API Docs</li>
                <li>System Status</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Cookie Policy</li>
                <li>Refund Policy</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} NexaNGO. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Global Styles */}
      <style jsx global>{`
        .container {
          width: 100%;
          max-width: 1280px;
          margin-left: auto;
          margin-right: auto;
          padding-left: 1rem;
          padding-right: 1rem;
        }
        
        @media (max-width: 768px) {
          .container {
            padding-left: 1.5rem;
            padding-right: 1.5rem;
          }
        }
        
        @media (max-width: 640px) {
          .container {
            padding-left: 1rem;
            padding-right: 1rem;
          }
        }
        
        html {
          scroll-behavior: smooth;
        }
        
        ::-webkit-scrollbar {
          width: 10px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #10b981, #059669);
          border-radius: 5px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #059669, #047857);
        }
      `}</style>
    </div>
  );
};

export default PricingPage;