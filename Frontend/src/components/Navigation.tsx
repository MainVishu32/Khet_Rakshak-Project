/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Menu, X, Globe, User, Bell, ChevronDown, Radio, 
  Sun, Moon, Type, Shield, LayoutDashboard, Map, 
  CalendarClock, BookOpen, CloudSun, AlertTriangle, 
  PhoneCall, FileText, Wallet, Laptop, Settings, HelpCircle
} from 'lucide-react';
import { Language, UserRole } from '../types';
import { translations } from '../translations';

interface NavigationProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  currentTheme: 'light' | 'dark';
  onThemeToggle: () => void;
  isLargeText: boolean;
  onLargeTextToggle: () => void;
  networkStatus: 'online' | 'weak' | 'offline';
  onNetworkStatusChange: (status: 'online' | 'weak' | 'offline') => void;
  walletBalance: number;
  currentView: string;
  onViewChange: (view: string) => void;
  unreadAlertsCount: number;
  onOpenNotifications: () => void;
  userName: string;
  userVillage: string;
}

export default function Navigation({
  currentLanguage,
  onLanguageChange,
  currentRole,
  onRoleChange,
  currentTheme,
  onThemeToggle,
  isLargeText,
  onLargeTextToggle,
  networkStatus,
  onNetworkStatusChange,
  walletBalance,
  currentView,
  onViewChange,
  unreadAlertsCount,
  onOpenNotifications,
  userName,
  userVillage
}: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const t = translations[currentLanguage];

  const languagesList: { code: Language; name: string; native: string }[] = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'mr', name: 'Marathi', native: 'मराठी' },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
    { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' }
  ];

  const rolesList: { code: UserRole; label: string }[] = [
    { code: 'guest', label: 'Guest User' },
    { code: 'farmer', label: 'Farmer (Patil)' },
    { code: 'operator', label: 'Drone Operator' },
    { code: 'manager', label: 'Outlet Manager' },
    { code: 'admin', label: 'Platform Admin' }
  ];

  // Helper to get active view class
  const getNavClass = (view: string) => {
    const isSelected = currentView === view;
    if (isSelected) {
      return "flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-700 text-white font-medium shadow-md transition-all";
    }
    return `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      currentTheme === 'dark' 
        ? 'text-gray-300 hover:bg-gray-800 hover:text-white' 
        : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-800'
    }`;
  };

  return (
    <div className={`relative ${isLargeText ? 'text-lg' : 'text-sm'}`}>
      {/* Main Top Header */}
      <header className={`sticky top-0 z-40 border-b transition-all duration-200 ${
        currentTheme === 'dark' 
          ? 'bg-gray-900 border-gray-800 text-white' 
          : 'bg-white border-gray-100 text-gray-900'
      } shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          
          {/* Logo Section */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onViewChange('home')} id="logo-container">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/30">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl tracking-tight text-emerald-600 flex items-center gap-1.5 dark:text-emerald-400">
                {t.app_title}
              </h1>
              <p className="text-[10px] text-gray-500 font-mono tracking-wider font-semibold uppercase">
                {t.app_tagline}
              </p>
            </div>
          </div>

          {/* Quick Stats Banner (For Logged In Users) */}
          {currentRole !== 'guest' && (
            <div className="hidden lg:flex items-center gap-6 px-4 py-1.5 rounded-full border border-dashed border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20">
              <div className="text-xs">
                <span className="text-gray-500 dark:text-gray-400">Role: </span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400 capitalize">{currentRole}</span>
              </div>
              <div className="text-xs h-4 w-px bg-gray-300 dark:bg-gray-700"></div>
              <div className="text-xs">
                <span className="text-gray-500 dark:text-gray-400">User: </span>
                <span className="font-semibold">{userName} ({userVillage})</span>
              </div>
              <div className="text-xs h-4 w-px bg-gray-300 dark:bg-gray-700"></div>
              <div className="text-xs flex items-center gap-1.5" onClick={() => onViewChange('expenses')} style={{ cursor: 'pointer' }}>
                <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">₹{walletBalance}</span>
              </div>
            </div>
          )}

          {/* Controls Panel */}
          <div className="flex items-center gap-2">
            
            {/* Network Status Toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1 text-xs">
              <button 
                onClick={() => onNetworkStatusChange('online')}
                className={`p-1.5 rounded-md flex items-center gap-1 transition-all ${
                  networkStatus === 'online' 
                    ? 'bg-emerald-600 text-white font-semibold' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}
                title="Simulate Strong Internet"
                id="net-online"
              >
                <Radio className="w-3 h-3" />
                <span className="hidden sm:inline">Online</span>
              </button>
              <button 
                onClick={() => onNetworkStatusChange('offline')}
                className={`p-1.5 rounded-md flex items-center gap-1 transition-all ${
                  networkStatus === 'offline' 
                    ? 'bg-red-600 text-white font-semibold' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}
                title="Simulate No Internet"
                id="net-offline"
              >
                <AlertTriangle className="w-3 h-3" />
                <span className="hidden sm:inline">Offline</span>
              </button>
            </div>

            {/* Accessibility: Font Size Scaler */}
            <button 
              onClick={onLargeTextToggle}
              className={`p-2 rounded-lg transition-colors border ${
                isLargeText 
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300' 
                  : 'bg-transparent text-gray-500 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              title="Toggle Large Text for Visibility"
              id="accessibility-text-toggle"
            >
              <Type className="w-4 h-4" />
            </button>

            {/* Accessibility: Theme Selector */}
            <button 
              onClick={onThemeToggle}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Toggle Light/Dark Theme"
              id="theme-toggle-btn"
            >
              {currentTheme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Language Selector */}
            <div className="relative">
              <button 
                onClick={() => {
                  setIsLangDropdownOpen(!isLangDropdownOpen);
                  setIsRoleDropdownOpen(false);
                  setIsProfileDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                id="language-selector-btn"
              >
                <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{languagesList.find(l => l.code === currentLanguage)?.native}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              
              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-2xl z-50 py-1 grid grid-cols-1 divide-y divide-gray-50 dark:divide-gray-700 animate-in fade-in slide-in-from-top-2 duration-100">
                  {languagesList.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onLanguageChange(lang.code);
                        setIsLangDropdownOpen(false);
                      }}
                      className={`flex items-center justify-between px-4 py-2.5 text-left text-xs transition-colors ${
                        currentLanguage === lang.code 
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold' 
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                      id={`lang-select-${lang.code}`}
                    >
                      <span>{lang.native}</span>
                      <span className="text-[10px] text-gray-400 font-mono">{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications Button */}
            {currentRole !== 'guest' && (
              <button 
                onClick={onOpenNotifications}
                className="relative p-2 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                id="notifications-bell-btn"
              >
                <Bell className="w-4 h-4" />
                {unreadAlertsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold animate-pulse">
                    {unreadAlertsCount}
                  </span>
                )}
              </button>
            )}

            {/* Role Switcher Dropdown beside Account */}
            <div className="relative">
              <button 
                onClick={() => {
                  setIsRoleDropdownOpen(!isRoleDropdownOpen);
                  setIsProfileDropdownOpen(false);
                  setIsLangDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300"
                id="role-selector-btn"
              >
                <Settings className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="capitalize hidden md:inline">{currentRole}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              
              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-2xl z-50 py-1 grid grid-cols-1 divide-y divide-gray-50 dark:divide-gray-700 animate-in fade-in slide-in-from-top-2 duration-100">
                  <div className="px-3 py-1.5 text-[10px] font-mono text-gray-400 font-bold uppercase">Switch Role</div>
                  {rolesList.map((r) => (
                    <button
                      key={r.code}
                      onClick={() => {
                        onRoleChange(r.code);
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`flex items-center justify-between px-4 py-2.5 text-left text-xs transition-colors ${
                        currentRole === r.code 
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold' 
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                      id={`role-select-${r.code}`}
                    >
                      <span>{r.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Drawer Dropdown */}
            <div className="relative">
              <button 
                onClick={() => {
                  setIsProfileDropdownOpen(!isProfileDropdownOpen);
                  setIsRoleDropdownOpen(false);
                  setIsLangDropdownOpen(false);
                }}
                className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center justify-center overflow-hidden cursor-pointer"
                id="profile-dropdown-btn"
              >
                <User className="w-4 h-4" />
              </button>
              
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-2xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-100">
                  <div className="p-2 border-b border-gray-100 dark:border-gray-700 text-xs mb-1">
                    <p className="font-bold">{userName}</p>
                    <p className="text-[10px] text-gray-500 truncate">{userVillage}</p>
                  </div>
                  {currentRole === 'guest' ? (
                    <button
                      onClick={() => {
                        onViewChange('register');
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left rounded-lg text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 font-bold"
                      id="profile-register-btn"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>{t.register_farmer}</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          onViewChange('dashboard');
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        id="profile-dash-btn"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        <span>My Dashboard</span>
                      </button>
                      <button
                        onClick={() => {
                          onRoleChange('guest');
                          onViewChange('home');
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 mt-1 font-semibold"
                        id="profile-logout-btn"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Logout / Exit Demo</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600"
              id="mobile-hamburger-btn"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Top Warning Banner for offline */}
      {networkStatus === 'offline' && (
        <div className="bg-red-600 text-white text-xs py-1.5 px-4 text-center font-bold flex items-center justify-center gap-2 animate-pulse">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>OFFLINE MODE ACTIVE: Forms will save locally and sync when connection returns.</span>
        </div>
      )}

      {/* Mobile Sidebar overlay menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className={`w-72 max-w-full h-full p-5 flex flex-col justify-between ${
            currentTheme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
          }`} onClick={e => e.stopPropagation()}>
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <h3 className="font-display font-bold text-lg text-emerald-600 dark:text-emerald-400">Navigation</h3>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sidebar items inside Mobile */}
              <div className="flex flex-col gap-1.5">
                {/* Mobile Role Switcher Section */}
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-gray-800 mb-2">
                  <p className="text-[10px] font-mono font-bold text-gray-400 uppercase mb-2">Test Roles / Accounts</p>
                  <div className="grid grid-cols-2 gap-1">
                    {rolesList.map((r) => (
                      <button
                        key={r.code}
                        onClick={() => {
                          onRoleChange(r.code);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`px-2 py-1.5 rounded text-[10px] font-bold uppercase transition-all ${
                          currentRole === r.code
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        {r.code}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={() => { onViewChange('home'); setIsMobileMenuOpen(false); }} className={getNavClass('home')} id="mob-nav-home">
                  <Laptop className="w-5 h-5" />
                  <span>{t.home}</span>
                </button>
                
                {currentRole === 'farmer' && (
                  <>
                    <button onClick={() => { onViewChange('dashboard'); setIsMobileMenuOpen(false); }} className={getNavClass('dashboard')} id="mob-nav-dash">
                      <LayoutDashboard className="w-5 h-5" />
                      <span>{t.farmer_dashboard}</span>
                    </button>
                    <button onClick={() => { onViewChange('farms'); setIsMobileMenuOpen(false); }} className={getNavClass('farms')} id="mob-nav-farms">
                      <Map className="w-5 h-5" />
                      <span>{t.farms}</span>
                    </button>
                    <button onClick={() => { onViewChange('booking-flow'); setIsMobileMenuOpen(false); }} className={getNavClass('booking-flow')} id="mob-nav-book">
                      <CalendarClock className="w-5 h-5" />
                      <span>{t.book_drone}</span>
                    </button>
                    <button onClick={() => { onViewChange('bookings-list'); setIsMobileMenuOpen(false); }} className={getNavClass('bookings-list')} id="mob-nav-bookings-list">
                      <FileText className="w-5 h-5" />
                      <span>{t.my_bookings}</span>
                    </button>
                    <button onClick={() => { onViewChange('drone-analysis'); setIsMobileMenuOpen(false); }} className={getNavClass('drone-analysis')} id="mob-nav-analysis">
                      <Shield className="w-5 h-5" />
                      <span>AI Drone Analysis</span>
                    </button>
                    <button onClick={() => { onViewChange('sensors'); setIsMobileMenuOpen(false); }} className={getNavClass('sensors')} id="mob-nav-sensors">
                      <Radio className="w-5 h-5" />
                      <span>{t.view_sensors}</span>
                    </button>
                    <button onClick={() => { onViewChange('advisory'); setIsMobileMenuOpen(false); }} className={getNavClass('advisory')} id="mob-nav-advisory">
                      <BookOpen className="w-5 h-5" />
                      <span>{t.advisory}</span>
                    </button>
                    <button onClick={() => { onViewChange('expert'); setIsMobileMenuOpen(false); }} className={getNavClass('expert')} id="mob-nav-expert">
                      <PhoneCall className="w-5 h-5" />
                      <span>{t.expert}</span>
                    </button>
                  </>
                )}

                {currentRole === 'operator' && (
                  <button onClick={() => { onViewChange('operator-dash'); setIsMobileMenuOpen(false); }} className={getNavClass('operator-dash')} id="mob-nav-operator">
                    <LayoutDashboard className="w-5 h-5" />
                    <span>{t.operator_dashboard}</span>
                  </button>
                )}

                {currentRole === 'manager' && (
                  <button onClick={() => { onViewChange('manager-dash'); setIsMobileMenuOpen(false); }} className={getNavClass('manager-dash')} id="mob-nav-manager">
                    <LayoutDashboard className="w-5 h-5" />
                    <span>{t.manager_dashboard}</span>
                  </button>
                )}

                {currentRole === 'admin' && (
                  <button onClick={() => { onViewChange('admin-dash'); setIsMobileMenuOpen(false); }} className={getNavClass('admin-dash')} id="mob-nav-admin">
                    <LayoutDashboard className="w-5 h-5" />
                    <span>{t.admin_dashboard}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Footer Area */}
            <div className="border-t pt-4">
              <div className="text-xs text-gray-500 mb-2">Developed for MSME Innovation Hub</div>
              <p className="text-[10px] text-gray-400 leading-relaxed">{t.disclaimer}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
