'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { 
  Building, 
  Users, 
  Shield, 
  Globe, 
  Mail, 
  Lock, 
  User, 
  CheckCircle, 
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  Award,
  Heart,
  Target,
  TrendingUp,
  Key,
  Server,
  ShieldCheck,
  UsersRound,
  Database,
  Bell,
  FileText,
  Settings,
  LayoutDashboard,
  CreditCard,
  BarChart,
  Calendar,
  MessageSquare,
  Upload,
  Download,
  Zap,
  Cpu,
  Network,
  Cloud,
  Clock,
  BellRing,
  UserPlus,
  KeyRound,
  ShieldAlert,
  ShieldOff,
  ShieldPlus,
  Users2,
  Building2,
  GlobeLock,
  BadgeCheck,
  Verified,
  Fingerprint,
  Smartphone,
  Tablet,
  Monitor,
  SmartphoneCharging,
  Wifi,
  DatabaseBackup,
  Backup,
  RefreshCw,
  AlertCircle,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  Info,
  HelpCircle,
  X,
  Plus,
  Trash2,
  Edit,
  Copy,
  Search,
  Filter,
  MoreVertical,
  Star,
  Crown,
  Rocket,
  Target as TargetIcon,
  BarChart3,
  Users as UsersIcon,
  DollarSign,
  FileText as FileTextIcon,
  CalendarDays,
  Bell as BellIcon,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  Home,
  Package,
  CreditCard as CreditCardIcon,
  Headphones,
  BookOpen,
  Video,
  DownloadCloud,
  CloudLightning,
  Database as DatabaseIcon,
  Shield as ShieldIcon,
  LockKeyhole,
  Key as KeyIcon,
  ScanFace,
  QrCode,
  Scan,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  ScanLine,
  Server as ServerIcon,
  HardDrive,
  Cpu as CpuIcon,
  MemoryStick,
  HardDriveDownload,
  DatabaseZap,
  ServerCog,
  Network as NetworkIcon,
  WifiOff,
  CloudOff,
  CloudCog,
  CloudRain,
  CloudSun,
  CloudSnow,
  CloudFog,
  CloudDrizzle,
  CloudHail,
  CloudLightning as CloudLightningIcon,
  CloudMoon,
  CloudMoonRain,
  CloudSunRain,
  Tornado,
  Hurricane,
  Earthquake,
  Flood,
  Fire,
  Snowflake,
  Sun,
  Moon,
  Star as StarIcon,
  SunDim,
  SunMedium,
  SunSnow,
  Thermometer,
  ThermometerSnowflake,
  ThermometerSun,
  Droplets,
  Umbrella,
  Wind,
  Waves,
  TreePine,
  TreeDeciduous,
  Leaf,
  Sprout,
  Flower2,
  Mountain,
  Volcano,
  Trees,
  Fish,
  Bird,
  Cat,
  Dog,
  Rabbit,
  Turtle,
  Whale,
  Dolphin,
  Shark,
  Octopus,
  Bug,
  Bee,
  Butterfly,
  Snail,
  Worm,
  Spider,
  Bat,
  Dragon,
  Ghost,
  Skull,
  Bone,
  Brain,
  HeartPulse,
  Pill,
  Stethoscope,
  Syringe,
  Thermometer as ThermometerIcon,
  Microscope,
  Beaker,
  TestTube,
  TestTube2,
  FlaskConical,
  FlaskRound,
  Atom,
  Radiation,
  Biohazard,
  Radioactive,
  Virus,
  Mask,
  HandHelping,
  HandHeart,
  HandCoins,
  HandPlatter,
  Handshake,
  Hand,
  ThumbsUp,
  Heart as HeartIcon,
  HeartHandshake,
  HeartPulse as HeartPulseIcon,
  HeartCrack,
  HeartOff,
  Heart as HeartIcon2,
  StarHalf,
  StarOff,
  Trophy,
  Medal,
  Award as AwardIcon,
  Badge,
  BadgePercent,
  BadgeDollarSign,
  BadgeCheck as BadgeCheckIcon,
  BadgeInfo,
  BadgeAlert,
  BadgeX,
  BadgePlus,
  BadgeMinus,
  BadgeHelp,
  BadgeRussianRuble,
  BadgeIndianRupee,
  BadgeEuro,
  BadgePound,
  BadgeCent,
  BadgeJapaneseYen,
  BadgeSwissFranc,
  BadgeDollar,
  BadgePercent as BadgePercentIcon,
  Badge as BadgeIcon,
  Crown as CrownIcon,
  Gem,
  Diamond,
  CircleDollarSign,
  CircleEuro,
  CirclePound,
  CircleYen,
  CircleYuan,
  CircleRupee,
  CircleWon,
  CircleRuble,
  CircleShekel,
  CircleParking,
  CirclePower,
  CircleUser,
  CircleUserRound,
  CircleDot,
  CircleCheck,
  CircleX,
  CircleHelp,
  CircleAlert,
  Circle,
  CircleEllipsis,
  CircleEqual,
  CircleSlash,
  CircleSlash2,
  CirclePercent,
  CircleArrowUp,
  CircleArrowDown,
  CircleArrowLeft,
  CircleArrowRight,
  CircleChevronUp,
  CircleChevronDown,
  CircleChevronLeft,
  CircleChevronRight,
  CirclePlay,
  CircleStop,
  CirclePause,
  CircleDashed,
  CircleFadingPlus,
  CircleGauge,
  CircleHelp as CircleHelpIcon,
  CircleMinus,
  CirclePlus,
  CirclePower as CirclePowerIcon,
  CircleSlash as CircleSlashIcon,
  CircleUser as CircleUserIcon,
  CircleUserRound as CircleUserRoundIcon,
  CircleX as CircleXIcon,
  OctagonAlert,
  OctagonPause,
  OctagonX,
  Hexagon,
  Pentagon,
  Square as SquareIcon,
  SquareCheck,
  SquareDashed,
  SquareDot,
  SquareEqual,
  SquareSlash,
  SquareStack,
  TriangleAlert,
  Triangle,
  Rhombus,
  Pentagon as PentagonIcon,
  Hexagon as HexagonIcon,
  Octagon as OctagonIcon,
  Nonagon,
  Decagon,
  Ellipsis,
  EllipsisVertical,
  Infinity,
  Pi,
  Sigma,
  Omega,
  Alpha,
  Beta,
  Gamma,
  Delta,
  Epsilon,
  Zeta,
  Eta,
  Theta,
  Iota,
  Kappa,
  Lambda,
  Mu,
  Nu,
  Xi,
  Omicron,
  Pi as PiIcon,
  Rho,
  Sigma as SigmaIcon,
  Tau,
  Upsilon,
  Phi,
  Chi,
  Psi,
  Omega as OmegaIcon
} from 'lucide-react';

