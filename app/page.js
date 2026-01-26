'use client';

import React, { useState, useEffect } from 'react';
import { Play, Square, Plus, Check, ChevronRight, Clock, Target, Briefcase, TrendingUp, X, Edit2, Trash2, DollarSign, Settings, ChevronDown } from 'lucide-react';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxoPJ7feeA428agiJOVtbsthm6B4hG8vNAE-ogfbQGKrefJJWdw_CseDiJNzaeu3V3G/exec';

export default function StudioTracker() {
  const [view, setView] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerStart, setTimerStart] = useState(null);
  const [timerCategory, setTimerCategory] = useState('prelim');
  const [timerProject, setTimerProject] = useState('');
  const [timerDescription, setTimerDescription] = useState('');
  const [showAddTime, setShowAddTime] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddGoalCategory, setShowAddGoalCategory] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(null);
  const [editingGoalCategory, setEditingGoalCategory] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [expandedProjects, setExpandedProjects] = useState({});
  const [editingEntry, setEditingEntry] = useState(null);
  const [showProjectHoursDetail, setShowProjectHoursDetail] = useState(null);
  const [timeFilter, setTimeFilter] = useState('total');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [expandedTimeProjects, setExpandedTimeProjects] = useState({});

  const [data, setData] = useState({
    timeEntries: [],
    projects: [],
    goalCategories: [],
    weeklyNotes: [],
    billingRate: 150,
    revenueGoal: 220000,
    header: { title: 'Studio', subtitle: '$220k goal — Year 2' }
  });

  const categories = [
    { id: 'prelim', label: 'Preliminary Design', color: '#2563eb' },
    { id: 'schematic', label: 'Schematic Design', color: '#3b82f6' },
    { id: 'dd', label: 'Design Development', color: '#6366f1' },
    { id: 'cd', label: 'Construction Documents', color: '#7c3aed' },
    { id: 'bidding', label: 'Bidding', color: '#8b5cf6' },
    { id: 'ca', label: 'Construction Observation', color: '#a855f7' },
    { id: 'meetings', label: 'Client Meetings', color: '#d97706' },
    { id: 'bizdev', label: 'Business Development', color: '#059669' },
    { id: 'marketing', label: 'Marketing', color: '#10b981' },
    { id: 'accounting', label: 'Accounting/Invoicing', color: '#64748b' },
    { id: 'admin', label: 'Admin', color: '#94a3b8' },
    { id: 'learning', label: 'Learning/Research', color: '#0891b2' }
  ];

  const phases = [
    { id: 'prelim', label: 'Preliminary Design', shortLabel: 'Prelim' },
    { id: 'schematic', label: 'Schematic Design', shortLabel: 'Schematic' },
    { id: 'dd', label: 'Design Development', shortLabel: 'DD' },
    { id: 'cd', label: 'Construction Documents', shortLabel: 'CD' },
    { id: 'bidding', label: 'Bidding', shortLabel: 'Bidding' },
    { id: 'ca', label: 'Construction Observation', shortLabel: 'CA' }
  ];

  const defaultData = {
    timeEntries: [],
    projects: [],
    goalCategories: [
      {
        id: 'ninety-day',
        name: '90-Day Goals',
        color: '#3b82f6',
        goals: [
          { id: 1, text: 'Quote next project at full value', completed: false },
          { id: 2, text: 'Conversation with contractor #1', completed: false },
          { id: 3, text: 'Conversation with contractor #2', completed: false },
          { id: 4, text: 'Conversation with contractor #3', completed: false },
          { id: 5, text: 'Build AI code compliance workflow', completed: false },
          { id: 6, text: 'Track time for 2 weeks', completed: false },
        ]
      }
    ],
    weeklyNotes: [],
    billingRate: 150,
    revenueGoal: 220000,
    header: { title: 'Studio', subtitle: '$220k goal — Year 2' }
  };

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setSaveStatus('Loading...');
      const response = await fetch(GOOGLE_SCRIPT_URL + '?action=get', { method: 'GET', redirect: 'follow' });
      const result = await response.json();
      if (result.success && result.data) {
        setData({ ...defaultData, ...result.data, header: { ...defaultData.header, ...(result.data.header || {}) } });
        setSaveStatus('Synced ✓');
      } else {
        setData(defaultData);
        setSaveStatus('New');
      }
    } catch (e) {
      console.error('Error loading data:', e);
      setData(defaultData);
      setSaveStatus('Offline');
    }
    setLoading(false);
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const saveData = async (newData) => {
    setData(newData);
    setSaveStatus('Saving...');
    try {
      // Use POST to avoid URL length limits
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', data: newData })
      });
      // no-cors means we can't read the response, so we verify with a GET
      const verifyResponse = await fetch(GOOGLE_SCRIPT_URL + '?action=get', { method: 'GET', redirect: 'follow' });
      const verifyResult = await verifyResponse.json();
      if (verifyResult.success && verifyResult.data) {
        setSaveStatus('Saved ✓');
      } else {
        // Fallback to GET method if POST didn't work
        const url = GOOGLE_SCRIPT_URL + '?action=save&data=' + encodeURIComponent(JSON.stringify(newData));
        const fallbackResponse = await fetch(url, { method: 'GET', redirect: 'follow' });
        const fallbackResult = await fallbackResponse.json();
        setSaveStatus(fallbackResult.success ? 'Saved ✓' : 'Error');
      }
    } catch (e) {
      console.error('Error saving data:', e);
      // Try GET as fallback
      try {
        const url = GOOGLE_SCRIPT_URL + '?action=save&data=' + encodeURIComponent(JSON.stringify(newData));
        const response = await fetch(url, { method: 'GET', redirect: 'follow' });
        const result = await response.json();
        setSaveStatus(result.success ? 'Saved ✓' : 'Error');
      } catch (e2) {
        console.error('Fallback save also failed:', e2);
        setSaveStatus('Offline');
      }
    }
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const startTimer = () => { setTimerRunning(true); setTimerStart(Date.now()); };
  const stopTimer = () => {
    if (timerStart) {
      const hours = (Date.now() - timerStart) / (1000 * 60 * 60);
      addTimeEntry(hours, timerCategory, timerProject, null, timerDescription);
    }
    setTimerRunning(false);
    setTimerStart(null);
    setTimerDescription('');
  };

  const addTimeEntry = (hours, category, project, date = null, description = '') => {
    const entry = { id: Date.now(), date: date || new Date().toISOString(), hours: Math.round(hours * 100) / 100, category, project, description };
    saveData({ ...data, timeEntries: [...data.timeEntries, entry] });
  };

  const updateTimeEntry = (id, updates) => {
    const newEntries = data.timeEntries.map(entry => entry.id === id ? { ...entry, ...updates } : entry);
    saveData({ ...data, timeEntries: newEntries });
    setEditingEntry(null);
  };

  const deleteTimeEntry = (id) => {
    const newEntries = data.timeEntries.filter(entry => entry.id !== id);
    saveData({ ...data, timeEntries: newEntries });
    setEditingEntry(null);
  };

  const addProject = (name, totalFee, type, phaseFees) => {
    const project = { id: Date.now(), name, fee: parseFloat(totalFee) || 0, type, phaseFees: phaseFees || { prelim: 0, schematic: 0, dd: 0, cd: 0, bidding: 0, ca: 0 }, invoices: [], createdAt: new Date().toISOString() };
    saveData({ ...data, projects: [...data.projects, project] });
    setShowAddProject(false);
  };

  const updateProject = (id, updates) => {
    const newProjects = data.projects.map(p => p.id === id ? { ...p, ...updates } : p);
    saveData({ ...data, projects: newProjects });
    setEditingProject(null);
  };

  const deleteProject = (id) => { saveData({ ...data, projects: data.projects.filter(p => p.id !== id) }); };

  const addInvoice = (projectId, amount, phase, date) => {
    const newProjects = data.projects.map(p => {
      if (p.id === projectId) {
        const invoice = { id: Date.now(), amount: parseFloat(amount), phase, dateSent: date, datePaid: null, status: 'sent' };
        return { ...p, invoices: [...(p.invoices || []), invoice] };
      }
      return p;
    });
    saveData({ ...data, projects: newProjects });
  };

  const markInvoicePaid = (projectId, invoiceId, datePaid) => {
    const newProjects = data.projects.map(p => {
      if (p.id === projectId) {
        return { ...p, invoices: (p.invoices || []).map(inv => inv.id === invoiceId ? { ...inv, status: 'paid', datePaid } : inv) };
      }
      return p;
    });
    saveData({ ...data, projects: newProjects });
  };

  const deleteInvoice = (projectId, invoiceId) => {
    const newProjects = data.projects.map(p => p.id === projectId ? { ...p, invoices: (p.invoices || []).filter(inv => inv.id !== invoiceId) } : p);
    saveData({ ...data, projects: newProjects });
  };

  const toggleGoal = (categoryId, goalId) => {
    const newCategories = (data.goalCategories || []).map(cat => cat.id === categoryId ? { ...cat, goals: cat.goals.map(g => g.id === goalId ? { ...g, completed: !g.completed } : g) } : cat);
    saveData({ ...data, goalCategories: newCategories });
  };

  const addGoalCategory = (name, color) => {
    const newCategory = { id: Date.now().toString(), name, color: color || '#3b82f6', goals: [] };
    saveData({ ...data, goalCategories: [...(data.goalCategories || []), newCategory] });
  };

  const updateGoalCategory = (categoryId, updates) => {
    const newCategories = (data.goalCategories || []).map(cat => cat.id === categoryId ? { ...cat, ...updates } : cat);
    saveData({ ...data, goalCategories: newCategories });
  };

  const deleteGoalCategory = (categoryId) => { saveData({ ...data, goalCategories: (data.goalCategories || []).filter(cat => cat.id !== categoryId) }); };

  const addGoal = (categoryId, text) => {
    const newCategories = (data.goalCategories || []).map(cat => cat.id === categoryId ? { ...cat, goals: [...cat.goals, { id: Date.now(), text, completed: false }] } : cat);
    saveData({ ...data, goalCategories: newCategories });
  };

  const deleteGoal = (categoryId, goalId) => {
    const newCategories = (data.goalCategories || []).map(cat => cat.id === categoryId ? { ...cat, goals: cat.goals.filter(g => g.id !== goalId) } : cat);
    saveData({ ...data, goalCategories: newCategories });
  };

  const getWeeklyHours = () => {
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    return data.timeEntries.filter(e => new Date(e.date) > weekAgo).reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + e.hours; return acc; }, {});
  };

  const getWeeklyHoursByProject = () => {
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    return data.timeEntries.filter(e => new Date(e.date) > weekAgo).reduce((acc, e) => { const key = e.project || 'No Project'; acc[key] = (acc[key] || 0) + e.hours; return acc; }, {});
  };

  const is2026 = (dateStr) => { if (!dateStr) return false; return new Date(dateStr).getFullYear() === 2026; };
  const getTotalBilled2026 = () => data.projects.reduce((sum, p) => sum + (p.invoices || []).filter(i => is2026(i.dateSent)).reduce((s, i) => s + i.amount, 0), 0);
  const getTotalPaid2026 = () => data.projects.reduce((sum, p) => sum + (p.invoices || []).filter(i => i.status === 'paid' && is2026(i.datePaid || i.dateSent)).reduce((s, i) => s + i.amount, 0), 0);
  const getProjectedRevenue2026 = () => data.projects.reduce((sum, p) => { const has2026 = is2026(p.createdAt) || (p.invoices || []).some(i => is2026(i.dateSent)); return has2026 ? sum + p.fee : sum; }, 0);
  const getTotalBilled = () => data.projects.reduce((sum, p) => sum + (p.invoices || []).reduce((s, i) => s + i.amount, 0), 0);
  const getTotalPaid = () => data.projects.reduce((sum, p) => sum + (p.invoices || []).filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0), 0);
  const getTotalHours = (projectName = null) => { let entries = data.timeEntries; if (projectName) entries = entries.filter(e => e.project === projectName); return entries.reduce((sum, e) => sum + e.hours, 0); };
  const getHoursValue = (projectName = null) => getTotalHours(projectName) * (data.billingRate || 0);
  const getGoalProgress = () => { const cats = data.goalCategories || []; const all = cats.flatMap(c => c.goals); if (all.length === 0) return 0; return Math.round((all.filter(g => g.completed).length / all.length) * 100); };
  const getTotalGoalsCount = () => (data.goalCategories || []).reduce((sum, cat) => sum + cat.goals.length, 0);
  const getCompletedGoalsCount = () => (data.goalCategories || []).reduce((sum, cat) => sum + cat.goals.filter(g => g.completed).length, 0);
  const getPhaseBilling = (project, phaseId) => {
    const phaseFee = (project.phaseFees || {})[phaseId] || 0;
    const phaseInvoiced = (project.invoices || []).filter(inv => inv.phase === phaseId).reduce((sum, inv) => sum + inv.amount, 0);
    const phasePaid = (project.invoices || []).filter(inv => inv.phase === phaseId && inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
    return { fee: phaseFee, invoiced: phaseInvoiced, paid: phasePaid };
  };

  const weeklyHours = getWeeklyHours();
  const weeklyHoursByProject = getWeeklyHoursByProject();
  const totalWeeklyHours = Object.values(weeklyHours).reduce((a, b) => a + b, 0);
  const toggleProjectExpanded = (projectId) => { setExpandedProjects(prev => ({ ...prev, [projectId]: !prev[projectId] })); };
  const toggleTimeProjectExpanded = (projectName) => { setExpandedTimeProjects(prev => ({ ...prev, [projectName]: !prev[projectName] })); };

  const getFilteredTimeEntries = () => {
    const now = new Date();
    let startDate = null;
    let endDate = now;

    switch (timeFilter) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'custom':
        if (customDateRange.start) startDate = new Date(customDateRange.start);
        if (customDateRange.end) endDate = new Date(customDateRange.end + 'T23:59:59');
        break;
      case 'total':
      default:
        return data.timeEntries;
    }

    return data.timeEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      if (startDate && entryDate < startDate) return false;
      if (endDate && entryDate > endDate) return false;
      return true;
    });
  };

  const getEntriesGroupedByProject = () => {
    const filtered = getFilteredTimeEntries();
    const grouped = {};

    filtered.forEach(entry => {
      const projectName = entry.project || 'No Project';
      if (!grouped[projectName]) {
        grouped[projectName] = { totalHours: 0, phases: {} };
      }
      grouped[projectName].totalHours += entry.hours;

      const phase = entry.category;
      if (!grouped[projectName].phases[phase]) {
        grouped[projectName].phases[phase] = { hours: 0, entries: [] };
      }
      grouped[projectName].phases[phase].hours += entry.hours;
      grouped[projectName].phases[phase].entries.push(entry);
    });

    // Sort projects by total hours descending
    return Object.entries(grouped)
      .sort(([, a], [, b]) => b.totalHours - a.totalHours)
      .reduce((acc, [key, value]) => { acc[key] = value; return acc; }, {});
  };

  const getFilteredTotalHours = () => {
    return getFilteredTimeEntries().reduce((sum, e) => sum + e.hours, 0);
  };

  const getFilterLabel = () => {
    switch (timeFilter) {
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'year': return '2026';
      case 'custom': return 'Custom Range';
      case 'total':
      default: return 'All Time';
    }
  };

  const getProjectHoursByCategory = (projectName) => {
    return data.timeEntries.filter(e => e.project === projectName).reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + e.hours; return acc; }, {});
  };

  const getProjectWeeklyHours = (projectName) => {
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    return data.timeEntries.filter(e => e.project === projectName && new Date(e.date) > weekAgo).reduce((sum, e) => sum + e.hours, 0);
  };

  const getProjectMonthlyHours = (projectName) => {
    const monthAgo = new Date(); monthAgo.setDate(monthAgo.getDate() - 30);
    return data.timeEntries.filter(e => e.project === projectName && new Date(e.date) > monthAgo).reduce((sum, e) => sum + e.hours, 0);
  };

  if (loading) return <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center"><div className="text-slate-400">Loading...</div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-4 py-5 sticky top-0 z-40">
        <div className="max-w-lg mx-auto flex items-start justify-between">
          <button onClick={() => setShowSettings(true)} className="text-left hover:opacity-70 transition-opacity">
            <h1 className="text-xl font-semibold text-slate-900 tracking-tight">{data.header?.title || 'Studio'}</h1>
            <p className="text-sm text-slate-500 mt-0.5">{data.header?.subtitle || '$220k goal — Year 2'}</p>
          </button>
          <div className="flex items-center gap-2">
            {saveStatus && <span className={`text-xs px-2 py-1 rounded-full ${saveStatus.includes('✓') ? 'bg-emerald-100 text-emerald-700' : saveStatus.includes('Error') || saveStatus.includes('Offline') ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'}`}>{saveStatus}</span>}
            <button onClick={() => setShowSettings(true)} className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"><Settings className="w-5 h-5" /></button>
          </div>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-lg border-b border-slate-200/60 sticky top-16 z-30">
        <div className="max-w-lg mx-auto flex">
          {[{ id: 'dashboard', icon: TrendingUp, label: 'Overview' }, { id: 'time', icon: Clock, label: 'Time' }, { id: 'projects', icon: Briefcase, label: 'Projects' }, { id: 'goals', icon: Target, label: 'Goals' }].map(tab => (
            <button key={tab.id} onClick={() => setView(tab.id)} className={`flex-1 py-3.5 text-center text-sm font-medium transition-all duration-200 relative ${view === tab.id ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
              <tab.icon className={`w-5 h-5 mx-auto mb-1 transition-transform duration-200 ${view === tab.id ? 'scale-110' : ''}`} />
              <span className="text-xs">{tab.label}</span>
              {view === tab.id && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-slate-900 rounded-full" />}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 pb-8">
        {view === 'dashboard' && (
          <div className="space-y-6">
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 shadow-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-full blur-3xl -translate-y-32 translate-x-32" />
              <div className="relative">
                <div className="text-slate-400 text-sm font-medium tracking-wide uppercase mb-2">2026 Revenue Goal</div>
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-4xl font-light text-white tracking-tight">${getTotalPaid2026().toLocaleString()}</span>
                  <span className="text-slate-500">of ${(data.revenueGoal || 220000).toLocaleString()}</span>
                </div>
                <div className="space-y-3">
                  <div className="relative h-3 bg-slate-700/50 rounded-full overflow-hidden">
                    <div className="absolute inset-y-0 left-0 bg-slate-600 rounded-full transition-all duration-500" style={{ width: `${Math.min((getProjectedRevenue2026() / (data.revenueGoal || 220000)) * 100, 100)}%` }} />
                    <div className="absolute inset-y-0 left-0 bg-amber-500/80 rounded-full transition-all duration-500" style={{ width: `${Math.min((getTotalBilled2026() / (data.revenueGoal || 220000)) * 100, 100)}%` }} />
                    <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500 shadow-lg shadow-emerald-500/30" style={{ width: `${Math.min((getTotalPaid2026() / (data.revenueGoal || 220000)) * 100, 100)}%` }} />
                  </div>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500" /><span className="text-emerald-400 font-medium">${getTotalPaid2026().toLocaleString()}</span><span className="text-slate-500">paid</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500/80" /><span className="text-amber-400 font-medium">${getTotalBilled2026().toLocaleString()}</span><span className="text-slate-500">invoiced</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-600" /><span className="text-slate-400 font-medium">${getProjectedRevenue2026().toLocaleString()}</span><span className="text-slate-500">projected</span></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60">
              <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-slate-800">Time vs Revenue</h3><span className="text-sm text-slate-400">${data.billingRate || 0}/hr</span></div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center"><div className="text-2xl font-light text-slate-800">{getTotalHours().toFixed(0)}</div><div className="text-xs text-slate-500 mt-0.5">Hours</div></div>
                <div className="text-center border-l border-r border-slate-100"><div className="text-2xl font-light text-blue-600">${(getHoursValue() / 1000).toFixed(0)}k</div><div className="text-xs text-slate-500 mt-0.5">Value</div></div>
                <div className="text-center"><div className="text-2xl font-light text-emerald-600">${(getTotalPaid() / 1000).toFixed(0)}k</div><div className="text-xs text-slate-500 mt-0.5">Paid</div></div>
              </div>
              <div className="space-y-2">
                {[{ label: 'Tracked', value: getHoursValue(), color: 'bg-blue-500' }, { label: 'Invoiced', value: getTotalBilled(), color: 'bg-amber-500' }, { label: 'Paid', value: getTotalPaid(), color: 'bg-emerald-500' }].map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-16">{item.label}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${item.color} rounded-full transition-all duration-500`} style={{ width: `${Math.min((item.value / Math.max(getHoursValue(), getTotalBilled(), getTotalPaid(), 1)) * 100, 100)}%` }} /></div>
                    <span className="text-xs font-medium text-slate-600 w-16 text-right">${item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {(data.goalCategories || []).map(category => {
                const completed = category.goals.filter(g => g.completed).length;
                const total = category.goals.length;
                const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
                return (
                  <div key={category.id} className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} /><h3 className="font-semibold text-slate-800">{category.name}</h3></div>
                        <div className="flex items-center gap-2"><span className="text-2xl font-light text-slate-800">{completed}</span><span className="text-slate-400">/</span><span className="text-slate-400">{total}</span></div>
                      </div>
                      {total > 0 && <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: category.color }} /></div>}
                    </div>
                    <div className="divide-y divide-slate-100">
                      {category.goals.slice(0, 3).map(goal => (
                        <button key={goal.id} onClick={() => toggleGoal(category.id, goal.id)} className="w-full px-5 py-3 flex items-center gap-3 text-left hover:bg-slate-50/80 transition-all duration-200 group">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${goal.completed ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 group-hover:border-slate-400'}`}>{goal.completed && <Check className="w-3 h-3 text-white" strokeWidth={3} />}</div>
                          <span className={`flex-1 text-sm transition-all duration-200 ${goal.completed ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-700'}`}>{goal.text}</span>
                        </button>
                      ))}
                      {category.goals.length > 3 && <button onClick={() => setView('goals')} className="w-full px-5 py-3 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors text-left">+{category.goals.length - 3} more...</button>}
                      {category.goals.length === 0 && <div className="px-5 py-4 text-sm text-slate-400">No goals yet</div>}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60">
              <div className="flex items-center justify-between mb-5"><h3 className="font-semibold text-slate-800">This Week</h3><div className="text-right"><span className="text-2xl font-light text-slate-800">{totalWeeklyHours.toFixed(1)}</span><span className="text-slate-400 ml-1">hrs</span></div></div>
              {totalWeeklyHours === 0 ? <div className="text-center py-8 text-slate-400"><Clock className="w-8 h-8 mx-auto mb-2 opacity-40" /><p className="text-sm">No time tracked this week</p></div> : (
                <>
                  <div className="mb-5"><div className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">By Project</div><div className="space-y-3">
                    {Object.entries(weeklyHoursByProject).sort(([,a], [,b]) => b - a).map(([projectName, hours]) => {
                      const percent = totalWeeklyHours > 0 ? (hours / totalWeeklyHours) * 100 : 0;
                      const project = data.projects.find(p => p.name === projectName);
                      const projectColor = project?.type === 'commercial' ? '#3b82f6' : '#f59e0b';
                      return (<div key={projectName}><div className="flex items-center justify-between mb-1.5"><div className="flex items-center gap-2"><span className="text-sm text-slate-700">{projectName}</span>{project && <span className={`text-xs px-1.5 py-0.5 rounded ${project.type === 'commercial' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>{project.type === 'commercial' ? 'Com' : 'Res'}</span>}</div><span className="text-sm font-medium text-slate-800">{hours.toFixed(1)}h</span></div><div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${percent}%`, backgroundColor: projectName === 'No Project' ? '#94a3b8' : projectColor }} /></div></div>);
                    })}
                  </div></div>
                  <div className="pt-4 border-t border-slate-100"><div className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">By Category</div><div className="space-y-3">
                    {categories.map(cat => { const hours = weeklyHours[cat.id] || 0; if (hours === 0) return null; const percent = totalWeeklyHours > 0 ? (hours / totalWeeklyHours) * 100 : 0; return (<div key={cat.id}><div className="flex items-center justify-between mb-1.5"><span className="text-sm text-slate-600">{cat.label}</span><span className="text-sm font-medium text-slate-800">{hours.toFixed(1)}h</span></div><div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${percent}%`, backgroundColor: cat.color }} /></div></div>); })}
                  </div></div>
                </>
              )}
            </div>
          </div>
        )}

        {view === 'time' && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60">
              <div className="text-center">
                {timerRunning ? (
                  <>
                    <div className="text-5xl font-extralight text-slate-900 tracking-tight mb-3"><TimerDisplay start={timerStart} /></div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-sm text-slate-600 mb-2"><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />{categories.find(c => c.id === timerCategory)?.label}{timerProject && <span className="text-slate-400">• {timerProject}</span>}</div>
                    {timerDescription && <div className="text-sm text-slate-500 mb-4">{timerDescription}</div>}
                    <button onClick={stopTimer} className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center justify-center mx-auto hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg shadow-red-500/30 active:scale-95"><Square className="w-5 h-5" fill="white" /></button>
                  </>
                ) : (
                  <>
                    <div className="space-y-3 mb-6">
                      <select value={timerCategory} onChange={(e) => setTimerCategory(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all">
                        <optgroup label="Project Phases">{categories.filter(c => ['prelim', 'schematic', 'dd', 'cd', 'bidding', 'ca'].includes(c.id)).map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}</optgroup>
                        <optgroup label="Business">{categories.filter(c => ['meetings', 'bizdev', 'marketing', 'accounting', 'admin', 'learning'].includes(c.id)).map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}</optgroup>
                      </select>
                      <select value={timerProject} onChange={(e) => setTimerProject(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all">
                        <option value="">No project</option>
                        {data.projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                      </select>
                      <input type="text" value={timerDescription} onChange={(e) => setTimerDescription(e.target.value)} placeholder="What are you working on?" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all" />
                    </div>
                    <button onClick={startTimer} className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center mx-auto hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg shadow-emerald-500/30 active:scale-95"><Play className="w-6 h-6 ml-0.5" fill="white" /></button>
                    <p className="text-slate-400 text-sm mt-3">Tap to start</p>
                  </>
                )}
              </div>
            </div>

            <button onClick={() => setShowAddTime(true)} className="w-full bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60 flex items-center justify-between text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 group">
              <span className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors"><Plus className="w-5 h-5 text-slate-500" /></div><span className="font-medium">Add time manually</span></span>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Date Filter Controls */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60">
              <div className="flex flex-wrap gap-2 mb-3">
                {[
                  { id: 'week', label: 'Week' },
                  { id: 'month', label: 'Month' },
                  { id: 'year', label: '2026' },
                  { id: 'total', label: 'All Time' },
                  { id: 'custom', label: 'Custom' }
                ].map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => setTimeFilter(filter.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${timeFilter === filter.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
              {timeFilter === 'custom' && (
                <div className="flex gap-2 mt-3">
                  <input
                    type="date"
                    value={customDateRange.start}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                    placeholder="Start date"
                  />
                  <input
                    type="date"
                    value={customDateRange.end}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                    placeholder="End date"
                  />
                </div>
              )}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm text-slate-500">{getFilterLabel()}</span>
                <span className="text-lg font-semibold text-slate-800">{getFilteredTotalHours().toFixed(1)} hours</span>
              </div>
            </div>

            {/* Hours Grouped by Project */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-800">Hours by Project</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {Object.entries(getEntriesGroupedByProject()).map(([projectName, projectData]) => {
                  const project = data.projects.find(p => p.name === projectName);
                  const isExpanded = expandedTimeProjects[projectName];
                  return (
                    <div key={projectName} className="bg-white">
                      <button
                        onClick={() => toggleTimeProjectExpanded(projectName)}
                        className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${projectName === 'No Project' ? 'bg-slate-400' : project?.type === 'commercial' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                          <div className="text-left">
                            <div className="font-medium text-slate-800">{projectName}</div>
                            <div className="text-xs text-slate-400">{Object.keys(projectData.phases).length} categories</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-semibold text-slate-800">{projectData.totalHours.toFixed(1)}h</span>
                          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="px-5 pb-4 space-y-3">
                          {Object.entries(projectData.phases)
                            .sort(([, a], [, b]) => b.hours - a.hours)
                            .map(([phaseId, phaseData]) => {
                              const cat = categories.find(c => c.id === phaseId);
                              const percent = projectData.totalHours > 0 ? (phaseData.hours / projectData.totalHours) * 100 : 0;
                              return (
                                <div key={phaseId} className="ml-6">
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat?.color || '#94a3b8' }} />
                                      <span className="text-sm text-slate-600">{cat?.label || phaseId}</span>
                                    </div>
                                    <span className="text-sm font-medium text-slate-700">{phaseData.hours.toFixed(1)}h</span>
                                  </div>
                                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden ml-4">
                                    <div className="h-full rounded-full transition-all" style={{ width: `${percent}%`, backgroundColor: cat?.color || '#94a3b8' }} />
                                  </div>
                                  {/* Individual entries */}
                                  <div className="mt-2 ml-4 space-y-1">
                                    {phaseData.entries.slice().reverse().map(entry => (
                                      editingEntry?.id === entry.id ? (
                                        <EditTimeEntryForm
                                          key={entry.id}
                                          entry={entry}
                                          categories={categories}
                                          projects={data.projects}
                                          onSave={(updates) => updateTimeEntry(entry.id, updates)}
                                          onCancel={() => setEditingEntry(null)}
                                          onDelete={() => deleteTimeEntry(entry.id)}
                                        />
                                      ) : (
                                        <div key={entry.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 group text-xs">
                                          <div className="flex items-center gap-2">
                                            <span className="text-slate-400">{new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                            {entry.description && <span className="text-slate-500 truncate max-w-[150px]">{entry.description}</span>}
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium text-slate-600">{entry.hours}h</span>
                                            <button onClick={(e) => { e.stopPropagation(); setEditingEntry(entry); }} className="p-1 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded transition-all opacity-0 group-hover:opacity-100"><Edit2 className="w-3 h-3" /></button>
                                          </div>
                                        </div>
                                      )
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  );
                })}
                {Object.keys(getEntriesGroupedByProject()).length === 0 && (
                  <div className="px-5 py-12 text-center">
                    <Clock className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                    <p className="text-slate-400">No time entries for this period</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {view === 'projects' && (
          <div className="space-y-5">
            <button onClick={() => setShowAddProject(true)} className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-4 font-medium hover:from-slate-800 hover:to-slate-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 active:scale-[0.98]"><Plus className="w-5 h-5" />Add Project</button>
            {data.projects.map(project => {
              const totalInvoiced = (project.invoices || []).reduce((sum, inv) => sum + inv.amount, 0);
              const totalPaid = (project.invoices || []).filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
              const unpaidAmount = totalInvoiced - totalPaid;
              const projectHours = getTotalHours(project.name);
              const projectTimeValue = getHoursValue(project.name);
              const isExpanded = expandedProjects[project.id];
              return (
                <div key={project.id} className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div><div className="font-semibold text-slate-900 text-lg">{project.name}</div><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${project.type === 'commercial' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{project.type}</span></div>
                      <div className="flex gap-1"><button onClick={() => setEditingProject(project)} className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"><Edit2 className="w-4 h-4" /></button><button onClick={() => deleteProject(project.id)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button></div>
                    </div>
                    <div className="text-3xl font-light text-slate-900 mb-4">${project.fee.toLocaleString()}</div>
                    {projectHours > 0 && (
                      <div className="mb-4">
                        <button onClick={() => setShowProjectHoursDetail(showProjectHoursDetail === project.id ? null : project.id)} className="w-full p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400" /><span className="text-slate-600">{projectHours.toFixed(1)} hrs tracked</span><ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showProjectHoursDetail === project.id ? 'rotate-180' : ''}`} /></div>
                            <span className="font-medium text-blue-600">${projectTimeValue.toLocaleString()} value</span>
                          </div>
                        </button>
                        {showProjectHoursDetail === project.id && (
                          <div className="mt-2 p-3 bg-slate-50 rounded-xl space-y-3">
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div className="bg-white rounded-lg p-2"><div className="text-lg font-medium text-slate-800">{getProjectWeeklyHours(project.name).toFixed(1)}</div><div className="text-xs text-slate-500">This Week</div></div>
                              <div className="bg-white rounded-lg p-2"><div className="text-lg font-medium text-slate-800">{getProjectMonthlyHours(project.name).toFixed(1)}</div><div className="text-xs text-slate-500">This Month</div></div>
                              <div className="bg-white rounded-lg p-2"><div className="text-lg font-medium text-slate-800">{projectHours.toFixed(1)}</div><div className="text-xs text-slate-500">All Time</div></div>
                            </div>
                            <div className="pt-2 border-t border-slate-200">
                              <div className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">By Category</div>
                              <div className="space-y-2">
                                {Object.entries(getProjectHoursByCategory(project.name)).sort(([,a], [,b]) => b - a).map(([catId, hrs]) => {
                                  const cat = categories.find(c => c.id === catId);
                                  const percent = projectHours > 0 ? (hrs / projectHours) * 100 : 0;
                                  return (
                                    <div key={catId}>
                                      <div className="flex items-center justify-between text-sm mb-1">
                                        <span className="text-slate-600">{cat?.label || catId}</span>
                                        <span className="font-medium text-slate-700">{hrs.toFixed(1)}h</span>
                                      </div>
                                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all" style={{ width: `${percent}%`, backgroundColor: cat?.color || '#94a3b8' }} />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-full"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-sm font-medium text-emerald-700">${totalPaid.toLocaleString()}</span><span className="text-sm text-emerald-600">paid</span></div>
                      {unpaidAmount > 0 && <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-full"><div className="w-2 h-2 rounded-full bg-amber-500" /><span className="text-sm font-medium text-amber-700">${unpaidAmount.toLocaleString()}</span><span className="text-sm text-amber-600">outstanding</span></div>}
                    </div>
                    <div className="mb-4"><div className="flex justify-between text-xs text-slate-500 mb-2"><span>Overall Billing Progress</span><span className="font-medium">{project.fee > 0 ? Math.round((totalInvoiced / project.fee) * 100) : 0}%</span></div><div className="h-2.5 bg-slate-100 rounded-full overflow-hidden flex"><div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500" style={{ width: `${project.fee > 0 ? (totalPaid / project.fee) * 100 : 0}%` }} /><div className="h-full bg-amber-400 transition-all duration-500" style={{ width: `${project.fee > 0 ? (unpaidAmount / project.fee) * 100 : 0}%` }} /></div></div>
                    <button onClick={() => toggleProjectExpanded(project.id)} className="w-full flex items-center justify-between py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"><span>Phase Breakdown</span><ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} /></button>
                    {isExpanded && (
                      <div className="mt-3 space-y-3 pt-3 border-t border-slate-100">
                        {phases.map(phase => { const billing = getPhaseBilling(project, phase.id); const hasPhase = billing.fee > 0 || billing.invoiced > 0; if (!hasPhase) return null; const phasePercent = billing.fee > 0 ? Math.round((billing.paid / billing.fee) * 100) : (billing.paid > 0 ? 100 : 0); return (<div key={phase.id}><div className="flex justify-between text-sm mb-1"><span className="text-slate-600">{phase.shortLabel}</span><span className="text-slate-500"><span className={billing.paid >= billing.fee && billing.fee > 0 ? 'text-emerald-600 font-medium' : ''}>${billing.invoiced.toLocaleString()}</span>{billing.fee > 0 && <span className="text-slate-300"> / ${billing.fee.toLocaleString()}</span>}<span className="ml-2 text-xs">({phasePercent}%)</span></span></div><div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all ${billing.paid >= billing.fee && billing.fee > 0 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(phasePercent, 100)}%` }} /></div></div>); })}
                        {phases.every(phase => { const billing = getPhaseBilling(project, phase.id); return billing.fee === 0 && billing.invoiced === 0; }) && <p className="text-sm text-slate-400 text-center py-2">No phases set up yet</p>}
                      </div>
                    )}
                  </div>
                  <div className="border-t border-slate-100 px-5 py-3 bg-slate-50/50 flex gap-3">
                    <button onClick={() => setShowInvoiceModal(project)} className="flex-1 text-sm text-emerald-600 font-medium hover:text-emerald-700 py-2 px-4 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all">+ Add Invoice</button>
                    {(project.invoices || []).length > 0 && <button onClick={() => setEditingProject({ ...project, viewInvoices: true })} className="flex-1 text-sm text-slate-600 font-medium hover:text-slate-700 py-2 px-4 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all">View ({(project.invoices || []).length})</button>}
                  </div>
                </div>
              );
            })}
            {data.projects.length === 0 && <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-200/60 text-center"><Briefcase className="w-12 h-12 mx-auto mb-4 text-slate-300" /><p className="text-slate-500 font-medium">No projects yet</p></div>}
          </div>
        )}

        {view === 'goals' && (
          <div className="space-y-5">
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-6 shadow-xl">
              <div className="relative"><div className="text-blue-200 text-sm font-medium tracking-wide uppercase mb-2">Overall Progress</div><div className="flex items-baseline gap-2"><span className="text-5xl font-light text-white">{getCompletedGoalsCount()}</span><span className="text-2xl text-blue-300">/</span><span className="text-2xl text-blue-300">{getTotalGoalsCount()}</span><span className="text-blue-200 ml-2">complete</span></div><div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden"><div className="h-full bg-white rounded-full transition-all duration-500 shadow-lg" style={{ width: `${getGoalProgress()}%` }} /></div></div>
            </div>
            <button onClick={() => setShowAddGoalCategory(true)} className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-4 font-medium hover:from-slate-800 hover:to-slate-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 active:scale-[0.98]"><Plus className="w-5 h-5" />Add Goal Category</button>
            {(data.goalCategories || []).map(category => (
              <div key={category.id} className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} /><h3 className="font-semibold text-slate-800">{category.name}</h3></div><div className="flex items-center gap-3"><span className="text-xl font-light text-slate-800">{category.goals.filter(g => g.completed).length}/{category.goals.length}</span><button onClick={() => setEditingGoalCategory(category)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"><Edit2 className="w-4 h-4" /></button></div></div></div>
                <div className="divide-y divide-slate-100">
                  {category.goals.map(goal => (<div key={goal.id} className="flex items-center"><button onClick={() => toggleGoal(category.id, goal.id)} className="flex-1 px-5 py-4 flex items-center gap-4 text-left hover:bg-slate-50/80 transition-all duration-200 group"><div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${goal.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 group-hover:border-slate-400'}`}>{goal.completed && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}</div><span className={`flex-1 ${goal.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{goal.text}</span></button><button onClick={() => deleteGoal(category.id, goal.id)} className="pr-4 p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button></div>))}
                </div>
                <div className="border-t border-slate-100 px-5 py-3 bg-slate-50/50"><button onClick={() => setShowAddGoal(category.id)} className="w-full text-sm text-slate-500 font-medium hover:text-slate-700 py-2 flex items-center justify-center gap-2 hover:bg-slate-100 rounded-xl transition-all"><Plus className="w-4 h-4" /> Add Goal</button></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddTime && <Modal onClose={() => setShowAddTime(false)}><AddTimeForm categories={categories} projects={data.projects} onAdd={(hours, category, project, date, description) => { addTimeEntry(parseFloat(hours), category, project, date, description); setShowAddTime(false); }} /></Modal>}
      {showAddProject && <Modal onClose={() => setShowAddProject(false)}><AddProjectForm phases={phases} onAdd={addProject} /></Modal>}
      {editingProject && !editingProject.viewInvoices && <Modal onClose={() => setEditingProject(null)}><EditProjectForm project={editingProject} phases={phases} onSave={(updates) => updateProject(editingProject.id, updates)} /></Modal>}
      {editingProject && editingProject.viewInvoices && <Modal onClose={() => setEditingProject(null)}><ViewInvoicesModal project={editingProject} onMarkPaid={markInvoicePaid} onDelete={deleteInvoice} /></Modal>}
      {showInvoiceModal && <Modal onClose={() => setShowInvoiceModal(null)}><AddInvoiceForm project={showInvoiceModal} onAdd={(amount, phase, date) => { addInvoice(showInvoiceModal.id, amount, phase, date); setShowInvoiceModal(null); }} /></Modal>}
      {showSettings && <Modal onClose={() => setShowSettings(false)}><SettingsForm billingRate={data.billingRate || 0} header={data.header || {}} revenueGoal={data.revenueGoal || 220000} onSave={(rate, header, goal) => { saveData({ ...data, billingRate: parseFloat(rate) || 0, header, revenueGoal: parseFloat(goal) || 220000 }); setShowSettings(false); }} /></Modal>}
      {showAddGoalCategory && <Modal onClose={() => setShowAddGoalCategory(false)}><AddGoalCategoryForm onAdd={(name, color) => { addGoalCategory(name, color); setShowAddGoalCategory(false); }} /></Modal>}
      {editingGoalCategory && <Modal onClose={() => setEditingGoalCategory(null)}><EditGoalCategoryForm category={editingGoalCategory} onSave={(updates) => { updateGoalCategory(editingGoalCategory.id, updates); setEditingGoalCategory(null); }} onDelete={() => { deleteGoalCategory(editingGoalCategory.id); setEditingGoalCategory(null); }} /></Modal>}
      {showAddGoal && <Modal onClose={() => setShowAddGoal(null)}><AddGoalForm onAdd={(text) => { addGoal(showAddGoal, text); setShowAddGoal(null); }} /></Modal>}
    </div>
  );
}

function TimerDisplay({ start }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => { const interval = setInterval(() => setElapsed(Date.now() - start), 1000); return () => clearInterval(interval); }, [start]);
  const hours = Math.floor(elapsed / 3600000); const minutes = Math.floor((elapsed % 3600000) / 60000); const seconds = Math.floor((elapsed % 60000) / 1000);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function Modal({ children, onClose }) {
  return (<div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50"><div className="bg-white w-full sm:w-[420px] sm:rounded-2xl rounded-t-2xl max-h-[85vh] overflow-auto shadow-2xl"><div className="flex justify-end p-3 sticky top-0 bg-white/80 backdrop-blur-xl z-10"><button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"><X className="w-5 h-5" /></button></div><div className="px-6 pb-8">{children}</div></div></div>);
}

function AddTimeForm({ categories, projects, onAdd }) {
  const [hours, setHours] = useState(''); const [category, setCategory] = useState('prelim'); const [project, setProject] = useState(''); const [date, setDate] = useState(new Date().toISOString().split('T')[0]); const [description, setDescription] = useState('');
  return (
    <div className="space-y-5">
      <h3 className="text-xl font-semibold text-slate-900">Add Time</h3>
      <div><label className="block text-sm font-medium text-slate-700 mb-2">Date</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl" /></div>
      <div><label className="block text-sm font-medium text-slate-700 mb-2">Hours</label><input type="number" step="0.25" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="1.5" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl" /></div>
      <div><label className="block text-sm font-medium text-slate-700 mb-2">Category</label><select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl"><optgroup label="Project Phases">{categories.filter(c => ['prelim', 'schematic', 'dd', 'cd', 'bidding', 'ca'].includes(c.id)).map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}</optgroup><optgroup label="Business">{categories.filter(c => ['meetings', 'bizdev', 'marketing', 'accounting', 'admin', 'learning'].includes(c.id)).map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}</optgroup></select></div>
      <div><label className="block text-sm font-medium text-slate-700 mb-2">Project</label><select value={project} onChange={(e) => setProject(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl"><option value="">No project</option>{projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}</select></div>
      <div><label className="block text-sm font-medium text-slate-700 mb-2">Description</label><input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What did you work on?" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl" /></div>
      <button onClick={() => hours && onAdd(hours, category, project, new Date(date + 'T12:00:00').toISOString(), description)} disabled={!hours} className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-4 font-medium disabled:opacity-50">Add Entry</button>
    </div>
  );
}

function AddProjectForm({ phases, onAdd }) {
  const [name, setName] = useState(''); const [totalFee, setTotalFee] = useState(''); const [type, setType] = useState('residential'); const [phaseFees, setPhaseFees] = useState({ prelim: '', schematic: '', dd: '', cd: '', bidding: '', ca: '' });
  const handlePhaseFeeChange = (phaseId, value) => { setPhaseFees(prev => ({ ...prev, [phaseId]: value })); };
  const getPhaseFeesForSubmit = () => { const result = {}; phases.forEach(p => { result[p.id] = parseFloat(phaseFees[p.id]) || 0; }); return result; };
  return (
    <div className="space-y-5">
      <h3 className="text-xl font-semibold text-slate-900">Add Project</h3>
      <div><label className="block text-sm font-medium text-slate-700 mb-2">Project Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Smith Residence" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl" /></div>
      <div><label className="block text-sm font-medium text-slate-700 mb-2">Total Fee</label><input type="number" value={totalFee} onChange={(e) => setTotalFee(e.target.value)} placeholder="50000" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl" /></div>
      <div><label className="block text-sm font-medium text-slate-700 mb-2">Type</label><div className="flex gap-3"><button type="button" onClick={() => setType('residential')} className={`flex-1 p-3 rounded-xl border-2 transition-all ${type === 'residential' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-200 text-slate-500'}`}>Residential</button><button type="button" onClick={() => setType('commercial')} className={`flex-1 p-3 rounded-xl border-2 transition-all ${type === 'commercial' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500'}`}>Commercial</button></div></div>
      <div><label className="block text-sm font-medium text-slate-700 mb-2">Phase Fees (optional)</label><p className="text-xs text-slate-400 mb-3">You can add these later if you prefer</p><div className="space-y-2">{phases.map(phase => (<div key={phase.id} className="flex items-center gap-3"><span className="text-sm text-slate-600 w-24">{phase.shortLabel}</span><input type="number" value={phaseFees[phase.id]} onChange={(e) => handlePhaseFeeChange(phase.id, e.target.value)} placeholder="0" className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" /></div>))}</div></div>
      <button onClick={() => name && onAdd(name, totalFee, type, getPhaseFeesForSubmit())} disabled={!name} className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-4 font-medium disabled:opacity-50">Add Project</button>
    </div>
  );
}

function EditProjectForm({ project, phases, onSave }) {
  const [name, setName] = useState(project.name); const [totalFee, setTotalFee] = useState(project.fee.toString()); const [type, setType] = useState(project.type);
  const [phaseFees, setPhaseFees] = useState(() => { const fees = {}; phases.forEach(p => { fees[p.id] = (project.phaseFees?.[p.id] || 0).toString(); }); return fees; });
  const handlePhaseFeeChange = (phaseId, value) => { setPhaseFees(prev => ({ ...prev, [phaseId]: value })); };
  const getPhaseFeesForSubmit = () => { const result = {}; phases.forEach(p => { result[p.id] = parseFloat(phaseFees[p.id]) || 0; }); return result; };
  return (
    <div className="space-y-5">
      <h3 className="text-xl font-semibold text-slate-900">Edit Project</h3>
      <div><label className="block text-sm font-medium text-slate-700 mb-2">Project Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl" /></div>
      <div><label className="block text-sm font-medium text-slate-700 mb-2">Total Fee</label><input type="number" value={totalFee} onChange={(e) => setTotalFee(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl" /></div>
      <div><label className="block text-sm font-medium text-slate-700 mb-2">Type</label><div className="flex gap-3"><button type="button" onClick={() => setType('residential')} className={`flex-1 p-3 rounded-xl border-2 transition-all ${type === 'residential' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-200 text-slate-500'}`}>Residential</button><button type="button" onClick={() => setType('commercial')} className={`flex-1 p-3 rounded-xl border-2 transition-all ${type === 'commercial' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500'}`}>Commercial</button></div></div>
      <div><label className="block text-sm font-medium text-slate-700 mb-2">Phase Fees</label><div className="space-y-2">{phases.map(phase => (<div key={phase.id} className="flex items-center gap-3"><span className="text-sm text-slate-600 w-24">{phase.shortLabel}</span><input type="number" value={phaseFees[phase.id]} onChange={(e) => handlePhaseFeeChange(phase.id, e.target.value)} placeholder="0" className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" /></div>))}</div></div>
      <button onClick={() => onSave({ name, fee: parseFloat(totalFee) || 0, type, phaseFees: getPhaseFeesForSubmit() })} className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-4 font-medium">Save Changes</button>
    </div>
  );
}

function AddInvoiceForm({ project, onAdd }) {
  const [amount, setAmount] = useState(''); const [phase, setPhase] = useState(''); const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const phases = [{ id: 'prelim', label: 'Preliminary Design' }, { id: 'schematic', label: 'Schematic Design' }, { id: 'dd', label: 'Design Development' }, { id: 'cd', label: 'Construction Documents' }, { id: 'bidding', label: 'Bidding' }, { id: 'ca', label: 'Construction Observation' }, { id: 'other', label: 'Other' }];
  return (
    <div className="space-y-5">
      <h3 className="text-xl font-semibold text-slate-900">Add Invoice</h3><p className="text-sm text-slate-500">{project.name}</p>
      <div><label className="block text-sm font-medium text-slate-700 mb-2">Date Sent</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl" /></div>
      <div><label className="block text-sm font-medium text-slate-700 mb-2">Amount</label><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="5000" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl" /></div>
      <div><label className="block text-sm font-medium text-slate-700 mb-2">Phase</label><select value={phase} onChange={(e) => setPhase(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl"><option value="">Select phase...</option>{phases.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}</select></div>
      <button onClick={() => amount && phase && onAdd(amount, phase, date)} disabled={!amount || !phase} className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl p-4 font-medium disabled:opacity-50">Add Invoice</button>
    </div>
  );
}

function ViewInvoicesModal({ project, onMarkPaid, onDelete }) {
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const phases = { prelim: 'Preliminary', schematic: 'Schematic', dd: 'Design Dev', cd: 'Construction Docs', bidding: 'Bidding', ca: 'Construction Obs', other: 'Other' };
  return (
    <div className="space-y-5">
      <h3 className="text-xl font-semibold text-slate-900">Invoices</h3><p className="text-sm text-slate-500">{project.name}</p>
      {(project.invoices || []).map(inv => (
        <div key={inv.id} className={`p-4 rounded-xl border-2 ${inv.status === 'paid' ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
          <div className="flex justify-between items-start mb-2"><div><div className="text-xl font-semibold text-slate-800">${inv.amount.toLocaleString()}</div><div className="text-sm text-slate-500">{phases[inv.phase] || inv.phase}</div></div><span className={`text-xs px-2.5 py-1 rounded-full font-medium ${inv.status === 'paid' ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'}`}>{inv.status === 'paid' ? 'Paid' : 'Outstanding'}</span></div>
          <div className="text-sm text-slate-500">Sent {new Date(inv.dateSent).toLocaleDateString()}{inv.datePaid && ` • Paid ${new Date(inv.datePaid).toLocaleDateString()}`}</div>
          {inv.status !== 'paid' && <div className="mt-3 pt-3 border-t border-slate-200/60 flex gap-2"><input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} className="flex-1 p-2.5 text-sm bg-white border border-slate-200 rounded-lg" /><button onClick={() => onMarkPaid(project.id, inv.id, payDate)} className="px-4 py-2.5 text-sm bg-emerald-500 text-white rounded-lg font-medium">Mark Paid</button></div>}
          <button onClick={() => onDelete(project.id, inv.id)} className="mt-2 text-xs text-slate-400 hover:text-red-500">Delete</button>
        </div>
      ))}
    </div>
  );
}

function SettingsForm({ billingRate, header, revenueGoal, onSave }) {
  const [rate, setRate] = useState(billingRate.toString()); const [title, setTitle] = useState(header.title || 'Studio'); const [subtitle, setSubtitle] = useState(header.subtitle || '$220k goal — Year 2');
  const [goal, setGoal] = useState((revenueGoal || 220000).toString());
  return (
    <div className="space-y-5">
      <h3 className="text-xl font-semibold text-slate-900">Settings</h3>
      <div><label className="block text-sm font-medium text-slate-700 mb-2">App Title</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl" /></div>
      <div><label className="block text-sm font-medium text-slate-700 mb-2">Subtitle</label><input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl" /></div>
      <div><label className="block text-sm font-medium text-slate-700 mb-2">Revenue Goal ($)</label><input type="number" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="220000" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl" /></div>
      <div><label className="block text-sm font-medium text-slate-700 mb-2">Billing Rate ($/hr)</label><input type="number" value={rate} onChange={(e) => setRate(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl" /></div>
      <button onClick={() => onSave(rate, { title, subtitle }, goal)} className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-4 font-medium">Save Settings</button>
    </div>
  );
}

function AddGoalCategoryForm({ onAdd }) {
  const [name, setName] = useState(''); const [color, setColor] = useState('#3b82f6');
  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f43f5e', '#6366f1'];
  return (
    <div className="space-y-5">
      <h3 className="text-xl font-semibold text-slate-900">Add Goal Category</h3>
      <div><label className="block text-sm font-medium text-slate-700 mb-2">Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Q2 Goals" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl" /></div>
      <div><label className="block text-sm font-medium text-slate-700 mb-2">Color</label><div className="flex gap-2 flex-wrap">{colors.map(c => <button key={c} onClick={() => setColor(c)} className={`w-10 h-10 rounded-xl ${color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}`} style={{ backgroundColor: c }} />)}</div></div>
      <button onClick={() => name && onAdd(name, color)} disabled={!name} className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-4 font-medium disabled:opacity-50">Create Category</button>
    </div>
  );
}

function EditGoalCategoryForm({ category, onSave, onDelete }) {
  const [name, setName] = useState(category.name); const [color, setColor] = useState(category.color);
  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f43f5e', '#6366f1'];
  return (
    <div className="space-y-5">
      <h3 className="text-xl font-semibold text-slate-900">Edit Category</h3>
      <div><label className="block text-sm font-medium text-slate-700 mb-2">Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl" /></div>
      <div><label className="block text-sm font-medium text-slate-700 mb-2">Color</label><div className="flex gap-2 flex-wrap">{colors.map(c => <button key={c} onClick={() => setColor(c)} className={`w-10 h-10 rounded-xl ${color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}`} style={{ backgroundColor: c }} />)}</div></div>
      <button onClick={() => onSave({ name, color })} className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-4 font-medium">Save Changes</button>
      <button onClick={onDelete} className="w-full text-red-500 text-sm font-medium py-2">Delete Category</button>
    </div>
  );
}

function AddGoalForm({ onAdd }) {
  const [text, setText] = useState('');
  return (
    <div className="space-y-5">
      <h3 className="text-xl font-semibold text-slate-900">Add Goal</h3>
      <div><label className="block text-sm font-medium text-slate-700 mb-2">Goal</label><input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Complete project proposal" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl" /></div>
      <button onClick={() => text && onAdd(text)} disabled={!text} className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-4 font-medium disabled:opacity-50">Add Goal</button>
    </div>
  );
}

function EditTimeEntryForm({ entry, categories, projects, onSave, onCancel, onDelete }) {
  const [hours, setHours] = useState(entry.hours.toString());
  const [category, setCategory] = useState(entry.category);
  const [project, setProject] = useState(entry.project || '');
  const [date, setDate] = useState(new Date(entry.date).toISOString().split('T')[0]);
  const [description, setDescription] = useState(entry.description || '');
  return (
    <div className="px-5 py-4 bg-slate-50 space-y-3">
      <div className="flex gap-3">
        <input type="number" step="0.25" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="Hours" className="w-20 p-2.5 bg-white border border-slate-200 rounded-lg text-sm" />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="flex-1 p-2.5 bg-white border border-slate-200 rounded-lg text-sm" />
      </div>
      <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm">
        <optgroup label="Project Phases">{categories.filter(c => ['prelim', 'schematic', 'dd', 'cd', 'bidding', 'ca'].includes(c.id)).map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}</optgroup>
        <optgroup label="Business">{categories.filter(c => ['meetings', 'bizdev', 'marketing', 'accounting', 'admin', 'learning'].includes(c.id)).map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}</optgroup>
      </select>
      <select value={project} onChange={(e) => setProject(e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm">
        <option value="">No project</option>
        {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
      </select>
      <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm" />
      <div className="flex gap-2 pt-1">
        <button onClick={() => onSave({ hours: parseFloat(hours) || entry.hours, category, project, date: new Date(date + 'T12:00:00').toISOString(), description })} className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium">Save</button>
        <button onClick={onCancel} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium">Cancel</button>
        <button onClick={onDelete} className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg text-sm font-medium"><Trash2 className="w-4 h-4" /></button>
      </div>
    </div>
  );
}
