"use client";
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  FileText, 
  Calendar, 
  BarChart3, 
  Shield,
  CheckCircle,
  ArrowRight,
  CreditCard,
  TrendingUp,
  Globe,
  Phone,
  Mail,
  MapPin,
  Menu,
  X,
  Heart,
  Target,
  Zap,
  Lock,
  Star,
  ChevronRight,
  Rocket,
  Search,
  Eye,
  ShoppingCart,
  Crown,
  PhoneCall,
  Twitter,
  Facebook,
  Linkedin,
  Instagram,
  HandHeart,
  ChartBar,
  UsersRound,
  CalendarDays,
  ShieldCheck,
  ChartLine,
  Database,
  Award,
  Gift,
  Headphones,
  Download,
  Cloud,
  Server,
  BookOpen,
  Video,
  HelpCircle,
  RefreshCw,
  BadgeCheck,
  Clock,
  ArrowLeft,
  Receipt,
  Building,
  Smartphone
} from 'lucide-react';

// ========== TYPE DEFINITIONS ==========
interface Problem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface Step {
  number: string;
  title: string;
  description: string;
}

interface PricingPlan {
  name: string;
  price: string;
  originalPrice?: string;
  period: string;
  description: string;
  features: string[];
  highlighted: boolean;
  badge?: string;
  savings?: string;
}

interface Stat {
  value: string;
  label: string;
}

interface FooterLink {
  title: string;
  items: string[];
}

interface UserData {
  name: string;
  email: string;
  phone: string;
  ngoName: string;
  teamSize: string;
}

// ========== CHECKOUT COMPONENT ==========
interface CheckoutFlowProps {
  onClose: () => void;
  selectedPlan: PricingPlan;
}

