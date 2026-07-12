/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Menu, X, Globe, User, Bell, ChevronDown, Radio, 
  Sun, Moon, Type, Shield, LayoutDashboard, Map, 
  CalendarClock, BookOpen, CloudSun, AlertTriangle, 
  PhoneCall, FileText, Wallet, Laptop, Settings, HelpCircle,
  Volume2, ShieldAlert, CheckCircle2, Info
} from 'lucide-react';

// Interfaces and Types
import { Language, UserRole, Farm, Booking } from './types';
import { translations } from './translations';

// Custom Core Components
import Navigation from './components/Navigation';
import LandingPage from './components/LandingPage';
import OnboardingFlow from './components/OnboardingFlow';
import FarmerDashboard from './components/FarmerDashboard';
import BookingFlow from './components/BookingFlow';
import BookingManagement from './components/BookingManagement';
import DroneAnalysis from './components/DroneAnalysis';
import SensorDashboard from './components/SensorDashboard';
import CropAdvisory from './components/CropAdvisory';
import ExpertConsultation from './components/ExpertConsultation';
import OtherDashboards from './components/OtherDashboards';
import WalletPayments from './components/WalletPayments';

export default function App() {
  // --- Core Layout & Language States ---
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [currentRole, setCurrentRole] = useState<UserRole>('guest');
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');
  const [isLargeText, setIsLargeText] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'weak' | 'offline'>('online');
  const [currentView, setCurrentView] = useState<string>('home');

  // --- User Profiles state ---
  const [userName, setUserName] = useState('Ramesh Patil');
  const [userVillage, setUserVillage] = useState('Pimpalgaon, Nashik');

  // --- Dynamic Agriculture States ---
  const [registeredFarms, setRegisteredFarms] = useState<Farm[]>([
    {
      id: 'farm-1',
      name: 'Pimpalgaon Onion plot',
      location: 'Pimpalgaon, Nashik',
      area: 4.5,
      areaUnit: 'acre',
      crop: 'Onion',
      sowingDate: '2026-06-12',
      irrigationType: 'drip',
      latestHealthScore: 74,
      lastScanDate: '08 July 2026',
      nextScanDate: '12 July 2026',
      activeAlertsCount: 2,
      boundary: [
        { lat: 20.0821, lng: 73.9841 },
        { lat: 20.0828, lng: 73.9849 },
        { lat: 20.0822, lng: 73.9855 },
        { lat: 20.0815, lng: 73.9845 }
      ]
    }
  ]);
  const [activeFarm, setActiveFarm] = useState<Farm>(registeredFarms[0]);

  // Sync activeFarm when registeredFarms changes or the selected farm is switched
  const handleSelectFarm = (farm: Farm) => {
    setActiveFarm(farm);
  };

  const handleAddFarm = (newFarm: Farm) => {
    setRegisteredFarms([...registeredFarms, newFarm]);
    setActiveFarm(newFarm);
  };

  // --- Live Wallet Balance ---
  // Starts at ₹850, spent when booking, top-up adds money
  const [walletBalance, setWalletBalance] = useState(850);

  // --- Bookings State Ledger ---
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: 'BK-810',
      farmId: 'farm-1',
      farmName: 'Pimpalgaon Onion plot',
      crop: 'Onion',
      serviceType: 'ai_report',
      area: 4.5,
      price: 415,
      outletId: 'nashik-central',
      dateTime: '2026-07-08 09:30 AM',
      timeSlot: 'Morning (08:00 AM - 11:00 AM)',
      operatorId: 'op-1',
      operatorName: 'Sanjay Ghadge',
      status: 'completed',
      paymentMethod: 'wallet',
      paymentStatus: 'paid',
      travelFee: 100,
      areaCharge: 315,
      sensorFee: 0,
      discount: 0
    },
    {
      id: 'BK-120',
      farmId: 'farm-1',
      farmName: 'Pimpalgaon Onion plot',
      crop: 'Onion',
      serviceType: 'sensor_confirm',
      area: 4.5,
      price: 320,
      outletId: 'nashik-central',
      dateTime: '2026-07-12 10:00 AM',
      timeSlot: 'Morning (08:00 AM - 11:00 AM)',
      operatorId: 'op-1',
      operatorName: 'Sanjay Ghadge',
      status: 'assigned',
      paymentMethod: 'upi',
      paymentStatus: 'paid',
      travelFee: 100,
      areaCharge: 120,
      sensorFee: 100,
      discount: 0
    }
  ]);

  const handleBookingConfirm = (newBooking: Booking) => {
    // Append to live ledger
    setBookings([newBooking, ...bookings]);
    
    // Deduct from wallet balance if paid via wallet
    if (newBooking.paymentMethod === 'wallet') {
      setWalletBalance((prev) => Math.max(0, prev - newBooking.price));
    }

    // Automatically route to bookings list tracker
    setCurrentView('bookings-list');
  };

  const handleBookingStatusUpdate = (bookingId: string, nextStatus: Booking['status']) => {
    setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: nextStatus } : b));
  };

  const handleCancelBooking = (bookingId: string) => {
    setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'cancelled', paymentStatus: b.paymentStatus === 'paid' ? 'refunded' : b.paymentStatus } : b));
  };

  // --- Inter-component Query Trigger state ---
  // Connects clicked advisory zone into pathological chat query automatically
  const [expertInitialMessage, setExpertInitialMessage] = useState<string>('');

  const handleTriggerExpertChat = (initialMsg: string) => {
    setExpertInitialMessage(initialMsg);
    setCurrentView('expert');
  };

  // --- Notifications Drawer States ---
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 'n1', text: 'Critical: Purple blotch fungal spot spotted in Zone D.', read: false, time: '1 hour ago' },
    { id: 'n2', text: 'Drip line water pressure warning: West Grid moisture below 18%.', read: false, time: '3 hours ago' },
    { id: 'n3', text: 'Your scheduled drone flight has been approved for July 12th.', read: true, time: 'Yesterday' }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkNotificationsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  // --- Speech Readout simulator ---
  // Safe text-to-speech fallback if Web Speech API isn't fully supported
  const [activeVoiceSpeakerText, setActiveVoiceSpeakerText] = useState<string | null>(null);

  const handleSpeakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Attempt to map correct accent voices based on selected regional language
      const voices = window.speechSynthesis.getVoices();
      if (currentLanguage === 'hi') {
        const hiVoice = voices.find(v => v.lang.startsWith('hi'));
        if (hiVoice) utterance.voice = hiVoice;
      } else if (currentLanguage === 'mr') {
        const mrVoice = voices.find(v => v.lang.startsWith('mr'));
        if (mrVoice) utterance.voice = mrVoice;
      }
      
      utterance.rate = 0.9; // Slightly slower for elderly/rural users
      
      utterance.onstart = () => {
        setActiveVoiceSpeakerText(text);
      };
      utterance.onend = () => {
        setActiveVoiceSpeakerText(null);
      };
      utterance.onerror = () => {
        setActiveVoiceSpeakerText(null);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      // Audio fallback simulation toast
      setActiveVoiceSpeakerText(text);
      setTimeout(() => setActiveVoiceSpeakerText(null), 5000);
    }
  };

  // --- Sync theme class with HTML DOM root ---
  useEffect(() => {
    const root = window.document.documentElement;
    if (currentTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [currentTheme]);

  // --- Map Role Switches to View Routes ---
  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'farmer') {
      setCurrentView('dashboard');
    } else if (role === 'operator') {
      setCurrentView('operator-dash');
    } else if (role === 'manager') {
      setCurrentView('manager-dash');
    } else if (role === 'admin') {
      setCurrentView('admin-dash');
    } else {
      setCurrentView('home');
    }
  };

  const handleLoginSuccess = (user: { name: string; role: UserRole; village: string }) => {
    setUserName(user.name);
    setCurrentRole(user.role);
    setUserVillage(user.village);
    
    // Auto route based on role
    if (user.role === 'farmer') {
      setCurrentView('dashboard');
    } else if (user.role === 'operator') {
      setCurrentView('operator-dash');
    } else if (user.role === 'manager') {
      setCurrentView('manager-dash');
    } else if (user.role === 'admin') {
      setCurrentView('admin-dash');
    } else {
      setCurrentView('home');
    }
  };

  // Navigation classes for consistent layout structures
  const t = translations[currentLanguage];

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      currentTheme === 'dark' ? 'bg-gray-950 text-white' : 'bg-[#faf9f5] text-gray-900'
    } ${isLargeText ? 'text-lg font-medium' : 'text-sm'}`}>
      
      {/* 1. Header Navigation Shell */}
      <Navigation
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        currentTheme={currentTheme}
        onThemeToggle={() => setCurrentTheme(currentTheme === 'light' ? 'dark' : 'light')}
        isLargeText={isLargeText}
        onLargeTextToggle={() => setIsLargeText(!isLargeText)}
        networkStatus={networkStatus}
        onNetworkStatusChange={setNetworkStatus}
        walletBalance={walletBalance}
        currentView={currentView}
        onViewChange={setCurrentView}
        unreadAlertsCount={unreadCount}
        onOpenNotifications={() => {
          setIsNotificationsOpen(true);
          handleMarkNotificationsRead();
        }}
        userName={userName}
        userVillage={userVillage}
      />

      {/* Dynamic Voice synthesis speaker toast */}
      {activeVoiceSpeakerText && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-emerald-900 text-white px-5 py-4 rounded-2xl shadow-2xl border border-emerald-700 flex items-start gap-3.5 animate-in slide-in-from-bottom-5">
          <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 animate-bounce">
            <Volume2 className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-mono font-bold text-emerald-400 tracking-wider block uppercase">SPEAKING ASSISTANT</span>
            <p className="text-xs font-medium leading-relaxed italic">"{activeVoiceSpeakerText}"</p>
          </div>
        </div>
      )}

      {/* Main Grid View Content Router */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Guest / Public Home Page View */}
        {currentView === 'home' && (
          <LandingPage
            currentLanguage={currentLanguage}
            onNavigate={setCurrentView}
            onRoleSet={(role) => handleRoleChange(role)}
            currentTheme={currentTheme}
          />
        )}

        {/* Farmer Register & 9-Step Onboarding View */}
        {currentView === 'register' && (
          <OnboardingFlow
            currentLanguage={currentLanguage}
            onLanguageChange={setCurrentLanguage}
            onLoginSuccess={handleLoginSuccess}
            onAddFarm={handleAddFarm}
            currentTheme={currentTheme}
          />
        )}

        {/* Logged-In Farmer views */}
        {currentRole === 'farmer' && (
          <>
            {/* 1. Farmer Cockpit Dashboard */}
            {currentView === 'dashboard' && (
              <FarmerDashboard
                currentLanguage={currentLanguage}
                onNavigate={setCurrentView}
                currentTheme={currentTheme}
                isLargeText={isLargeText}
                onSpeakText={handleSpeakText}
                activeFarm={activeFarm}
                registeredFarms={registeredFarms}
                onSelectFarm={handleSelectFarm}
                onTriggerExpertChat={handleTriggerExpertChat}
              />
            )}

            {/* 2. Farms selector onboarding page */}
            {currentView === 'farms' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
                  <h2 className="font-display font-bold text-lg text-emerald-950 dark:text-white">Registered Land Plots</h2>
                  <p className="text-xs text-gray-500">View GPS grids, crop variety age, and soil sensor assignments for your land holdings.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {registeredFarms.map((f) => (
                      <div 
                        key={f.id} 
                        className={`p-5 rounded-2xl border transition-all ${
                          activeFarm.id === f.id 
                            ? 'bg-emerald-50/50 border-emerald-500 dark:bg-emerald-950/20' 
                            : 'bg-white dark:bg-gray-850 border-gray-100 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white">{f.name}</h4>
                            <p className="text-xs text-gray-500">{f.location} • {f.area} {f.areaUnit}s</p>
                          </div>
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded text-[9px] font-bold uppercase">
                            {f.crop}
                          </span>
                        </div>
                        <div className="border-t border-dashed mt-4 pt-3 flex justify-between text-[11px] text-gray-500">
                          <span>Sown on: <strong>{f.sowingDate}</strong></span>
                          <span>Health Score: <strong className="text-emerald-700">{f.latestHealthScore}%</strong></span>
                        </div>
                        <button 
                          onClick={() => handleSelectFarm(f)}
                          className="w-full mt-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold"
                        >
                          Select as Active Farm
                        </button>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => setCurrentView('register')}
                    className="py-2.5 px-4 border border-emerald-600 text-emerald-700 hover:bg-emerald-50 rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <span>+ Add Another Plot</span>
                  </button>
                </div>
              </div>
            )}

            {/* 3. Multi-Step Drone Booking Flow */}
            {currentView === 'booking-flow' && (
              <BookingFlow
                currentLanguage={currentLanguage}
                registeredFarms={registeredFarms}
                activeFarm={activeFarm}
                onBookingConfirm={handleBookingConfirm}
                onNavigate={setCurrentView}
              />
            )}

            {/* 4. Live Telemetry Tracker & Bookings Management */}
            {currentView === 'bookings-list' && (
              <BookingManagement
                currentLanguage={currentLanguage}
                bookings={bookings}
                onStatusUpdate={handleBookingStatusUpdate}
                onCancelBooking={handleCancelBooking}
              />
            )}

            {/* 5. AI Drone Analysis & Compare screen */}
            {currentView === 'drone-analysis' && (
              <DroneAnalysis
                currentLanguage={currentLanguage}
                onNavigate={setCurrentView}
                onSpeakText={handleSpeakText}
              />
            )}

            {/* 6. Live Soil Ground Sensors Cockpit */}
            {currentView === 'sensors' && (
              <SensorDashboard
                currentLanguage={currentLanguage}
                currentTheme={currentTheme}
              />
            )}

            {/* 7. Advisory Panel & Task calendar */}
            {currentView === 'advisory' && (
              <CropAdvisory
                currentLanguage={currentLanguage}
                onSpeakText={handleSpeakText}
                onNavigate={setCurrentView}
              />
            )}

            {/* 8. Expert Consultation Chatbot & Video */}
            {currentView === 'expert' && (
              <ExpertConsultation
                currentLanguage={currentLanguage}
                initialMessage={expertInitialMessage}
                onClearInitialMessage={() => setExpertInitialMessage('')}
              />
            )}

            {/* 9. Wallet & Ledger Panel */}
            {currentView === 'expenses' && (
              <WalletPayments
                currentLanguage={currentLanguage}
              />
            )}
          </>
        )}

        {/* Operator Dashboard view */}
        {currentRole === 'operator' && currentView === 'operator-dash' && (
          <OtherDashboards
            currentLanguage={currentLanguage}
            currentTheme={currentTheme}
            currentRole="operator"
          />
        )}

        {/* Manager Dashboard view */}
        {currentRole === 'manager' && currentView === 'manager-dash' && (
          <OtherDashboards
            currentLanguage={currentLanguage}
            currentTheme={currentTheme}
            currentRole="manager"
          />
        )}

        {/* Admin Dashboard view */}
        {currentRole === 'admin' && currentView === 'admin-dash' && (
          <OtherDashboards
            currentLanguage={currentLanguage}
            currentTheme={currentTheme}
            currentRole="admin"
          />
        )}

      </main>

      {/* Regional Warnings / Alert Notifications Side drawer panel */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-end" onClick={() => setIsNotificationsOpen(false)}>
          <div className={`w-80 max-w-full h-full p-5 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200 ${
            currentTheme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-950'
          }`} onClick={e => e.stopPropagation()}>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <h3 className="font-display font-bold text-lg text-emerald-950 dark:text-emerald-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-5 h-5 text-emerald-600" />
                  Regional Alerts
                </h3>
                <button onClick={() => setIsNotificationsOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-gray-800 space-y-4 pt-1">
                {notifications.map((n) => (
                  <div key={n.id} className="pt-3 text-xs space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-gray-400">
                      <span className="font-mono">{n.time}</span>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-red-500 block"></span>
                      )}
                    </div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200 leading-relaxed">
                      {n.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200/50 text-[10px] text-amber-800 dark:text-amber-400 leading-relaxed flex gap-2">
                <Info className="w-4 h-4 shrink-0" />
                <span>AI diagnostics are advisory. Verify in-field or consult an agronomist before spraying chemicals.</span>
              </div>
              <button 
                onClick={() => setIsNotificationsOpen(false)}
                className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-md"
              >
                Close Drawer
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
