/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Shield, CheckCircle2, Play, Users, MapPin, 
  ArrowRight, Heart, Sparkles, HelpCircle, AlertTriangle,
  Zap, Cloud, Info
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface LandingPageProps {
  currentLanguage: Language;
  onNavigate: (view: string) => void;
  onRoleSet: (role: 'farmer' | 'guest') => void;
  currentTheme: 'light' | 'dark';
}

export default function LandingPage({
  currentLanguage,
  onNavigate,
  onRoleSet,
  currentTheme
}: LandingPageProps) {
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [selectedVillageNode, setSelectedVillageNode] = useState<string | null>('pimpalgaon');
  const t = translations[currentLanguage];

  // Mock village network nodes
  const villages = [
    { id: 'pimpalgaon', name: 'Pimpalgaon (4.2 km)', description: 'Active drone coverage hub. Sowing Onion and Grapes.', status: 'Active' },
    { id: 'shivar', name: 'Shivar (1.5 km)', description: 'Soil sensor validation grid deployed here.', status: 'Active' },
    { id: 'ozar', name: 'Ozar (6.8 km)', description: 'Drone route Scheduled on Tuesdays.', status: 'Active' },
    { id: 'kokangaon', name: 'Kokangaon (8.5 km)', description: 'Sub-centre node with 12 registered cooperatives.', status: 'Active' },
    { id: 'dindori', name: 'Dindori (11.0 km)', description: 'New expansion warehouse starting next month.', status: 'Planned' }
  ];

  return (
    <div className={`transition-all duration-200 ${
      currentTheme === 'dark' ? 'bg-gray-950 text-white' : 'bg-[#fcfbf7] text-gray-900'
    }`}>
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 md:px-8 border-b border-gray-100 dark:border-gray-900 bg-gradient-to-b from-emerald-50/20 via-transparent to-transparent">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold text-xs border border-emerald-200/50">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.app_tagline}</span>
            </div>
            
            <h1 className="font-display font-extrabold text-3xl md:text-5xl tracking-tight leading-tight text-emerald-950 dark:text-emerald-100">
              {t.hero_headline}
            </h1>
            
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl">
              {t.hero_sub}
            </p>

            {/* AI Warning Box */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 text-xs text-amber-800 dark:text-amber-400">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="font-medium leading-relaxed">{t.disclaimer}</p>
            </div>

            {/* Quick action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => {
                  onRoleSet('farmer');
                  onNavigate('register');
                }}
                className="px-6 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all hover:translate-y-[-1px]"
                id="hero-register-btn"
              >
                <span>{t.register_farmer}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button 
                onClick={() => {
                  onRoleSet('farmer');
                  onNavigate('booking-flow');
                }}
                className="px-6 py-3.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
                id="hero-book-btn"
              >
                <span>{t.book_drone_btn}</span>
              </button>

              <button 
                onClick={() => setShowDemoModal(true)}
                className="px-5 py-3.5 rounded-xl bg-transparent hover:bg-gray-100/50 text-gray-600 dark:text-gray-400 font-semibold flex items-center justify-center gap-2 border border-transparent hover:border-gray-200 dark:hover:border-gray-800 transition-all"
                id="hero-demo-btn"
              >
                <Play className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                <span>{t.watch_demo}</span>
              </button>
            </div>
          </div>

          {/* Hero mockup/art */}
          <div className="lg:col-span-5 relative">
            <div className="aspect-square rounded-3xl overflow-hidden bg-gradient-to-tr from-emerald-800 to-amber-700 p-1 shadow-2xl relative">
              <div className="absolute inset-0 bg-black/25"></div>
              {/* Main abstract illustration representation of the drone scanning a structured grid */}
              <div className="w-full h-full bg-[#182a1b] rounded-[22px] p-6 flex flex-col justify-between relative overflow-hidden text-white font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-widest flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    DRONE_GPS_LOCKED
                  </span>
                  <span className="text-xs font-semibold text-gray-300">Pimpalgaon Grid B</span>
                </div>

                {/* Simulated Grid Scanning visualization */}
                <div className="grid grid-cols-4 gap-2 my-4 opacity-80">
                  <div className="border border-emerald-500/30 bg-emerald-500/10 rounded-lg aspect-square flex flex-col justify-between p-1.5 text-[8px] text-emerald-400">
                    <span>A1</span>
                    <span className="text-[7px] text-right font-bold text-emerald-300">Healthy (96%)</span>
                  </div>
                  <div className="border border-emerald-500/30 bg-emerald-500/10 rounded-lg aspect-square flex flex-col justify-between p-1.5 text-[8px] text-emerald-400">
                    <span>A2</span>
                    <span className="text-[7px] text-right font-bold text-emerald-300">Healthy (91%)</span>
                  </div>
                  <div className="border-2 border-amber-500 bg-amber-500/10 rounded-lg aspect-square flex flex-col justify-between p-1.5 text-[8px] text-amber-500">
                    <span>B1</span>
                    <span className="text-[7px] text-right font-bold text-amber-400">Warning (72%)</span>
                  </div>
                  <div className="border border-emerald-500/30 bg-emerald-500/10 rounded-lg aspect-square flex flex-col justify-between p-1.5 text-[8px] text-emerald-400">
                    <span>B2</span>
                    <span className="text-[7px] text-right font-bold text-emerald-300">Healthy (94%)</span>
                  </div>
                </div>

                <div className="space-y-2 border-t border-emerald-900/40 pt-4">
                  <div className="flex items-center justify-between text-xs font-sans">
                    <span className="text-gray-400">Target Area:</span>
                    <span className="font-semibold">4.5 Acres (Onion Field)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-sans">
                    <span className="text-gray-400">Drone Pilot:</span>
                    <span className="font-semibold">Sanjay Ghadge</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-sans">
                    <span className="text-gray-400">Status:</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 text-[10px] font-bold">Scanning Ready</span>
                  </div>
                </div>
              </div>
            </div>


          </div>

        </div>
      </section>

      {/* Two-Tier Concept Explanation */}
      <section className="py-20 px-4 md:px-8 bg-emerald-900 text-white">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="font-display font-extrabold text-2xl md:text-4xl tracking-tight">
              {t.two_tier_title}
            </h2>
            <p className="text-emerald-100 text-sm md:text-base max-w-2xl mx-auto">
              How we combine drone speed and ground accuracy to keep crop screening inexpensive.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            
            {/* Tier 1 Box */}
            <div className="bg-white/10 rounded-3xl p-6 border border-white/10 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800 text-emerald-300 text-xs font-bold font-mono">
                  TIER 1
                </div>
                <h3 className="font-display font-bold text-xl">{t.tier1}</h3>
                <p className="text-sm text-emerald-100 leading-relaxed">
                  {t.tier1_desc} Consumer-grade RGB drones fly over your fields to capture normal color maps. AI algorithms identify visible anomalies, discoloration, and stress regions in minutes.
                </p>
              </div>
              <div className="mt-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/30">
                <span className="text-[11px] font-mono text-emerald-300 block uppercase font-bold tracking-widest mb-1">Visual Checkpoints</span>
                <p className="text-xs text-gray-300">✓ Defective patch outlines • ✓ Leaf color index mapping</p>
              </div>
            </div>

            {/* Tier 2 Box */}
            <div className="bg-white/10 rounded-3xl p-6 border border-white/10 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-800 text-amber-300 text-xs font-bold font-mono">
                  TIER 2
                </div>
                <h3 className="font-display font-bold text-xl">{t.tier2}</h3>
                <p className="text-sm text-emerald-100 leading-relaxed">
                  {t.tier2_desc} Once the drone highlights suspicious patches, operators verify those specific regions on foot. They log immediate soil moisture, pH, and NPK measurements to confirm.
                </p>
              </div>
              <div className="mt-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/30">
                <span className="text-[11px] font-mono text-amber-300 block uppercase font-bold tracking-widest mb-1">Sensor Inputs</span>
                <p className="text-xs text-gray-300">✓ N-P-K chemical ranges • ✓ Real-time Root Moisture %</p>
              </div>
            </div>

          </div>

          {/* Interactive Flow visualization */}
          <div className="bg-[#122818] border border-emerald-800 rounded-3xl p-6 text-center space-y-4">
            <h4 className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">Process Pipeline Flow</h4>
            <div className="flex flex-col md:flex-row items-center justify-center gap-3 text-xs md:text-sm font-semibold">
              <div className="px-4 py-2 bg-emerald-800/40 border border-emerald-700/50 rounded-lg">1. Drone Scan</div>
              <span className="text-emerald-500 font-bold">→</span>
              <div className="px-4 py-2 bg-emerald-800/40 border border-emerald-700/50 rounded-lg">2. AI Anomaly Match</div>
              <span className="text-emerald-500 font-bold">→</span>
              <div className="px-4 py-2 bg-amber-800/40 border border-amber-700/50 rounded-lg text-amber-200">3. Ground Confirmation</div>
              <span className="text-emerald-500 font-bold">→</span>
              <div className="px-4 py-2 bg-emerald-700 text-white rounded-lg shadow-md">4. Advisory & Action</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works 4 steps */}
      <section className="py-20 px-4 md:px-8 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="font-display font-extrabold text-2xl md:text-4xl text-emerald-950 dark:text-emerald-100">
            {t.how_it_works}
          </h2>
          <p className="text-gray-500 text-xs md:text-sm max-w-lg mx-auto">
            Get professional grade crop diagnostic scouting without spending thousands on equipment.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: '01', title: 'Register your farm', desc: 'Select location on our village map, select crop and input sowing details.' },
            { step: '02', title: 'Book a drone visit', desc: 'Select desired slot. The regional Khet Rakshak outlet assigns a trained pilot.' },
            { step: '03', title: 'Receive AI health report', desc: 'We scan your farm and trigger sensor tests if stress regions are caught.' },
            { step: '04', title: 'Take swift action', desc: 'Get simple crop advisory instructions on WhatsApp, SMS or the App.' }
          ].map((item, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-3xl relative space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <span className="text-4xl font-black text-emerald-100 dark:text-emerald-950 font-display block select-none">
                {item.step}
              </span>
              <h3 className="font-display font-bold text-base text-gray-900 dark:text-gray-100">{item.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Us and Service Outlets Section */}
      <section className="py-20 px-4 md:px-8 border-t border-gray-100 dark:border-gray-900 bg-emerald-50/20 dark:bg-emerald-950/10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <h2 className="font-display font-extrabold text-2xl md:text-4xl text-emerald-950 dark:text-emerald-100">
              {t.why_us}
            </h2>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {t.why_us_sub} By setting up regional storage warehouses, Khet Rakshak services smallholder farmers who otherwise cannot afford drones.
            </p>

            <ul className="space-y-3">
              {[
                { title: 'Works with budget RGB cameras', desc: 'Advanced AI compensates for expensive multispectral sensors.' },
                { title: 'Local operator handles everything', desc: 'No complex app management needed for older farmers.' },
                { title: 'Complete Regional Service Coverage', desc: 'Each outlet acts as a training and drone hangar node.' }
              ].map((point, idx) => (
                <li key={idx} className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-xs md:text-sm text-gray-900 dark:text-gray-100">{point.title}</h4>
                    <p className="text-xs text-gray-500">{point.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Interactive Drone Outlet Simulator */}
          <div className="lg:col-span-6">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl space-y-6">
              <div>
                <h3 className="font-display font-bold text-lg text-emerald-800 dark:text-emerald-400">Drone Service Hub Simulator</h3>
                <p className="text-xs text-gray-500">Each regional warehouse serves 4 to 5 villages. Select a village node to trace coverage.</p>
              </div>

              {/* Graphical Trace representation */}
              <div className="relative border border-dashed border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/10 rounded-2xl p-6 h-56 flex flex-col items-center justify-center">
                {/* Central Outlet */}
                <div className="relative z-10 w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-lg shadow-emerald-600/30">
                  HUB
                </div>
                <div className="absolute top-2 text-[10px] font-mono font-bold text-emerald-700 bg-white dark:bg-gray-800 px-2 py-0.5 rounded border border-emerald-200">
                  Nashik Central Outlet
                </div>

                {/* Village grid layout */}
                <div className="absolute inset-0 flex items-center justify-between px-8">
                  <button 
                    onClick={() => setSelectedVillageNode('shivar')}
                    className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center text-[9px] font-bold border transition-all ${
                      selectedVillageNode === 'shivar' 
                        ? 'bg-amber-100 border-amber-400 text-amber-800 dark:bg-amber-950 dark:text-amber-200 scale-110 shadow' 
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    Shivar
                  </button>
                  <button 
                    onClick={() => setSelectedVillageNode('pimpalgaon')}
                    className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center text-[9px] font-bold border transition-all ${
                      selectedVillageNode === 'pimpalgaon' 
                        ? 'bg-emerald-100 border-emerald-400 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 scale-110 shadow' 
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    Pimpal
                  </button>
                </div>

                <div className="absolute inset-x-0 bottom-4 flex justify-around px-12">
                  <button 
                    onClick={() => setSelectedVillageNode('ozar')}
                    className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center text-[9px] font-bold border transition-all ${
                      selectedVillageNode === 'ozar' 
                        ? 'bg-emerald-100 border-emerald-400 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 scale-110 shadow' 
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    Ozar
                  </button>
                  <button 
                    onClick={() => setSelectedVillageNode('dindori')}
                    className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center text-[9px] font-bold border transition-all ${
                      selectedVillageNode === 'dindori' 
                        ? 'bg-amber-100 border-amber-400 text-amber-800 dark:bg-amber-950 dark:text-amber-200 scale-110 shadow' 
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    Dindori
                  </button>
                </div>
              </div>

              {/* Village detail */}
              {selectedVillageNode && (
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs border border-gray-100 dark:border-gray-700 animate-in fade-in duration-200">
                  {villages.map((v) => v.id === selectedVillageNode && (
                    <div key={v.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900 dark:text-gray-100">{v.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                          v.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {v.status}
                        </span>
                      </div>
                      <p className="text-gray-500 text-[11px] leading-relaxed">{v.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 md:px-8 max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="font-display font-extrabold text-2xl md:text-4xl text-emerald-950 dark:text-emerald-100">
            What Farmers Are Saying
          </h2>
          <p className="text-gray-500 text-xs md:text-sm">Real stories from regional cooperatives using our system.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              name: 'Ramesh Patil',
              village: 'Pimpalgaon, Nashik',
              crop: 'Onion (4.5 Acres)',
              comment: '“Khet Rakshak identified a small water deficiency region on my onion field before the leaves turned yellow. The ground check confirmed the drip line was blocked. Saved my entire harvest.”'
            },
            {
              name: 'Kamlesh Patel',
              village: 'Dakor, Gujarat',
              crop: 'Cotton & Potato',
              comment: '“No need to buy a drone or understand complicated science. I requested a drone pilot, he arrived within a day, did the scanning, and gave me simple instructions in Gujarati.”'
            }
          ].map((test, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 italic">{test.comment}</p>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 font-bold flex items-center justify-center text-xs">
                  {test.name[0]}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-900 dark:text-gray-100">{test.name}</h4>
                  <p className="text-[10px] text-gray-500">{test.village} • {test.crop}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Landing Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-900 bg-emerald-950 text-white/90 pt-16 pb-8 px-4 md:px-8 font-sans">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-emerald-400" />
              <span className="font-display font-bold text-lg">{t.app_title}</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Agritech Innovation for grassroots empowerment. AI Crop monitoring using affordable drones.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-sm text-emerald-400">Emergency Support</h4>
            <div className="text-xs space-y-1">
              <p className="font-bold">Krishi Sahayata Helpline:</p>
              <p className="text-gray-400">1800-419-5321 (Toll Free)</p>
              <p className="text-gray-400">Email: support@khetrakshak.in</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-sm text-emerald-400">Demo Quick-Links</h4>
            <ul className="text-xs space-y-2 text-gray-400">
              <li><button onClick={() => onNavigate('dashboard')} className="hover:text-white text-left">Farmer Dashboard View</button></li>
              <li><button onClick={() => onNavigate('booking-flow')} className="hover:text-white text-left">Drone Booking Flow</button></li>
              <li><button onClick={() => onNavigate('sensors')} className="hover:text-white text-left">Ground Sensor Dashboard</button></li>
              <li><button onClick={() => onNavigate('admin-dash')} className="hover:text-white text-left">Platform Admin Stats</button></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-sm text-emerald-400">Platform Vision</h4>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Designed for regional FPCs, agricultural cooperatives and agri-MSME innovations. Proudly aligned with Digital India and Krishi Drone policies.
            </p>
          </div>

        </div>

        {/* Disclaimer section */}
        <div className="max-w-6xl mx-auto border-t border-emerald-900 pt-8 text-[10px] text-gray-400 space-y-3 leading-relaxed">
          <div className="flex gap-2 items-start">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
            <p><strong>IMPORTANT DISCLAIMER:</strong> {t.disclaimer_full}</p>
          </div>
          <p className="text-center text-[11px] text-gray-500 pt-4">
            &copy; 2026 Khet Rakshak Platforms. Developed for Hackathon Pitch. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Demo Video Pop-Up Simulation */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-3xl max-w-xl w-full p-6 space-y-6 relative border dark:border-gray-800">
            <button 
              onClick={() => setShowDemoModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="space-y-2">
              <h3 className="font-display font-bold text-xl text-emerald-800 dark:text-emerald-400">Khet Rakshak Demo Video</h3>
              <p className="text-xs text-gray-500">Visual demonstration of the Two-Tier Drone Scanning process.</p>
            </div>

            {/* Custom Interactive Video Screen Simulator */}
            <div className="aspect-video bg-[#152419] rounded-2xl p-4 flex flex-col justify-between text-white font-mono relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
                <Play className="w-12 h-12 text-emerald-500 fill-emerald-500" />
              </div>

              <div className="flex items-center justify-between text-[9px] relative z-20 text-emerald-400">
                <span>🎥 SCENE: 01_DRONE_ASCENT</span>
                <span>00:42 / 02:30</span>
              </div>

              <div className="text-center relative z-20 py-12">
                <p className="text-xs font-sans font-bold">"Testing Drone RGB scanning near Nashik over 4.5 Acres."</p>
                <p className="text-[10px] text-amber-400 mt-1">Status: Extracting color health patterns...</p>
              </div>

              <div className="text-[8px] text-gray-400 flex items-center justify-between relative z-20">
                <span>Model: DJI Mavic 3 Enterprise</span>
                <span>Resolution: 4K RGB</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setShowDemoModal(false)}
                className="px-4 py-2 text-xs rounded-xl border border-gray-200"
              >
                Close Video
              </button>
              <button 
                onClick={() => {
                  setShowDemoModal(false);
                  onRoleSet('farmer');
                  onNavigate('register');
                }}
                className="px-4 py-2 text-xs rounded-xl bg-emerald-700 text-white font-bold"
              >
                Register Farmer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Simple internal X component used inside modal for speed
function X({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