const CheckoutFlow: React.FC<CheckoutFlowProps> = ({ onClose, selectedPlan }) => {
  const [checkoutStep, setCheckoutStep] = useState<number>(1);
  const [userData, setUserData] = useState<UserData>({
    name: '',
    email: '',
    phone: '',
    ngoName: '',
    teamSize: '5-10'
  });
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardName: ''
  });
  const [orderId, setOrderId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Calculate price based on plan name
  const calculatePrice = () => {
    const priceText = selectedPlan.price.replace('₹', '').replace(',', '');
    const price = parseInt(priceText);
    
    const gst = price * 0.18;
    return {
      subtotal: price,
      gst: Math.round(gst),
      total: Math.round(price + gst)
    };
  };

  const totals = calculatePrice();

  const handlePaymentSubmit = async () => {
    setIsProcessing(true);
    
    // Generate order ID
    const newOrderId = `NGO-${Date.now().toString().slice(-8)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    setOrderId(newOrderId);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setCheckoutStep(3);
      
      // Save order to localStorage
      const orderData = {
        orderId: newOrderId,
        plan: selectedPlan.name,
        price: selectedPlan.price,
        period: selectedPlan.period,
        amount: totals.total,
        userData,
        date: new Date().toISOString()
      };
      
      const existingOrders = JSON.parse(localStorage.getItem('ngonexa-orders') || '[]');
      existingOrders.push(orderData);
      localStorage.setItem('ngonexa-orders', JSON.stringify(existingOrders));
    }, 2000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleGoToCompanySignup = () => {
    // Save user session
    localStorage.setItem('ngonexa-user', JSON.stringify({
      ...userData,
      plan: selectedPlan.name,
      price: selectedPlan.price,
      period: selectedPlan.period,
      orderId,
      subscribedAt: new Date().toISOString()
    }));
    
    // Redirect to company signup page
    window.location.href = '/company-signup';
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div className="min-h-screen px-4 py-8 flex items-center justify-center">
        <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-slideUp">
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 z-10 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
            disabled={isProcessing}
          >
            <X size={24} className="text-gray-700" />
          </button>
          
          {/* Checkout Header */}
          <div className="bg-gradient-to-r from-gray-900 to-emerald-900 text-white p-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                <HandHeart size={28} className="text-emerald-600" />
              </div>
              <span className="text-3xl font-bold">
                Nexa<span className="text-emerald-400">NGO</span>
              </span>
            </div>
            <h1 className="text-3xl font-bold text-center mb-2">Complete Your Purchase</h1>
            <p className="text-gray-300 text-center">Secure checkout for {selectedPlan.name}</p>
          </div>

          {/* Progress Steps */}
          <div className="px-8 pt-8">
            <div className="flex justify-center mb-8">
              <div className="flex items-center">
                <div className={`flex flex-col items-center ${checkoutStep >= 1 ? 'text-emerald-600' : 'text-gray-400'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${checkoutStep >= 1 ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    1
                  </div>
                  <span className="text-xs mt-2 font-medium">Details</span>
                </div>
                <div className={`w-16 h-1 ${checkoutStep >= 2 ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                <div className={`flex flex-col items-center ${checkoutStep >= 2 ? 'text-emerald-600' : 'text-gray-400'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${checkoutStep >= 2 ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    2
                  </div>
                  <span className="text-xs mt-2 font-medium">Payment</span>
                </div>
                <div className={`w-16 h-1 ${checkoutStep >= 3 ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                <div className={`flex flex-col items-center ${checkoutStep >= 3 ? 'text-emerald-600' : 'text-gray-400'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${checkoutStep >= 3 ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    3
                  </div>
                  <span className="text-xs mt-2 font-medium">Confirm</span>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Content */}
          <div className="p-8 max-h-[70vh] overflow-y-auto">
            {/* Plan Summary */}
            <div className="bg-emerald-50 rounded-2xl p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedPlan.name}</h3>
                  <p className="text-gray-600">{selectedPlan.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {selectedPlan.price}
                    <span className="text-lg font-normal text-gray-600">
                      {selectedPlan.period}
                    </span>
                  </div>
                  {selectedPlan.savings && (
                    <p className="text-emerald-600 text-sm font-medium">
                      {selectedPlan.savings}
                    </p>
                  )}
                  {selectedPlan.originalPrice && (
                    <p className="text-gray-500 text-sm line-through">
                      {selectedPlan.originalPrice}
                    </p>
                  )}
                </div>
              </div>
              
              {selectedPlan.badge && (
                <div className="flex justify-center mt-2">
                  <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-xs font-semibold">
                    {selectedPlan.badge}
                  </span>
                </div>
              )}
            </div>

            {/* Step 1: User Details */}
            {checkoutStep === 1 && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Your Information</h3>
                
                <div className="grid md:grid-cols-2 gap-4 mb-6">
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
                  <div className="grid grid-cols-4 gap-2">
                    {['1-5', '5-10', '10-20', '20+'].map((size) => (
                      <button
                        key={size}
                        onClick={() => setUserData({...userData, teamSize: size})}
                        className={`py-3 rounded-lg text-sm transition-colors ${userData.teamSize === size ? 'border-emerald-500 bg-emerald-50 text-emerald-700 border-2' : 'border border-gray-300 hover:border-emerald-300 hover:text-emerald-700'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setCheckoutStep(2)}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!userData.name || !userData.email || !userData.ngoName || !userData.phone}
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {/* Step 2: Payment */}
            {checkoutStep === 2 && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Payment Details</h3>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-2">
                    <Lock className="text-yellow-600 mt-1 flex-shrink-0" size={18} />
                    <p className="text-gray-600 text-sm">
                      Secure payment gateway simulation. Real implementation would connect to Razorpay/Stripe.
                    </p>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <h4 className="font-bold text-gray-900 mb-3">Order Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plan Price</span>
                      <span className="font-medium">{selectedPlan.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">GST (18%)</span>
                      <span className="font-medium">{formatCurrency(totals.gst)}</span>
                    </div>
                    <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between font-bold">
                      <span>Total Amount</span>
                      <span>{formatCurrency(totals.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Demo Payment Form */}
                <div className="mb-6">
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Number
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition"
                        placeholder="4242 4242 4242 4242"
                        value={paymentData.cardNumber}
                        onChange={(e) => setPaymentData({...paymentData, cardNumber: e.target.value})}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          MM/YY
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition"
                          placeholder="12/28"
                          value={paymentData.expiry}
                          onChange={(e) => setPaymentData({...paymentData, expiry: e.target.value})}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition"
                          placeholder="123"
                          value={paymentData.cvv}
                          onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-6">
                    <ShieldCheck size={16} className="text-emerald-600" />
                    <span>Secure 256-bit SSL encryption</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setCheckoutStep(1)}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isProcessing}
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePaymentSubmit}
                    disabled={isProcessing || !paymentData.cardNumber || !paymentData.expiry || !paymentData.cvv}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 rounded-xl font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw size={20} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard size={20} />
                        Pay {formatCurrency(totals.total)}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {checkoutStep === 3 && (
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={32} className="text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Payment Successful!</h3>
                <p className="text-gray-600 mb-8">
                  Thank you for choosing NexaNGO! Redirecting to company signup...
                </p>
                
                <div className="bg-emerald-50 rounded-xl p-6 mb-8">
                  <div className="text-left">
                    <h4 className="font-bold text-gray-900 mb-4">Order Details</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order ID</span>
                        <span className="font-mono font-medium">{orderId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Plan</span>
                        <span className="font-medium">{selectedPlan.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount Paid</span>
                        <span className="font-medium">{formatCurrency(totals.total)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Billing Period</span>
                        <span className="font-medium">{selectedPlan.period}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleGoToCompanySignup}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-bold hover:shadow-xl transition-all"
                  >
                    Go to Company Signup
                  </button>
                  <button
                    onClick={onClose}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Security Footer */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span>256-bit SSL</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock size={16} className="text-emerald-600" />
                <span>PCI DSS Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-600" />
                <span>30-day Money Back</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========== MAIN APP COMPONENT ==========
const NGOApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('features');
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [showProductPreview, setShowProductPreview] = useState<boolean>(false);
  const [showCheckout, setShowCheckout] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Load orders
    const savedOrders = localStorage.getItem('ngonexa-orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
    
    // Check if user is already logged in
    const userSession = localStorage.getItem('ngonexa-user');
    setIsLoggedIn(!!userSession);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string): void => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: 'smooth'
      });
      setIsMenuOpen(false);
    }
  };

  const handleBuyNow = (plan: PricingPlan): void => {
    setSelectedPlan(plan);
    setShowCheckout(true);
  };

  const handleGetStarted = (): void => {
    // Default to monthly plan
    handleBuyNow(pricingPlans[0]);
  };

  const handleGoToDashboard = () => {
    window.location.href = '/admin/dashboard';
  };

  // ========== DATA ==========
  const problems: Problem[] = [
    { 
      icon: <DollarSign size={28} />, 
      title: "Manual Donation Tracking", 
      description: "Spreadsheets and paper receipts lead to errors and lost donations"
    },
    { 
      icon: <Users size={28} />, 
      title: "Volunteer Mismanagement", 
      description: "No centralized system to track volunteers and their availability"
    },
    { 
      icon: <FileText size={28} />, 
      title: "Compliance Headaches", 
      description: "Struggling with regulatory requirements and reporting deadlines"
    },
    { 
      icon: <Database size={28} />, 
      title: "Scattered Data", 
      description: "Important information stored across multiple platforms and devices"
    },
  ];

  const features: Feature[] = [
    { 
      icon: <DollarSign size={32} />, 
      title: "Donation Management", 
      description: "Track all donations, generate receipts, and manage donor relationships"
    },
    { 
      icon: <UsersRound size={32} />, 
      title: "Volunteer Management", 
      description: "Schedule, communicate with, and track volunteer activities"
    },
    { 
      icon: <CalendarDays size={32} />, 
      title: "Events & Campaigns", 
      description: "Plan and manage fundraising events and awareness campaigns"
    },
    { 
      icon: <ChartBar size={32} />, 
      title: "Compliance & Reports", 
      description: "Automated reporting for regulatory compliance and stakeholders"
    },
    { 
      icon: <ShieldCheck size={32} />, 
      title: "Role-based Access", 
      description: "Control access to sensitive data based on team member roles"
    },
    { 
      icon: <ChartLine size={32} />, 
      title: "Impact Analytics", 
      description: "Measure and visualize your organization's impact with detailed analytics"
    },
  ];

  const steps: Step[] = [
    { number: "1", title: "Choose Your Plan", description: "Select the perfect plan for your NGO's needs" },
    { number: "2", title: "Create Workspace", description: "Set up your organization's digital workspace in minutes" },
    { number: "3", title: "Invite Your Team", description: "Add team members and assign roles and permissions" },
    { number: "4", title: "Manage Everything", description: "Start managing donations, volunteers, and events efficiently" },
  ];

  const pricingPlans: PricingPlan[] = [
    {
      name: "Monthly Plan",
      price: "₹7,999",
      period: "/month",
      description: "Perfect for NGOs wanting flexibility",
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
      highlighted: false
    },
    {
      name: "Yearly Plan",
      price: "₹69,999",
      originalPrice: "₹95,988",
      period: "/year",
      description: "Best value for committed NGOs",
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
        "Impact analytics dashboard",
        "2 months free",
        "Priority feature requests"
      ],
      highlighted: true,
      badge: "MOST POPULAR",
      savings: "Save ₹25,989"
    },
    {
      name: "3-Year Partnership",
      price: "₹1,79,999",
      originalPrice: "₹2,87,964",
      period: "/3 years",
      description: "Ultimate savings for long-term partners",
      features: [
        "Up to 20 team members",
        "Unlimited donations tracking",
        "Advanced volunteer management",
        "Compliance & audit reports",
        "Priority email & chat support",
        "20 GB secure storage",
        "Custom workflows",
        "Full API access",
        "Event management tools",
        "Impact analytics dashboard",
        "8 months free",
        "Priority feature requests",
        "Dedicated account manager",
        "Custom training sessions",
        "Annual strategy review"
      ],
      highlighted: false,
      badge: "BEST VALUE",
      savings: "Save ₹1,07,965"
    },
  ];

  const stats: Stat[] = [
    { value: "500+", label: "NGOs Trust Us" },
    { value: "₹2.5Cr+", label: "Donations Managed" },
    { value: "50K+", label: "Volunteers Coordinated" },
    { value: "99%", label: "Satisfaction Rate" },
  ];

  const footerLinks: FooterLink[] = [
    {
      title: "Product",
      items: ["Features", "Pricing", "Use Cases", "Updates"]
    },
    {
      title: "Company",
      items: ["About Us", "Careers", "Blog", "Press"]
    },
    {
      title: "Legal",
      items: ["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR"]
    }
  ];

  const navigationItems: string[] = ['problems', 'features', 'how-it-works', 'pricing'];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-emerald-50/30">
        {/* Navigation */}
        <header className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-4' : 'bg-transparent py-6'}`}>
          <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <HandHeart size={28} className="text-white" />
              </div>
              <div>
                <span className="text-2xl md:text-3xl font-bold text-gray-900">
                  Nexa<span className="text-emerald-600">NGO</span>
                </span>
                <p className="text-xs text-gray-500 mt-1 hidden sm:block">Empowering Social Impact</p>
              </div>
            </div>
            
            {/* Desktop Menu */}
            <nav className="hidden lg:flex space-x-10">
              {navigationItems.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    scrollToSection(item);
                    setActiveTab(item);
                  }}
                  className={`font-semibold transition-all duration-300 ${activeTab === item ? 'text-emerald-600 border-b-2 border-emerald-500 pb-1' : 'text-gray-700 hover:text-emerald-600'}`}
                >
                  {item.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </button>
              ))}
              <button
                onClick={() => setShowProductPreview(true)}
                className="font-semibold text-gray-700 hover:text-emerald-600 transition-all duration-300"
              >
                Product Preview
              </button>
              {isLoggedIn && (
                <button
                  onClick={handleGoToDashboard}
                  className="font-semibold text-emerald-600 border-b-2 border-emerald-500 pb-1"
                >
                  Go to Dashboard
                </button>
              )}
            </nav>
            
            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <button 
                  onClick={handleGoToDashboard}
                  className="hidden md:flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <ArrowRight size={20} />
                  Go to Dashboard
                </button>
              ) : (
                <button 
                  onClick={handleGetStarted}
                  className="hidden md:flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <CreditCard size={20} />
                  Get Started
                </button>
              )}
              
              {/* Mobile Menu Button */}
              <button 
                className="lg:hidden text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden bg-white shadow-2xl py-6 px-8 absolute top-full left-0 right-0 animate-fadeIn">
              <div className="flex flex-col space-y-4">
                {navigationItems.map((item) => (
                  <button
                    key={item}
                    onClick={() => scrollToSection(item)}
                    className="text-left font-semibold py-3 text-gray-800 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg px-4 transition-colors"
                  >
                    {item.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </button>
                ))}
                <button
                  onClick={() => setShowProductPreview(true)}
                  className="text-left font-semibold py-3 text-gray-800 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg px-4 transition-colors"
                >
                  Product Preview
                </button>
                {isLoggedIn ? (
                  <button 
                    onClick={handleGoToDashboard}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-4 rounded-xl font-semibold shadow-lg"
                  >
                    <ArrowRight size={20} />
                    Go to Dashboard
                  </button>
                ) : (
                  <button 
                    onClick={handleGetStarted}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-4 rounded-xl font-semibold shadow-lg"
                  >
                    <CreditCard size={20} />
                    Get Started
                  </button>
                )}
              </div>
            </div>
          )}
        </header>

        {/* Hero Section */}
        <section className="pt-40 pb-28 px-4 md:px-8 relative overflow-hidden bg-gradient-to-br from-emerald-50/50 via-white to-emerald-50/30">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent"></div>
          <div className="container mx-auto max-w-6xl relative">
            <div className="max-w-2xl animate-fadeInUp">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 px-6 py-3 rounded-full text-sm md:text-base font-semibold mb-8 shadow-sm">
                <CheckCircle size={18} />
                Trusted by 500+ NGOs across India
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
                All-in-one platform to manage
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-600 mt-4">
                  NGOs, donations, volunteers & compliance.
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 mb-12 leading-relaxed max-w-xl">
                Streamline your NGO operations with our comprehensive software solution. 
                Manage donations, coordinate volunteers, track compliance, and measure impact—all in one beautiful, intuitive platform.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 mb-20">
                {isLoggedIn ? (
                  <>
                    <button 
                      onClick={handleGoToDashboard}
                      className="group flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-10 py-5 rounded-2xl font-semibold text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300"
                    >
                      <Rocket size={22} />
                      Go to Dashboard
                      <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
                    </button>
                    <div className="text-sm text-gray-500 text-center">
                      Already subscribed • Access your dashboard
                    </div>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={handleGetStarted}
                      className="group flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-10 py-5 rounded-2xl font-semibold text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300"
                    >
                      <Rocket size={22} />
                      Get Started Today
                      <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
                    </button>
                    <button 
                      onClick={() => scrollToSection('features')}
                      className="flex items-center gap-3 px-10 py-5 text-lg font-semibold text-gray-700 hover:text-emerald-600 transition-colors border-2 border-gray-200 rounded-2xl hover:border-emerald-300"
                    >
                      <Search size={22} />
                      Explore Features
                      <ChevronRight size={22} />
                    </button>
                  </>
                )}
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-white animate-fadeInUp"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-gray-600 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Problems Section */}
        <section id="problems" className="py-24 px-4 md:px-8 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <div className="inline-block bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full font-semibold mb-4">
                Common Challenges
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Problems We Solve
              </h2>
              <p className="text-lg md:text-xl text-gray-600">
                Many NGOs struggle with manual processes and disconnected systems. Here's how we help:
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {problems.map((problem, index) => (
                <div
                  key={index}
                  className="bg-white p-10 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 animate-fadeInUp"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center text-emerald-600 mb-8 mx-auto">
                    {problem.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">{problem.title}</h3>
                  <p className="text-gray-600 text-center leading-relaxed">{problem.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-4 md:px-8">
          <div className="container mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <div className="inline-block bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full font-semibold mb-4">
                Powerful Features
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Everything You Need
              </h2>
              <p className="text-lg md:text-xl text-gray-600">
                Comprehensive tools designed specifically for NGO management
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group bg-gradient-to-br from-white to-gray-50 p-10 rounded-3xl border-2 border-gray-100 hover:border-emerald-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 animate-fadeInUp"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform duration-500">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Dashboard Preview */}
        <section className="py-24 px-4 md:px-8 bg-gradient-to-br from-emerald-50/50 via-white to-blue-50/30">
          <div className="container mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="animate-fadeInUp">
                <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-3xl shadow-2xl">
                  <div className="aspect-video bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-2xl flex flex-col items-center justify-center p-8">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mx-auto mb-6">
                      <Eye size={32} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">Modern Dashboard Preview</h3>
                    <p className="text-gray-600 text-center mb-6">Clean, intuitive interface</p>
                    <button 
                      onClick={() => setShowProductPreview(true)}
                      className="group flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-transform duration-300"
                    >
                      <Eye size={20} />
                      View Full Preview
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                <div className="inline-block bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full font-semibold mb-4">
                  Beautiful Interface
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  Designed for Simplicity
                </h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Our platform features a clean, modern dashboard that puts all the important information 
                  at your fingertips. No complicated menus or confusing layouts.
                </p>
                <button 
                  onClick={() => setShowProductPreview(true)}
                  className="group flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300"
                >
                  <Eye size={22} />
                  View Complete Product Tour
                  <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24 px-4 md:px-8">
          <div className="container mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <div className="inline-block bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full font-semibold mb-4">
                Simple Setup
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                How It Works
              </h2>
              <p className="text-lg md:text-xl text-gray-600">
                Get started in just 4 simple steps
              </p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto relative">
              <div className="hidden md:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-200 via-emerald-400 to-emerald-200 -z-10"></div>
              
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="relative"
                >
                  <div className="bg-white p-10 rounded-3xl shadow-2xl text-center h-full relative z-10 hover:shadow-3xl transition-shadow duration-300 animate-fadeInUp"
                       style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {step.number}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 mt-8">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-24 px-4 md:px-8 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <div className="inline-block bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full font-semibold mb-4">
                Flexible Plans
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Choose Your Perfect Plan
              </h2>
              <p className="text-lg md:text-xl text-gray-600">
                Save more with longer commitments
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
              {pricingPlans.map((plan, index) => (
                <div
                  key={index}
                  className={`relative rounded-3xl p-10 h-full flex flex-col animate-fadeInUp ${
                    plan.highlighted 
                      ? 'bg-gradient-to-b from-emerald-50 to-white border-4 border-emerald-300 shadow-3xl transform md:scale-105 z-10' 
                      : 'bg-white border-2 border-gray-200 shadow-2xl'
                  }`}
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  {plan.badge && (
                    <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg">
                        {plan.badge}
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-10">
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">{plan.name}</h3>
                    <div className="flex flex-col items-center justify-center mb-4">
                      <div className="flex items-baseline">
                        <span className="text-6xl font-bold text-gray-900">{plan.price}</span>
                        <span className="text-gray-600 text-xl ml-2">{plan.period}</span>
                      </div>
                      {plan.originalPrice && (
                        <div className="mt-2">
                          <span className="text-gray-500 line-through text-lg">{plan.originalPrice}</span>
                          {plan.savings && (
                            <span className="ml-2 text-emerald-600 font-semibold text-sm">{plan.savings}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="text-gray-600 text-lg">{plan.description}</p>
                  </div>
                  
                  <ul className="space-y-5 mb-10 flex-grow">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle className="text-emerald-500 mt-1 mr-4 flex-shrink-0" size={22} />
                        <span className="text-gray-700 text-lg">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button 
                    onClick={() => handleBuyNow(plan)}
                    className={`mt-auto w-full py-5 rounded-2xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                      plan.highlighted 
                        ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:shadow-2xl hover:scale-105' 
                        : plan.name === '3-Year Partnership'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-2xl hover:scale-105'
                        : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:shadow-2xl hover:scale-105'
                    }`}
                  >
                    {plan.name === '3-Year Partnership' ? <Crown size={22} /> : <ShoppingCart size={22} />}
                    {plan.name === '3-Year Partnership' ? 'Become a Partner' : 'Buy Now'}
                  </button>
                </div>
              ))}
            </div>
            
            {/* Additional Info */}
            <div className="mt-20 text-center animate-fadeInUp">
              <div className="inline-flex items-center gap-6 bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl max-w-3xl mx-auto">
                <div className="text-left">
                  <h4 className="text-2xl font-bold text-gray-900 mb-3">All plans include:</h4>
                  <div className="flex flex-wrap gap-4 justify-center">
                    <div className="flex items-center gap-2">
                      <Zap size={20} className="text-emerald-600" />
                      <span className="text-gray-700">30-day free trial</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock size={20} className="text-emerald-600" />
                      <span className="text-gray-700">Bank-level security</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target size={20} className="text-emerald-600" />
                      <span className="text-gray-700">Priority support</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star size={20} className="text-emerald-600" />
                      <span className="text-gray-700">Regular updates</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 px-4 md:px-8 bg-gradient-to-br from-emerald-50 via-white to-green-50">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="animate-fadeInUp">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                Ready to Transform Your NGO?
              </h2>
              <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
                Join hundreds of NGOs that have streamlined their operations and increased their impact.
              </p>
              {isLoggedIn ? (
                <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-2xl mx-auto">
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-2xl">
                      <CheckCircle size={32} className="text-emerald-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-2xl font-bold text-gray-900">Welcome back!</h3>
                      <p className="text-gray-600">You're already subscribed. Access your dashboard anytime.</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleGoToDashboard}
                    className="group inline-flex items-center gap-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-12 py-6 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300"
                  >
                    Go to Dashboard
                    <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <button 
                    onClick={handleGetStarted}
                    className="group inline-flex items-center gap-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-12 py-6 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300"
                  >
                    Start Your Free Trial
                    <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                  </button>
                  <button 
                    onClick={() => setShowProductPreview(true)}
                    className="group inline-flex items-center gap-4 border-2 border-emerald-300 text-emerald-700 hover:text-emerald-800 hover:border-emerald-400 px-12 py-6 rounded-2xl font-bold text-xl transition-all duration-300"
                  >
                    <Eye size={24} />
                    View Product Preview
                  </button>
                </div>
              )}
              <p className="text-gray-500 mt-8 text-sm">
                No credit card required • 30-day free trial • Cancel anytime
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-20 px-4 md:px-8">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-5 gap-12 mb-16">
              <div className="md:col-span-2">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center">
                    <HandHeart size={32} className="text-emerald-600" />
                  </div>
                  <div>
                    <span className="text-3xl font-bold">Nexa<span className="text-emerald-400">NGO</span></span>
                    <p className="text-gray-400 text-sm mt-1">Empowering Social Impact Since 2020</p>
                  </div>
                </div>
                <p className="text-gray-400 text-lg mb-8 max-w-md">
                  We're dedicated to helping NGOs achieve greater impact through innovative technology solutions.
                </p>
                <div className="flex space-x-4">
                  {[Twitter, Facebook, Linkedin, Instagram].map((Icon, idx) => (
                    <button 
                      key={idx} 
                      className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center hover:bg-emerald-700 transition-colors cursor-pointer hover:scale-110"
                      onClick={() => alert(`Opening ${Icon.name}...`)}
                    >
                      <Icon size={22} className="text-gray-300" />
                    </button>
                  ))}
                </div>
              </div>
              
              {footerLinks.map((section, idx) => (
                <div key={idx}>
                  <h4 className="text-xl font-bold mb-8 pb-2 border-b border-gray-800">{section.title}</h4>
                  <ul className="space-y-4">
                    {section.items.map((item, itemIdx) => (
                      <li key={itemIdx}>
                        <button 
                          onClick={() => alert(`Navigating to ${item} page...`)}
                          className="text-gray-400 hover:text-emerald-300 transition-colors text-lg text-left"
                        >
                          {item}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-800 pt-10 text-center">
              <p className="text-gray-500 text-lg">
                &copy; {new Date().getFullYear()} NexaNGO. All rights reserved.
              </p>
              <p className="text-gray-600 text-sm mt-4">
                Made with ❤️ for NGOs worldwide
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* Product Preview Modal */}
      {showProductPreview && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/50 backdrop-blur-sm">
          <div className="min-h-screen px-4 py-8 flex items-center justify-center">
            <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-slideUp">
              {/* Close Button */}
              <button 
                onClick={() => setShowProductPreview(false)}
                className="absolute top-6 right-6 z-10 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
              >
                <X size={24} className="text-gray-700" />
              </button>
              
              {/* Product Preview Content */}
              <div className="max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-12 text-center">
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center">
                      <HandHeart size={32} className="text-emerald-600" />
                    </div>
                    <span className="text-4xl font-bold">
                      Nexa<span className="text-emerald-400">NGO</span>
                    </span>
                  </div>
                  <h1 className="text-5xl font-bold mb-6">Complete Product Preview</h1>
                  <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                    See everything included in our NGO management platform
                  </p>
                </div>
                
                <div className="p-12">
                  {/* Screenshots Section */}
                  <div className="mb-20">
                    <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">See It In Action</h2>
                    <div className="grid lg:grid-cols-2 gap-8">
                      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8">
                        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
                          <div className="aspect-video bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-xl flex flex-col items-center justify-center">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mx-auto mb-6">
                              <Eye size={32} className="text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Dashboard Preview</h3>
                            <p className="text-gray-300 text-center">Modern, intuitive interface</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        {['Dashboard', 'Donations', 'Volunteers', 'Reports'].map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => alert(`Opening ${item} preview...`)}
                            className="w-full bg-white p-6 rounded-2xl border border-gray-200 hover:border-emerald-200 transition-colors text-left"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                                {idx === 0 && <BarChart3 size={24} />}
                                {idx === 1 && <DollarSign size={24} />}
                                {idx === 2 && <Users size={24} />}
                                {idx === 3 && <FileText size={24} />}
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900">{item} Screen</h3>
                                <p className="text-gray-600 text-sm">Interactive preview available</p>
                              </div>
                              <ChevronRight size={20} className="text-gray-400 ml-auto" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* What You Get Section */}
                  <div className="mb-20">
                    <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">What You Get</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {[
                        { icon: <Download size={24} />, title: "Source Code", desc: "Complete source files" },
                        { icon: <Cloud size={24} />, title: "Cloud Hosting", desc: "1 year free hosting" },
                        { icon: <Headphones size={24} />, title: "Premium Support", desc: "6 months support" },
                        { icon: <BookOpen size={24} />, title: "Documentation", desc: "Detailed guides" },
                        { icon: <Video size={24} />, title: "Video Tutorials", desc: "Step-by-step videos" },
                        { icon: <RefreshCw size={24} />, title: "Free Updates", desc: "1 year updates" },
                        { icon: <ShieldCheck size={24} />, title: "SSL Certificate", desc: "Free SSL" },
                        { icon: <Server size={24} />, title: "Backups", desc: "Automated backups" },
                      ].map((item, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-2xl border border-emerald-100 hover:border-emerald-200 transition-colors">
                          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
                            {item.icon}
                          </div>
                          <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                          <p className="text-gray-600 text-sm">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Final CTA in Modal */}
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-3xl p-12 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 backdrop-blur-sm mb-6">
                      <Gift size={20} />
                      <span className="font-medium">Special Discount</span>
                    </div>
                    
                    <h2 className="text-4xl font-bold text-gray-900 mb-6">
                      Ready to Get Started?
                    </h2>
                    
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 mb-8 max-w-3xl mx-auto">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-4 border border-emerald-200 rounded-xl">
                          <div className="text-2xl font-bold text-gray-900">₹7,999</div>
                          <div className="text-gray-600 text-sm">Monthly Plan</div>
                          <div className="text-xs text-gray-500 mt-1">Flexible & cancel anytime</div>
                        </div>
                        <div className="text-center p-4 border-2 border-emerald-300 rounded-xl bg-emerald-50">
                          <div className="text-2xl font-bold text-gray-900">₹69,999</div>
                          <div className="text-gray-600 text-sm">Yearly Plan</div>
                          <div className="text-xs text-emerald-600 font-medium mt-1">Save ₹25,989</div>
                        </div>
                        <div className="text-center p-4 border border-amber-200 rounded-xl bg-amber-50/50">
                          <div className="text-2xl font-bold text-gray-900">₹1,79,999</div>
                          <div className="text-gray-600 text-sm">3-Year Partnership</div>
                          <div className="text-xs text-amber-600 font-medium mt-1">Save ₹1,07,965</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button 
                        onClick={() => {
                          setSelectedPlan(pricingPlans[1]); // Yearly plan as default
                          setShowProductPreview(false);
                          setShowCheckout(true);
                        }}
                        className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-12 py-5 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300"
                      >
                        <CreditCard size={24} className="inline mr-3" />
                        Get Yearly Plan (Save 27%)
                      </button>
                      
                      <button 
                        onClick={() => setShowProductPreview(false)}
                        className="px-8 py-5 border-2 border-emerald-300 text-emerald-700 hover:text-emerald-800 hover:border-emerald-400 rounded-2xl font-medium transition-colors"
                      >
                        Continue Exploring
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Flow Modal */}
      {showCheckout && selectedPlan && (
        <CheckoutFlow 
          onClose={() => setShowCheckout(false)} 
          selectedPlan={selectedPlan}
        />
      )}

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        
        /* Container */
        .container {
          width: 100%;
          max-width: 1280px;
          margin-left: auto;
          margin-right: auto;
          padding-left: 1rem;
          padding-right: 1rem;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 10px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 5px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #10b981, #059669);
          border-radius: 5px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #059669, #047857);
        }
        
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
          scroll-padding-top: 80px;
        }
        
        /* Section spacing */
        section {
          scroll-margin-top: 80px;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .container {
            padding-left: 1.5rem;
            padding-right: 1.5rem;
          }
          
          section {
            padding-top: 3rem !important;
            padding-bottom: 3rem !important;
          }
          
          .hero {
            padding-top: 120px !important;
          }
          
          h1 {
            font-size: 2.25rem !important;
          }
          
          h2 {
            font-size: 2rem !important;
          }
        }
        
        @media (max-width: 640px) {
          .container {
            padding-left: 1rem;
            padding-right: 1rem;
          }
          
          section {
            padding-top: 2.5rem !important;
            padding-bottom: 2.5rem !important;
          }
          
          h1 {
            font-size: 2rem !important;
          }
          
          h2 {
            font-size: 1.75rem !important;
          }
        }
      `}</style>
    </>
  );
};

export default NGOApp;