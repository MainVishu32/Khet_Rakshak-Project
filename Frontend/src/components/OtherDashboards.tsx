/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import {
  CheckCircle2, AlertTriangle, Upload, ChevronRight,
  MapPin, Settings, DollarSign, Users, Sprout, BarChart3, HelpCircle
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';
import { OperatorAssignment, getOperatorAssignments } from '../services/authService';

const operatorChecklistItems = [
  { key: 'battery', label: 'Drone battery level checked' },
  { key: 'camera', label: 'RGB optical camera lens cleared and balanced' },
  { key: 'gps', label: 'GPS satellite lock confirmed' },
  { key: 'weather', label: 'Local wind and visibility checked' },
  { key: 'permission', label: 'Farmer field boundary permission confirmed' },
] as const;

interface OtherDashboardsProps {
  currentLanguage: Language;
  currentTheme: 'light' | 'dark';
  currentRole: 'drone_pilot' | 'outlet_manager' | 'admin';
  identity?: User;
  userName?: string;
}

export default function OtherDashboards({
  currentLanguage,
  currentTheme,
  currentRole,
  identity,
  userName,
}: OtherDashboardsProps) {
  const t = translations[currentLanguage];

  // Operator Checklist state
  const [operatorChecklist, setOperatorChecklist] = useState({
    battery: true,
    camera: true,
    gps: true,
    weather: true,
    permission: true
  });

  const [assignments, setAssignments] = useState<OperatorAssignment[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(currentRole === 'drone_pilot');
  const [assignmentsError, setAssignmentsError] = useState('');

  // Manager Price sliders
  const [managerBasePrice, setManagerBasePrice] = useState(100);
  const [managerAcreRate, setManagerAcreRate] = useState(70);

  useEffect(() => {
    if (currentRole !== 'drone_pilot' || !identity) {
      setAssignmentsLoading(false);
      return undefined;
    }
    let active = true;
    setAssignmentsLoading(true);
    setAssignmentsError('');
    void getOperatorAssignments(identity)
      .then((result) => {
        if (active) setAssignments(result.assignments);
      })
      .catch((error: unknown) => {
        if (active) setAssignmentsError(error instanceof Error ? error.message : 'Could not load assignments.');
      })
      .finally(() => {
        if (active) setAssignmentsLoading(false);
      });
    return () => { active = false; };
  }, [currentRole, identity]);

  return (
    <div className="space-y-6">
      
      {/* -------------------- DRONE OPERATOR PORTAL -------------------- */}
      {currentRole === 'drone_pilot' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-lg text-emerald-950 dark:text-white">{t.operator_dashboard}</h2>
              <p className="text-xs text-gray-500">Pilot Profile: {userName || identity?.displayName || 'Verified drone pilot'}</p>
            </div>
            <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold font-mono">
              PILOT ACCESS APPROVED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Operator checklist */}
            <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
              <h3 className="font-display font-bold text-sm text-gray-950 dark:text-white">Pre-Flight Safety Checklist</h3>
              <p className="text-xs text-gray-500">DGCA regulations require checking all hardware safety switches before take-off.</p>

              <div className="space-y-2.5 text-xs">
                {operatorChecklistItems.map((chk) => (
                  <label key={chk.key} className="flex items-center gap-3 p-3 rounded-xl border bg-gray-50/50 dark:bg-gray-850 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={operatorChecklist[chk.key]}
                      onChange={(e) => setOperatorChecklist({ ...operatorChecklist, [chk.key]: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{chk.label}</span>
                  </label>
                ))}
              </div>

              <div className="rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
                Flight controls and live telemetry are not connected. This checklist is a preview only.
              </div>
            </div>

            {/* Operator task cards */}
            <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
              <h3 className="font-display font-bold text-sm text-gray-900 dark:text-white">Assigned Visits Today</h3>
              {assignmentsError ? (
                <p role="alert" className="rounded-xl bg-red-50 p-3 text-xs text-red-700">{assignmentsError}</p>
              ) : assignmentsLoading ? (
                <p role="status" className="text-xs text-gray-500">Loading your assignments…</p>
              ) : assignments.length === 0 ? (
                <p className="rounded-xl bg-gray-50 p-4 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">No operations are currently assigned to this account.</p>
              ) : (
                <div className="space-y-3">
                  {assignments.map((assignment) => (
                    <article key={assignment.id} className="rounded-xl border border-gray-200 p-4 text-xs dark:border-gray-700">
                      <h4 className="font-bold">{assignment.farmName}</h4>
                      <p className="mt-1 text-gray-500">{assignment.farmerName} · {assignment.village} · {assignment.crop}</p>
                      <p className="mt-2">Scheduled: {assignment.scheduledAt} · {assignment.status}</p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* -------------------- OUTLET MANAGER PORTAL -------------------- */}
      {currentRole === 'outlet_manager' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-lg text-emerald-950 dark:text-white">{t.manager_dashboard}</h2>
              <p className="text-xs text-gray-500">Region Hub: Nashik Central Outlet • Serving 5 nearby villages</p>
            </div>
            <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold font-mono">
              Drones Available: 2/3
            </span>
          </div>

          {/* Pricing configuration sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            
            <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
              <h3 className="font-display font-bold text-sm text-gray-900 dark:text-white">Region Pricing Configurator</h3>
              <p className="text-xs text-gray-500">Adjust active service prices. Changes propagate to regional farmer dashboards instantly.</p>

              <div className="space-y-4 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>Base Inspection Fee</span>
                    <span className="text-emerald-700">₹{managerBasePrice}</span>
                  </div>
                  <input 
                    type="range" 
                    min={80} 
                    max={250} 
                    value={managerBasePrice} 
                    onChange={e => setManagerBasePrice(parseInt(e.target.value))} 
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <p className="text-[10px] text-gray-400">Covers initial pilot transport & drone battery charging.</p>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>AI Report Rate (per Acre)</span>
                    <span className="text-emerald-700">₹{managerAcreRate}/acre</span>
                  </div>
                  <input 
                    type="range" 
                    min={40} 
                    max={120} 
                    value={managerAcreRate} 
                    onChange={e => setManagerAcreRate(parseInt(e.target.value))} 
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <p className="text-[10px] text-gray-400">Covers cloud cluster orthomosaic calculation charges.</p>
                </div>
              </div>
            </div>

            {/* Active pilot allocation logs */}
            <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
              <h3 className="font-display font-bold text-sm text-gray-900 dark:text-white">Active Operator Roster</h3>
              
              <div className="space-y-3.5 text-xs">
                {[
                  { name: 'Sanjay Ghadge', status: 'Airborne', task: 'Scan active at Patil Onion field' },
                  { name: 'Vikram Salunkhe', status: 'Hangar', task: 'Calibrating backup agricultural drone' },
                  { name: 'Rahul Jadhav', status: 'Resting', task: 'Completed 3 surveys yesterday' }
                ].map((pil, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-xl border flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-gray-800">{pil.name}</h4>
                      <p className="text-[10px] text-gray-500">{pil.task}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                      pil.status === 'Airborne' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                      pil.status === 'Hangar' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {pil.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* -------------------- PLATFORM ADMIN PANEL -------------------- */}
      {currentRole === 'admin' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-lg text-emerald-950 dark:text-white">{t.admin_dashboard}</h2>
              <p className="text-xs text-gray-500">Platform Analytics Overview • Serving Indian Agritech Nodes</p>
            </div>
            <span className="px-3 py-1 bg-emerald-800 text-white rounded-full text-[10px] font-bold font-mono">
              Server status: ACTIVE
            </span>
          </div>

          {/* Core admin statistics numbers */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Registered Farmers', value: '1,420', trend: '↑ +12%' },
              { label: 'Monitored Fields', value: '3,840 Acres', trend: '↑ +18%' },
              { label: 'Drone Hub Outlets', value: '12 Active', trend: '4 Pending' },
              { label: 'Revenue Generated', value: '₹2.84 Lakh', trend: '↑ +22%' }
            ].map((st, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-1">
                <span className="text-gray-500 text-[10px] uppercase font-bold block">{st.label}</span>
                <span className="text-xl md:text-2xl font-black text-emerald-900 dark:text-emerald-400 block">{st.value}</span>
                <span className="text-[10px] font-bold text-emerald-600 block">{st.trend}</span>
              </div>
            ))}
          </div>

          {/* Simple Visual SVG Analytics charts for presentation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            
            {/* Chart 1: Crop distribution */}
            <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
              <h3 className="font-display font-bold text-sm text-gray-950 dark:text-white flex items-center gap-1.5">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
                Monitored Fields Density by Crop Type
              </h3>

              <div className="space-y-3.5 text-xs">
                {[
                  { crop: 'Onion (Nashik & Dakor hubs)', percentage: '45%', acres: '1,728 Acres', color: 'bg-emerald-600' },
                  { crop: 'Cotton (Gujarat nodes)', percentage: '25%', acres: '960 Acres', color: 'bg-amber-500' },
                  { crop: 'Grapes (Horticulture clusters)', percentage: '18%', acres: '691 Acres', color: 'bg-blue-600' },
                  { crop: 'Other crops (Wheat, Tomato)', percentage: '12%', acres: '461 Acres', color: 'bg-gray-400' }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                      <span>{item.crop}</span>
                      <span>{item.acres} ({item.percentage})</span>
                    </div>
                    {/* Visual bar */}
                    <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: item.percentage }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart 2: Common stress categories */}
            <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="font-display font-bold text-sm text-gray-950 dark:text-white flex items-center gap-1.5">
                  <BarChart3 className="w-5 h-5 text-amber-600" />
                  Most Common Detected Stress Anomalies
                </h3>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  {[
                    { title: 'Water Deficit', count: '142 Cases', pct: '40%' },
                    { title: 'Fungal Spot (Mildew)', count: '106 Cases', pct: '30%' },
                    { title: 'Nitrogen Drop', count: '89 Cases', pct: '25%' },
                    { title: 'Mechanical Damage', count: '18 Cases', pct: '5%' }
                  ].map((an, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-850 border border-gray-100">
                      <span className="text-[10px] font-bold text-gray-500">{an.title}</span>
                      <p className="font-extrabold text-sm text-gray-900 dark:text-white">{an.count}</p>
                      <span className="text-[9px] text-emerald-600 font-bold">{an.pct} of total</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-[10px] text-gray-400 leading-relaxed border-t border-gray-100/50 pt-3">
                Note: Diagnostic database synced with MPKV Agronomy research profiles to maintain early detection threshold accuracy.
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