export default function NgoSignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isValidating, setIsValidating] = useState(false);
  const [domainAvailable, setDomainAvailable] = useState<boolean | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['admin']);
  const [invitedStaff, setInvitedStaff] = useState<Array<{email: string, role: string}>>([]);
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('staff');
  const [dashboardPreferences, setDashboardPreferences] = useState({
    theme: 'light',
    defaultView: 'overview',
    notifications: true,
    autoRefresh: false,
    compactMode: false,
  });

  const [formData, setFormData] = useState({
    ngoName: '',
    domain: '',
    domainExtension: '.ngo',
    adminEmail: '',
    adminName: '',
    phone: '',
    teamSize: '5-10',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
    subscribeUpdates: true,
    country: 'IN',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    language: 'en',
  });

  const domainExtensions = [
    { value: '.ngo', label: '.ngo (NGO specific)', popular: true, icon: <Heart size={14} /> },
    { value: '.org', label: '.org (Non-profit)', popular: true, icon: <Building size={14} /> },
    { value: '.in', label: '.in (India)', popular: true, icon: <Globe size={14} /> },
    { value: '.com', label: '.com (Commercial)', icon: <Globe size={14} /> },
    { value: '.foundation', label: '.foundation', icon: <Award size={14} /> },
    { value: '.charity', label: '.charity', icon: <Heart size={14} /> },
    { value: '.net', label: '.net (Network)', icon: <Network size={14} /> },
    { value: '.co.in', label: '.co.in (India)', icon: <Globe size={14} /> },
  ];

  const teamSizes = [
    { value: '1-5', label: '1-5 members', icon: '👤' },
    { value: '5-10', label: '5-10 members', icon: '👥' },
    { value: '10-20', label: '10-20 members', icon: '👥👥' },
    { value: '20-50', label: '20-50 members', icon: '👥👥👥' },
    { value: '50+', label: '50+ members', icon: '👥👥👥👥' },
  ];

  const roles = [
    { value: 'super-admin', label: 'Super Admin', description: 'Full system access', icon: <Crown size={16} />, color: 'text-amber-600' },
    { value: 'admin', label: 'Admin', description: 'Full organization access', icon: <Shield size={16} />, color: 'text-emerald-600' },
    { value: 'finance', label: 'Finance Manager', description: 'Financial operations', icon: <DollarSign size={16} />, color: 'text-blue-600' },
    { value: 'program', label: 'Program Manager', description: 'Program management', icon: <Target size={16} />, color: 'text-purple-600' },
    { value: 'volunteer', label: 'Volunteer Coordinator', description: 'Volunteer management', icon: <Users size={16} />, color: 'text-green-600' },
    { value: 'staff', label: 'Staff Member', description: 'Limited access', icon: <User size={16} />, color: 'text-gray-600' },
    { value: 'viewer', label: 'Viewer', description: 'Read-only access', icon: <Eye size={16} />, color: 'text-gray-500' },
  ];

  const dashboardViews = [
    { value: 'overview', label: 'Overview', icon: <LayoutDashboard size={16} /> },
    { value: 'financial', label: 'Financial', icon: <BarChart3 size={16} /> },
    { value: 'programs', label: 'Programs', icon: <Target size={16} /> },
    { value: 'volunteers', label: 'Volunteers', icon: <Users size={16} /> },
  ];

  const handleDomainCheck = async () => {
    if (!formData.domain) return;
    
    setIsValidating(true);
    // Simulate domain validation
    setTimeout(() => {
      const isAvailable = Math.random() > 0.3; // 70% chance available
      setDomainAvailable(isAvailable);
      setIsValidating(false);
      
      if (!isAvailable) {
        setError(`Domain ${formData.domain}${formData.domainExtension} is already taken. Please try another.`);
      } else {
        setError('');
      }
    }, 1500);
  };

  const handleAddStaff = () => {
    if (!newStaffEmail || !newStaffRole) return;
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newStaffEmail)) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (!invitedStaff.some(staff => staff.email === newStaffEmail)) {
      setInvitedStaff([...invitedStaff, { email: newStaffEmail, role: newStaffRole }]);
      setNewStaffEmail('');
      setNewStaffRole('staff');
      setError('');
    } else {
      setError('This email has already been invited');
    }
  };

  const handleRemoveStaff = (email: string) => {
    setInvitedStaff(invitedStaff.filter(staff => staff.email !== email));
  };

  const handleRoleToggle = (roleValue: string) => {
    if (selectedRoles.includes(roleValue)) {
      setSelectedRoles(selectedRoles.filter(r => r !== roleValue));
    } else {
      setSelectedRoles([...selectedRoles, roleValue]);
    }
  };

  const handleNextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  // Function to send invitation email to staff
  const sendStaffInvitationEmail = async (staffEmail: string, staffRole: string, organizationName: string, inviterName: string, organizationId: string) => {
    try {
      // Create invitation link
      const inviteLink = `${window.location.origin}/invite/accept?org=${organizationId}&email=${encodeURIComponent(staffEmail)}&role=${staffRole}`;
      
      // Send invitation email (you can implement this with your email service)
      console.log('Sending invitation email to:', staffEmail);
      console.log('Invitation Link:', inviteLink);
      
      // For now, we'll simulate sending an email
      // In production, integrate with Resend, SendGrid, etc.
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        message: 'Invitation sent successfully (simulated)'
      };
    } catch (err) {
      console.error('Error sending invitation:', err);
      return {
        success: false,
        message: 'Failed to send invitation'
      };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.agreeTerms) {
      setError('You must agree to Terms & Privacy Policy');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 10) {
      setError('Password must be at least 10 characters long');
      return;
    }

    // Check for strong password
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
    if (!strongPasswordRegex.test(formData.password)) {
      setError('Password must include uppercase, lowercase, number, and special character');
      return;
    }

    const fullDomain = `${formData.domain}${formData.domainExtension}`;
    const emailDomain = formData.adminEmail.split('@')[1];

    // Optional: Check if admin email matches domain
    if (!emailDomain || !emailDomain.endsWith(fullDomain)) {
      // Just show warning but don't block
      console.warn(`Admin email domain doesn't match NGO domain`);
    }

    if (domainAvailable === false) {
      setError('Please choose an available domain');
      return;
    }

    setLoading(true);

    try {
      // 1. Create user FIRST
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.adminEmail,
        formData.password
      );
      const user = userCredential.user;
      console.log("User created:", user);

      await sendEmailVerification(user);

      // 2. Then create NGO
      const ngoRef = await addDoc(collection(db, "NGO"), {
        name: formData.ngoName,
        admin_id: user.uid, // 🔥 important
        domain: fullDomain,
        team_size: formData.teamSize,
        country: formData.country,
        timezone: formData.timezone,
        currency: formData.currency,
        dashboard_preferences: dashboardPreferences,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      });
      console.log("NGO created with ID: ", ngoRef.id);

      // Store email for verification page
      localStorage.setItem('verificationEmail', formData.adminEmail);

      // Success! Redirect to verification page
      setTimeout(() => {
        router.push(`/auth/verify?email=${encodeURIComponent(formData.adminEmail)}&ngo=${ngoRef.id}`);
      }, 1500);

    } catch (err: any) {
      console.error('Signup error:', err);
      if (err.code === 'auth/email-already-in-use') {
        router.push('/auth/login');
        return;
      }
      if (err.code === 'auth/invalid-api-key') {
        setError('Firebase API Key is invalid. Please check your .env.local file.');
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-10">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((step) => (
          <React.Fragment key={step}>
            <div className={`flex flex-col items-center ${currentStep >= step ? 'text-emerald-600' : 'text-gray-400'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${currentStep >= step ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {step}
              </div>
              <span className="text-xs mt-2 font-medium">
                {step === 1 && 'NGO'}
                {step === 2 && 'Domain'}
                {step === 3 && 'Admin'}
                {step === 4 && 'Team'}
                {step === 5 && 'Setup'}
              </span>
            </div>
            {step < 5 && (
              <div className={`w-16 h-1 ${currentStep > step ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50/30">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                <Heart size={22} className="text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                Nexa<span className="text-emerald-600">NGO</span>
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-emerald-600 font-semibold hover:text-emerald-700">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Column - Form */}
            <div>
              <div className="mb-10">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                  <Sparkles size={16} />
                  Advanced NGO Management Platform
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Create Your NGO Portal
                </h1>
                <p className="text-lg text-gray-600">
                  Set up your secure, multi-admin NGO management system with role-based access
                </p>
              </div>

              {renderStepIndicator()}

              <div className="bg-white rounded-3xl shadow-2xl p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {error && (
                    <div className={`px-4 py-3 rounded-xl ${error.includes('successfully') ? 'bg-yellow-50 border border-yellow-200 text-yellow-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                      {error}
                    </div>
                  )}

                  {/* Step 1: NGO Details */}
                  {currentStep === 1 && (
                    <div className="space-y-6 animate-fadeIn">
                      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Building className="text-emerald-600" size={24} />
                        NGO Information
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            NGO Name *
                          </label>
                          <input
                            type="text"
                            placeholder="Enter your NGO name"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                            value={formData.ngoName}
                            onChange={(e) =>
                              setFormData({ ...formData, ngoName: e.target.value })
                            }
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Team Size
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                            {teamSizes.map((size) => (
                              <button
                                key={size.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, teamSize: size.value })}
                                className={`py-3 border rounded-lg text-center transition-all ${formData.teamSize === size.value ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 hover:border-emerald-300'}`}
                              >
                                <div className="text-lg mb-1">{size.icon}</div>
                                <div className="text-sm font-medium">{size.label}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between pt-6">
                        <div></div>
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                        >
                          Next Step
                          <ArrowRight size={18} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Domain Setup */}
                  {currentStep === 2 && (
                    <div className="space-y-6 animate-fadeIn">
                      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Globe className="text-emerald-600" size={24} />
                        Domain & NGO URL
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Choose Your Domain *
                          </label>
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <div className="flex">
                                <input
                                  type="text"
                                  placeholder="your-ngo"
                                  className="flex-1 px-4 py-3 border border-gray-300 rounded-l-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                                  value={formData.domain}
                                  onChange={(e) => {
                                    setFormData({ ...formData, domain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') });
                                    setDomainAvailable(null);
                                  }}
                                  required
                                />
                                
                                <select
                                  className="px-4 py-3 border border-gray-300 rounded-r-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                                  value={formData.domainExtension}
                                  onChange={(e) => setFormData({ ...formData, domainExtension: e.target.value })}
                                >
                                  {domainExtensions.map((ext) => (
                                    <option key={ext.value} value={ext.value}>
                                      {ext.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            
                            <button
                              type="button"
                              onClick={handleDomainCheck}
                              disabled={isValidating || !formData.domain}
                              className="px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                              {isValidating ? 'Checking...' : 'Check'}
                            </button>
                          </div>
                          
                          {domainAvailable !== null && (
                            <div className={`mt-2 text-sm font-medium ${domainAvailable ? 'text-emerald-600' : 'text-red-600'}`}>
                              {domainAvailable ? (
                                <div className="flex items-center gap-2">
                                  <CheckCircle size={16} />
                                  Domain is available! Your portal will be at: <strong>{formData.domain}{formData.domainExtension}.nexango.com</strong>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <X size={16} />
                                  Domain is not available
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                          <div className="flex items-start gap-3">
                            <Info className="text-blue-600 mt-0.5" size={18} />
                            <div className="text-sm text-blue-800">
                              <p className="font-medium">Domain-based Auto NGO</p>
                              <p className="mt-1">Your NGO will be automatically created with a unique subdomain. All team members will access through: <strong>{formData.domain}{formData.domainExtension}.nexango.com</strong></p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between pt-6">
                        <button
                          type="button"
                          onClick={handlePrevStep}
                          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={handleNextStep}
                          disabled={domainAvailable === null || domainAvailable === false}
                          className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                          Next Step
                          <ArrowRight size={18} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Admin Setup */}
                  {currentStep === 3 && (
                    <div className="space-y-6 animate-fadeIn">
                      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <User className="text-emerald-600" size={24} />
                        Primary Administrator
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            placeholder="Enter your full name"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                            value={formData.adminName}
                            onChange={(e) =>
                              setFormData({ ...formData, adminName: e.target.value })
                            }
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            placeholder={`admin@${formData.domain}${formData.domainExtension}`}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                            value={formData.adminEmail}
                            onChange={(e) =>
                              setFormData({ ...formData, adminEmail: e.target.value })
                            }
                            required
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            This will be your login username and primary contact
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            placeholder="+91 98765 43210"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({ ...formData, phone: e.target.value })
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Admin Roles
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {roles.map((role) => (
                              <button
                                key={role.value}
                                type="button"
                                onClick={() => handleRoleToggle(role.value)}
                                className={`p-3 border rounded-xl text-left transition-all ${selectedRoles.includes(role.value) ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300'}`}
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <div className={role.color}>
                                    {role.icon}
                                  </div>
                                  <div className="font-medium">{role.label}</div>
                                </div>
                                <div className="text-xs text-gray-500">{role.description}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between pt-6">
                        <button
                          type="button"
                          onClick={handlePrevStep}
                          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                        >
                          Next Step
                          <ArrowRight size={18} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Team Setup */}
                  {currentStep === 4 && (
                    <div className="space-y-6 animate-fadeIn">
                      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <UsersRound className="text-emerald-600" size={24} />
                        Invite Your Team
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                          <div className="flex items-start gap-3">
                            <UserPlus className="text-blue-600 mt-0.5" size={18} />
                            <div className="text-sm text-blue-800">
                              <p className="font-medium">Team Invitation System</p>
                              <p className="mt-1">Team members will receive an invitation email to join. After accepting, they'll get their login credentials.</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Add Team Members
                          </label>
                          <div className="flex gap-2 mb-4">
                            <input
                              type="email"
                              placeholder="team.member@email.com"
                              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                              value={newStaffEmail}
                              onChange={(e) => setNewStaffEmail(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleAddStaff()}
                            />
                            
                            <select
                              className="px-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                              value={newStaffRole}
                              onChange={(e) => setNewStaffRole(e.target.value)}
                            >
                              {roles.map((role) => (
                                <option key={role.value} value={role.value}>
                                  {role.label}
                                </option>
                              ))}
                            </select>
                            
                            <button
                              type="button"
                              onClick={handleAddStaff}
                              className="px-4 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
                            >
                              Add
                            </button>
                          </div>

                          {invitedStaff.length > 0 && (
                            <div className="border rounded-xl p-4">
                              <h4 className="font-medium text-gray-900 mb-3">Team Members ({invitedStaff.length})</h4>
                              <div className="space-y-3">
                                {invitedStaff.map((staff, index) => (
                                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <div>
                                      <div className="font-medium text-gray-900">{staff.email}</div>
                                      <div className="text-sm text-gray-500">
                                        Role: {roles.find(r => r.value === staff.role)?.label}
                                      </div>
                                      <div className="text-xs text-blue-600 mt-1">
                                        ✅ Will receive invitation email
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveStaff(staff.email)}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between pt-6">
                        <button
                          type="button"
                          onClick={handlePrevStep}
                          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                        >
                          Next Step
                          <ArrowRight size={18} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 5: Final Setup */}
                  {currentStep === 5 && (
                    <div className="space-y-6 animate-fadeIn">
                      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <LayoutDashboard className="text-emerald-600" size={24} />
                        Final Setup
                      </h3>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Dashboard Preferences
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {dashboardViews.map((view) => (
                              <button
                                key={view.value}
                                type="button"
                                onClick={() => setDashboardPreferences({...dashboardPreferences, defaultView: view.value})}
                                className={`p-3 border rounded-xl text-center transition-all ${dashboardPreferences.defaultView === view.value ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300'}`}
                              >
                                <div className="flex justify-center mb-2">
                                  {view.icon}
                                </div>
                                <div className="font-medium text-sm">{view.label}</div>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Create Password *
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              placeholder="Create strong password (min 10 characters)"
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                              value={formData.password}
                              onChange={(e) =>
                                setFormData({ ...formData, password: e.target.value })
                              }
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-3 text-gray-500"
                            >
                              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            Must include uppercase, lowercase, number, and special character
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm Password *
                          </label>
                          <input
                            type="password"
                            placeholder="Confirm your password"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                            value={formData.confirmPassword}
                            onChange={(e) =>
                              setFormData({ ...formData, confirmPassword: e.target.value })
                            }
                            required
                          />
                        </div>

                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={formData.agreeTerms}
                            onChange={(e) =>
                              setFormData({ ...formData, agreeTerms: e.target.checked })
                            }
                            className="mt-1"
                            required
                          />
                          <div>
                            <p className="text-sm text-gray-700">
                              I agree to the{' '}
                              <Link href="/terms" className="text-emerald-600 font-medium hover:text-emerald-700">
                                Terms of Service
                              </Link>
                              ,{' '}
                              <Link href="/privacy" className="text-emerald-600 font-medium hover:text-emerald-700">
                                Privacy Policy
                              </Link>
                              , and{' '}
                              <Link href="/data-processing" className="text-emerald-600 font-medium hover:text-emerald-700">
                                Data Processing Agreement
                              </Link>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              By creating an account, you acknowledge that you have read and agree to our terms.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={formData.subscribeUpdates}
                            onChange={(e) =>
                              setFormData({ ...formData, subscribeUpdates: e.target.checked })
                            }
                            className="mt-1"
                          />
                          <div>
                            <p className="text-sm text-gray-700">
                              Subscribe to product updates and security announcements
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Get notified about new features, security updates, and best practices.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between pt-6">
                        <button
                          type="button"
                          onClick={handlePrevStep}
                          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                          {loading ? (
                            <>
                              <RefreshCw size={18} className="animate-spin" />
                              Creating Portal...
                            </>
                          ) : (
                            <>
                              <Rocket size={18} />
                              Create NGO Portal
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Right Column - Features */}
            <div className="sticky top-8">
              <div className="bg-gradient-to-br from-gray-900 to-emerald-900 text-white rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                    <Heart size={24} className="text-emerald-600" />
                  </div>
                  <span className="text-2xl font-bold">
                    Nexa<span className="text-emerald-400">NGO</span>
                  </span>
                </div>

                <h2 className="text-2xl font-bold mb-6">Advanced NGO Management Platform</h2>
                
                <div className="space-y-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <LayoutDashboard className="text-emerald-400" size={20} />
                      Role-Based Dashboard
                    </h3>
                    <ul className="space-y-3 text-gray-300">
                      <li className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-emerald-400" />
                        <span>Custom dashboards per role</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-emerald-400" />
                        <span>Personalized widgets and metrics</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-emerald-400" />
                        <span>Real-time activity tracking</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-emerald-400" />
                        <span>Drag-and-drop customization</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Users2 className="text-emerald-400" size={20} />
                      Multi-Admin System
                    </h3>
                    <ul className="space-y-3 text-gray-300">
                      <li className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-emerald-400" />
                        <span>Multiple administrators per NGO</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-emerald-400" />
                        <span>Granular permission controls</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-emerald-400" />
                        <span>Department-based access</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-emerald-400" />
                        <span>Audit trail for all actions</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <UserPlus className="text-emerald-400" size={20} />
                      Staff Invitation System
                    </h3>
                    <ul className="space-y-3 text-gray-300">
                      <li className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-emerald-400" />
                        <span>Automatic invitation emails</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-emerald-400" />
                        <span>Role-based access setup</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-emerald-400" />
                        <span>Secure temporary passwords</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-emerald-400" />
                        <span>Invitation tracking and reminders</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <GlobeLock className="text-emerald-400" size={20} />
                      Domain-Based NGO
                    </h3>
                    <ul className="space-y-3 text-gray-300">
                      <li className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-emerald-400" />
                        <span>Custom subdomain for your NGO</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-emerald-400" />
                        <span>Automatic NGO creation</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-emerald-400" />
                        <span>SSL certificate included</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-emerald-400" />
                        <span>Custom branding options</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/20">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 bg-emerald-500/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                      <BadgeCheck size={16} />
                      <span className="text-sm font-medium">Trusted by 500+ NGOs</span>
                    </div>
                    <p className="text-gray-300 text-sm">
                      24/7 Support • 99.9% Uptime • GDPR Compliant
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}